'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { completeLevel, SettlementResult, INITIAL_LEVELS } from '@/lib/game';
import { useModalConfig } from './useModalConfig';
import { useSound } from './useSound';

export function useGameSettlement() {
  const router = useRouter();
  const { playSFX } = useSound();
  
  // 两个独立的弹窗控制器
  const rewardModal = useModalConfig();
  const navModal = useModalConfig();
  
  const [showGift, setShowGift] = useState(false);
  const [settlement, setSettlement] = useState<SettlementResult | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);

  const triggerNextLevelModal = useCallback((id: number) => {
    const nextLevel = INITIAL_LEVELS.find(l => l.id === id + 1);
    
    // 播放通关特效
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (nextLevel && nextLevel.path) {
      navModal.showModal({
        title: '关卡挑战成功！',
        description: `下一关：${nextLevel.name}`,
        icon: '🎉',
        type: 'success',
        confirmText: '继续下一关',
        onConfirm: () => router.push(nextLevel.path),
        cancelText: '返回关卡列表',
        onCancel: () => router.push('/games'),
      });
    } else {
      navModal.showModal({
        title: '成就达成！',
        description: '你已完成目前所有的挑战。快去留言板写下此时的心情吧！',
        icon: '🏆',
        type: 'success',
        confirmText: '返回主页',
        onConfirm: () => router.push('/'),
        cancelText: '去留言',
        onCancel: () => router.push('/messages'),
      });
    }
  }, [navModal, router]);

  const handleSettlement = useCallback((levelId: number) => {
    setCurrentLevelId(levelId);
    const result = completeLevel(levelId);
    setSettlement(result);

    if (result.isFirstTime) {
      setShowGift(true);
    } else {
      playSFX('coin_receive');
      rewardModal.showModal({
        title: '',
        description: `获得 +${result.earnedCoins} 💰`,
        icon: '',
        type: 'success',
        autoClose: 2000,
      });
      // 金币弹窗2秒后自动消失，稍微给点间隙弹出导航弹窗
      setTimeout(() => {
        triggerNextLevelModal(levelId);
      }, 2100);
    }
  }, [playSFX, rewardModal, triggerNextLevelModal]);

  const onGiftOpenComplete = useCallback(() => {
    setShowGift(false);
    if (settlement && currentLevelId !== null) {
      playSFX('win');
      rewardModal.showModal({
        title: '解锁首通奖励！',
        description: `获得【${settlement.reward.name}】：${settlement.reward.description}`,
        icon: settlement.reward.image,
        type: 'success',
        confirmText: '收下奖励并继续',
        onConfirm: () => {
          triggerNextLevelModal(currentLevelId);
        },
      });
    }
  }, [settlement, currentLevelId, rewardModal, playSFX, triggerNextLevelModal]);

  return {
    handleSettlement,
    showGift,
    onGiftOpenComplete,
    // 导出两个独立的配置供页面渲染
    rewardModal,
    navModal,
  };
}
