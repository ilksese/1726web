export interface LevelReward {
  name: string;
  description: string;
  image: string;
}

export interface Level {
  id: number;
  name: string;
  path: string;
  unlocked: boolean;
  completed: boolean;
  firstTimeReward: LevelReward;
}

export interface SettlementResult {
  isFirstTime: boolean;
  reward: LevelReward;
  earnedCoins: number;
  isDailyBonus: boolean;
}

export interface Message {
  id: string;
  text: string;
  author: string;
  date: string;
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (progress: GameProgress) => boolean;
}

export interface GameProgress {
  levels: Level[];
  totalCoins: number;
  purchasedItems: number[]; // ID of shop items
  unlockedGifts: number[]; // ID of gifts
  messages: Message[];
  unlockedAchievements: string[];
  lastDailyChallengeDate?: string; // YYYY-MM-DD
  dailyChallengeTargetId?: number;
}

export const INITIAL_LEVELS: Level[] = [
  { 
    id: 0, name: '起点', path: '', unlocked: true, completed: true,
    firstTimeReward: { name: '初心', description: '一切美好的开始。', image: '🌱' }
  },
  { 
    id: 1, name: '爱know', path: '/game/understand', unlocked: true, completed: false,
    firstTimeReward: { name: '心之钥匙', description: '它是打开对方心扉的唯一凭证。', image: '🔑' }
  },
  { 
    id: 2, name: '回忆重组', path: '/game/puzzle', unlocked: false, completed: false,
    firstTimeReward: { name: '记忆碎片', description: '拼凑起我们点点滴滴的珍贵瞬间。', image: '🧩' }
  },
  { 
    id: 3, name: '雷霆战机', path: '/game/thunder-fighter', unlocked: false, completed: false,
    firstTimeReward: { name: '守护勋章', description: '感谢你这一路风雨无阻的勇敢守护。', image: '🛡️' }
  },
  { 
    id: 4, name: '数独挑战', path: '/game/sudoku', unlocked: false, completed: false,
    firstTimeReward: { name: '逻辑之光', description: '见证你们之间无与伦比的默契。', image: '💡' }
  },
  { 
    id: 5, name: '2048之恋', path: '/game/2048', unlocked: false, completed: false,
    firstTimeReward: { name: '永恒基石', description: '爱意在不断的融合中走向永恒。', image: '💎' }
  },
  { 
    id: 6, name: '记忆方块', path: '/game/memory', unlocked: false, completed: false,
    firstTimeReward: { name: '思念留声机', description: '即使不见面，心跳也会在同一频道。', image: '📻' }
  },
  { 
    id: 7, name: '节奏大师', path: '/game/rhythm', unlocked: false, completed: false,
    firstTimeReward: { name: '共鸣音符', description: '这是属于我们两个人的心动节拍。', image: '🎵' }
  },
  { 
    id: 8, name: '飞翔的心', path: '/game/flappy', unlocked: false, completed: false,
    firstTimeReward: { name: '勇气之翼', description: '无论逆风顺风，我们都并肩飞翔。', image: '🕊️' }
  },
  { 
    id: 9, name: '接住这份爱', path: '/game/collector', unlocked: false, completed: false,
    firstTimeReward: { name: '满溢福袋', description: '收集每一份微小的爱，汇聚成星海。', image: '🧧' }
  },
  { 
    id: 10, name: '天生一对', path: '/game/sync', unlocked: false, completed: false,
    firstTimeReward: { name: '灵魂共振', description: '不需要言语，你的眼神就是我的答案。', image: '🔗' }
  },
];

export interface Gift {
  id: number;
  name: string;
  description: string;
  icon: string;
  price: number;
}

export const GIFTS: Gift[] = [
  { id: 1, name: '洗碗券', description: '使用此券，对方必须无条件洗碗一次！', icon: '🥣', price: 100 },
  { id: 2, name: '按摩礼包', description: '享受 20 分钟的全方位手工按摩服务。', icon: '💆', price: 200 },
  { id: 3, name: '不准生气券', description: '吵架时使用，对方必须立刻停止生气 5 分钟。', icon: '😤', price: 300 },
  { id: 4, name: '大餐预约', description: '预约一顿你最想吃的豪华大餐。', icon: '🍲', price: 500 },
  { id: 5, name: '神秘惊喜', description: '由对方在 24 小时内策划的一个小惊喜。', icon: '🎁', price: 1000 },
];

export const ACHIEVEMENTS: Achievement[] = [
  { 
    id: 'rich', 
    name: '小富翁', 
    description: '累计获得 500 金币', 
    icon: '💰', 
    requirement: (p) => p.totalCoins >= 500 
  },
  { 
    id: 'gamer', 
    name: '游戏达人', 
    description: '完成前 3 个关卡', 
    icon: '🎮', 
    requirement: (p) => p.levels.filter(l => l.id >= 1 && l.id <= 3 && l.completed).length === 3 
  },
  { 
    id: 'gift_master', 
    name: '慷慨大方', 
    description: '兑换 3 个惊喜礼包', 
    icon: '💝', 
    requirement: (p) => p.unlockedGifts.length >= 3 
  },
  { 
    id: 'all_clear', 
    name: '通关专家', 
    description: '完成所有游戏关卡', 
    icon: '🏆', 
    requirement: (p) => p.levels.every(l => l.completed) 
  },
];

export const getMergedProgress = (): GameProgress => {
  const defaultProgress: GameProgress = {
    levels: INITIAL_LEVELS,
    totalCoins: 0,
    purchasedItems: [],
    unlockedGifts: [],
    messages: [],
    unlockedAchievements: [],
  };

  if (typeof window === 'undefined') return defaultProgress;
  
  const savedProgress = localStorage.getItem('gameProgress');
  if (!savedProgress) return defaultProgress;
  
  try {
    const progress = JSON.parse(savedProgress);
    const levels = INITIAL_LEVELS.map(defaultLevel => {
      const savedLevel = (progress.levels || []).find((l: any) => l.id === defaultLevel.id);
      return savedLevel ? { ...defaultLevel, ...savedLevel } : defaultLevel;
    });

    // 自动解锁逻辑
    for (let i = 0; i < levels.length - 1; i++) {
      if (levels[i].completed) {
        levels[i + 1].unlocked = true;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    let dailyChallengeTargetId = progress.dailyChallengeTargetId;
    let lastDailyChallengeDate = progress.lastDailyChallengeDate;

    if (lastDailyChallengeDate !== today) {
      dailyChallengeTargetId = Math.floor(Math.random() * (INITIAL_LEVELS.length - 1)) + 1;
      lastDailyChallengeDate = today;
    }
    
    return {
      levels,
      totalCoins: progress.totalCoins || 0,
      purchasedItems: progress.purchasedItems || [],
      unlockedGifts: progress.unlockedGifts || [],
      messages: progress.messages || [],
      unlockedAchievements: progress.unlockedAchievements || [],
      lastDailyChallengeDate,
      dailyChallengeTargetId,
    };
  } catch (e) {
    console.error('Failed to parse game progress', e);
    return defaultProgress;
  }
};

export const saveProgress = (partialProgress: Partial<GameProgress>) => {
  if (typeof window === 'undefined') return;
  const current = getMergedProgress();
  const next = { ...current, ...partialProgress };
  localStorage.setItem('gameProgress', JSON.stringify(next));
};

export const completeLevel = (levelId: number): SettlementResult => {
  const progress = getMergedProgress();
  const currentLevel = progress.levels.find(l => l.id === levelId);
  const isFirstTime = currentLevel ? !currentLevel.completed : false;
  
  const updatedLevels = progress.levels.map(l => {
    if (l.id === levelId) return { ...l, completed: true };
    if (l.id === levelId + 1) return { ...l, unlocked: true };
    return l;
  });

  let earnedCoins = isFirstTime ? 100 : 50;
  let isDailyBonus = false;

  if (progress.dailyChallengeTargetId === levelId) {
    earnedCoins += 100;
    isDailyBonus = true;
    progress.dailyChallengeTargetId = undefined;
  }

  saveProgress({ 
    levels: updatedLevels, 
    totalCoins: progress.totalCoins + earnedCoins,
    dailyChallengeTargetId: progress.dailyChallengeTargetId
  });

  return {
    isFirstTime,
    reward: currentLevel?.firstTimeReward || INITIAL_LEVELS[0].firstTimeReward,
    earnedCoins,
    isDailyBonus
  };
};
