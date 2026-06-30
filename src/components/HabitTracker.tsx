import React, { useState } from 'react';
import { 
  Check, 
  Flame, 
  Calendar, 
  Smile, 
  Compass, 
  Activity, 
  Plus,
  Trash2,
  Award,
  BarChart2
} from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  streak: number;
  completedToday: boolean;
  color: string;
}

interface HabitTrackerProps {
  onRewardXP: (xp: number) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ onRewardXP }) => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: 'h1', name: 'Write Clean Code (Vite/Spring)', streak: 12, completedToday: false, color: 'border-l-4 border-emerald-400' },
    { id: 'h2', name: 'Meditate / Focus Alignment', streak: 4, completedToday: false, color: 'border-l-4 border-sky-400' },
    { id: 'h3', name: 'Hydration Target (3L Water)', streak: 21, completedToday: false, color: 'border-l-4 border-blue-400' },
    { id: 'h4', name: 'Read technical articles / PDFs', streak: 7, completedToday: false, color: 'border-l-4 border-amber-400' },
    { id: 'h5', name: 'Gym / Cardiovascular activity', streak: 0, completedToday: false, color: 'border-l-4 border-rose-400' }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [moodLogs, setMoodLogs] = useState<{ time: string; mood: string; energy: number }[]>([
    { time: '10:00 AM', mood: 'Focused', energy: 80 },
    { time: '02:30 PM', mood: 'Calm', energy: 70 },
    { time: '06:00 PM', mood: 'Energetic', energy: 85 }
  ]);
  const [selectedMood, setSelectedMood] = useState('Focused');
  const [selectedEnergy, setSelectedEnergy] = useState<number>(80);

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const colors = [
      'border-l-4 border-emerald-400',
      'border-l-4 border-sky-400',
      'border-l-4 border-blue-400',
      'border-l-4 border-amber-400',
      'border-l-4 border-rose-400',
      'border-l-4 border-purple-400'
    ];

    const newH: Habit = {
      id: Math.random().toString(),
      name: inputVal,
      streak: 0,
      completedToday: false,
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setHabits(prev => [...prev, newH]);
    onRewardXP(20); // XP for establishing custom atomic habit
    setInputVal('');
  };

  const handleCompleteHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const willBeCompleted = !h.completedToday;
      
      if (willBeCompleted) {
        onRewardXP(15); // XP for checking off habit
      }
      
      return {
        ...h,
        completedToday: willBeCompleted,
        streak: willBeCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
      };
    }));
  };

  const handleDeleteHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const handleAddMoodLog = () => {
    const newLog = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood: selectedMood,
      energy: selectedEnergy
    };
    setMoodLogs(prev => [newLog, ...prev]);
    onRewardXP(10); // Reward XP for self-tracking mood
  };

  // Generate GitHub style grids for consistent heatmaps
  const heatmapDays = Array.from({ length: 42 }).map((_, idx) => {
    const active = Math.random() > 0.4;
    const density = active ? Math.floor(Math.random() * 4) + 1 : 0;
    return density;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Habits List & Streaks (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <Flame className="w-4.5 h-4.5 text-[var(--accent-primary)] animate-pulse" />
            Atomic habits tracker
          </h3>
          <span className="text-[9px] font-mono text-[var(--text-muted)]">Check off to gain XP + Streaks</span>
        </div>

        {/* Habit Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {habits.map(habit => (
            <div
              key={habit.id}
              onClick={() => handleCompleteHabit(habit.id)}
              className={`glass-card p-4 bg-white/2 border cursor-pointer flex justify-between items-center transition-all ${habit.color} ${
                habit.completedToday ? 'bg-emerald-500/5 border-emerald-500/20' : 'border-white/5 hover:border-white/12'
              }`}
            >
              <div className="space-y-1.5 pr-4">
                <span className="text-xs font-bold text-white leading-snug block">{habit.name}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <span>{habit.streak} day streak</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleDeleteHabit(habit.id, e)}
                  className="p-1 rounded hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                  habit.completedToday
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                    : 'border-white/20'
                }`}>
                  {habit.completedToday && <Check className="w-4 h-4" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Habit Form */}
        <form onSubmit={handleAddHabit} className="glass-card p-4.5 bg-gradient-to-br from-white/2 to-black/35 border border-white/5 rounded-2xl flex gap-3">
          <input
            type="text"
            placeholder="e.g. Drink 250ml water, do 20 pushups, code 1 component..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            required
            className="flex-1 bg-black/40 border border-white/8 rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
          <button type="submit" className="btn-primary py-2 px-5 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Habit
          </button>
        </form>

        {/* GitHub Style Heatmap Grid */}
        <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
              Consistent Habit Execution Heatmap
            </h4>
            <span className="text-[9px] uppercase font-mono text-[var(--text-muted)]">Past 6 Weeks</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 justify-items-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[8px] uppercase font-mono text-[var(--text-muted)] py-0.5">{d}</div>
            ))}
            
            {heatmapDays.map((val, idx) => (
              <div
                key={idx}
                className={`w-5 h-5 rounded-md border ${
                  val === 0 ? 'bg-white/5 border-white/5' :
                  val === 1 ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)]/10' :
                  val === 2 ? 'bg-[var(--accent-primary)]/40 border-[var(--accent-primary)]/20' :
                  val === 3 ? 'bg-[var(--accent-primary)]/70 border-[var(--accent-primary)]/30' :
                  'bg-[var(--accent-primary)] border-[var(--accent-primary)]/50'
                }`}
                style={{
                  boxShadow: val > 2 ? '0 0 4px var(--accent-primary)' : 'none'
                }}
                title={`${val} habits completed on this index date`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Mood Log & Dopamine Analysis */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Mood Logger card */}
        <div className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/45 border border-white/5 rounded-2xl flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Smile className="w-4.5 h-4.5 text-[var(--accent-secondary)]" />
              Cognitive Mood Logger
            </h4>

            {/* Mood selector buttons */}
            <div className="grid grid-cols-2 gap-2">
              {['Focused', 'Calm', 'Energetic', 'Exhausted', 'Stressed', 'Distracted'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMood(m)}
                  className={`py-2 px-3 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                    selectedMood === m
                      ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-black/25 border-white/4 text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Energy Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[var(--text-secondary)] uppercase font-bold">Energy Levels</span>
                <span className="font-bold font-mono text-[var(--accent-primary)]">{selectedEnergy}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={selectedEnergy}
                onChange={(e) => setSelectedEnergy(Number(e.target.value))}
                className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
              />
            </div>

            <button
              onClick={handleAddMoodLog}
              className="w-full btn-secondary text-xs py-2 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Log Mood State
            </button>

            {/* Mood history stream */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Today's Logs</span>
              
              <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar">
                {moodLogs.map((log, idx) => (
                  <div key={idx} className="p-2.5 bg-black/35 border border-white/4 rounded-xl flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--accent-primary)] font-bold">{log.mood}</span>
                      <span className="text-[var(--text-muted)] font-mono">({log.energy}% Energy)</span>
                    </div>
                    <span className="text-[9.5px] text-[var(--text-muted)] font-mono">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-4 p-3 bg-black/40 border border-white/4 rounded-xl flex items-center gap-3.5 text-[9.5px] font-mono">
            <Award className="w-4 h-4 text-[var(--accent-tertiary)] shrink-0" />
            <span className="text-[var(--text-secondary)] leading-relaxed">
              AI Dopamine Tip: Coding velocity peaks when combined with a 'Calm' mood and &gt;80% energy.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
