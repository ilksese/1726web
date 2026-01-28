'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/hooks/useSound';

interface Photo {
  id: string;
  url: string;
  caption: string;
}

export default function PhotoGallery() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playSFX } = useSound();

  useEffect(() => {
    const saved = localStorage.getItem('photoGallery');
    if (saved) setPhotos(JSON.parse(saved));
  }, []);

  const saveToLocal = (updated: Photo[]) => {
    localStorage.setItem('photoGallery', JSON.stringify(updated));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: Photo = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          url: event.target?.result as string,
          caption: '添加描述...',
        };
        const updated = [newPhoto, ...photos];
        setPhotos(updated);
        saveToLocal(updated);
        playSFX('coin');
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    saveToLocal(updated);
    playSFX('click');
  };

  const updateCaption = (id: string, caption: string) => {
    const updated = photos.map(p => p.id === id ? { ...p, caption } : p);
    setPhotos(updated);
    saveToLocal(updated);
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">我们的相册</h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">定格我们的美好瞬间</p>
          </motion.div>
          <div className="flex gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              上传照片
            </button>
            <button 
              onClick={() => router.push('/games')}
              className="btn-secondary"
            >
              返回
            </button>
          </div>
        </header>

        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept="image/*" 
          onChange={handleUpload} 
          className="hidden" 
        />

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          <AnimatePresence>
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative group break-inside-avoid modern-card overflow-hidden cursor-zoom-in"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img src={photo.url} alt="Memory" className="w-full h-auto transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-rose-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                  <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm p-3 rounded-xl">
                    <p className="text-xs font-bold text-slate-800 truncate pr-4 uppercase tracking-widest">{photo.caption}</p>
                    <button 
                      onClick={(e) => deletePhoto(photo.id, e)}
                      className="p-2 text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {photos.length === 0 && (
          <div className="py-40 text-center">
            <div className="text-8xl mb-8 opacity-20">📷</div>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-[0.3em]">相册空空如也</p>
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-4 md:p-12"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.img 
                layoutId={selectedPhoto.id}
                src={selectedPhoto.url} 
                className="max-w-full max-h-[70vh] rounded-3xl shadow-2xl border border-slate-100"
              />
              <div className="mt-12 max-w-xl w-full" onClick={e => e.stopPropagation()}>
                <input 
                  type="text"
                  value={selectedPhoto.caption}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSelectedPhoto({ ...selectedPhoto, caption: next });
                    updateCaption(selectedPhoto.id, next);
                  }}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-4 text-center text-xl font-bold text-slate-800 focus:outline-none focus:border-rose-200 transition-all"
                />
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="w-full mt-6 btn-ghost text-[10px] tracking-[0.2em] uppercase font-bold"
                >
                  关闭预览
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
