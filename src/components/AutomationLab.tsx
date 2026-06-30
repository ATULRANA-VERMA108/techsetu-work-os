import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Zap, 
  Play, 
  Settings, 
  Link2, 
  Activity,
  Award
} from 'lucide-react';

interface Recipe {
  id: string;
  trigger: string;
  action: string;
  active: boolean;
  execCount: number;
}

interface AutomationLabProps {
  onRewardXP: (xp: number) => void;
}

export const AutomationLab: React.FC<AutomationLabProps> = ({ onRewardXP }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([
    { id: 'r1', trigger: 'When sprint task moves to Done', action: 'Simulate notification in Team Chat', active: true, execCount: 14 },
    { id: 'r2', trigger: 'When task due date is near (< 24h)', action: 'Raise card priority to High automatically', active: true, execCount: 5 },
    { id: 'r3', trigger: 'When strategic goal is delayed', action: 'AI automatically triggers Daily Planner replan', active: false, execCount: 0 },
    { id: 'r4', trigger: 'When Pomodoro focus block completes', action: 'Add +120 XP and post streak achievement', active: true, execCount: 8 }
  ]);

  const [triggerVal, setTriggerVal] = useState('When sprint task moves to Done');
  const [actionVal, setActionVal] = useState('Simulate notification in Team Chat');

  const triggers = [
    'When sprint task moves to Done',
    'When task due date is near (< 24h)',
    'When strategic goal is delayed',
    'When Pomodoro focus block completes',
    'When morning daily plan is generated',
    'When mood is logged as Stressed'
  ];

  const actions = [
    'Simulate notification in Team Chat',
    'Raise card priority to High automatically',
    'AI automatically triggers Daily Planner replan',
    'Add +120 XP and post streak achievement',
    'Send warning email digest to team members',
    'Lock down YouTube and social site blocker lists'
  ];

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const newR: Recipe = {
      id: Math.random().toString(),
      trigger: triggerVal,
      action: actionVal,
      active: true,
      execCount: 0
    };

    setRecipes(prev => [newR, ...prev]);
    onRewardXP(25); // XP for setting up automation workflow
  };

  const toggleRecipe = (id: string) => {
    setRecipes(prev => prev.map(r => {
      if (r.id !== id) return r;
      const willBeActive = !r.active;
      if (willBeActive) {
        onRewardXP(5);
      }
      return { ...r, active: willBeActive };
    }));
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const triggerExecutionSimulation = (id: string) => {
    setRecipes(prev => prev.map(r => {
      if (r.id !== id) return r;
      onRewardXP(10); // Simulation reward
      return { ...r, execCount: r.execCount + 1 };
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Recipes List (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-[var(--accent-primary)] animate-pulse" />
            Active Zapier-style integrations recipes
          </h3>
          <span className="text-[9px] font-mono text-[var(--text-muted)]">Automatic Background triggers</span>
        </div>

        {/* Recipes cards */}
        <div className="space-y-3.5">
          {recipes.map(recipe => (
            <div
              key={recipe.id}
              className={`glass-card p-4.5 bg-white/2 border transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                recipe.active ? 'border-sky-500/10' : 'border-white/4 opacity-60'
              }`}
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-[var(--accent-primary)] font-bold">WHEN</span>
                  <span className="text-white truncate block max-w-sm">{recipe.trigger}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-[var(--accent-secondary)] font-bold">DO ACTION</span>
                  <span className="text-slate-300 truncate block max-w-sm">{recipe.action}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 shrink-0 font-mono text-[10px]">
                <div className="leading-tight text-right pr-2 border-r border-white/5">
                  <span className="text-[8.5px] text-[var(--text-muted)] block">Runs Count</span>
                  <span className="text-xs font-bold text-white">{recipe.execCount}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => triggerExecutionSimulation(recipe.id)}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/8 text-[var(--text-secondary)] hover:text-white cursor-pointer"
                    title="Simulate execution run"
                  >
                    <Play className="w-3.5 h-3.5 fill-[var(--text-secondary)]/10" />
                  </button>

                  <label className="switch-toggle shrink-0">
                    <input
                      type="checkbox"
                      checked={recipe.active}
                      onChange={() => toggleRecipe(recipe.id)}
                    />
                    <span className="switch-slider" />
                  </label>

                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="p-1 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Builder Form */}
        <form onSubmit={handleAddRecipe} className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/35 border border-white/5 rounded-2xl space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">Assemble Custom Automation Block</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block mb-1">Trigger (When Event occurs)</label>
              <select
                value={triggerVal}
                onChange={(e) => setTriggerVal(e.target.value)}
                className="w-full bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-secondary)] focus:outline-none"
              >
                {triggers.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9.5px] uppercase font-bold text-[var(--text-muted)] block mb-1">Action (Execute operational command)</label>
              <select
                value={actionVal}
                onChange={(e) => setActionVal(e.target.value)}
                className="w-full bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-secondary)] focus:outline-none"
              >
                {actions.map((a, idx) => (
                  <option key={idx} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
            <Link2 className="w-4 h-4" /> Link Automation Pipeline
          </button>
        </form>

      </div>

      {/* Right Column: Active Automation status & Logs */}
      <div className="lg:col-span-1 space-y-6">
        
        <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
              <Activity className="w-4.5 h-4.5 text-[var(--accent-secondary)]" />
              Automations System Diagnostics
            </h4>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between items-center text-[var(--text-secondary)]">
                <span>Core Listener status</span>
                <span className="text-[var(--accent-primary)] font-bold">ONLINE</span>
              </div>

              <div className="flex justify-between items-center text-[var(--text-secondary)]">
                <span>Active background zaps</span>
                <span className="text-white font-bold">{recipes.filter(r => r.active).length} listeners</span>
              </div>

              <div className="flex justify-between items-center text-[var(--text-secondary)]">
                <span>Total execution logs</span>
                <span className="text-sky-400 font-bold">27 triggers fired</span>
              </div>
            </div>

            <div className="p-3 bg-black/40 border border-white/4 rounded-xl space-y-2">
              <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Live Stream Logs</span>
              <div className="space-y-1.5 text-[9px] font-mono text-slate-400 max-h-[160px] overflow-y-auto no-scrollbar">
                <div>[11:30:42 AM] - Zap #4 triggered: Pomodoro complete. Posted +120 XP.</div>
                <div>[11:15:10 AM] - Zap #1 triggered: Carlos Menendez moved task #1 to Done. Message sent.</div>
                <div>[10:02:18 AM] - System loaded 4 recipe nodes successfully.</div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-black/40 border border-white/4 rounded-xl flex items-center gap-2.5 text-[9px] font-mono">
            <Award className="w-4 h-4 text-[var(--accent-tertiary)] shrink-0" />
            <span>AI recommendation: Automate site blocker rules during coding focus hours to save 3.2 weekly hours.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
