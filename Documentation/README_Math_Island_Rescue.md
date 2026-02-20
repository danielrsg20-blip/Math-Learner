# 🎮 Math Island Rescue

A story-driven adaptive math adventure game for ages 6--10.\
Built with **Vite + React + TypeScript**.

------------------------------------------------------------------------

## 📚 Overview

Math Island Rescue is a browser-based educational game where players
restore magical islands by solving math challenges embedded inside
interactive mini-games.

The game is designed around:

-   🎮 Game-first, math-second design
-   🧠 Adaptive difficulty system
-   🔁 Short, satisfying play loops
-   🎁 Frequent rewards
-   📖 Light narrative progression

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Vite
-   React 18+
-   TypeScript (strict mode)
-   Zustand (state management)
-   Framer Motion (animations)
-   Howler.js (audio)
-   LocalStorage (persistence)
-   Vitest (unit testing)

------------------------------------------------------------------------

## 🚀 Getting Started

### 1. Clone the Repository

``` bash
git clone <your-repo-url>
cd math-island-rescue
```

### 2. Install Dependencies

``` bash
npm install
```

### 3. Run Development Server

``` bash
npm run dev
```

App will run at:

    http://localhost:5173

### 4. Build for Production

``` bash
npm run build
```

### 5. Preview Production Build

``` bash
npm run preview
```

------------------------------------------------------------------------

## 📁 Project Structure

    src/
    │
    ├── assets/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── miniGames/
    │
    ├── engine/
    ├── store/
    ├── types/
    ├── pages/
    │
    ├── App.tsx
    ├── main.tsx

------------------------------------------------------------------------

## 🎮 Core Systems

### Adaptive Difficulty

The game uses a lightweight skill rating system:

-   Starts at 1000
-   +10 for correct answers
-   -5 for incorrect answers
-   Speed bonus applied

Difficulty tiers automatically adjust question complexity.

------------------------------------------------------------------------

### Math Engine

The math generator supports:

-   Addition
-   Subtraction
-   Multiplication
-   Fractions (planned expansion)

All math logic is centralized in:

    src/engine/mathGenerator.ts

------------------------------------------------------------------------

### Mini-Games (MVP)

#### Crystal Pop

-   Arcade-style rapid response game
-   90-second session
-   Combo multiplier system

#### Balance Builder

-   Visual balancing puzzle
-   Drag-and-drop interaction
-   Intuitive equation solving

------------------------------------------------------------------------

## 💾 Persistence

Player progress is stored locally using LocalStorage.

Data saved: - Gems - Stars - Skill rating - Unlocks

No backend required for MVP.

------------------------------------------------------------------------

## 🧪 Testing

Run tests:

``` bash
npm run test
```

Unit tests cover: - Math generator - Difficulty engine - Scoring logic

------------------------------------------------------------------------

## 🎯 MVP Goals

-   60 FPS on low-end tablet
-   \< 2 second initial load
-   Smooth animation performance
-   Adaptive difficulty functioning correctly

------------------------------------------------------------------------

## ♿ Accessibility

-   Large tap targets (48px+)
-   High contrast UI
-   No negative feedback sounds
-   Optional audio toggle
-   Colorblind-safe palette

------------------------------------------------------------------------

## 📦 Deployment

This project is fully static and can be deployed to:

-   Vercel
-   Netlify
-   AWS S3
-   Any static hosting provider

Build output folder:

    dist/

------------------------------------------------------------------------

## 🗺 Roadmap

Future expansions may include:

-   Multiplication Island
-   Fraction Forest
-   Account system
-   Leaderboards
-   Multiplayer challenges
-   Teacher dashboard

------------------------------------------------------------------------

## 📄 License

Add your license here.

------------------------------------------------------------------------

## ❤️ Philosophy

Math Island Rescue is built on the belief that:

> Math should feel like power, not pressure.

We design every system so that math is the tool to fix the world ---
never a test to pass.

------------------------------------------------------------------------

**End of README**
