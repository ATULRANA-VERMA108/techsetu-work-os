import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Sparkles, 
  Smile, 
  Frown, 
  Meh, 
  Zap, 
  Brain,
  Coffee,
  CheckCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface DailyPlannerProps {
  onRewardXP: (xp: number) => void;
  isEasyMode?: boolean;
}

export const DailyPlanner: React.FC<DailyPlannerProps> = ({ onRewardXP, isEasyMode = false }) => {
  const [plannerTab, setPlannerTab] = useState<'morning' | 'night'>('morning');
  const [whatWentWell, setWhatWentWell] = useState('');
  const [timeWasted, setTimeWasted] = useState('');
  const [mood, setMood] = useState<'happy' | 'neutral' | 'anxious' | 'tired'>('neutral');
  const [productivityScore, setProductivityScore] = useState<number>(75);
  const [reflectionLogs, setReflectionLogs] = useState<any[]>([
    {
      date: 'June 29, 2026',
      score: 85,
      mood: 'happy',
      insight: isEasyMode 
        ? 'Great job starting play goals early yesterday morning! Keep up the stars! ⭐'
        : 'Starting developer sprint tasks immediately at 8 AM boosted flow velocity by 30%.'
    },
    {
      date: 'June 28, 2026',
      score: 60,
      mood: 'tired',
      insight: isEasyMode
        ? 'Too much screen games time took away your focus. Let\'s try setting a timer today! 👾'
        : 'Context-switching to customer support syncs reduced developer focus. Suggest batching emails.'
    }
  ]);
  const [generatedInsight, setGeneratedInsight] = useState<string | null>(null);

  const handleNightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatWentWell.trim()) return;

    // Simulate AI insight generator based on input
    setTimeout(() => {
      let insight = isEasyMode 
        ? 'Fantastic! You did awesome activities today. Keep doing what makes you happy! ✨'
        : 'You maintained focus during technical phases, but meeting configurations dragged efficiency. Try setting focus blocks.';
      if (whatWentWell.toLowerCase().includes('code') || whatWentWell.toLowerCase().includes('play') || whatWentWell.toLowerCase().includes('study')) {
        insight = isEasyMode
          ? 'Super star! Studying and playing are best done in blocks. You earned extra level points! 🏅'
          : 'Your coding cycles are highly efficient when aligned with lofi focus audios. Keep shielding these slots.';
      } else if (timeWasted.toLowerCase().includes('youtube') || timeWasted.toLowerCase().includes('game') || timeWasted.toLowerCase().includes('social')) {
        insight = isEasyMode
          ? 'Remember to take play breaks so you do not get tired! Use your Focus Space timer. ⏱️'
          : 'Distractions accounted for a 15% dip. Leverage the Site Blocker inside Focus Mode to seal this gap.';
      }

      const newLog = {
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        score: productivityScore,
        mood,
        insight
      };

      setReflectionLogs(prev => [newLog, ...prev]);
      setGeneratedInsight(insight);
      onRewardXP(50); // XP for completing reflection
      setWhatWentWell('');
      setTimeWasted('');
    }, 800);
  };

  const morningSlots = isEasyMode ? [
    {
      time: '08:00 AM - 09:30 AM',
      title: 'Study Time: Learn coding & drawing! 🎨',
      type: 'focus',
      description: 'Zero distractions, complete check-off tasks, earn achievement badges.'
    },
    {
      time: '09:30 AM - 10:00 AM',
      title: 'Water break & stretch play 🧸',
      type: 'break',
      description: 'Stretch, light walk, drink 1 cup of water.'
    },
    {
      time: '10:00 AM - 11:30 AM',
      title: 'Creative play: Build Lego model nodes 🧱',
      type: 'work',
      description: 'Train your brain with puzzle building blocks.'
    },
    {
      time: '11:30 AM - 12:30 PM',
      title: 'Family sync: Share what you built! 🗣️',
      type: 'meeting',
      description: 'Show your dreams milestones to your parents and friends.'
    }
  ] : [
    {
      time: '08:00 AM - 09:30 AM',
      title: 'Deep Work: Vector RAG Core Architecture Coding',
      type: 'focus',
      description: 'Zero notifications, active Spotify lofi stream, local database query testing.'
    },
    {
      time: '09:30 AM - 10:00 AM',
      title: 'Health check & coffee transition',
      type: 'break',
      description: 'Stretch, light walk, check hydration levels.'
    },
    {
      time: '10:00 AM - 11:30 AM',
      title: 'Operations Sprint: Clean telemetry leaks & memory profiles',
      type: 'work',
      description: 'Check active ports and Docker containers stats.'
    },
    {
      time: '11:30 AM - 12:30 PM',
      title: 'Collaborative Sync: Carlos & Sarah review',
      type: 'meeting',
      description: 'Align on launch PRD metrics and server integration branches.'
    },
    {
      time: '02:00 PM - 03:30 PM',
      title: 'Creative R&D: Map goal hierarchy KPIs',
      type: 'focus',
      description: 'Brainstorm annual metrics dashboard.'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Columns: Morning/Night Planner Interface (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Planner Mode Toggles */}
        <div className="glass-card p-3 bg-white/2 border border-white/5 rounded-2xl flex gap-2">
          <button
            onClick={() => setPlannerTab('morning')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              plannerTab === 'morning' ? 'btn-active-primary' : 'btn-inactive'
            }`}
            title="Switch to morning daily plan layout"
          >
            <Sun className="w-4 h-4" />
            <span>{isEasyMode ? 'My Day Plan ☀️' : 'Morning "Perfect Day" Plan'}</span>
          </button>
          <button
            onClick={() => setPlannerTab('night')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              plannerTab === 'night' ? 'btn-active-secondary' : 'btn-inactive'
            }`}
            title="Switch to night reflection log form"
          >
            <Moon className="w-4 h-4" />
            <span>{isEasyMode ? 'My Reflection 🌙' : 'Night Reflection & Insights'}</span>
          </button>
        </div>

        {plannerTab === 'morning' ? (
          /* Morning Tab */
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" />
                {isEasyMode ? 'My Fun Activity Checklist' : 'AI Generated Ideal Work Sequence'}
              </h3>
              <span className="text-[9px] font-mono text-[var(--accent-primary)] bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/20 px-2 py-0.5 rounded-full">
                {isEasyMode ? 'Super Star Mode ⭐' : 'Energy Optimised'}
              </span>
            </div>

            <div className="space-y-3">
              {morningSlots.map((slot, idx) => (
                <div key={idx} className="glass-card p-4 bg-white/2 border border-white/5 hover:border-[var(--border-hover)] flex gap-4 items-start transition-all">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/6 flex flex-col items-center justify-center text-center shrink-0 w-32 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent-tertiary)] mb-1" />
                    <span className="text-[8.5px] text-[var(--text-secondary)] leading-none">{slot.time.split(' - ')[0]}</span>
                    <span className="text-[7.5px] text-[var(--text-muted)] mt-1">{slot.time.split(' - ')[1]}</span>
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        slot.type === 'focus' ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/25' :
                        slot.type === 'break' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' :
                        slot.type === 'meeting' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25' :
                        'bg-sky-500/15 text-sky-400 border border-sky-500/25'
                      }`}>
                        {slot.type}
                      </span>
                      <h4 className="text-xs font-bold text-white">{slot.title}</h4>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{slot.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Night Tab */
          <div className="space-y-6 animate-fade-in">
            <form onSubmit={handleNightSubmit} className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/5 pb-2.5">
                <Moon className="w-4 h-4 text-[var(--accent-secondary)]" />
                {isEasyMode ? 'My Star Score & Sleep Journal 🌙' : 'Workspace Night Reflection Log'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-[9.5px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
                    {isEasyMode ? 'What did you enjoy most today? 💖' : 'What went well today?'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isEasyMode ? 'I finished my study checklist, played Lego blocks...' : 'e.g. Cleared 4 backlog sprint tickets, ran custom API queries successfully...'}
                    value={whatWentWell}
                    onChange={(e) => setWhatWentWell(e.target.value)}
                    required
                    className="w-full bg-black/40 border border-white/8 rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-secondary)] transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] uppercase font-bold text-[var(--text-secondary)] block mb-1">
                    {isEasyMode ? 'What took away your fun or focus? 👾' : 'What wasted your time today?'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isEasyMode ? 'Spent too much time on video game screens...' : 'e.g. Spent 1 hour debuging a missing semicolon, slack channel threads...'}
                    value={timeWasted}
                    onChange={(e) => setTimeWasted(e.target.value)}
                    className="w-full bg-black/40 border border-white/8 rounded-xl p-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-secondary)] transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Mood Selector */}
                  <div>
                    <label className="text-[9.5px] uppercase font-bold text-[var(--text-secondary)] block mb-1.5">
                      {isEasyMode ? 'How do you feel? 😊' : 'Emotional / Energy State'}
                    </label>
                    <div className="flex gap-2">
                      {[
                        { id: 'happy', icon: <Smile className="w-4 h-4" />, label: isEasyMode ? 'Happy' : 'Focused' },
                        { id: 'neutral', icon: <Meh className="w-4 h-4" />, label: isEasyMode ? 'Okay' : 'Steady' },
                        { id: 'anxious', icon: <Zap className="w-4 h-4" />, label: isEasyMode ? 'Tired' : 'Stressed' },
                        { id: 'tired', icon: <Frown className="w-4 h-4" />, label: isEasyMode ? 'Sad' : 'Fatigued' }
                      ].map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMood(item.id as any)}
                          className={`flex-1 py-2 px-2.5 rounded-xl border text-[9px] font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            mood === item.id ? 'btn-active-secondary' : 'btn-inactive'
                          }`}
                          title={`Select feeling: ${item.label}`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Productivity slider */}
                  <div className="flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[9.5px] uppercase font-bold text-[var(--text-secondary)]">
                        {isEasyMode ? 'How many stars do you give today? ⭐' : 'Productivity Score'}
                      </label>
                      <span className="text-xs font-mono font-bold text-[var(--accent-secondary)]">
                        {isEasyMode ? `${Math.round(productivityScore / 20)} Stars` : `${productivityScore}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={productivityScore}
                      onChange={(e) => setProductivityScore(Number(e.target.value))}
                      className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-[var(--accent-secondary)]"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-secondary w-full text-xs py-2.5 rounded-xl cursor-pointer">
                {isEasyMode ? 'Save My Star Journal 🌟' : 'Submit Reflection Node'}
              </button>
            </form>

            {/* AI Response insights after submit */}
            {generatedInsight && (
              <div className="glass-card p-4.5 bg-gradient-to-br from-white/2 to-black/35 border border-[var(--accent-secondary)]/20 rounded-2xl flex gap-3.5 items-start animate-fade-in">
                <Brain className="w-5 h-5 text-[var(--accent-secondary)] shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1.5">
                  <span className="text-[8.5px] uppercase font-mono text-[var(--accent-secondary)] font-bold">AI Reflection Insight</span>
                  <p className="text-[10.5px] text-[var(--text-primary)] leading-relaxed italic">
                    "{generatedInsight}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Right Column: Historical Logs & Insights */}
      <div className="lg:col-span-1 space-y-6">
        
        <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-3 border-b border-white/5">
              <TrendingUp className="w-4.5 h-4.5 text-[var(--accent-tertiary)]" />
              Growth Insights & Performance History
            </h4>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto no-scrollbar">
              {reflectionLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-black/35 border border-white/4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center border-b border-white/4 pb-1.5 text-[9.5px] font-mono">
                    <span className="text-slate-400 font-bold">{log.date}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8.5px] font-bold uppercase ${
                        log.mood === 'happy' ? 'text-emerald-400' : log.mood === 'tired' ? 'text-rose-400' : 'text-slate-400'
                      }`}>{log.mood}</span>
                      <span className="text-white bg-white/5 px-1.5 py-0.2 rounded font-bold">{log.score}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed italic">
                    "{log.insight}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-black/40 border border-white/4 rounded-xl flex items-center justify-between text-[10px]">
            <span className="text-[var(--text-muted)] font-mono">Completed Streaks</span>
            <span className="font-bold text-[var(--accent-primary)] font-mono">7 Days Consistent</span>
          </div>
        </div>

      </div>

    </div>
  );
};
