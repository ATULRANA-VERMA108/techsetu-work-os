# 🌌 TechSetu Work OS

TechSetu Work OS is a high-performance, dark-themed developer workstation and gamified productivity dashboard. Designed with premium aesthetics, rich micro-animations, and modular scalability, it consolidates task management, 3D simulation labs, notes workspaces, and telemetry tools into one seamless gateway.

---

## 🛠️ Feature Modules

TechSetu Work OS includes a suite of integrated modules designed for developers, productivity enthusiasts, and kids mode:

- **📋 Flow Boards & Task Manager**: A drag-and-drop Kanban interface for managing checklists and tracking column-level task activity.
- **⏱️ Focus Engine**: A Pomodoro timer integrated with ambient soundscapes and study playlists to boost deep work flow.
- **🎮 Kids Game Lab**: A high-fidelity 3D map editor and driving simulator built with Three.js. Map your daily tasks to city landmarks (Maze Bank ATMs, supermarkets, and corporate offices) and drive to complete missions.
- **🤖 AI Co-Pilots Hub**: Talk with advanced agentic LLM roles and run developer diagnostics.
- **📝 Second Brain**: A rich document editor and note-taking workspace with Markdown support.
- **📊 Telemetry & Health Audit**: Live visual data plots tracking memory allocations, CPU loads, and active socket streams in real time.
- **🏆 Gamification Center**: Earn XP points, unlock custom achievements, and track consistency streaks across tasks.

---

## 🚀 Recent Updates & Optimizations

### 1. Sidebar Layout & Viewport Scrollability
- **Self-Constrained Navigation**: Restructured the sidebar's layout into a flex column wrapper (`flex flex-col flex-1 min-h-0`). 
- **Premium Custom Scrollbar**: Added scroll support for the 16+ navigation links using a custom, ultra-thin themed scrollbar. The User Profile dock remains anchored at the bottom at all times.
- **Mobile Hamburger Toggler**: Integrated a responsive hamburger menu toggler (`Menu` icon) that appears on viewports `<= 768px` to cleanly show and hide navigation.
- **Link Auto-Collapse**: Links now trigger auto-collapsing of the sidebar drawer on mobile devices, preventing layout blockage.

### 2. Kids Game Lab Performance Refactoring (Three.js WebGL)
- **Zero WebGL Context Leaks**: Separated the WebGL canvas initialization from the block-drawing loop. Renderers, cameras, orbit controls, and lighting structures are initialized **once** on mount.
- **Efficient Mesh Updates**: Regenerates city block groups within the existing active context on `blocks` updates, bypassing the need to recreate WebGL contexts. This resolves black-screen crashes and canvas rendering locks.
- **Drift Smoke & Physics Cleanup**: Configured rigorous scene removal loops for spawned sports cars, player avatars, and drifting particles to prevent duplicate objects from bloating memory.

### 3. Sign in with Google (Fast Auth Handshake)
- **Google Sign-In Button**: Integrated a custom, high-fidelity Google login button featuring the official Google red G-Logo.
- **Account Chooser Modal**: Opens a premium Google account selector modal offering preconfigured fast-login profiles (e.g., `vatulrana104@gmail.com`) and custom email entry inputs.
- **Automated Handshake**: Connects client-side Google identities directly to the Java backend database. If an email is new, it automatically registers it (`/api/auth/signup`) and performs a subsequent login (`/api/auth/login`) with secure generated credentials, authorizing the workspace session instantly.

---

## 💻 Tech Stack & Commands

- **Core**: React, TypeScript, Vite
- **3D Graphics**: Three.js, OrbitControls
- **Icons**: Lucide React
- **Linter**: Oxlint

### Getting Started

Install the project dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Build the optimized production bundles:
```bash
npm.cmd run build
```

Preview the production build locally:
```bash
npm run preview
```
