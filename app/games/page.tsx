'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/Modal';
import { ChevronRight } from 'lucide-react';
import { INITIAL_LEVELS, Level, getMergedProgress, saveProgress } from '@/lib/game';
import { useModalConfig } from '@/hooks/useModalConfig';
import { useSound } from '@/hooks/useSound';

export default function GamesPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<Level[]>(INITIAL_LEVELS);
  const [dailyTarget, setDailyTarget] = useState<number | null>(null);
  const { modalConfig, showModal, closeModal } = useModalConfig();
  const { isMuted, toggleMute, playSFX, startBGM } = useSound();

  const longPressTimer = useRef<any>(null);

  // 从localStorage加载进度
  useEffect(() => {
    const progress = getMergedProgress();
    setLevels(progress.levels);
    setDailyTarget(progress.dailyChallengeTargetId || null);
    saveProgress({ 
      levels: progress.levels, 
      dailyChallengeTargetId: progress.dailyChallengeTargetId,
      lastDailyChallengeDate: progress.lastDailyChallengeDate 
    }); 
    startBGM();
  }, []);

  const unlockAllLevels = () => {
    const updatedLevels = levels.map(l => ({ ...l, unlocked: true }));
    setLevels(updatedLevels);
    saveProgress({ levels: updatedLevels });
  };

  const unlockLevel = (levelId: number) => {
    const updatedLevels = levels.map(l => {
      if (l.id === levelId) {
        return { ...l, unlocked: true };
      }
      return l;
    });
    
    setLevels(updatedLevels);
    saveProgress({ levels: updatedLevels });
  };

  const handleLevelClick = (level: Level) => {
    playSFX('click');
    if (level.unlocked && level.path) {
      router.push(level.path);
    } else {
      showModal({
        title: '关卡未解锁',
        description: '请先完成之前的关卡。',
        icon: '🔒',
        type: 'warning',
      });
    }
  };

  const handleLongPressStart = (levelId: number) => {
    if (levelId === 0) return;
    longPressTimer.current = setTimeout(() => {
      unlockLevel(levelId);
      if (navigator.vibrate) navigator.vibrate(200);
      showModal({
        title: '关卡解锁成功',
        description: '🔒 后门开启：该关卡已强制解锁！',
        icon: '🔓',
        type: 'success',
      });
    }, 10000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTitleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      unlockAllLevels();
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      showModal({
        title: '神级解锁',
        description: '🔓 神级后门开启：所有关卡已全部解锁！',
        icon: '✨',
        type: 'success',
      });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <Modal {...modalConfig} onClose={closeModal} />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 
              onMouseDown={handleTitleLongPressStart}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={handleTitleLongPressStart}
              onTouchEnd={handleLongPressEnd}
              className="text-6xl md:text-8xl font-bold text-rose-500 cursor-help select-none mb-2"
            >
              游戏室
            </h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">开启回忆之旅</p>
          </motion.div>

          <div className="flex gap-4">
            {[
              { icon: '🏅', path: '/achievements', title: '成就勋章' },
              { icon: '📌', path: '/messages', title: '留言板' },
              { icon: '🖼️', path: '/gallery', title: '相册' },
              { icon: '🎁', path: '/gifts', title: '惊喜礼盒' },
            ].map((item, i) => (
              <motion.button 
                key={item.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { playSFX('click'); router.push(item.path); }}
                className="nav-item"
                title={item.title}
              >
                <span className="text-2xl">{item.icon}</span>
              </motion.button>
            ))}
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { playSFX('click'); toggleMute(); }}
              className="nav-item"
            >
              <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
            </motion.button>
          </div>
        </div>

        {dailyTarget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            className="mb-16 bg-rose-500 rounded-[2.5rem] p-10 shadow-lg text-white relative overflow-hidden group cursor-pointer active:scale-[0.99] transition-all"
            onClick={() => handleLevelClick(levels.find(l => l.id === dailyTarget)!)}
          >
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <span className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">每日任务 +100 💰</span>
                <h2 className="text-4xl font-bold mt-6 flex items-center gap-4">✨ {levels.find(l => l.id === dailyTarget)?.name}</h2>
                <p className="text-white/80 text-sm mt-3 font-medium tracking-wide">挑战随机关卡，赢取额外奖励！</p>
              </div>
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="text-6xl"
              >
                🔥
              </motion.div>
            </div>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16"
        >
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleLevelClick(level)}
              onMouseDown={() => handleLongPressStart(level.id)}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
              onTouchStart={() => handleLongPressStart(level.id)}
              onTouchEnd={handleLongPressEnd}
              className={`
                group relative modern-card p-8 transition-all duration-300 select-none
                ${level.unlocked && level.id !== 0 && level.path 
                  ? 'cursor-pointer hover:border-rose-300' 
                  : 'opacity-60 cursor-default grayscale'}
                ${level.id === 0 ? 'hidden' : ''}
              `}
            >
              <div className="flex items-center gap-6">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-all
                  ${level.unlocked 
                    ? 'bg-rose-50 text-rose-500' 
                    : 'bg-slate-50 text-slate-300'}
                `}>
                  {level.completed ? '✅' : level.unlocked ? '🔓' : '🔒'}
                </div>
                <div className="flex-1">
                  <h3 className={`text-2xl font-bold tracking-tight mb-1 ${level.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                    {level.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                    {level.completed ? '已通关' : level.unlocked ? '可挑战' : '未解锁'}
                  </p>

                </div>
                {level.unlocked && level.id !== 0 && level.path && (
                  <div className="text-slate-200 group-hover:text-rose-300 group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/')}
          className="w-full btn-secondary py-5 text-[10px] tracking-[0.3em] uppercase"
        >
          返回首页
        </motion.button>
      </div>
    </div>
  );
}
