import React from 'react';
import { 
  Award, 
  Trophy, 
  Flame, 
  Zap, 
  Target, 
  Compass, 
  User, 
  Sparkles,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  desc: string;
  unlocked: boolean;
  xpValue: number;
}

interface LeaderboardUser {
  rank: number;
  name: string;
  initials: string;
  role: string;
  xp: number;
  streak: number;
}

interface GamificationCenterProps {
  xp: number;
  level: number;
  streak: number;
}

export const GamificationCenter: React.FC<GamificationCenterProps> = ({ xp, level, streak }) => {
  const achievements: Achievement[] = [
    { id: 'a1', title: 'Deep Work Adept', desc: 'Complete a full 25-minute focus session.', unlocked: true, xpValue: 120 },
    { id: 'a2', title: 'Goal Setter', desc: 'Create a strategic objective with 3 key milestones.', unlocked: true, xpValue: 40 },
    { id: 'a3', title: 'Atomic Habit Streak', desc: 'Maintain a 7-day habit checkin loop.', unlocked: true, xpValue: 80 },
    { id: 'a4', title: 'Automator Pioneer', desc: 'Assemble and deploy a custom trigger-action recipe.', unlocked: true, xpValue: 25 },
    { id: 'a5', title: 'Cognitive Reflector', desc: 'Complete 3 night reflections and emotional logs.', unlocked: false, xpValue: 150 },
    { id: 'a6', title: 'Flow State Master', desc: 'Log 8 cumulative deep work focus hours.', unlocked: false, xpValue: 300 }
  ];

  const leaders: LeaderboardUser[] = [
    { rank: 1, name: 'Atul Verma (You)', initials: 'AV', role: 'Workspace Lead Developer', xp, streak },
    { rank: 2, name: 'Carlos Menendez', initials: 'CM', role: 'Lead Backend Developer', xp: 840, streak: 8 },
    { rank: 3, name: 'Sarah Chen', initials: 'SC', role: 'Product Designer', xp: 620, streak: 5 },
    { rank: 4, name: 'Emily Taylor', initials: 'ET', role: 'QA Engineer', xp: 480, streak: 3 }
  ].sort((a, b) => b.xp - a.xp);

  // Recalculate ranks based on sorted order
  leaders.forEach((u, idx) => {
    u.rank = idx + 1;
  });

  const xpNeeded = level * 300;
  const levelProgress = Math.round((xp / xpNeeded) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: XP Progression & Achievements (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Level card */}
        <div className="glass-card p-6 bg-gradient-to-br from-white/2 to-black/50 border border-white/5 rounded-2xl flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex flex-col items-center justify-center shrink-0 shadow-lg shadow-black border border-white/10">
            <Trophy className="w-6 h-6 text-black mb-0.5" />
            <span className="text-xl font-black text-black leading-none font-mono">Lvl {level}</span>
          </div>

          <div className="space-y-3 flex-1 w-full">
            <div className="flex justify-between items-end">
              <div className="leading-tight">
                <span className="text-[9px] uppercase font-bold text-[var(--accent-primary)] tracking-widest font-mono">Dopamine Rank</span>
                <h3 className="text-base font-black text-white mt-1">Deep Work Adept</h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold">
                {xp} / {xpNeeded} XP
              </span>
            </div>

            {/* Level progress bar */}
            <div className="w-full h-2 bg-black/45 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, levelProgress)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-[var(--text-muted)]">
              <span>Current Level: {level}</span>
              <span>XP to Level {level + 1}: {xpNeeded - xp} XP</span>
            </div>
          </div>
        </div>

        {/* Achievements list */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Award className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
              Unlocked Achievements
            </h3>
            <span className="text-[9px] font-mono text-[var(--text-muted)]">Completed Challenges Shelf</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`glass-card p-4.5 bg-white/2 border transition-all flex gap-3.5 items-start ${
                  ach.unlocked 
                    ? 'border-emerald-500/10 bg-emerald-500/5' 
                    : 'border-white/4 opacity-50 bg-black/10'
                }`}
              >
                <span className={`p-2 rounded-xl border shrink-0 ${
                  ach.unlocked 
                    ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400' 
                    : 'bg-black/30 border-white/6 text-[var(--text-muted)]'
                }`}>
                  <Sparkles className="w-4.5 h-4.5" />
                </span>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    {ach.title}
                    {ach.unlocked && <span className="text-[8px] bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-1 rounded font-bold font-mono">✓</span>}
                  </h4>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{ach.desc}</p>
                  <span className="text-[8.5px] font-mono text-[var(--accent-primary)] font-bold">+{ach.xpValue} XP Rewards</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Right Column: Weekly focus leaderboards */}
      <div className="lg:col-span-1 space-y-6">
        
        <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
              <Trophy className="w-4.5 h-4.5 text-[var(--accent-tertiary)]" />
              Weekly Focus Leaderboard
            </h4>

            {/* User rankings */}
            <div className="space-y-2.5">
              {leaders.map(user => {
                const isUser = user.name.includes('(You)');
                return (
                  <div
                    key={user.rank}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isUser 
                        ? 'border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5' 
                        : 'border-white/4 bg-black/25'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank badge */}
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                        user.rank === 1 ? 'bg-amber-400 text-black' :
                        user.rank === 2 ? 'bg-slate-300 text-black' :
                        user.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-black/40 text-[var(--text-muted)]'
                      }`}>
                        {user.rank}
                      </span>

                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-[var(--accent-primary)] shrink-0">
                        {user.initials}
                      </div>

                      {/* Name / Role */}
                      <div className="min-w-0 leading-tight">
                        <span className="text-[10.5px] font-bold text-white truncate block">{user.name}</span>
                        <span className="text-[8.5px] text-[var(--text-muted)] truncate block">{user.role}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <span className="text-[11px] font-bold text-[var(--accent-primary)] block leading-none">{user.xp} XP</span>
                      <span className="text-[8.5px] text-orange-500 font-bold flex items-center justify-end gap-0.5 mt-1.5">
                        <Flame className="w-3 h-3 fill-orange-500" />
                        {user.streak}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-br from-white/2 to-black/35 border border-white/4 rounded-xl flex items-center gap-3 text-[9.5px]">
            <Zap className="w-4 h-4 text-[var(--accent-primary)] shrink-0 animate-bounce" />
            <span className="text-[var(--text-secondary)] font-mono leading-relaxed">
              Complete task checklists or log reflections to maintain Rank #1 on the leaderboard.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
