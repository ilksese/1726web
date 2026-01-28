'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getMergedProgress, saveProgress, Message } from '@/lib/game';
import { useSound } from '@/hooks/useSound';

const COLORS = [
  'bg-rose-50 border-rose-100',
  'bg-emerald-50 border-emerald-100',
  'bg-amber-50 border-amber-100',
  'bg-slate-50 border-slate-100',
];

export default function MessageBoard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [author, setAuthor] = useState('');
  const { playSFX } = useSound();

  useEffect(() => {
    const progress = getMergedProgress();
    setMessages(progress.messages);
  }, []);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !author.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      author: author,
      date: new Date().toLocaleDateString(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    saveProgress({ messages: updatedMessages });
    setInputText('');
    playSFX('coin');
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    saveProgress({ messages: updated });
    playSFX('click');
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">留言板</h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">来自心底的留言</p>
          </motion.div>
          <button 
            onClick={() => router.push('/games')}
            className="btn-secondary"
          >
            返回
          </button>
        </header>

        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-card p-10 mb-20"
        >
          <form onSubmit={handlePost} className="space-y-6">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="写下你想说的话..."
              className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-50 rounded-3xl focus:outline-none focus:border-rose-100 transition-all text-slate-700 font-medium resize-none text-lg"
            />
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="你的称呼"
                className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:outline-none focus:border-rose-100 text-slate-700 font-bold"
              />
              <button 
                type="submit"
                className="btn-primary"
              >
                发布留言
              </button>
            </div>
          </form>
        </motion.div>

        {/* Sticky Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className={`p-10 rounded-[2.5rem] border transition-all relative group ${msg.color}`}
              >
                <button 
                  onClick={() => deleteMessage(msg.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-rose-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <p className="text-slate-800 font-medium leading-relaxed mb-10 min-h-[120px] whitespace-pre-wrap text-lg">
                  {msg.text}
                </p>
                <div className="flex justify-between items-center border-t border-black/5 pt-6">
                  <span className="text-[10px] font-bold text-black/30 uppercase tracking-[0.2em] italic">
                    {msg.author}
                  </span>
                  <span className="text-[10px] text-black/20 font-bold">{msg.date}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {messages.length === 0 && (
            <div className="col-span-full py-40 text-center">
              <div className="text-8xl mb-8 opacity-10">🍃</div>
              <p className="text-sm font-bold text-slate-300 uppercase tracking-[0.3em]">暂无留言</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
