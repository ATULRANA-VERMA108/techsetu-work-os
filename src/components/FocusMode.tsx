import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Activity, 
  Award,
  Zap,
  Flame,
  Plus,
  Trash2,
  AlertOctagon
} from 'lucide-react';

interface AmbientSound {
  id: string;
  name: string;
  playing: boolean;
  intensity: number;
}

interface FocusModeProps {
  onRewardXP: (xp: number) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onRewardXP }) => {
  // Timer States
  const [timerMode, setTimerMode] = useState<'work' | 'short' | 'long'>('work');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);

  // Ambient Sounds state
  const [sounds, setSounds] = useState<AmbientSound[]>([
    { id: 's1', name: 'Rain on Hologram Shield', playing: false, intensity: 50 },
    { id: 's2', name: 'Cyberpunk Lofi Beats', playing: false, intensity: 75 },
    { id: 's3', name: 'Retro Synthwave Grid', playing: false, intensity: 60 },
    { id: 's4', name: 'Cozy Workspace Cafe', playing: false, intensity: 40 },
    { id: 's5', name: 'Whispering Forest Nodes', playing: false, intensity: 30 }
  ]);

  // Blocked websites list
  const [blockedUrls, setBlockedUrls] = useState<string[]>([
    'youtube.com/shorts',
    'twitter.com/home',
    'reddit.com/r/all'
  ]);
  const [newUrl, setNewUrl] = useState('');

  // Flow State metrics
  const [focusHoursToday, setFocusHoursToday] = useState(3.5);
  const [burnoutRisk, setBurnoutRisk] = useState<'Low' | 'Moderate' | 'Critical'>('Moderate');

  // Handle timer countdown
  useEffect(() => {
    let interval: any = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      // Completed Focus Session!
      if (timerMode === 'work') {
        onRewardXP(120); // Massive XP for a full Pomodoro session
        alert('Deep Work Focus Block Completed! Level Up +120 XP.');
        setSecondsLeft(5 * 60);
        setTimerMode('short');
      } else {
        onRewardXP(20);
        alert('Break completed. Ready to focus again?');
        setSecondsLeft(25 * 60);
        setTimerMode('work');
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, timerMode]);

  const handleModeChange = (mode: 'work' | 'short' | 'long') => {
    setIsActive(false);
    setTimerMode(mode);
    if (mode === 'work') setSecondsLeft(25 * 60);
    else if (mode === 'short') setSecondsLeft(5 * 60);
    else if (mode === 'long') setSecondsLeft(15 * 60);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      onRewardXP(10); // Starter XP
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    if (timerMode === 'work') setSecondsLeft(25 * 60);
    else if (timerMode === 'short') setSecondsLeft(5 * 60);
    else if (timerMode === 'long') setSecondsLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleSound = (id: string) => {
    setSounds(prev => prev.map(s => {
      if (s.id !== id) return s;
      const willPlay = !s.playing;
      if (willPlay) {
        onRewardXP(5); // Ambient booster XP
      }
      return { ...s, playing: willPlay };
    }));
  };

  const handleBlockUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setBlockedUrls(prev => [...prev, newUrl.toLowerCase().trim()]);
    setNewUrl('');
    onRewardXP(15); // Shielding XP
  };

  const handleUnblockUrl = (index: number) => {
    setBlockedUrls(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Pomodoro Core Timer & Site Blocker (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Core Timer card */}
        <div className="glass-card p-8 bg-gradient-to-br from-white/2 to-black/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[var(--accent-secondary)]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Toggles */}
          <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl gap-1 mb-6">
            <button
              onClick={() => handleModeChange('work')}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timerMode === 'work' ? 'bg-white/5 text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Deep Work (25m)
            </button>
            <button
              onClick={() => handleModeChange('short')}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timerMode === 'short' ? 'bg-white/5 text-emerald-400' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => handleModeChange('long')}
              className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timerMode === 'long' ? 'bg-white/5 text-purple-400' : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Time digits display */}
          <div className="relative mb-6">
            <h1 className="text-7xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {formatTime(secondsLeft)}
            </h1>
            
            {/* Spinning pulse ring on active */}
            {isActive && (
              <div className="absolute -inset-4 border border-[var(--accent-primary)]/10 rounded-3xl animate-ping opacity-40" />
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={toggleTimer}
              className={`py-3 px-8 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg ${
                isActive
                  ? 'bg-black/30 border border-red-500/20 text-red-400 hover:bg-red-500/10'
                  : 'btn-primary border-transparent'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-red-400" />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Deep Work</span>
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 bg-black/40 border border-white/8 hover:border-white/20 text-[var(--text-secondary)] hover:text-white rounded-xl transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Website Blocker simulator */}
        <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-[var(--accent-secondary)]" />
              AI Distraction Blocker Shield
            </h4>
            <span className="text-[9px] uppercase font-mono text-[var(--text-muted)]">Local Host Hook</span>
          </div>

          <form onSubmit={handleBlockUrl} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. facebook.com, netflix.com..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-secondary)] transition-colors"
            />
            <button type="submit" className="btn-secondary py-2 px-5 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Block URL
            </button>
          </form>

          {/* Blocked URL list items */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {blockedUrls.map((url, idx) => (
              <div key={idx} className="p-2.5 bg-black/25 border border-white/4 rounded-xl flex justify-between items-center text-[10px] font-mono text-rose-300">
                <span className="truncate pr-2">{url}</span>
                <button
                  type="button"
                  onClick={() => handleUnblockUrl(idx)}
                  className="text-[var(--text-muted)] hover:text-red-400 p-0.5 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Ambient Sounds & Flow Analytics */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Ambient audio player */}
        <div className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/40 border border-white/5 rounded-2xl space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Volume2 className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
            Ambient sound generator
          </h4>

          <div className="space-y-2.5">
            {sounds.map(sound => (
              <div
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className={`p-3 bg-black/25 border rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-black/40 ${
                  sound.playing ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-white/4'
                }`}
              >
                <div className="leading-tight">
                  <span className="text-xs font-bold text-white block">{sound.name}</span>
                  <span className="text-[8.5px] text-[var(--text-muted)] font-mono">Volume Mixer: {sound.intensity}%</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {sound.playing ? (
                    /* Active audio animation lines */
                    <div className="flex gap-0.5 items-end h-3 px-1">
                      <span className="w-0.5 bg-[var(--accent-primary)] animate-sound-bar h-2.5" />
                      <span className="w-0.5 bg-[var(--accent-primary)] animate-sound-bar-delayed h-1.5" />
                      <span className="w-0.5 bg-[var(--accent-primary)] animate-sound-bar h-2" />
                    </div>
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <style>{`
            @keyframes sound-bar {
              0%, 100% { height: 4px; }
              50% { height: 12px; }
            }
            .animate-sound-bar {
              animation: sound-bar 0.8s ease-in-out infinite;
            }
            .animate-sound-bar-delayed {
              animation: sound-bar 0.8s ease-in-out infinite;
              animation-delay: 0.3s;
            }
          `}</style>
        </div>

        {/* Focus Analytics */}
        <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2.5">
            <Activity className="w-4.5 h-4.5 text-[var(--accent-tertiary)]" />
            Active Flow Analytics
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-[var(--text-secondary)]">Deep Work Hours (Today)</span>
              <span className="font-bold text-white">{focusHoursToday} hrs</span>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-[var(--text-secondary)]">Burnout Risk Alert</span>
              <span className={`font-bold px-1.5 py-0.2 rounded ${
                burnoutRisk === 'Critical' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
              }`}>{burnoutRisk}</span>
            </div>

            {burnoutRisk === 'Moderate' && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-2 text-[9.5px] text-[var(--text-secondary)] leading-relaxed">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Tip: Rest interval suggested. Take a short walk or drink 250ml water to reset cognitive focus.
                </span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
