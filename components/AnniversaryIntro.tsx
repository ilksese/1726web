"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function AnniversaryIntro() {
  const [isActive, setIsActive] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // 1. Check Date (Jan 30)
    const now = new Date();
    // Month is 0-indexed (0 = Jan)
    const isAnniversary = now.getMonth() === 0 && now.getDate() === 30;

    if (!isAnniversary) return;

    // 2. Check First Visit of the Day
    const todayStr = now.toISOString().split("T")[0];
    const lastCelebration = localStorage.getItem("lastCelebrationDate");

    if (lastCelebration !== todayStr) {
      // Trigger Celebration
      setIsActive(true);
      localStorage.setItem("lastCelebrationDate", todayStr);

      // Start animations
      setTimeout(() => setShowContent(true), 1000); // Wait for darken

      // Confetti loop
      const end = Date.now() + 15 * 1000;
      const colors = ["#ff0000", "#ff69b4", "#ffffff", "#ffd700"];

      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 10000,
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 10000,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

      // Auto close after 15 seconds
      const timer = setTimeout(() => {
        setIsActive(false);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }} // "Slowly darken"
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center overflow-hidden pointer-events-none"
        >
          {showContent && (
            <div className="relative w-full h-full">
              {/* Floating Balloons (CSS/Motion) */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={`balloon-${i}`}
                  initial={{ y: "120vh", x: Math.random() * 100 + "vw", scale: 0.5 + Math.random() }}
                  animate={{ y: "-20vh" }}
                  transition={{
                    duration: 10 + Math.random() * 5,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                  className="absolute text-6xl"
                  style={{ left: 0 }}
                >
                  🎈
                </motion.div>
              ))}

              {/* Falling Candy */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={`candy-${i}`}
                  initial={{ y: "-10vh", x: Math.random() * 100 + "vw", rotate: 0 }}
                  animate={{ y: "110vh", rotate: 360 }}
                  transition={{
                    duration: 5 + Math.random() * 5,
                    ease: "linear",
                    repeat: Infinity,
                    delay: Math.random() * 5,
                  }}
                  className="absolute text-4xl"
                  style={{ left: 0 }}
                >
                  🍬
                </motion.div>
              ))}

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <motion.h1
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="text-6xl md:text-8xl font-bold text-rose-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                >
                  ❤️周年快乐❤️
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="text-white text-xl mt-8 font-medium tracking-widest uppercase"
                >
                  Happy Anniversary!
                </motion.p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
