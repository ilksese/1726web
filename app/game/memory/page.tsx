'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { INITIAL_LEVELS, getMergedProgress, saveProgress } from '@/lib/game';
import { useSound } from '@/hooks/useSound';
import { useGameSettlement } from '@/hooks/useGameSettlement';
import GiftBox from '@/components/GiftBox';
import Modal from '@/components/Modal';

const EMOJIS = ['❤️', '💖', '💍', '🧸', '🌹', '💌', '👩‍❤️‍👨', '🥂'];

interface Card { id: number; emoji: string; isFlipped: boolean; isMatched: boolean; }

export default function MemoryGame() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const initGame = useCallback(() => {
    const pairs = [...EMOJIS, ...EMOJIS];
    const shuffled = pairs.sort(() => Math.random() - 0.5).map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }));
    setCards(shuffled); setFlippedIds([]); setMoves(0); setIsWon(false);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const handleCardClick = (id: number) => {
    if (flippedIds.length === 2 || cards[id].isFlipped || cards[id].isMatched || isWon) return;
    playSFX('click');
    const newCards = [...cards]; newCards[id].isFlipped = true; setCards(newCards);
    const newFlippedIds = [...flippedIds, id]; setFlippedIds(newFlippedIds);
    if (newFlippedIds.length === 2) {
      setMoves(m => m + 1); const [firstId, secondId] = newFlippedIds;
      if (cards[firstId].emoji === cards[secondId].emoji) {
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c));
          setFlippedIds([]); playSFX('coin');
        }, 500);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  useEffect(() => { if (cards.length > 0 && cards.every(c => c.isMatched)) { setIsWon(true); handleSettlement(6); } }, [cards, handleSettlement]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      <div className="max-w-md w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-12">
          <div><h1 className="text-5xl md:text-7xl font-bold text-rose-500 mb-2">记忆方块</h1><p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">揭开我们的爱之故事</p></div>
          <div className="modern-card px-6 py-3 flex flex-col items-center min-w-[100px]"><span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-1">步数</span><span className="text-2xl font-bold text-rose-500">{moves}</span></div>
        </motion.div>
        <div className="grid grid-cols-4 gap-4 mb-12">
          {cards.map((card) => (
            <motion.div key={card.id} whileHover={{ scale: card.isFlipped ? 1 : 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleCardClick(card.id)} className="perspective-1000 relative aspect-square cursor-pointer">
              <motion.div animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="w-full h-full relative preserve-3d" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-slate-100" style={{ backfaceVisibility: 'hidden' }}><div className="w-2 h-2 rounded-full bg-rose-100 opacity-40"></div></div>
                <div className={`absolute inset-0 bg-white rounded-2xl flex items-center justify-center shadow-sm border-2 transition-colors duration-500 ${card.isMatched ? 'border-emerald-100' : 'border-rose-100'}`} style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}><span className="text-3xl">{card.emoji}</span></div>
              </motion.div>
              {card.isMatched && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-1 shadow-md z-10"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></motion.div>)}
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={initGame} className="btn-primary py-5 text-xs tracking-widest uppercase font-bold">重新洗牌</button>
          <button onClick={() => router.push('/games')} className="btn-ghost py-4 text-[10px] tracking-[0.3em] uppercase font-bold">退出游戏</button>
        </div>
      </div>
      <style jsx global>{`.perspective-1000 { perspective: 1000px; }`}</style>
    </div>
  );
}
