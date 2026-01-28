'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { INITIAL_LEVELS, getMergedProgress, saveProgress } from '@/lib/game';
import { useSound } from '@/hooks/useSound';
import { useGameSettlement } from '@/hooks/useGameSettlement';
import GiftBox from '@/components/GiftBox';
import Modal from '@/components/Modal';

const GRAVITY = 0.6; const JUMP = -8; const PIPE_SPEED = 3; const PIPE_SPAWN_RATE = 1500; const PIPE_WIDTH = 60; const PIPE_GAP = 180;

interface Pipe { id: number; x: number; topHeight: number; passed: boolean; }

export default function FlappyHeart() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [heartY, setHeartY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);

  const gameLoopRef = useRef<number | null>(null);
  const lastPipeTime = useRef(0);
  const pipeIdCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const initGame = () => { setGameState('playing'); setScore(0); setHeartY(250); setVelocity(0); setPipes([]); lastPipeTime.current = Date.now(); };
  const jump = useCallback(() => { if (gameState === 'playing') { setVelocity(JUMP); playSFX('click'); } }, [gameState, playSFX]);

  const update = useCallback(() => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    setHeartY(y => { const nextY = y + velocity; if (nextY < 0 || nextY > 500) { setGameState('over'); playSFX('lose'); return y; } return nextY; });
    setVelocity(v => v + GRAVITY);
    if (now - lastPipeTime.current > PIPE_SPAWN_RATE) {
      const topHeight = Math.floor(Math.random() * (500 - PIPE_GAP - 100)) + 50;
      setPipes(prev => [...prev, { id: pipeIdCounter.current++, x: 400, topHeight, passed: false }]);
      lastPipeTime.current = now;
    }
    setPipes(prev => {
      const updated = prev.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED })).filter(pipe => pipe.x > -PIPE_WIDTH);
      updated.forEach(pipe => {
        if (pipe.x < 80 && pipe.x + PIPE_WIDTH > 40) { if (heartY < pipe.topHeight || heartY > pipe.topHeight + PIPE_GAP) { setGameState('over'); playSFX('lose'); } }
        if (!pipe.passed && pipe.x < 40) { pipe.passed = true; setScore(s => { const next = s + 1; if (next === 20) handleSettlement(8); return next; }); playSFX('coin'); }
      });
      return updated;
    });
    gameLoopRef.current = requestAnimationFrame(update);
  }, [gameState, velocity, heartY, playSFX, handleSettlement]);

  useEffect(() => {
    if (gameState === 'playing') gameLoopRef.current = requestAnimationFrame(update);
    else if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' || e.key === 'w' || e.key === 'ArrowUp') jump(); };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12 font-sans select-none overflow-hidden relative">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      <div className="max-w-xl w-full relative z-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12"><h1 className="text-5xl md:text-7xl font-bold text-rose-500 mb-2">飞翔的心</h1><p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">飞越重重挑战</p></motion.div>
        <div ref={containerRef} onClick={jump} className="relative w-full max-w-[360px] h-[480px] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 cursor-pointer group shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 opacity-10 pointer-events-none"><div className="absolute top-10 left-10 text-2xl">☁️</div><div className="absolute top-40 right-20 text-3xl">☁️</div><div className="absolute bottom-20 left-20 text-2xl">☁️</div></div>
          <motion.div animate={{ rotate: velocity * 3 }} className="absolute left-[50px] w-10 h-10 flex items-center justify-center text-4xl z-20 transition-transform" style={{ top: heartY - 20 }}>❤️</motion.div>
          {pipes.map(pipe => (<div key={pipe.id}><div className="absolute bg-slate-200 border-x border-slate-300 rounded-b-2xl transition-colors group-hover:bg-rose-100 group-hover:border-rose-200" style={{ left: pipe.x, top: 0, width: PIPE_WIDTH, height: pipe.topHeight }} /><div className="absolute bg-slate-200 border-x border-slate-300 rounded-t-2xl transition-colors group-hover:bg-rose-100 group-hover:border-rose-200" style={{ left: pipe.x, top: pipe.topHeight + PIPE_GAP, width: PIPE_WIDTH, height: 500 - (pipe.topHeight + PIPE_GAP) }} /></div>))}
          <div className="absolute top-10 left-0 right-0 text-center z-30 pointer-events-none"><span className="text-6xl font-black text-rose-500 drop-shadow-sm opacity-20">{score}</span></div>
          {gameState === 'start' && (<div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-40 p-10 text-center"><h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">准备好起飞了吗？</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">点击跳跃，避开障碍</p><button onClick={(e) => { e.stopPropagation(); initGame(); }} className="btn-primary w-full py-4 text-xs tracking-widest">开始任务</button></div>)}
          {gameState === 'over' && (<div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-40 p-10 text-center"><h2 className="text-2xl font-bold text-rose-500 mb-2 uppercase tracking-tighter">任务结束</h2><p className="text-slate-800 text-4xl font-black mb-10">{score}</p><div className="flex flex-col gap-3 w-full"><button onClick={(e) => { e.stopPropagation(); initGame(); }} className="btn-primary w-full py-4 text-xs tracking-widest">重试</button><button onClick={(e) => { e.stopPropagation(); router.push('/games'); }} className="btn-secondary w-full py-4 text-xs tracking-widest">返回</button></div></div>)}
        </div>
        <div className="mt-12 text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em] text-center">达到 20 分即可通关</div>
        <button onClick={() => router.push('/games')} className="mt-8 btn-ghost text-[10px] tracking-[0.3em] uppercase font-bold">退出游戏</button>
      </div>
    </div>
  );
}
