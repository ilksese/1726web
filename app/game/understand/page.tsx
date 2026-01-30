'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import Modal from '@/components/Modal';
import { getMergedProgress, saveProgress } from '@/lib/game';
import { useSound } from '@/hooks/useSound';
import { useGameSettlement } from '@/hooks/useGameSettlement';
import GiftBox from '@/components/GiftBox';
import styles from './understand.module.css';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  { id: 1, question: '我最喜欢的颜色是？', options: ['红色', '粉色', '蓝色', '紫色'], correctAnswer: 1 },
  { id: 2, question: '我最喜欢的食物是？', options: ['火锅', '寿司', '烧烤', '甜品'], correctAnswer: 3 },
  { id: 3, question: '我的王者最高段位是？', options: ['绝世王者', '无双王者', '荣耀王者', '最强王者'], correctAnswer: 3 },
  { id: 4, question: '我最喜欢的季节是？', options: ['春天', '夏天', '秋天', '冬天'], correctAnswer: 4 },
  { id: 5, question: '我最喜欢的动物是？', options: ['猫咪', '狗狗', '兔子', '熊猫'], correctAnswer: 1 },
];

export default function UnderstandGame() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'in' | 'out'>('in');
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    const correct = selectedAnswer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      playSFX('coin');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ff69b4', '#ff0000', '#ffffff'] });
    } else {
      playSFX('hit');
    }
  };

  const handleNext = () => {
    playSFX('click');
    if (!isCorrect) {
      setShowResult(false);
      setSelectedAnswer(null);
      return;
    }
    setShowResult(false);
    setSelectedAnswer(null);
    setSlideDirection('out');
    setTimeout(() => {
      if (isLastQuestion) {
        handleSettlement(1);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSlideDirection('in');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      
      {/* 奖励弹窗 */}
      <Modal
        onClose={rewardModal.closeModal}
        {...rewardModal.modalConfig}
      />

      {/* 导航弹窗 */}
      <Modal
        onClose={navModal.closeModal}
        {...navModal.modalConfig}
      />

      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-rose-500 mb-2">爱know</h1>
          <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">深入了解彼此</p>
        </motion.div>

        <div className="mb-12">
          <div className="flex justify-between text-[10px] text-slate-400 mb-3 font-bold uppercase tracking-widest">
            <span>问题 {currentQuestionIndex + 1} / {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} className="h-full bg-rose-500 transition-all duration-500" />
          </div>
        </div>

        <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="modern-card p-8 md:p-12 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-10 leading-tight">{currentQuestion.question}</h2>
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button key={index} onClick={() => { if (!showResult) { playSFX('click'); setSelectedAnswer(index); } }} disabled={showResult} className={`w-full p-5 rounded-2xl text-left font-semibold transition-all duration-200 border-2 ${selectedAnswer === index ? 'border-rose-500 bg-rose-50/30 text-rose-600' : 'border-slate-50 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-slate-50'} ${showResult && isCorrect && index === currentQuestion.correctAnswer ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : ''} ${showResult && selectedAnswer === index && !isCorrect ? 'border-rose-300 bg-rose-50 text-rose-700' : ''} disabled:cursor-default`}>
                <div className="flex justify-between items-center">
                  <span className="text-lg">{option}</span>
                  {showResult && isCorrect && index === currentQuestion.correctAnswer && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl">✨</motion.span>}
                </div>
              </button>
            ))}
          </div>
          {!showResult ? (
            <button onClick={handleSubmit} disabled={selectedAnswer === null} className={`w-full mt-10 py-5 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase transition-all ${selectedAnswer === null ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'btn-primary'}`}>确定答案</button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
              <div className={`text-center text-sm font-bold mb-6 tracking-widest uppercase ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>{isCorrect ? '恭喜你，答对了！' : '很遗憾，答错了'}</div>
              <button onClick={handleNext} className={`w-full py-5 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase transition-all ${isCorrect ? 'btn-primary' : 'btn-secondary'}`}>{isCorrect ? (isLastQuestion ? '完成关卡' : '下一题') : '再试一次'}</button>
            </motion.div>
          )}
        </motion.div>
        <button onClick={() => router.push('/games')} className="w-full btn-ghost text-[10px] tracking-[0.3em] uppercase font-bold">返回关卡列表</button>
      </div>
    </div>
  );
}
