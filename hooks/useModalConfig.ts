'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type ModalType = 'success' | 'info' | 'warning' | 'error';

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  description: string;
  icon: string;
  type: ModalType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  autoClose?: number; // 毫秒
}

export function useModalConfig() {
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    description: '',
    icon: '',
    type: 'success',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const closeModal = useCallback(() => {
    clearTimer();
    setModalConfig((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, [clearTimer]);

  const showModal = useCallback((config: Omit<ModalConfig, 'isOpen'>) => {
    clearTimer();
    setModalConfig({
      ...config,
      isOpen: true,
    });

    if (config.autoClose) {
      timerRef.current = setTimeout(() => {
        closeModal();
      }, config.autoClose);
    }
  }, [closeModal, clearTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    modalConfig,
    showModal,
    closeModal,
  };
}
