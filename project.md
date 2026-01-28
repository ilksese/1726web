# 🚀 项目初始化上下文文档：1726web (Anniversary Game Hub)

## 1. 项目概述
*   **名称**：1726web / 情侣纪念日游戏中心
*   **目标**：一个移动端优先的、关卡制的小游戏合集应用，用于纪念周年庆。
*   **核心理念**：游戏解锁、金币体系、情感互动（留言/相册）、惊喜奖励。

## 2. 技术栈
*   **框架**：Next.js 15 (App Router)
*   **语言**：TypeScript (严格类型)
*   **样式**：Tailwind CSS + Framer Motion (动画)
*   **持久化**：`localStorage` (客户端持久化)
*   **音频**：Web Audio API (自定义 `SoundProvider` 钩子)
*   **工具**：`canvas-confetti` (礼花), `@dnd-kit` (拼图拖拽)

## 3. 核心架构与文件映射
### 🧠 逻辑中心 (Brain)
*   `lib/game.ts`: **核心逻辑**。定义了 `GameProgress` 接口、`INITIAL_LEVELS` 配置、`GIFTS` 注册表、`ACHIEVEMENTS` 逻辑以及全局进度的合并与保存函数 (`getMergedProgress`, `completeLevel`)。

### 🛡️ 全局组件与钩子
*   `hooks/useModalConfig.ts`: 统一管理全站弹窗状态。
*   `hooks/useSound.tsx`: 全局音频控制器（BGM 循环, SFX 播放, 静音切换）。
*   `components/Modal.tsx`: 基于 Framer Motion 的标准化动画弹窗。

### 🕹️ 游戏/功能路由
*   `app/games/page.tsx`: 关卡选择大厅（包含每日挑战逻辑、成就入口、后门解锁）。
*   `app/game/[id]/page.tsx`: 各小游戏的独立实现（1-10关）。
*   `app/gifts/page.tsx`: 惊喜礼盒（金币兑换系统）。
*   `app/story/page.tsx`: 交互式时光轴（大事记）。
*   `app/messages/page.tsx`: 电子便利贴（留言板）。
*   `app/gallery/page.tsx`: 瀑布流相册（支持图片上传与 Caption）。
*   `app/letter/page.tsx`: 锁定的周年情书（基于日期解锁）。

## 4. 关键业务逻辑
### A. 进度与解锁
*   关卡是线性的：`completed` 关卡 `i` 自动 `unlocked` 关卡 `i+1`。
*   所有游戏完成时必须调用 `lib/game.ts` 中的 `completeLevel(id)`。

### B. 经济系统
*   **金币 (Coins)**：通过游戏获得，用于在 `app/game/thunder-fighter` 购买永久 Buff 或在 `app/gifts` 兑换实体礼券。
*   **每日挑战**：每天随机选一个关卡作为 Target，完成后奖励 100 金币。

### C. 调试后门 (Backdoors)
*   **解锁单关**：在关卡选择页长按某关卡卡片 10 秒。
*   **解锁全关**：在关卡选择页长按标题（🎮 游戏关卡）5 秒。

## 5. 数据结构参考 (localStorage: `gameProgress`)
```typescript
{
  levels: Array<{id, name, path, unlocked, completed}>,
  totalCoins: number,
  purchasedItems: number[], // 商店强化 ID
  unlockedGifts: number[],  // 已兑换礼券 ID
  messages: Array<{id, text, author, date, color}>,
  unlockedAchievements: string[],
  lastDailyChallengeDate: string, // YYYY-MM-DD
  dailyChallengeTargetId: number
}
```

## 6. 开发规范 (AI 指令建议)
*   **移动端优先**：所有 UI 必须适配 iOS/Android 浏览器，优先使用 Flex/Grid 布局，交互需考虑 `TouchStart`。
*   **动画风格**：使用 `framer-motion` 的 `Spring` 效果，保持柔和、粉色调、高饱和度的视觉风格。
*   **错误处理**：页面加载时需调用 `getMergedProgress` 确保 `window` 已定义（SSR 兼容性）。
*   **音效集成**：关键交互（点击、获胜、失败、金币增加）必须调用 `playSFX`。

## 7. 待办事项 / 未来扩展
1.  **全局成就自动检测**：目前成就需手动触发检查，可优化为全局监听。
2.  **相册持久化优化**：目前相册存在 `localStorage`，若图片过多会溢出（建议接入 IndexedDB 或外部存储）。
3.  **情书自定义**：增加用户在 UI 侧直接修改情书内容的功能。

---
**当前状态：** 项目已完成 10 个关卡、成就系统、每日挑战、礼盒商店、留言板、相册及核心持久化架构。所有 `npm run build` 错误已清理。
