import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  HelpCircle, 
  Sparkles, 
  Trophy, 
  Zap, 
  Activity, 
  CheckSquare, 
  Clock, 
  Target, 
  Bot, 
  FileText, 
  Settings, 
  Car,
  Volume2,
  Tv,
  List
} from 'lucide-react';

interface SystemDemoCenterProps {
  setView: (view: string) => void;
  onRewardXP: (amount: number) => void;
  isEasyMode: boolean;
  toggleEasyMode: () => void;
  openCommandFinder: () => void;
}

// 2D City Simulator engine for the Guide Section
class MiniCitySimulator {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private carX = 20;
  private carY = 80;
  private carAngle = 0;
  private carSpeed = 2;
  private targetX = 220;
  private targetY = 80;
  private reqId: number | null = null;
  private phase = 'drive'; // drive, arrive, reset

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No 2D Context');
    this.ctx = context;
  }

  start() {
    const loop = () => {
      this.update();
      this.draw();
      this.reqId = requestAnimationFrame(loop);
    };
    this.reqId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.reqId) cancelAnimationFrame(this.reqId);
  }

  private update() {
    if (this.phase === 'drive') {
      // Direct angle towards target
      const dx = this.targetX - this.carX;
      const dy = this.targetY - this.carY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 5) {
        this.phase = 'arrive';
        setTimeout(() => {
          this.phase = 'reset';
        }, 1200);
      } else {
        this.carAngle = Math.atan2(dy, dx);
        this.carX += Math.cos(this.carAngle) * this.carSpeed;
        this.carY += Math.sin(this.carAngle) * this.carSpeed;
      }
    } else if (this.phase === 'reset') {
      // Teleport back
      this.carX = 20;
      this.carY = 20 + Math.random() * 110;
      this.phase = 'drive';
    }
  }

  private draw() {
    // Clear
    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid streets in background
    this.ctx.strokeStyle = '#1e1e3f';
    this.ctx.lineWidth = 1.5;
    for (let i = 0; i < this.canvas.width; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }
    for (let j = 0; j < this.canvas.height; j += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, j);
      this.ctx.lineTo(this.canvas.width, j);
      this.ctx.stroke();
    }

    // Draw target office building zone
    this.ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
    this.ctx.fillRect(this.targetX - 25, this.targetY - 25, 50, 50);
    this.ctx.strokeStyle = '#22c55e';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.targetX - 25, this.targetY - 25, 50, 50);
    
    // Draw target marker tag
    this.ctx.fillStyle = '#22c55e';
    this.ctx.font = '9px monospace';
    this.ctx.fillText('🏢 OFFICE', this.targetX - 22, this.targetY + 4);

    // Draw driveable car
    this.ctx.save();
    this.ctx.translate(this.carX, this.carY);
    this.ctx.rotate(this.carAngle);
    
    // Red car chassis
    this.ctx.fillStyle = '#ef4444';
    this.ctx.fillRect(-12, -6, 24, 12);
    // Windshield
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(-2, -4, 7, 8);
    // Yellow headlights
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(11, -5, 2, 2);
    this.ctx.fillRect(11, 3, 2, 2);
    
    this.ctx.restore();

    // Draw Arrive celebration banner
    if (this.phase === 'arrive') {
      this.ctx.fillStyle = 'rgba(0,0,0,0.85)';
      this.ctx.fillRect(0, this.canvas.height/2 - 20, this.canvas.width, 40);
      
      this.ctx.fillStyle = '#00ffcc';
      this.ctx.font = 'bold 11px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('MISSION PASSED: +30 XP REWARDED!', this.canvas.width/2, this.canvas.height/2 + 4);
    }
  }
}

// Retro sound generator
const playSynthBeep = (freq: number, type: 'sine' | 'triangle' | 'square', duration: number) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const SystemDemoCenter: React.FC<SystemDemoCenterProps> = ({ 
  setView, 
  onRewardXP, 
  isEasyMode, 
  toggleEasyMode,
  openCommandFinder 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'tester' | 'simulator'>('walkthrough');
  const [celebrationGlow, setCelebrationGlow] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const simInstance = useRef<MiniCitySimulator | null>(null);

  // Run or stop 2D simulation
  useEffect(() => {
    if (activeTab === 'simulator' && canvasRef.current) {
      const sim = new MiniCitySimulator(canvasRef.current);
      sim.start();
      simInstance.current = sim;
      setSimRunning(true);
    } else {
      if (simInstance.current) {
        simInstance.current.stop();
        simInstance.current = null;
      }
      setSimRunning(false);
    }
    return () => {
      if (simInstance.current) {
        simInstance.current.stop();
      }
    };
  }, [activeTab]);

  // Test triggers
  const triggerCelebration = () => {
    setCelebrationGlow(true);
    playSynthBeep(523.25, 'triangle', 0.12);
    setTimeout(() => playSynthBeep(659.25, 'triangle', 0.12), 100);
    setTimeout(() => playSynthBeep(783.99, 'triangle', 0.12), 200);
    setTimeout(() => playSynthBeep(1046.50, 'triangle', 0.3), 300);
    
    // Add global XP
    onRewardXP(50);
    
    setTimeout(() => {
      setCelebrationGlow(false);
    }, 2500);
  };

  const featureWalkthroughs = [
    {
      id: 'kids',
      title: '🚗 GTA 3D Task City',
      icon: <Car className="w-5 h-5 text-red-400" />,
      description: 'A 3D sandbox city environment where you can build blocks (roads, skyscrapers, offices, banks, shops), drive a sports car, and navigate to target landmarks to complete active todo list items.',
      steps: [
        'Place roads and target buildings in Edit mode, then click Play.',
        'Walk to the sports car and press F to enter/exit the driver seat.',
        'Use WASD / Arrow Keys to accelerate, reverse, and steer the vehicle.',
        'Drive into target destination beacons to pass the mission and earn XP!'
      ]
    },
    {
      id: 'dashboard',
      title: '📈 Operations Dashboard',
      icon: <Activity className="w-5 h-5 text-sky-400" />,
      description: 'The core operational center of TechSetu. Displays system statistics, active process logs, daily habit trend charts, and overall user growth metrics.',
      steps: [
        'Check real-time telemetry metrics and system memory streams.',
        'Monitor active task statistics and completed milestones.',
        'Review habit performance over the past week in a graph.'
      ]
    },
    {
      id: 'tasks',
      title: '📋 AI Task Manager',
      icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
      description: 'Organize study lists, code items, and play tasks on a multi-column Kanban board. Drag and drop tasks from backlog to complete.',
      steps: [
        'Create tasks with priority values and due dates.',
        'Drag items across columns: Backlog, In Progress, Review, and Done.',
        'Integrates with the 3D Task City to resolve city milestones.'
      ]
    },
    {
      id: 'focus',
      title: '⏱️ Pomodoro Focus Engine',
      icon: <Clock className="w-5 h-5 text-purple-400" />,
      description: 'Improve focus cycles using customized Pomodoro timer sessions coupled with dynamic ambient sound options.',
      steps: [
        'Start the timer (25 minutes deep focus / 5 minutes rest).',
        'Toggle focus sounds like white noise or synthetic rain.',
        'Earn XP points automatically upon completing focus loops!'
      ]
    },
    {
      id: 'ai',
      title: '🤖 Intelligent AI Hub',
      icon: <Bot className="w-5 h-5 text-teal-400" />,
      description: 'A playground to query AI models directly inside your workspace OS, writing summaries, drafting outlines, or auditing code.',
      steps: [
        'Input prompts to retrieve code explanations or plans.',
        'Select custom context folders for local research.'
      ]
    },
    {
      id: 'gamification',
      title: '🏆 Gamification Shelf',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      description: 'Maintains user levels, daily habit streaks, and ranks on the weekly leaderboards. Unlocks achievements as you complete work.',
      steps: [
        'Earn XP by checking off checklist tasks and completing city drives.',
        'Level up when you exceed the level threshold.',
        'Unlock custom badges like Deep Work Adept or Automator Pioneer.'
      ]
    }
  ];

  return (
    <div className="space-y-6 relative">
      
      {/* Celebration visual banner overlay */}
      {celebrationGlow && (
        <div className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl pointer-events-none z-20 animate-pulse flex items-center justify-center">
          <div className="glass-card p-6 bg-black/80 text-center space-y-2 border border-emerald-500/30 scale-105 transition-all">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto animate-bounce" />
            <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-mono">
              DEMO CELEBRATION!
            </h2>
            <p className="text-[10px] text-slate-300 font-mono">
              XP rewarded (+50 XP) & synth notes swept successfully!
            </p>
          </div>
        </div>
      )}

      {/* Guide Header Banner */}
      <div className="glass-card p-6 bg-gradient-to-br from-white/2 to-black/60 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <h2 className="text-lg font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 tracking-wider">
              {isEasyMode ? "My Workspace Guide Book 📖" : "Interactive Guide & Tour Center"}
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xl">
            {isEasyMode 
              ? "Welcome to the App Guide! Click on the tabs below to read how each section works, trigger fun live demos, or play our mini city simulator!"
              : "Discover the modules of TechSetu Work OS. Click features to navigate immediately, test audio synths, triggers, and review mock mechanics."}
          </p>
        </div>

        {/* Tab Selector buttons */}
        <div className="flex gap-2 bg-black/40 border border-white/10 p-1.5 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'walkthrough' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📋 Feature Map
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tester' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Live Triggers
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎮 City Simulator
          </button>
        </div>
      </div>

      {/* TAB CONTENT: 1. FEATURE MAP LIST */}
      {activeTab === 'walkthrough' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {featureWalkthroughs.map(feat => (
            <div 
              key={feat.id}
              className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-white/15 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-white/5 border border-white/5">
                    {feat.icon}
                  </span>
                  <h3 className="text-sm font-black text-white">{feat.title}</h3>
                </div>

                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {feat.description}
                </p>

                <div className="pt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block mb-1">
                    How it works:
                  </span>
                  <ul className="space-y-1">
                    {feat.steps.map((s, idx) => (
                      <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-normal">
                        <span className="text-[9px] text-[var(--accent-primary)] font-bold mt-0.5">▸</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setView(feat.id)}
                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--accent-primary)]/40 rounded-xl text-[11px] font-bold text-slate-200 hover:text-white transition-all cursor-pointer uppercase tracking-wider"
              >
                Jump to {isEasyMode ? 'Feature 🚀' : feat.title}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: 2. LIVE TRIGGERS TESTER */}
      {activeTab === 'tester' && (
        <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-2xl space-y-6 animate-fade-in">
          <div className="space-y-1.5">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-orange-400" />
              <span>Interactive Action Triggers</span>
            </h3>
            <p className="text-xs text-slate-400">
              Test core application behaviors directly. Click any action block to trigger its event instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Level up / XP Trigger */}
            <button
              onClick={triggerCelebration}
              className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 group"
            >
              <Trophy className="w-8 h-8 text-emerald-400 group-hover:animate-bounce" />
              <div className="leading-tight">
                <span className="text-xs font-black text-white block">Level Up Celebration</span>
                <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">Triggers XP & chimes</span>
              </div>
            </button>

            {/* Jump Sound Synth */}
            <button
              onClick={() => playSynthBeep(250, 'triangle', 0.15)}
              className="p-5 rounded-2xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 group"
            >
              <Volume2 className="w-8 h-8 text-pink-400 group-hover:scale-110" />
              <div className="leading-tight">
                <span className="text-xs font-black text-white block">Synth Jump Beep</span>
                <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">Synthesizes retro oscillator</span>
              </div>
            </button>

            {/* Spotlight Command Launcher */}
            <button
              onClick={openCommandFinder}
              className="p-5 rounded-2xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 group"
            >
              <HelpCircle className="w-8 h-8 text-sky-400 group-hover:rotate-12" />
              <div className="leading-tight">
                <span className="text-xs font-black text-white block">⌘K Command Spotlight</span>
                <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">Launches Spotlight panel</span>
              </div>
            </button>

            {/* Toggle Kids Mode layout */}
            <button
              onClick={toggleEasyMode}
              className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 group"
            >
              <Sparkles className="w-8 h-8 text-purple-400 group-hover:animate-spin" />
              <div className="leading-tight">
                <span className="text-xs font-black text-white block">Toggle Kids Theme</span>
                <span className="text-[9.5px] text-slate-400 block mt-1 font-mono">
                  {isEasyMode ? "Switch to Work OS" : "Switch to Kid Mode theme"}
                </span>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* TAB CONTENT: 3. INTERACTIVE 2D SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-2xl space-y-4 animate-fade-in">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-pink-400" />
              <span>Interactive GTA City 2D Logic Simulator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Watch this 2D mini simulation displaying the physical system loop of the 3D Task City. The car routes dynamically through streets to reach the green office beacon and triggers XP rewards.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* 2D Canvas Mount */}
            <div className="w-full md:w-2/3 max-w-[400px] h-[180px] rounded-xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#0f0f23]">
              <canvas ref={canvasRef} width={400} height={180} className="w-full h-full" />
            </div>

            {/* Simulator stats and logs */}
            <div className="flex-1 space-y-3.5 w-full">
              <div className="p-4 bg-black/45 border border-white/5 rounded-xl space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider block">
                  Simulated Physics Logs:
                </span>
                
                <div className="space-y-1 text-[10px] font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>GPS Target Coordinates:</span>
                    <span className="text-emerald-400">(X: 220, Y: 80)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Car Position:</span>
                    <span className="text-orange-400">Driving...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Verification Area:</span>
                    <span className="text-slate-400">&lt; 5.0 units</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Simulation Status:</span>
                    <span className="text-sky-400">{simRunning ? "Active" : "Stopped"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setView('kids')}
                className="w-full py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:brightness-110 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider font-mono shadow-lg shadow-red-500/10 cursor-pointer"
              >
                Go Play the Full 3D GTA City 🚗
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
