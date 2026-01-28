'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { INITIAL_LEVELS, getMergedProgress, saveProgress } from '@/lib/game';
import { useSound } from '@/hooks/useSound';
import { useGameSettlement } from '@/hooks/useGameSettlement';
import GiftBox from '@/components/GiftBox';
import Modal from '@/components/Modal';

interface SyncQuestion { id: number; question: string; options: string[]; }

const SYNC_QUESTIONS: SyncQuestion[] = [
  { id: 1, question: '周末休息，ta更倾向于？', options: ['宅家看电影', '出门逛街', '户外运动', '找朋友聚会'] },
  { id: 2, question: '如果中了大奖，ta第一件事会做？', options: ['存起来', '买心仪已久的礼物', '带你去旅游', '请全家吃大餐'] },
  { id: 3, question: 'ta最喜欢的解压方式是？', options: ['睡觉', '吃美食', '找你倾诉', '一个人静静'] },
  { id: 4, question: '在ta眼中，你最可爱的瞬间是？', options: ['刚睡醒时', '认真工作时', '撒娇时', '吃东西时'] },
  { id: 5, question: '你们最想一起去的地方是？', options: ['浪漫海岛', '古镇古村', '繁华都市', '极地极光'] },
];

export default function SyncQuiz() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [step, setStep] = useState<'intro' | 'p1' | 'p2' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [p1Answers, setP1Answers] = useState<number[]>([]);
  const [p2Answers, setP2Answers] = useState<number[]>([]);

  const handleAnswer = (idx: number) => {
    playSFX('click');
    if (step === 'p1') {
      const nextAnswers = [...p1Answers, idx];
      if (currentIdx < SYNC_QUESTIONS.length - 1) { setP1Answers(nextAnswers); setCurrentIdx(currentIdx + 1); }
      else { setP1Answers(nextAnswers); setStep('p2'); setCurrentIdx(0); alert('第一阶段完成！现在请把手机交给另一半，轮到ta来猜你的心意了！'); }
    } else if (step === 'p2') {
      const nextAnswers = [...p2Answers, idx];
      if (currentIdx < SYNC_QUESTIONS.length - 1) { setP2Answers(nextAnswers); setCurrentIdx(currentIdx + 1); }
      else { setP2Answers(nextAnswers); setStep('result'); calculateScore(p1Answers, nextAnswers); }
    }
  };

  const calculateScore = (a1: number[], a2: number[]) => {
    let matches = 0; a1.forEach((val, i) => { if (val === a2[i]) matches++; });
    const scoreValue = (matches / SYNC_QUESTIONS.length) * 100;
    if (scoreValue >= 60) handleSettlement(10);
    else {
      playSFX('lose'); alert(`默契不足！只有 ${Math.round(scoreValue)}%，再接再厉哦！`);
      setStep('intro'); setP1Answers([]); setP2Answers([]); setCurrentIdx(0);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      <div className="max-w-xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="text-center">
              <div className="text-8xl mb-12 opacity-10">💑</div><h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-4">天生一对</h1><p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px] mb-16">心灵同步</p>
              <div className="modern-card p-10 md:p-14 mb-12"><p className="text-slate-500 leading-relaxed font-medium text-sm mb-10">这不仅仅是一个测试，更是深入了解彼此的机会。<br/>第一人输入真实想法，第二人尝试猜对。<br/><span className="font-bold text-rose-400">达到 60% 默契度即可通关！</span></p><button onClick={() => setStep('p1')} className="btn-primary w-full py-5 text-sm tracking-widest">开始挑战</button></div>
              <button onClick={() => router.push('/games')} className="btn-ghost text-xs tracking-widest uppercase font-bold">← 返回关卡</button>
            </motion.div>
          )}
          {(step === 'p1' || step === 'p2') && (
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
              <div className="flex justify-between items-center mb-10"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${step === 'p1' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>{step === 'p1' ? '玩家 1: 真实想法' : '玩家 2: 你的猜测'}</span><span className="text-slate-300 font-bold text-xs">{currentIdx + 1} / {SYNC_QUESTIONS.length}</span></div>
              <div className="modern-card p-10 md:p-14 mb-12"><h2 className="text-3xl font-bold text-slate-800 mb-12 leading-tight">{SYNC_QUESTIONS[currentIdx].question}</h2><div className="space-y-4">{SYNC_QUESTIONS[currentIdx].options.map((opt, i) => (<button key={i} onClick={() => handleAnswer(i)} className="w-full p-6 text-left border-2 border-slate-50 bg-slate-50/50 rounded-2xl font-bold text-slate-600 hover:border-rose-100 hover:bg-rose-50/30 hover:text-rose-600 transition-all active:scale-[0.99]">{opt}</button>))}</div></div>
              <button onClick={() => router.push('/games')} className="w-full btn-ghost text-[10px] tracking-[0.3em] uppercase font-bold">退出挑战</button>
            </motion.div>
          )}
          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
              <div className="text-7xl mb-10">💑</div><h2 className="text-xs font-bold text-slate-300 tracking-[0.4em] uppercase mb-4">同步率</h2><div className="text-8xl font-black text-rose-500 mb-16">{Math.round((p1Answers.filter((v, i) => v === p2Answers[i]).length / SYNC_QUESTIONS.length) * 100)}%</div>
              <div className="modern-card p-8 md:p-10 mb-12 space-y-6">{SYNC_QUESTIONS.map((q, i) => (<div key={q.id} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0"><span className="text-slate-500 text-sm font-medium text-left truncate pr-4">{q.question}</span><span className={`text-[10px] font-black uppercase tracking-widest ${p1Answers[i] === p2Answers[i] ? 'text-emerald-500' : 'text-rose-300'}`}>{p1Answers[i] === p2Answers[i] ? '匹配' : '不匹配'}</span></div>))}</div>
              <div className="flex flex-col gap-4"><button onClick={() => { setStep('intro'); setP1Answers([]); setP2Answers([]); setCurrentIdx(0); }} className="btn-primary w-full py-5 text-sm tracking-widest">重试挑战</button><button onClick={() => router.push('/games')} className="btn-secondary w-full py-5 text-sm tracking-widest">返回列表</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
