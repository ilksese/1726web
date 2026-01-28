"use client";

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { getMergedProgress } from "@/lib/game";
import Modal from "@/components/Modal";
import { useModalConfig } from "@/hooks/useModalConfig";

export default function LoveLetter() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(
    null
  );
  const [isUnlocked, setIsUnlocked] = useState(false);
  const { playSFX, startBGM } = useSound();
  const { modalConfig, showModal, closeModal } = useModalConfig();

  // 设定纪念日日期：1月30日
  const targetDate = new Date(new Date().getFullYear(), 0, 30);
  if (new Date() > targetDate && new Date().getDate() !== 30) {
    // 如果今年已过且今天不是30号，显示明年的
    targetDate.setFullYear(targetDate.getFullYear() + 1);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // 调试用：如果是1月30日或者过了1月30日，就解锁
      const isAnniversary = now.getMonth() === 0 && now.getDate() === 30;

      if (isAnniversary || now > targetDate) {
        // 增加关卡全通检查
        const progress = getMergedProgress();
        const allCompleted = progress.levels.every((l) => l.completed);

        if (allCompleted) {
          setIsUnlocked(true);
          clearInterval(timer);
        } else {
          // 如果日期到了但没通关，这里可以保持锁定状态，或者显示特定提示
          // 我们保持 isUnlocked = false，并在界面上显示"需通关"的提示
          setIsUnlocked(false);
          // 我们不需要清除定时器，因为用户可能正在另外的标签页通关
        }
      } else {
        const diff = targetDate.getTime() - now.getTime();
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
      <Modal onClose={closeModal} {...modalConfig} />
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="locked"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-md w-full text-center space-y-10"
          >
            <div className="text-8xl opacity-10">✉️</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">神秘情书</h1>
              <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">写给你的悄悄话</p>
            </motion.div>

            <div className="text-slate-500 leading-relaxed font-medium text-sm px-8 space-y-4">
              <p>这是一封来自未来的信，只有在特殊的日子里才会开启。</p>

              <div className="py-4 border-t border-b border-slate-100 space-y-2">
                <p className="font-bold text-rose-400 tracking-widest uppercase text-xs">解锁条件</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>1. 纪念日当天 (1月30日)</span>
                  <span>{timeLeft ? "⏳ 等待中" : "✅ 已达成"}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>2. 完成所有游戏关卡</span>
                  <span
                    className={
                      getMergedProgress().levels.every((l) => l.completed)
                        ? "text-green-500 font-bold"
                        : "text-slate-300"
                    }
                  >
                    {getMergedProgress().levels.every((l) => l.completed) ? "✅ 已达成" : "🔒 未完成"}
                  </span>
                </div>
              </div>
            </div>

            {timeLeft && (
              <div className="grid grid-cols-4 gap-4 px-4">
                {Object.entries(timeLeft).map(([unit, value], i) => (
                  <div key={unit} className="flex flex-col items-center">
                    <div className="text-3xl md:text-4xl font-light text-slate-800 mb-1">{value}</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                      {unit === "days" ? "天" : unit === "hours" ? "时" : unit === "minutes" ? "分" : "秒"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!timeLeft && !getMergedProgress().levels.every((l) => l.completed) && (
              <div className="text-rose-500 font-bold text-sm bg-rose-50 p-4 rounded-xl">
                <p>虽然今天是个特殊的日子，</p>
                <p>但你需要证明你的爱意（通关所有游戏）才能开启这封信哦！</p>
                <button
                  onClick={() => router.push("/games")}
                  className="mt-2 text-xs underline decoration-rose-300 underline-offset-4 hover:text-rose-600"
                >
                  去挑战关卡 &rarr;
                </button>
              </div>
            )}

            <button onClick={() => router.push("/")} className="btn-ghost text-xs tracking-widest uppercase font-bold">
              ← 返回主页
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl w-full p-10 md:p-20 relative"
          >
            <header className="text-center mb-20">
              <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">致亲爱的17</h1>
              <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">一封来自心底的信</p>
            </header>

            <article className="space-y-12 text-xl md:text-2xl leading-[1.8] text-slate-700 font-medium">
              <div className="w-12 h-1 bg-rose-100 mb-12"></div>
              <p>亲爱的17： 展信安。</p>
              <p>
                当日历翻到今天，才惊觉我们已经携手走过了一整个春夏秋冬。这 365
                天里，没有惊天动地的波澜，却满是藏在烟火气里的温柔与欢喜，每一个瞬间都像被阳光晒过的棉花，柔软又温暖，刻在我心里最珍贵的角落。
              </p>
              <p>
                我总想起那些我们窝在被卧上聊天的夜晚，灯光昏黄，空气里飘着你喜欢的香薰味。我们聊彼此的过往，那些没遇见彼此之前的小遗憾、小坚持，让我更懂你的珍贵；我们聊身边的朋友，吐槽那些好笑的琐事，分享彼此的喜怒哀乐，仿佛有说不完的话，哪怕沉默着并肩坐着，也觉得无比安心。原来最好的相处，就是哪怕什么都不做，只要身边是你，就足够美好。
              </p>
              <p>
                这一年，我们也一起解锁了无数美食地图。从巷子里的苍蝇小馆到商场里的精致餐厅，我们笑着分享同一碗面，推搡着吃最后一块肉，不知不觉间，不仅胃被填满了，心也被填得满满当当，连体重都悄悄上涨了不少。后来每次你吐槽自己变胖，我都觉得可爱极了
                —— 这是我们幸福的 “证据” 呀，是一起分享过的烟火气，沉淀出的专属印记。
              </p>
              <p>
                更难忘的是那些 “第一次”
                的悸动。第一次小心翼翼地亲吻，心跳快得像要跳出胸膛，那一刻世界仿佛静止了，只剩下彼此的呼吸；第一次相拥而眠，你窝在我怀里，温热的气息拂过我的脖颈，我整夜都不敢翻身，生怕惊扰了这份来之不易的美好；第一次一起去九寨沟，湖泊、森林美得像童话，而比风景更动人的，是你拉着我的手，眼里闪着光说
                “以后还要和你去更多地方”；第一次自驾出行，路上的风景忽远忽近，我们唱着跑调的歌，聊着无关紧要的话题，那种自由自在的感觉，只因身边有你才更完整。
              </p>
              <p>
                这一年，我习惯了身边有你的温度，习惯了听你叽叽喳喳地分享日常，习惯了你的喜怒哀乐都与我有关。你让我明白，爱情不是轰轰烈烈的誓言，而是细水长流的陪伴；不是完美无缺的契合，而是愿意为彼此变得更好的心意。我喜欢看你笑起来弯弯的眼睛，喜欢听你委屈时软软的撒娇，喜欢和你一起规划未来的笃定，更喜欢这个因为有你而变得更温柔、更勇敢的自己。
              </p>
              <p>
                宝贝，一周年只是我们故事的开始。未来还有无数个春夏秋冬要一起走过，还有好多美食要一起品尝，好多风景要一起打卡，好多
                “第一次”
                要一起解锁。我想牵着你的手，从青丝到白发，从心动到白首，把每一个平凡的日子都过成诗，把每一份简单的幸福都藏进时光里。
                谢谢你，出现在我的生命里，照亮了我的整个世界。
              </p>
              <p>
                回想起那些一起压过的马路，一起吃过的晚餐，甚至是那些偶尔的小争吵，现在想来都是生命中最闪亮的瞬间。在这些平凡的日子里，是因为有你的陪伴，才让一切变得不再平凡。
              </p>
              <p>
                谢谢你包容我的小脾气，谢谢你总是能在我最需要的时候给我一个拥抱。我希望在未来的每一个一月三十日，我们都能像现在这样，坐在一起，聊聊过去的一年，展望未来的无限可能。
              </p>
              <p>你要记住，无论世界如何变迁，这颗爱你的心永远不会改变。</p>
              <div className="pt-20 text-right">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">永远爱你的，</p>
                <p className="text-4xl md:text-5xl font-bold text-rose-500 romantic-title">Mr.26</p>
                <p className="text-slate-300 text-xs font-bold mt-4">2026.01.30</p>
              </div>
            </article>

            <button
              onClick={() => router.push("/")}
              className="w-full mt-24 btn-secondary py-6 text-xs tracking-[0.3em] uppercase font-bold"
            >
              合上信笺
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
