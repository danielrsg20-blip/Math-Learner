# Math Island Rescue

## Developer Technical Specification

**Tech Stack:** Vite + React + TypeScript\
**Platform:** Browser (Desktop + Tablet)\
**Architecture:** Frontend-only (MVP)

------------------------------------------------------------------------

# 1. Project Overview

## Core Technologies

-   Vite (React + TypeScript template)
-   React 18+
-   TypeScript (strict mode)
-   Zustand (state management)
-   Framer Motion (animations)
-   Howler.js (audio)
-   LocalStorage (persistence)

No backend required for MVP.

------------------------------------------------------------------------

# 2. Project Structure

    src/
    │
    ├── assets/
    │   ├── audio/
    │   ├── images/
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ProgressBar.tsx
    │   │
    │   ├── layout/
    │   │   ├── GameLayout.tsx
    │   │
    │   ├── miniGames/
    │   │   ├── CrystalPop/
    │   │   ├── BalanceBuilder/
    │
    ├── engine/
    │   ├── mathGenerator.ts
    │   ├── difficultyEngine.ts
    │   ├── scoringSystem.ts
    │
    ├── store/
    │   ├── usePlayerStore.ts
    │   ├── useGameStore.ts
    │
    ├── types/
    │   ├── math.ts
    │   ├── player.ts
    │
    ├── pages/
    │   ├── Home.tsx
    │   ├── Island.tsx
    │   ├── MiniGame.tsx
    │
    ├── App.tsx
    ├── main.tsx

------------------------------------------------------------------------

# 3. State Architecture

## Player State (Zustand)

Tracks: - Gems - Stars - Unlocks - Skill rating - Performance history

Example:

``` ts
type PlayerState = {
  gems: number
  stars: number
  unlocks: string[]
  skillRating: number
  updateSkill: (delta: number) => void
  addGems: (amount: number) => void
}
```

------------------------------------------------------------------------

## Game Session State

Tracks: - Current question - Score - Combo multiplier - Accuracy - Timer

------------------------------------------------------------------------

# 4. Adaptive Difficulty Engine

Location: `src/engine/difficultyEngine.ts`

## Skill Rating Model

-   Start at 1000
-   +10 correct
-   -5 incorrect
-   +5 speed bonus

### Difficulty Tiers

  Skill        Tier
  ------------ -----------
  \< 900       Very Easy
  900--1100    Easy
  1100--1300   Medium
  1300+        Hard

Function:

``` ts
export function getDifficulty(skill: number): DifficultyTier
```

------------------------------------------------------------------------

# 5. Math Question Generator

Location: `src/engine/mathGenerator.ts`

## Types

``` ts
export type Operation =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "fraction"

export type MathQuestion = {
  id: string
  prompt: string
  correctAnswer: number
  options?: number[]
}
```

Generator:

``` ts
export function generateQuestion(
  operation: Operation,
  difficulty: DifficultyTier
): MathQuestion
```

------------------------------------------------------------------------

# 6. Mini-Game Specifications

## A. Crystal Pop

-   8 floating numbers
-   Target prompt
-   90-second timer
-   Combo scoring
-   Immediate feedback

Scoring: - +10 correct - Combo multiplier - Reset on incorrect

------------------------------------------------------------------------

## B. Balance Builder

-   Visual scale mechanic
-   Drag and drop answer block
-   Animated balance feedback

Example: 7 + □ = 12

------------------------------------------------------------------------

# 7. Persistence

Location: `src/utils/storage.ts`

``` ts
export function savePlayer(data: PlayerState)
export function loadPlayer(): PlayerState
```

Auto-save after each mini-game.

------------------------------------------------------------------------

# 8. UI System

Design Rules: - Large tap targets (48px+) - High contrast numbers -
Rounded UI - Minimal text - Animated transitions

------------------------------------------------------------------------

# 9. Audio System

Location: `src/engine/audioEngine.ts`

Sounds: - Correct - Incorrect (gentle) - Reward - Level up - Background
music

Must include mute toggle.

------------------------------------------------------------------------

# 10. Routing

    /              -> Home
    /island/:id    -> Island overview
    /play/:mode    -> Mini-game

------------------------------------------------------------------------

# 11. Testing

Use Vitest for: - mathGenerator - difficultyEngine - scoringSystem

------------------------------------------------------------------------

# 12. MVP Checklist

Must Have: - Addition Island - Crystal Pop - Balance Builder - Adaptive
difficulty - Gem system - Cosmetic unlocks - Local save

------------------------------------------------------------------------

# 13. Performance Targets

-   60 FPS
-   \< 2s load time
-   Lazy load mini-games
-   Use dynamic imports

------------------------------------------------------------------------

# 14. Accessibility

-   Colorblind-safe palette
-   Audio optional
-   Large buttons
-   No flashing effects

------------------------------------------------------------------------

# 15. 6-Week Development Plan

Week 1: Setup + Math Engine\
Week 2: Crystal Pop\
Week 3: Balance Builder\
Week 4: Adaptation + Rewards\
Week 5: UI + Audio\
Week 6: Testing + Deploy

------------------------------------------------------------------------

# End of Technical Specification
