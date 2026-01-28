'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  confirmText = '确定',
  cancelText,
  onConfirm,
  onCancel,
  type = 'success'
}: ModalProps) {
  const isImageUrl = icon && (icon.startsWith('http') || icon.startsWith('/') || icon.length > 10);

  const colorConfig = {
    success: 'text-green-600 bg-green-50',
    info: 'text-blue-600 bg-blue-50',
    warning: 'text-yellow-600 bg-yellow-50',
    error: 'text-red-600 bg-red-50',
  };

  const btnConfig = {
    success: 'bg-green-600 hover:bg-green-700 shadow-green-200',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
    warning: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-200',
    error: 'bg-red-600 hover:bg-red-700 shadow-red-200',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[200] p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`bg-white rounded-[2.5rem] p-8 md:p-10 w-full text-center shadow-2xl overflow-hidden ${
              isImageUrl ? 'max-w-2xl' : 'max-w-sm'
            }`}
          >
            {icon && (
              <motion.div 
                animate={isImageUrl ? {} : { y: [0, -10, 0] }}
                transition={isImageUrl ? {} : { repeat: Infinity, duration: 2 }}
                className={`${isImageUrl ? 'mb-8' : 'text-6xl mb-6'} flex justify-center`}
              >
                {!isImageUrl ? (
                  <span>{icon}</span>
                ) : (
                  <div className="relative w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                    <img 
                      src={icon} 
                      alt="Reward" 
                      className="w-full h-auto max-h-[55vh] object-contain mx-auto"
                    />
                  </div>
                )}
              </motion.div>
            )}
            <h2 className={`text-3xl font-bold mb-3 ${colorConfig[type].split(' ')[0]}`}>{title}</h2>
            {description && <p className="text-slate-500 mb-10 font-medium leading-relaxed px-4">{description}</p>}
            
            <div className={`flex gap-4 ${isImageUrl ? 'flex-row' : 'flex-col'}`}>
              {cancelText && (
                <button
                  onClick={() => {
                    if (onCancel) onCancel();
                    onClose();
                  }}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 active:scale-95 transition-all text-sm tracking-widest uppercase"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  if (onConfirm) onConfirm();
                  onClose();
                }}
                className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm tracking-widest uppercase ${btnConfig[type]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
