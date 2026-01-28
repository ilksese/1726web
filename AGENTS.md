# Agent Guidelines for 1726web

This repository contains the "Anniversary Game Hub", a mobile-first web application built with Next.js 15.

## 🛠 Commands

### Development & Build
- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production. **Primary verification tool** for TypeScript and Linting.
- `npm run lint`: Run ESLint checks.

### Testing
- **Currently, no automated testing framework (Jest/Playwright) is configured.**
- To verify changes, use `npm run build` to catch type errors and linting issues.
- For manual verification, run `npm run dev` and test interactions in the browser.

---

## 🎨 Code Style Guidelines

### 1. Technology Stack
- **Framework**: Next.js 15 (App Router).
- **Language**: TypeScript (Strict mode enabled).
- **Styling**: Tailwind CSS.
- **Animations**: Framer Motion.
- **Icons**: Lucide-react (preferred) and Emojis (for game elements).
- **Audio**: Web Audio API via `hooks/useSound.tsx`.

### 2. File Structure & Path Aliases
- Use absolute imports with the `@/` prefix (defined in `tsconfig.json`).
- `app/`: Contains routes and pages.
- `components/`: Reusable UI components.
- `hooks/`: Custom React hooks (e.g., `useSound`, `useModalConfig`).
- `lib/`: Business logic and data models (e.g., `game.ts`).
- `public/`: Static assets.

### 3. Naming Conventions
- **Components**: PascalCase (e.g., `Modal.tsx`, `GamesPage`).
- **Hooks**: camelCase with `use` prefix (e.g., `useSound`).
- **Functions/Variables**: camelCase.
- **Constants**: UPPER_SNAKE_CASE (e.g., `INITIAL_LEVELS`, `BULLET_COOLDOWN`).
- **Types/Interfaces**: PascalCase (e.g., `GameProgress`, `Level`).

### 4. Component Patterns
- **Client Components**: Always use `'use client';` at the top of files in `app/` that use hooks or browser APIs.
- **Mobile First**: Design for small screens first. Use responsive Tailwind utilities (`md:`, `lg:`) for larger displays.
- **Modals**: Use the centralized `Modal` component and `useModalConfig` hook for all game alerts and confirmations.

### 5. Imports Ordering
1. React hooks (useState, useEffect, etc.).
2. Next.js components and hooks (useRouter, Image, etc.).
3. External libraries (framer-motion, canvas-confetti, etc.).
4. Internal shared logic/types (`@/lib/...`).
5. Internal components/hooks (`@/components/...`, `@/hooks/...`).
6. Styles (CSS modules).

### 6. Logic & State Management
- **Persistence**: Centralized in `lib/game.ts`. Use `getMergedProgress()` and `saveProgress()` / `completeLevel()` to sync with `localStorage`.
- **Game Completion**: Every game must call `completeLevel(id)` upon victory to handle rewards, daily challenges, and unlocking the next stage.
- **Error Handling**: 
  - Wrap `JSON.parse` or `localStorage` access in try-catch.
  - Use `showModal` to communicate errors to the user instead of native `alert()`.

### 7. Formatting & Types
- Explicitly type function parameters and return values where possible.
- Prefer interfaces over types for public models.
- Maintain consistent indentation (2 spaces) as per the existing codebase.

---

## 🧩 Architectural Control Points

### The `GameProgress` Object
The entire application state resides in a single JSON object in `localStorage` under the key `gameProgress`. 
Structure:
```typescript
{
  levels: Level[],
  totalCoins: number,
  purchasedItems: number[],
  unlockedGifts: number[],
  messages: Message[],
  unlockedAchievements: string[],
  lastDailyChallengeDate?: string,
  dailyChallengeTargetId?: number
}
```

### Sound System
Always trigger `playSFX` for:
- `click`: General buttons.
- `win`: Success/Victory.
- `lose`: Failure/Game Over.
- `hit`: Damage/Error.
- `coin`: Purchases or minor successes.

### Daily Challenge
The `getMergedProgress` function in `lib/game.ts` automatically rotates the daily challenge target based on the current date. Ensure any new games are added to `INITIAL_LEVELS` to be included in the rotation.
