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

const TRACK_COUNT = 4;
const SPAWN_INTERVAL = 800;
const NOTE_DURATION = 2000; 
const HIT_WINDOW = 150; 

interface Note { id: number; track: number; startTime: number; isHit: boolean; isMissed: boolean; }

export default function RhythmGame() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const lastSpawnTime = useRef(0);
  const noteIdCounter = useRef(0);

  const initGame = useCallback(() => { setNotes([]); setScore(0); setCombo(0); setIsGameOver(false); lastSpawnTime.current = Date.now(); }, []);

  const spawnNote = useCallback(() => {
    setNotes(prev => [...prev, { id: noteIdCounter.current++, track: Math.floor(Math.random() * TRACK_COUNT), startTime: Date.now(), isHit: false, isMissed: false }]);
  }, []);

  const update = useCallback(() => {
    const now = Date.now();
    if (now - lastSpawnTime.current > SPAWN_INTERVAL) { spawnNote(); lastSpawnTime.current = now; }
    setNotes(prev => {
      let missCount = 0;
      const updated = prev.map(note => { if (!note.isHit && !note.isMissed && now - note.startTime > NOTE_DURATION + HIT_WINDOW) { missCount++; return { ...note, isMissed: true }; } return note; }).filter(note => now - note.startTime < NOTE_DURATION + 500);
      if (missCount > 0) { setCombo(0); playSFX('hit'); }
      return updated;
    });
    if (score >= 2000) { setIsGameOver(true); handleSettlement(7); } else { gameLoopRef.current = requestAnimationFrame(update); }
  }, [spawnNote, score, playSFX, handleSettlement]);

  useEffect(() => { gameLoopRef.current = requestAnimationFrame(update); return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); }; }, [update]);

  const handleHit = (track: number) => {
    const now = Date.now();
    setNotes(prev => {
      let hitIdx = -1;
      const updated = prev.map((note, idx) => { if (note.track === track && !note.isHit && !note.isMissed) { const timeOffset = Math.abs(now - (note.startTime + NOTE_DURATION)); if (timeOffset < HIT_WINDOW) { hitIdx = idx; return { ...note, isHit: true }; } } return note; });
      if (hitIdx !== -1) { setScore(s => s + 100 + combo * 10); setCombo(c => c + 1); playSFX('coin'); }
      return updated;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { const keys = ['d', 'f', 'j', 'k']; const idx = keys.indexOf(e.key.toLowerCase()); if (idx !== -1) handleHit(idx); };
    window.addEventListener('keydown', handleKeyDown); return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combo]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12 font-sans text-slate-800 overflow-hidden select-none relative">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      <div className="max-w-md w-full h-[85vh] flex flex-col relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-10">
          <div><h1 className="text-5xl md:text-7xl font-bold text-rose-500 mb-2">节奏大师</h1><p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">感受我们的节拍</p></div>
          <div className="flex gap-3">
            <div className="modern-card px-4 py-2 flex flex-col items-center min-w-[70px]"><span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">得分</span><span className="text-lg font-bold text-rose-500">{score}</span></div>
            <div className="modern-card px-4 py-2 flex flex-col items-center min-w-[70px]"><span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">连击</span><span className="text-lg font-bold text-rose-500">{combo}</span></div>
          </div>
        </motion.div>
        <div className="flex-1 relative bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex overflow-hidden">
          {Array(TRACK_COUNT).fill(0).map((_, i) => (<div key={i} className={`flex-1 border-r border-slate-100 last:border-0 relative`}><div className="absolute bottom-20 left-0 right-0 h-0.5 bg-rose-500/10" /><div className="absolute bottom-20 left-3 right-3 h-1 bg-rose-100 rounded-full" /></div>))}
          <AnimatePresence>{notes.map(note => !note.isHit && !note.isMissed && (<motion.div key={note.id} initial={{ top: '-5%' }} animate={{ top: '100%' }} transition={{ duration: NOTE_DURATION / 1000, ease: 'linear' }} className="absolute w-1/4 px-3" style={{ left: `${note.track * 25}%` }}><div className="w-full h-3 bg-rose-500 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.3)]" /></motion.div>))}</AnimatePresence>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-10">{['D', 'F', 'J', 'K'].map((key, i) => (<button key={i} onMouseDown={() => handleHit(i)} onTouchStart={() => handleHit(i)} className="py-8 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-xl text-slate-400 hover:bg-slate-100 active:scale-95 active:bg-rose-50 active:text-rose-500 transition-all uppercase tracking-tighter">{key}</button>))}</div>
        <button onClick={() => router.push('/games')} className="mt-10 btn-ghost text-[10px] tracking-[0.3em] uppercase font-bold">退出游戏</button>
      </div>
    </div>
  );
}
