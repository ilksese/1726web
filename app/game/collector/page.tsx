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

const PLAYER_WIDTH = 80; const ITEM_SIZE = 40; const SPAWN_INTERVAL = 600; const FALL_SPEED = 4; const TARGET_SCORE = 1000;

interface Item { id: number; x: number; y: number; type: 'heart' | 'bomb'; emoji: string; }

export default function CollectorGame() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'over'>('start');
  const [score, setScore] = useState(0);
  const [playerX, setPlayerX] = useState(120); 
  const [items, setItems] = useState<Item[]>([]);

  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTime = useRef(0);
  const itemIdCounter = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const initGame = () => { setGameState('playing'); setScore(0); setPlayerX(120); setItems([]); lastSpawnTime.current = Date.now(); };
  const spawnItem = useCallback(() => { const isBomb = Math.random() > 0.8; setItems(prev => [...prev, { id: itemIdCounter.current++, x: Math.random() * (320 - ITEM_SIZE), y: -ITEM_SIZE, type: isBomb ? 'bomb' : 'heart', emoji: isBomb ? '💣' : ['❤️', '💖', '💝', '💕'][Math.floor(Math.random() * 4)] }]); }, []);

  const update = useCallback(() => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    if (now - lastSpawnTime.current > SPAWN_INTERVAL) { spawnItem(); lastSpawnTime.current = now; }
    setItems(prev => {
      const updated = prev.map(item => ({ ...item, y: item.y + FALL_SPEED })).filter(item => item.y < 500);
      const collisionIndex = updated.findIndex(item => { if (item.y + ITEM_SIZE > 420 && item.y < 460) { if (item.x + ITEM_SIZE > playerX && item.x < playerX + PLAYER_WIDTH) return true; } return false; });
      if (collisionIndex !== -1) { const hitItem = updated[collisionIndex]; if (hitItem.type === 'heart') { setScore(s => s + 50); playSFX('coin'); updated.splice(collisionIndex, 1); } else { setGameState('over'); playSFX('lose'); } }
      return updated;
    });
    if (score >= TARGET_SCORE) { setGameState('over'); handleSettlement(9); } else { gameLoopRef.current = requestAnimationFrame(update); }
  }, [gameState, playerX, score, playSFX, spawnItem, handleSettlement]);

  useEffect(() => { if (gameState === 'playing') gameLoopRef.current = requestAnimationFrame(update); else if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); }; }, [gameState, update]);

  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft' || e.key === 'a') setPlayerX(x => Math.max(0, x - 20)); if (e.key === 'ArrowRight' || e.key === 'd') setPlayerX(x => Math.min(320 - PLAYER_WIDTH, x + 20)); }; window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown); }, []);

  const handleTouch = (e: React.TouchEvent | React.MouseEvent) => { if (containerRef.current) { const rect = containerRef.current.getBoundingClientRect(); const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX; setPlayerX(Math.min(320 - PLAYER_WIDTH, Math.max(0, clientX - rect.left - PLAYER_WIDTH / 2))); } };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12 font-sans select-none overflow-hidden relative">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      <div className="max-w-xl w-full relative z-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12"><h1 className="text-5xl md:text-7xl font-bold text-rose-500 mb-2">接住这份爱</h1><p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">接住爱心，传播爱意</p></motion.div>
        <div ref={containerRef} onMouseMove={handleTouch} onTouchMove={handleTouch} className="relative w-[320px] h-[480px] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 cursor-none group shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute inset-0 opacity-5 pointer-events-none">{Array(15).fill(0).map((_, i) => (<div key={i} className="absolute text-xl" style={{ top: (i * 7)%100+'%', left: (i * 13)%100+'%' }}>💗</div>))}</div>
          <div className="absolute top-8 left-0 right-0 text-center z-30 pointer-events-none"><div className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-1">当前得分</div><div className="text-5xl font-black text-rose-500 drop-shadow-sm">{score}</div></div>
          <div className="absolute bottom-10 h-10 bg-white rounded-full flex items-center justify-center text-3xl shadow-lg border border-rose-100 transition-all duration-75" style={{ left: playerX, width: PLAYER_WIDTH }}>🧺</div>
          {items.map(item => (<div key={item.id} className="absolute flex items-center justify-center text-3xl pointer-events-none" style={{ left: item.x, top: item.y, width: ITEM_SIZE, height: ITEM_SIZE }}>{item.emoji}</div>))}
          <AnimatePresence>
            {gameState === 'start' && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-40 p-10 text-center"><h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">准备好接住了吗？</h2><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-12 leading-relaxed">移动篮子接住落下的爱心<br/>避开炸弹！</p><button onClick={initGame} className="btn-primary w-full py-4 text-xs tracking-widest">开始收集</button></motion.div>)}
            {gameState === 'over' && score < TARGET_SCORE && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-40 p-10 text-center"><h2 className="text-2xl font-bold text-rose-500 mb-2 uppercase tracking-tighter">撞到炸弹了！</h2><p className="text-slate-800 text-4xl font-black mb-10">{score}</p><div className="flex flex-col gap-3 w-full"><button onClick={initGame} className="btn-primary w-full py-4 text-xs tracking-widest">再试一次</button><button onClick={() => router.push('/games')} className="btn-secondary w-full py-4 text-xs tracking-widest">退出</button></div></motion.div>)}
          </AnimatePresence>
        </div>
        <div className="mt-12 text-slate-300 text-[10px] font-bold uppercase tracking-[0.3em] text-center">达到 1000 分即可通关</div>
        <button onClick={() => router.push('/games')} className="mt-8 btn-ghost text-[10px] tracking-[0.3em] uppercase font-bold">退出游戏</button>
      </div>
    </div>
  );
}
