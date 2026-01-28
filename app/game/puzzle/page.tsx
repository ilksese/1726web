'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { INITIAL_LEVELS, getMergedProgress, saveProgress } from '@/lib/game';
import { useSound } from '@/hooks/useSound';
import { useGameSettlement } from '@/hooks/useGameSettlement';
import GiftBox from '@/components/GiftBox';
import Modal from '@/components/Modal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tile {
  id: string; 
  correctIndex: number; 
  sliceUrl: string; 
}

type Difficulty = 'easy' | 'medium' | 'hard';

const GRID_SIZES = {
  easy: 3,
  medium: 4,
  hard: 5,
};

function SortableTile({ id, sliceUrl, isComplete }: { id: string; sliceUrl: string; isComplete: boolean; }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, backgroundImage: `url(${sliceUrl})`, backgroundSize: 'cover' };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`aspect-square rounded-md md:rounded-lg shadow-sm cursor-grab active:cursor-grabbing border border-white/10 ${isComplete ? 'ring-2 ring-green-400' : ''} ${isDragging ? 'opacity-50 scale-105 shadow-xl z-50' : ''}`} />;
}

export default function PuzzleGame() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [images, setImages] = useState<string[]>([]); 
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [showUpload, setShowUpload] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [isSlicing, setIsSlicing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gridSize = difficulty ? GRID_SIZES[difficulty] : 3;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    images.forEach(url => URL.revokeObjectURL(url));
    const fileArray = Array.from(files);
    if (fileArray.length < 3) { alert('请至少上传三张图片以开始挑战！'); return; }
    const newImages = fileArray.slice(0, 3).map(file => URL.createObjectURL(file));
    setImages(newImages);
    setShowUpload(false);
    setDifficulty('easy');
  };

  const sliceImage = async (imageUrl: string, size: number): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const slices: string[] = [];
        const sliceWidth = img.width / size;
        const sliceHeight = img.height / size;
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const canvas = document.createElement('canvas');
            canvas.width = sliceWidth; canvas.height = sliceHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) { ctx.drawImage(img, x * sliceWidth, y * sliceHeight, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight); slices.push(canvas.toDataURL('image/jpeg', 0.9)); }
          }
        }
        resolve(slices);
      };
      img.onerror = reject; img.src = imageUrl;
    });
  };

  const initializePuzzle = async () => {
    if (!images[currentLevel] || !difficulty) return;
    setIsSlicing(true);
    try {
      const sliceUrls = await sliceImage(images[currentLevel], gridSize);
      const newTiles: Tile[] = sliceUrls.map((url, i) => ({ id: `tile-${i}`, correctIndex: i, sliceUrl: url }));
      let shuffled = [...newTiles];
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      if (shuffled.every((tile, index) => tile.correctIndex === index)) { [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]; }
      setTiles(shuffled); setIsComplete(false);
    } catch (error) { console.error('Failed to slice image:', error); } finally { setIsSlicing(false); }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTiles((items) => {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        const newItems = [...items];
        const temp = newItems[oldIndex];
        newItems[oldIndex] = newItems[newIndex];
        newItems[newIndex] = temp;
        if (newItems.every((tile, index) => tile.correctIndex === index)) {
          setIsComplete(true); playSFX('win');
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
          setTimeout(() => handleNextLevel(), 2000);
        } else { playSFX('click'); }
        return newItems;
      });
    }
  };

  const handleNextLevel = () => {
    if (currentLevel < 2) { setCurrentLevel(prev => prev + 1); setIsComplete(false); }
    else { handleSettlement(2); }
  };

  useEffect(() => { if (difficulty && images.length > 0) initializePuzzle(); }, [difficulty, currentLevel]);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      
      {showUpload ? (
        <div className="relative z-10 text-center w-full max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">回忆重组</h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">重组我们的回忆</p>
          </motion.div>
          <div className="modern-card p-10 md:p-14 mb-12">
            <p className="text-slate-500 font-medium mb-12 leading-relaxed">选出今年的回忆TOP3！</p>
            <div className="space-y-4">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="btn-primary w-full py-5">上传3张照片</button>
            </div>
          </div>
          <button onClick={() => router.push('/games')} className="btn-ghost text-xs tracking-widest uppercase font-bold">← 返回关卡</button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-rose-500 mb-2">回忆重组</h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">第 {currentLevel + 1} / 3 关</p>
          </motion.div>
          <div className="flex justify-center mb-12">
            <div className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-rose-400 uppercase tracking-widest">
              难度：{difficulty === 'easy' ? '简单 (3×3)' : difficulty === 'medium' ? '中等 (4×4)' : '困难 (5×5)'}
            </div>
          </div>
          <div className="modern-card p-6 md:p-12 mb-12 relative min-h-[400px]">
            {isSlicing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                <div className="w-10 h-10 border-4 border-rose-50 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest">正在处理图片...</p>
              </div>
            )}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid gap-1.5 mx-auto" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, maxWidth: 'min(100%, 500px)' }}>
                <SortableContext items={tiles} strategy={rectSortingStrategy}>
                  {tiles.map((tile) => (
                    <SortableTile key={tile.id} id={tile.id} sliceUrl={tile.sliceUrl} isComplete={isComplete} />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
            {isComplete && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-12">
                <div className="text-xl font-bold text-emerald-500 mb-2 tracking-widest uppercase">关卡完成！</div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{currentLevel < 2 ? '正在加载下一关...' : '所有挑战已完成！'}</p>
              </motion.div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button onClick={initializePuzzle} disabled={isSlicing} className="flex-1 btn-primary py-5 text-[10px] tracking-widest uppercase">重新打乱</button>
            <button onClick={() => router.push('/games')} className="flex-1 btn-secondary py-5 text-[10px] tracking-widest uppercase">放弃</button>
          </div>
        </div>
      )}
    </div>
  );
}
