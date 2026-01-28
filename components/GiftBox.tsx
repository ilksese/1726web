'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';

interface GiftBoxProps {
  isOpen: boolean;
  onOpenComplete: () => void;
}

export default function GiftBox({ isOpen, onOpenComplete }: GiftBoxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpened, setIsOpened] = useState(false);
  const { playSFX } = useSound();
  const particles = useRef<any[]>([]);
  const requestRef = useRef<number>(0);

  const initParticles = (x: number, y: number) => {
    const colors = ['#F43F5E', '#FBBF24', '#10B981', '#3B82F6', '#FFFFFF'];
    for (let i = 0; i < 100; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.02 + 0.01,
        type: Math.random() > 0.5 ? 'heart' : 'star'
      });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.current.forEach((p, i) => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      
      if (p.type === 'heart') {
        ctx.beginPath();
        const topCurveHeight = p.size * 0.3;
        ctx.moveTo(p.x, p.y + topCurveHeight);
        ctx.bezierCurveTo(p.x, p.y, p.x - p.size / 2, p.y, p.x - p.size / 2, p.y + topCurveHeight);
        ctx.bezierCurveTo(p.x - p.size / 2, p.y + (p.size + topCurveHeight) / 2, p.x, p.y + (p.size + topCurveHeight) / 2, p.x, p.y + p.size);
        ctx.bezierCurveTo(p.x, p.y + (p.size + topCurveHeight) / 2, p.x + p.size / 2, p.y + (p.size + topCurveHeight) / 2, p.x + p.size / 2, p.y + topCurveHeight);
        ctx.bezierCurveTo(p.x + p.size / 2, p.y, p.x, p.y, p.x, p.y + topCurveHeight);
        ctx.fill();
      } else {
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            ctx.lineTo(p.x + Math.cos((18 + j * 72) / 180 * Math.PI) * p.size, p.y - Math.sin((18 + j * 72) / 180 * Math.PI) * p.size);
            ctx.lineTo(p.x + Math.cos((54 + j * 72) / 180 * Math.PI) * p.size / 2, p.y - Math.sin((54 + j * 72) / 180 * Math.PI) * p.size / 2);
        }
        ctx.closePath();
        ctx.fill();
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.current.splice(i, 1);
      }
    });

    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (isOpen) {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      requestRef.current = requestAnimationFrame(draw);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isOpen]);

  const handleOpen = () => {
    if (isOpened) return;
    setIsOpened(true);
    playSFX('gift_open');
    initParticles(window.innerWidth / 2, window.innerHeight / 2);
    
    setTimeout(() => {
      onOpenComplete();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
          />
          
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ 
              scale: isOpened ? [1, 1.2, 0] : 1,
              y: isOpened ? -100 : 0,
              rotate: isOpened ? [0, -10, 10, -10, 0] : 0
            }}
            transition={{ 
                duration: 0.8,
                ease: isOpened ? "easeInOut" : "linear"
            }}
            onClick={handleOpen}
            className="relative cursor-pointer"
          >
            {!isOpened && (
              <motion.div
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, -2, 2, -2, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="w-40 h-40 flex items-center justify-center relative"
              >
                 <svg width="120" height="120" viewBox="0 0 100 100">
                    <rect x="10" y="40" width="80" height="50" fill="#f43f5e" rx="4" />
                    <rect x="5" y="30" width="90" height="15" fill="#e11d48" rx="4" />
                    <rect x="42" y="30" width="16" height="60" fill="#fbbf24" />
                    <path d="M50 30 C30 10, 10 30, 50 30 C90 10, 70 30, 50 30" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-white font-black text-xs uppercase tracking-tighter opacity-40">点我开启</span>
                 </div>
              </motion.div>
            )}
          </motion.div>
          
          <AnimatePresence>
            {!isOpened && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-20 text-rose-200 text-sm font-bold tracking-[0.3em] uppercase animate-pulse"
              >
                发现神秘礼盒
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
