'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Modal from '@/components/Modal';
import { GIFTS, Gift, getMergedProgress, saveProgress } from '@/lib/game';
import { useModalConfig } from '@/hooks/useModalConfig';
import { useSound } from '@/hooks/useSound';

export default function GiftsPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(getMergedProgress());
  const { modalConfig, showModal, closeModal } = useModalConfig();
  const { playSFX } = useSound();

  useEffect(() => {
    setProgress(getMergedProgress());
  }, []);

  const handleRedeem = (gift: Gift) => {
    if (progress.totalCoins < gift.price) {
      showModal({
        title: '金币不足',
        description: `还需要 ${gift.price - progress.totalCoins} 💰 才能兑换这个礼包哦。`,
        icon: '😢',
        type: 'warning',
      });
      return;
    }

    if (progress.unlockedGifts.includes(gift.id)) {
      showModal({
        title: '提示',
        description: '你已经兑换过这个礼包啦！',
        icon: '📦',
        type: 'info',
      });
      return;
    }

    playSFX('coin');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    const newCoins = progress.totalCoins - gift.price;
    const newGifts = [...progress.unlockedGifts, gift.id];
    
    saveProgress({ totalCoins: newCoins, unlockedGifts: newGifts });
    setProgress({ ...progress, totalCoins: newCoins, unlockedGifts: newGifts });

    showModal({
      title: '兑换成功！',
      description: `你获得了【${gift.name}】！截图保存并向对方出示即可使用。`,
      icon: gift.icon,
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">惊喜礼盒</h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">用金币兑换爱心礼券</p>
          </motion.div>
          
          <div className="modern-card px-8 py-4 flex flex-col items-center justify-center min-w-[160px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">我的金币</span>
            <span className="text-3xl font-bold text-rose-500">{progress.totalCoins} 💰</span>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GIFTS.map((gift, index) => {
            const isUnlocked = progress.unlockedGifts.includes(gift.id);
            return (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  relative modern-card p-8 flex flex-col transition-all duration-300
                  ${isUnlocked ? 'border-emerald-100 bg-emerald-50/10' : 'hover:border-rose-100'}
                `}
              >
                <div className="text-7xl mb-8 text-center">{gift.icon}</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{gift.name}</h3>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed text-center font-medium">{gift.description}</p>
                
                <div className="flex flex-col gap-4 mt-auto">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">消耗</span>
                    <span className="text-lg font-bold text-rose-400">{gift.price} 💰</span>
                  </div>
                  <button
                    onClick={() => handleRedeem(gift)}
                    disabled={isUnlocked}
                    className={`
                      w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all
                      ${isUnlocked 
                        ? 'bg-emerald-500 text-white cursor-default' 
                        : 'btn-primary'}
                    `}
                  >
                    {isUnlocked ? '已拥有' : '立即兑换'}
                  </button>
                </div>

                {isUnlocked && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-md">
                    已兑换
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.push('/games')}
          className="w-full mt-24 btn-secondary py-5 text-[10px] tracking-[0.3em] uppercase"
        >
          返回关卡
        </motion.button>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        description={modalConfig.description}
        icon={modalConfig.icon}
        type={modalConfig.type}
      />
    </div>
  );
}
