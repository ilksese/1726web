'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Event {
  date: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const EVENTS: Event[] = [
  { date: '2025.01.26', title: '初次相遇', description: '在这个平凡的冬日，我们第一次交换了目光。', icon: '❄️', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.01.27', title: '第一场电影', description: '不懂浪漫的他，带她去看了犯罪片', icon: '🎥', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.01.30', title: '正式在一起', description: '那天月色很好，我们决定牵着手一直走下去。', icon: '🤝', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.03.01', title: 'KISSxKISS', description: '感觉时间都凝固了。（嘴给干麻，还肿了一周）', icon: '💋', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.04.12', title: '第一次同眠', description: '别多想，啥都没干', icon: '🛌', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.05.03', title: '出发，安顺', description: '好吃好吃好吃', icon: '🍲', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.05.10', title: '坦诚相待', description: 'FBI警告！', icon: '👀', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.09.13', title: '九寨沟', description: '《乞儿与海子》', icon: '🏞️', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.10.03', title: '武陵大裂谷、816、白鹤梁', description: '头回见他的老友，不尴不尬的', icon: '🏞️', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.11.02', title: '周深演唱会', description: '值回票价了', icon: '🚗', color: 'bg-rose-50 text-rose-500' },
  { date: '2025.11.15', title: '第一次自驾', description: '副驾驶：看路！', icon: '🚗', color: 'bg-rose-50 text-rose-500' },
  { date: '2026.01.30', title: '一周年纪念', description: '三百六十五天，每一天都因为你而闪闪发光。', icon: '✨', color: 'bg-rose-50 text-rose-500' },
  { date: '今天', title: '未来可期', description: '故事还在继续，而我只想和你一起写完它。', icon: '♾️', color: 'bg-rose-500 text-white' },
];

export default function StoryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 relative overflow-x-hidden">
      <div className="max-w-2xl mx-auto relative z-10">
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold text-rose-500 mb-2">我们的故事</h1>
            <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-[10px]">属于我们的篇章</p>
          </motion.div>
        </header>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] bg-slate-100 -translate-x-1/2 z-0" />

          <div className="space-y-24">
            {EVENTS.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className={`relative flex items-center justify-between w-full ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                }`}
              >
                {/* Content */}
                <div className="ml-16 md:ml-0 md:w-[42%]">
                  <div className="modern-card p-8 group hover:border-rose-100 transition-all duration-500">
                    <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block mb-4 italic">{event.date}</span>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">{event.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{event.description}</p>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center z-10 shadow-sm overflow-hidden">
                  <div className={`w-full h-full ${event.color} flex items-center justify-center text-xl`}>
                    {event.icon}
                  </div>
                </div>

                {/* Empty space for layout */}
                <div className="hidden md:block w-[42%]" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => router.push('/')}
          className="w-full mt-32 btn-secondary py-5 text-[10px] tracking-[0.3em] uppercase"
        >
          返回首页
        </motion.button>
      </div>
    </div>
  );
}
