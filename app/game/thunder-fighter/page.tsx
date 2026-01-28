'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { INITIAL_LEVELS, getMergedProgress, saveProgress } from '@/lib/game';
import { useSound } from '@/hooks/useSound';
import { useGameSettlement } from '@/hooks/useGameSettlement';
import GiftBox from '@/components/GiftBox';
import Modal from '@/components/Modal';

const PLANE_INIT_HP = 4;
const BULLET_COOLDOWN = 500; 
const MONSTER_MOVE_INTERVAL = 600; 

type Entity = { id: number; x: number; y: number; hp: number; maxHp: number; type: 'normal' | 'elite' | 'boss'; emoji: string; };
type Bullet = { id: number; batchId: number; x: number; y: number; };
type ShopItem = { id: number; name: string; price: number; color: string; };

const SHOP_ITEMS: ShopItem[] = [
  { id: 1, name: '超级能量', price: 50, color: 'bg-yellow-400' },
  { id: 2, name: '护盾发生器', price: 100, color: 'bg-blue-400' },
  { id: 3, name: '粒子炮', price: 200, color: 'bg-purple-500' },
  { id: 4, name: '复活甲', price: 500, color: 'bg-green-400' },
];

export default function ThunderFighter() {
  const router = useRouter();
  const { playSFX } = useSound();
  const { handleSettlement, showGift, onGiftOpenComplete, rewardModal, navModal } = useGameSettlement();

  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'over' | 'shop'>('start');
  const [coins, setCoins] = useState(0);
  const [playerHp, setPlayerHp] = useState(PLANE_INIT_HP);
  const [bulletLevel, setBulletLevel] = useState(1);
  const [normalKillCount, setNormalKillCount] = useState(0);
  const [score, setScore] = useState(0);
  const [inventory, setInventory] = useState<number[]>([]);
  const [hasRevived, setHasRevived] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 80 });
  const [monsters, setMonsters] = useState<Entity[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);

  const gameLoopRef = useRef<number | null>(null);
  const lastShotTime = useRef(0);
  const lastMonsterMoveTime = useRef(0);
  const entityIdCounter = useRef(0);
  const batchIdCounter = useRef(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const hasItem = (id: number) => inventory.includes(id);
  const currentMaxHp = hasItem(2) ? 6 : PLANE_INIT_HP;
  const currentBulletCooldown = hasItem(3) ? 350 : BULLET_COOLDOWN;

  useEffect(() => {
    const progress = getMergedProgress();
    setCoins(progress.totalCoins);
    setInventory(progress.purchasedItems || []);
  }, []);

  const requestSensorPermission = async () => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try { await (DeviceMotionEvent as any).requestPermission(); } catch (e) { console.error('Sensor permission denied', e); }
    }
  };

  const buyItem = (item: ShopItem) => {
    if (coins >= item.price) {
      playSFX('coin');
      const newCoins = coins - item.price;
      const newInventory = [...inventory, item.id];
      setCoins(newCoins); setInventory(newInventory);
      saveProgress({ totalCoins: newCoins, purchasedItems: newInventory });
    } else { playSFX('click'); alert(`你需要 ${item.price} 💰 才能购买。`); }
  };

  const spawnMonster = useCallback(() => {
    const rand = Math.random();
    let type: Entity['type'] = 'normal';
    let hp = Math.floor(Math.random() * 41) + 10;
    let emoji = '👾';
    if (rand > 0.95) { type = 'boss'; hp = 250; emoji = '👹'; }
    else if (rand > 0.8) { type = 'elite'; hp = Math.floor(Math.random() * 51) + 70; emoji = '👽'; }
    setMonsters(prev => [...prev, { id: entityIdCounter.current++, x: Math.random() * 90 + 5, y: Math.random() * 30, hp, maxHp: hp, type, emoji }]);
  }, []);

  const handlePause = () => { if (gameState === 'playing') { playSFX('click'); setGameState('paused'); } };

  const update = useCallback(() => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    if (keysPressed.current.size > 0) {
      const step = 1.2;
      setPlayerPos(prev => {
        let { x, y } = prev;
        if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) y = Math.max(5, y - step);
        if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) y = Math.min(95, y + step);
        if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) x = Math.max(5, x - step);
        if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) x = Math.min(95, x + step);
        return { x, y };
      });
    }
    if (now - lastShotTime.current > currentBulletCooldown) {
      const newBullets: Bullet[] = [];
      const currentBatchId = batchIdCounter.current++;
      const count = Math.min(3, bulletLevel);
      for (let i = 0; i < count; i++) {
        newBullets.push({ id: entityIdCounter.current++, batchId: currentBatchId, x: playerPos.x + (i - (count - 1) / 2) * 4, y: playerPos.y - 5 });
      }
      setBullets(prev => [...prev, ...newBullets]);
      lastShotTime.current = now;
    }
    setBullets(prev => prev.map(b => ({ ...b, y: b.y - 2 })).filter(b => b.y > -5));
    if (now - lastMonsterMoveTime.current > MONSTER_MOVE_INTERVAL) {
      setMonsters(prev => {
        let hpDeducted = 0;
        const remaining = prev.map(m => {
          const nextY = m.y + 5;
          if (nextY >= 100) { hpDeducted++; return null; }
          return { ...m, y: nextY };
        }).filter((m): m is Entity => m !== null);
        if (hpDeducted > 0) { playSFX('hit'); setPlayerHp(h => Math.max(0, h - hpDeducted)); }
        return remaining;
      });
      lastMonsterMoveTime.current = now;
      if (Math.random() > 0.7) spawnMonster();
    }
    setPlayerHp(currentHp => {
      if (currentHp <= 0 && gameState === 'playing') {
        if (hasItem(4) && !hasRevived) { playSFX('win'); setHasRevived(true); return 2; }
        playSFX('lose'); setGameState('over');
      }
      return currentHp;
    });
    setBullets(prevBullets => {
      const hitBatchIds = new Set<number>();
      setMonsters(prevMonsters => {
        return prevMonsters.map(m => {
          let currentHp = m.hp;
          const hittingBullet = prevBullets.find(b => !hitBatchIds.has(b.batchId) && Math.abs(b.x - m.x) < 8 && Math.abs(b.y - m.y) < 8);
          if (hittingBullet) { playSFX('hit'); hitBatchIds.add(hittingBullet.batchId); currentHp -= Math.min(3, bulletLevel); }
          if (currentHp <= 0) {
            if (m.type === 'normal') { setCoins(c => c + 5); setNormalKillCount(count => { const next = count + 1; if (next % 3 === 0) setBulletLevel(bl => Math.min(3, bl + 1)); return next; }); }
            else if (m.type === 'elite') { setCoins(c => c + 10); setBulletLevel(bl => Math.min(3, bl + 1)); }
            else { handleSettlement(3); }
            setScore(s => s + m.maxHp); return null;
          }
          return { ...m, hp: currentHp };
        }).filter((m): m is Entity => m !== null);
      });
      return prevBullets.filter(b => !hitBatchIds.has(b.batchId));
    });
    gameLoopRef.current = requestAnimationFrame(update);
  }, [gameState, playerPos, bulletLevel, spawnMonster, currentBulletCooldown, hasItem, hasRevived, handleSettlement, playSFX]);

  useEffect(() => {
    if (gameState === 'playing') gameLoopRef.current = requestAnimationFrame(update);
    else if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, [gameState, update]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysPressed.current.add(e.key.toLowerCase());
    const handleKeyUp = (e: KeyboardEvent) => keysPressed.current.delete(e.key.toLowerCase());
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      if (gameState !== 'playing' || !e.accelerationIncludingGravity) return;
      const { x, y } = e.accelerationIncludingGravity;
      if (x !== null && y !== null) setPlayerPos(prev => ({ x: Math.min(95, Math.max(5, prev.x - x * 1.5)), y: Math.min(95, Math.max(5, prev.y + y * 1.5)) }));
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    if (window.DeviceMotionEvent) window.addEventListener('devicemotion', handleDeviceMotion);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); window.removeEventListener('devicemotion', handleDeviceMotion); };
  }, [gameState]);

  const handlePointerMove = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }
    setPlayerPos({ x: Math.min(95, Math.max(5, ((clientX - rect.left) / rect.width) * 100)), y: Math.min(95, Math.max(5, ((clientY - rect.top) / rect.height) * 100)) });
  };

  useEffect(() => { if (gameState === 'over') saveProgress({ totalCoins: coins }); }, [gameState, coins]);

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden font-sans select-none">
      <GiftBox isOpen={showGift} onOpenComplete={onGiftOpenComplete} />
      <Modal onClose={rewardModal.closeModal} {...rewardModal.modalConfig} />
      <Modal onClose={navModal.closeModal} {...navModal.modalConfig} />
      
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex gap-6 items-center">
          <div className="flex gap-1">{Array.from({ length: PLANE_INIT_HP }).map((_, i) => (<div key={i} className={`w-3 h-3 rounded-full ${i < playerHp ? 'bg-rose-500' : 'bg-slate-100'}`} />))}</div>
          <div className="h-4 w-[1px] bg-slate-200"></div>
          <span className="text-xs font-bold text-rose-500 tracking-widest uppercase">{coins} 💰</span>
          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">等级 {Math.min(3, bulletLevel)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePause} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all border border-slate-100">{gameState === 'playing' ? '⏸' : '▶'}</button>
          <button onClick={() => setGameState('shop')} className="px-4 h-10 bg-rose-500 text-white rounded-xl font-bold text-[10px] tracking-widest uppercase shadow-sm hover:bg-rose-600 transition-all">商店</button>
        </div>
      </div>

      <div ref={containerRef} onMouseMove={handlePointerMove} onTouchMove={handlePointerMove} className="relative w-full h-full cursor-none touch-none">
        <div className="absolute text-5xl transition-all duration-75 pointer-events-none z-10" style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}>🚀</div>
        {bullets.map(b => (<div key={b.id} className="absolute w-1.5 h-4 bg-rose-400 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.4)]" style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }} />))}
        {monsters.map(m => (<div key={m.id} className="absolute flex flex-col items-center transition-all duration-[600ms] linear" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}><div className="bg-slate-900/10 backdrop-blur-sm px-2 py-0.5 rounded-full text-[8px] mb-1 font-bold text-slate-800">{m.hp}</div><div className="text-5xl drop-shadow-lg">{m.emoji}</div></div>))}
      </div>

      {gameState === 'start' && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex z-50 flex-col items-center justify-center p-8 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">雷霆战机</h1><p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px] mb-16">星际守护者</p></motion.div>
          <div className="modern-card p-10 max-w-sm w-full mb-12"><p className="text-slate-500 font-medium text-sm leading-relaxed space-y-2"><span className="block">💻 PC: WASD 控制</span><span className="block">📱 手机: 倾斜屏幕或滑动</span><span className="block">子弹自动发射</span></p></div>
          <button onClick={async () => { playSFX('click'); await requestSensorPermission(); setGameState('playing'); setPlayerHp(currentMaxHp); setMonsters([]); setBullets([]); setScore(0); setBulletLevel(hasItem(1) ? 2 : 1); setHasRevived(false); }} className="btn-primary w-full max-w-sm py-5 text-sm tracking-[0.2em] uppercase font-bold">开始作战</button>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex z-50 flex-col items-center justify-center p-8 text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-12">游戏暂停</h2>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button onClick={() => setGameState('playing')} className="btn-primary w-full py-5 text-sm tracking-widest uppercase font-bold">继续战斗</button>
            <button onClick={() => { saveProgress({ totalCoins: coins }); router.push('/games'); }} className="btn-secondary w-full py-5 text-sm tracking-widest uppercase font-bold">结算退出</button>
          </div>
        </div>
      )}

      {gameState === 'over' && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex z-50 flex-col items-center justify-center p-8 text-center">
          <h2 className="text-4xl font-bold text-rose-500 mb-4">游戏结束</h2><p className="text-slate-500 mb-12">本次获得收益: {coins} 💰</p>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button onClick={() => setGameState('start')} className="btn-primary w-full py-5 text-sm tracking-widest uppercase font-bold">重新开始</button>
            <button onClick={() => router.push('/games')} className="btn-secondary w-full py-5 text-sm tracking-widest uppercase font-bold">返回大厅</button>
          </div>
        </div>
      )}

      {gameState === 'shop' && (
        <div className="absolute inset-0 bg-white z-[60] p-10 md:p-20 overflow-y-auto">
          <div className="flex justify-between items-end mb-20"><div><h2 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">星际商店</h2><p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">升级你的装备</p></div><div className="flex flex-col items-end"><span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">余额</span><div className="text-3xl font-bold text-rose-500">{coins} 💰</div></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">{SHOP_ITEMS.map(item => (<div key={item.id} className="modern-card p-8 group flex flex-col h-full"><div className="w-full aspect-square rounded-2xl mb-8 flex items-center justify-center text-5xl transition-transform duration-500 group-hover:scale-105 bg-slate-50 border border-slate-100">🎁</div><h3 className="text-2xl font-bold text-slate-800 mb-2">{item.name}</h3><p className="text-rose-400 font-bold mb-8 tracking-widest text-sm">{item.price} 💰</p><button onClick={() => buyItem(item)} disabled={hasItem(item.id)} className={`mt-auto w-full py-4 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all ${hasItem(item.id) ? 'bg-slate-100 text-slate-300 cursor-default' : 'btn-primary'}`}>{hasItem(item.id) ? '已装备' : '购买'}</button></div>))}</div>
          <button onClick={() => setGameState('playing')} className="w-full mt-24 btn-secondary py-5 text-[10px] tracking-[0.3em] uppercase">关闭商店</button>
        </div>
      )}
    </div>
  );
}
