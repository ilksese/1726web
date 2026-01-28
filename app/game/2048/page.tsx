'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useSound } from "@/hooks/useSound";
import { useModalConfig } from "@/hooks/useModalConfig";
import Modal from "@/components/Modal";
import { completeLevel } from "@/lib/game";

const VALUE_MAP: Record<number, { text: string; bg: string; color: string; shadow: string }> = {
  0: { text: "", bg: "bg-rose-100/50", color: "", shadow: "" },
  2: { text: "初见", bg: "bg-rose-50", color: "text-rose-500", shadow: "shadow-sm" },
  4: { text: "相识", bg: "bg-rose-100", color: "text-rose-600", shadow: "shadow-sm" },
  8: { text: "心动", bg: "bg-rose-200", color: "text-rose-700", shadow: "shadow-md" },
  16: { text: "告白", bg: "bg-rose-300", color: "text-white", shadow: "shadow-md" },
  32: { text: "牵手", bg: "bg-rose-400", color: "text-white", shadow: "shadow-lg" },
  64: { text: "拥抱", bg: "bg-rose-500", color: "text-white", shadow: "shadow-lg" },
  128: { text: "热恋", bg: "bg-pink-500", color: "text-white", shadow: "shadow-xl" },
  256: { text: "承诺", bg: "bg-purple-500", color: "text-white", shadow: "shadow-xl" },
  512: { text: "陪伴", bg: "bg-indigo-500", color: "text-white", shadow: "shadow-2xl" },
  1024: { text: "包容", bg: "bg-blue-500", color: "text-white", shadow: "shadow-2xl" },
  2048: { text: "永恒", bg: "bg-gradient-to-br from-yellow-400 to-orange-500", color: "text-white", shadow: "shadow-orange-500/50" },
};

const Love2048 = () => {
  const router = useRouter();
  const { playSFX } = useSound();
  const { modalConfig, showModal, closeModal } = useModalConfig();
  
  const [grid, setGrid] = useState<number[][]>(
    Array(4).fill(0).map(() => Array(4).fill(0))
  );
  const [score, setScore] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // 初始化游戏
  const initGame = useCallback(() => {
    let newGrid = Array(4)
      .fill(0)
      .map(() => Array(4).fill(0));
    newGrid = addRandomTile(addRandomTile(newGrid));
    setGrid(newGrid);
    setScore(0);
    setHasWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // 在随机空位置添加一个 2 或 4
  function addRandomTile(currentGrid: number[][]) {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentGrid[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentGrid;
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = currentGrid.map((row) => [...row]);
    newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }

  // 核心移动逻辑：向左移动一行
  const slideLeft = (row: number[]) => {
    let arr = row.filter((val) => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] = arr[i] * 2;
        setScore((prev) => prev + arr[i]);
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < 4) arr.push(0);
    return arr;
  };

  const move = useCallback((direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
    let newGrid: number[][] = [];
    let changed = false;

    // 使用函数式更新以获取最新的 grid 状态
    setGrid(prevGrid => {
        newGrid = prevGrid.map((row) => [...row]);
        
        if (direction === "LEFT" || direction === "RIGHT") {
            newGrid = newGrid.map((row) => {
                const original = [...row];
                const processed = direction === "LEFT" ? slideLeft(row) : slideLeft([...row].reverse()).reverse();
                if (JSON.stringify(original) !== JSON.stringify(processed)) changed = true;
                return processed;
            });
        } else {
            // 处理上下移动：先转置，处理后再转置回来
            for (let c = 0; c < 4; c++) {
                const column = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
                const processed = direction === "UP" ? slideLeft(column) : slideLeft([...column].reverse()).reverse();
                for (let r = 0; r < 4; r++) {
                    if (newGrid[r][c] !== processed[r]) {
                        changed = true;
                        newGrid[r][c] = processed[r];
                    }
                }
            }
        }

        if (changed) {
            playSFX('click');
            return addRandomTile(newGrid);
        }
        return prevGrid;
    });
  }, [playSFX]);

  // 检查游戏状态：胜利或失败
  useEffect(() => {
    // 初始加载时不检查
    if (grid.every(row => row.every(cell => cell === 0))) return;

    // 1. 检查胜利 (2048)
    const has2048 = grid.some(row => row.includes(2048));
    if (has2048 && !hasWon) {
      setHasWon(true);
      playSFX('win');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fb7185', '#f472b6', '#e879f9'] // Rose & Pink colors
      });
      
      const result = completeLevel(5); // Level ID 5 is 2048
      showModal({
        title: "永恒之爱达成！",
        description: `恭喜你合成了“永恒”！${result.isFirstTime ? '获得首通奖励：' + result.reward.name : ''}`,
        icon: result.isFirstTime ? result.reward.image : "💖",
        type: "success",
        confirmText: "下一关",
        cancelText: "留在这里",
        onConfirm: () => router.push('/game/memory'),
        onCancel: () => {}
      });
      return;
    }

    // 2. 检查失败 (没有空格且无法合并)
    const hasEmpty = grid.some(row => row.includes(0));
    if (!hasEmpty && !hasWon) { // 只有没赢的时候才判输
        let canMove = false;
        // 检查水平相邻
        for(let r=0; r<4; r++) {
            for(let c=0; c<3; c++) {
                if(grid[r][c] === grid[r][c+1]) canMove = true;
            }
        }
        // 检查垂直相邻
        for(let c=0; c<4; c++) {
            for(let r=0; r<3; r++) {
                if(grid[r][c] === grid[r+1][c]) canMove = true;
            }
        }

        if (!canMove) {
            playSFX('lose');
            showModal({
                title: "爱意暂停",
                description: "虽然暂时无法前行，但爱永远有重来的机会。",
                icon: "💔",
                type: "warning",
                confirmText: "重新开始",
                cancelText: "返回主页",
                onConfirm: initGame,
                onCancel: () => router.push('/games')
            });
        }
    }
  }, [grid, hasWon, playSFX, showModal, router, initGame]);

  // 监听键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      
      if (e.key === "ArrowUp") move("UP");
      if (e.key === "ArrowDown") move("DOWN");
      if (e.key === "ArrowLeft") move("LEFT");
      if (e.key === "ArrowRight") move("RIGHT");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move]);

  // 触摸滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStart.x;
    const deltaY = touchEndY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > 30) { // Threshold
        move(deltaX > 0 ? "RIGHT" : "LEFT");
      }
    } else {
      if (Math.abs(deltaY) > 30) {
        move(deltaY > 0 ? "DOWN" : "UP");
      }
    }
    setTouchStart(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-rose-50 p-4 touch-none">
      <Modal 
        onClose={closeModal} 
        {...modalConfig} 
      />

      {/* Header Area */}
      <div className="w-full max-w-md flex justify-between items-center mb-6 px-2">
        <button onClick={() => router.push('/games')} className="p-2 bg-white rounded-full shadow-sm text-rose-400 hover:bg-rose-50 transition-colors">
            <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold text-rose-600">2048之恋</h1>
            <div className="text-rose-400 text-sm font-medium">目标：永恒</div>
        </div>
        <button onClick={initGame} className="p-2 bg-white rounded-full shadow-sm text-rose-400 hover:bg-rose-50 transition-colors">
            <RotateCcw size={24} />
        </button>
      </div>

      {/* Score Board */}
      <div className="mb-6 bg-white px-8 py-3 rounded-2xl shadow-sm border border-rose-100">
        <span className="text-rose-300 text-sm uppercase tracking-wider mr-2">当前得分</span>
        <span className="text-2xl font-bold text-rose-500 font-mono">{score}</span>
      </div>

      {/* Game Grid */}
      <div 
        className="bg-rose-200/80 backdrop-blur-sm p-3 rounded-xl shadow-inner relative select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-3">
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const config = VALUE_MAP[cell] || VALUE_MAP[0];
              return (
                <div
                    key={`${rIdx}-${cIdx}`}
                    className="w-16 h-16 sm:w-20 sm:h-20 relative"
                >
                    {/* Background placeholder */}
                    <div className="absolute inset-0 bg-rose-100/50 rounded-lg" />
                    
                    {/* Animated Tile */}
                    <AnimatePresence mode="popLayout">
                        {cell !== 0 && (
                            <motion.div
                                key={`${cell}-${rIdx}-${cIdx}`} // Key triggers animation on value change
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`absolute inset-0 flex items-center justify-center rounded-lg 
                                font-bold text-lg sm:text-xl
                                ${config.bg} ${config.color} ${config.shadow}`}
                            >
                                {config.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Instructions */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-sm text-rose-400/80 font-medium flex items-center gap-2"
      >
        <span>👆 滑动</span>
        <span className="w-1 h-1 bg-rose-300 rounded-full"></span>
        <span>⌨️ 键盘</span>
        <span className="w-1 h-1 bg-rose-300 rounded-full"></span>
        <span>奔向“永恒”</span>
      </motion.p>
    </div>
  );
};

export default Love2048;
