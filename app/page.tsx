'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BookOpen, Send, Lock, ChevronRight } from 'lucide-react';
import AnniversaryIntro from '@/components/AnniversaryIntro';

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loveDuration, setLoveDuration] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      
      // Calculate countdown to next anniversary
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 0, 30); // 1月30日
      if (now > targetDate) {
        targetDate = new Date(currentYear + 1, 0, 30);
      }
      const difference = targetDate.getTime() - now.getTime();
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });

      // Calculate duration since 2025-01-30
      const startDate = new Date(2025, 0, 30);
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      
      if (months < 0 || (months === 0 && now.getDate() < startDate.getDate())) {
        years--;
        months += 12;
      }
      if (now.getDate() < startDate.getDate()) {
        months--;
        if (months < 0) {
          years--;
          months += 12;
        }
      }

      let durationStr = '';
      if (years > 0) {
        durationStr = `${years}年${months > 0 ? `零${months}个月` : ''}`;
      } else {
        durationStr = `${months}个月`;
      }
      if (!durationStr || durationStr === '0个月') {
        const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        durationStr = `${diffDays}天`;
      }
      
      setLoveDuration(durationStr);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'love') {
      router.push('/games');
    } else {
      setError('口令不对哦，再想想？');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 relative overflow-hidden">
      <AnniversaryIntro />
      <div className="relative z-10 text-center w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-rose-500 leading-tight">
            陪伴{loveDuration}
          </h1>
          <p className="text-slate-400 font-medium tracking-[0.4em] mb-12 md:mb-20 uppercase text-[10px] md:text-xs">
            我们的旅程 & 永恒的爱
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="modern-card p-10 md:p-14 mb-16 cursor-pointer group"
          onClick={() => setShowPasswordInput(true)}
        >
          <h2 className="text-xs font-bold mb-12 text-slate-300 tracking-[0.3em] uppercase flex items-center justify-center gap-4">
            <span className="w-12 h-[1px] bg-slate-100"></span>
            下一个纪念日
            <span className="w-12 h-[1px] bg-slate-100"></span>
          </h2>

          <div className="grid grid-cols-4 gap-4 md:gap-8 text-center">
            {Object.entries(timeLeft).map(([unit, value], i) => (
              <div key={unit} className="flex flex-col items-center">
                <div className="text-4xl md:text-6xl font-light text-slate-800 font-sans tracking-tight leading-none mb-3">
                  {value}
                </div>
                <div className="text-[9px] md:text-10px text-slate-400 uppercase tracking-widest font-bold">
                  {unit === 'days' ? '天' : unit === 'hours' ? '时' : unit === 'minutes' ? '分' : '秒'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-14 flex items-center justify-center gap-2 text-rose-400 text-[10px] font-bold tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            进入游戏室 <ChevronRight className="w-3 h-3" />
          </div>
        </motion.div>

        <div className="flex justify-center gap-6 flex-wrap">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/story')}
            className="btn-secondary"
          >
            我们的故事
          </motion.button>
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/letter')}
            className="btn-primary"
          >
            神秘情书
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showPasswordInput && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pink-900/20 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordInput(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl border border-slate-100 relative overflow-hidden" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-rose-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 text-center">输入访问口令</h3>
              <p className="text-slate-400 text-[10px] text-center mb-10 font-bold uppercase tracking-widest">仅限私人访问</p>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="relative mb-8">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-rose-200 text-slate-900 font-semibold text-center placeholder:text-slate-300 transition-all"
                    placeholder="输入秘密口令"
                    autoFocus
                  />
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-rose-500 text-[10px] mt-3 text-center font-bold tracking-tight"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="btn-primary w-full py-4"
                  >
                    解锁甜蜜
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordInput(false)}
                    className="btn-ghost text-xs tracking-widest uppercase font-bold"
                  >
                    返回
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
