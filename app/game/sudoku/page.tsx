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

interface Cell { value: number | null; isInitial: boolean; isError: boolean; }

export default function SudokuGame() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const generateSudoku = useCallback(() => {
    const newGrid: Cell[][] = Array(9).fill(null).map(() => Array(9).fill(null).map(() => ({ value: null, isInitial: false, isError: false })));
    const solved = [[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]];
    for (let i = 0; i < 9; i++) { for (let j = 0; j < 9; j++) { if (Math.random() > 0.4) newGrid[i][j] = { value: solved[i][j], isInitial: true, isError: false }; } }
    setGrid(newGrid);
  }, []);

  useEffect(() => { generateSudoku(); }, [generateSudoku]);

  const handleCellClick = (row: number, col: number) => { if (!grid[row][col].isInitial) { setSelectedCell([row, col]); playSFX('click'); } };

  const isSolved = (currentGrid: Cell[][]) => {
    for (let i = 0; i < 9; i++) { for (let j = 0; j < 9; j++) { if (currentGrid[i][j].value === null || currentGrid[i][j].isError) return false; } }
    return true;
  };

  const handleNumberInput = useCallback((num: number | null) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    const newGrid = [...grid];
    newGrid[r][c] = { ...newGrid[r][c], value: num, isError: false };
    setGrid(newGrid);
    playSFX('click');
    if (isSolved(newGrid)) handleSettlement(4);
  }, [grid, selectedCell, playSFX, handleSettlement]);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      
      <div className="max-w-xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-rose-500 mb-2">数独挑战</h1>
          <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">逻辑与专注</p>
        </motion.div>
        <div className="modern-card p-4 md:p-8 mb-12 aspect-square flex items-center justify-center">
          <div className="grid grid-cols-9 w-full h-full gap-0 border-2 border-slate-800 overflow-hidden rounded-sm">
            {grid.map((row, rIdx) => row.map((cell, cIdx) => (
              <div key={`${rIdx}-${cIdx}`} onClick={() => handleCellClick(rIdx, cIdx)} className={`flex items-center justify-center text-xl md:text-2xl cursor-pointer transition-all border ${(cIdx + 1) % 3 === 0 && cIdx !== 8 ? 'border-r-2 border-r-slate-800' : 'border-r-slate-200'} ${(rIdx + 1) % 3 === 0 && rIdx !== 8 ? 'border-b-2 border-b-slate-800' : 'border-b-slate-200'} ${selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx ? 'bg-rose-50' : 'bg-white'} ${cell.isInitial ? 'font-bold text-slate-900 bg-slate-50' : 'text-rose-500'} ${cell.isError ? 'bg-rose-100 text-rose-700' : ''} hover:bg-slate-50`}>{cell.value || ''}</div>
            )))}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3 mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (<button key={num} onClick={() => handleNumberInput(num)} className="py-4 md:py-6 modern-card text-xl font-bold text-slate-700 hover:border-rose-300 hover:text-rose-500 active:scale-95 transition-all flex items-center justify-center">{num}</button>))}
          <button onClick={() => handleNumberInput(null)} className="py-4 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-xs font-black text-slate-400 hover:bg-slate-100 active:scale-95 transition-all uppercase tracking-widest">清除</button>
        </div>
        <div className="flex flex-col gap-4">
          <button onClick={generateSudoku} className="btn-primary py-5 text-xs tracking-widest uppercase">新游戏</button>
          <button onClick={() => router.push('/games')} className="btn-ghost py-4 text-[10px] tracking-[0.3em] uppercase font-bold">退出挑战</button>
        </div>
      </div>
    </div>
  );
}
