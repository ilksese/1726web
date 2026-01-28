'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ACHIEVEMENTS, getMergedProgress, GameProgress } from '@/lib/game';

export default function AchievementsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    setProgress(getMergedProgress());
  }, []);

  if (!progress) return null;

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">
              成就勋章
            </h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">你们的里程碑与奖杯</p>
          </motion.div>
          <button 
            onClick={() => router.push('/games')}
            className="btn-secondary"
          >
            返回
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ACHIEVEMENTS.map((achievement, index) => {
            const isUnlocked = achievement.requirement(progress);
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  modern-card p-8 flex items-center gap-6 relative
                  ${isUnlocked ? 'border-rose-100' : 'opacity-60 grayscale'}
                `}
              >
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-sm
                  ${isUnlocked ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-300'}
                `}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-xl font-bold mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                    {achievement.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                    {achievement.description}
                  </p>
                </div>

                {isUnlocked && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md"
                  >
                    已解锁
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-24 p-12 modern-card text-center bg-slate-50/30">
          <div className="text-6xl mb-8">🏆</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">全成就挑战</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-10 leading-relaxed font-medium">解锁所有成就，即可在纪念日当天开启隐藏惊喜！</p>
          
          <div className="max-w-sm mx-auto">
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(ACHIEVEMENTS.filter(a => a.requirement(progress)).length / ACHIEVEMENTS.length) * 100}%` }}
                className="h-full bg-rose-500"
              />
            </div>
            <div className="text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">
              已完成 {ACHIEVEMENTS.filter(a => a.requirement(progress)).length} / {ACHIEVEMENTS.length}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
