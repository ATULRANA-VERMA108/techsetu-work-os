import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Activity, 
  HelpCircle, 
  Brain, 
  Plus, 
  ChevronRight, 
  Award,
  Zap,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  tier: 'vision' | 'annual' | 'monthly' | 'weekly' | 'daily';
  progress: number;
  category: 'career' | 'personal' | 'financial' | 'learning' | 'fitness';
  targetDate: string;
  milestones: { text: string; done: boolean }[];
}

interface GoalTrackerProps {
  onRewardXP: (xp: number) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({ onRewardXP }) => {
  const [activeTier, setActiveTier] = useState<Goal['tier']>('annual');
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'g1',
      title: 'Build global AI Productivity Ecosystem brand',
      tier: 'vision',
      progress: 45,
      category: 'career',
      targetDate: '2028-12-31',
      milestones: [
        { text: 'Launch TechSetu WorkOS v1.0', done: true },
        { text: 'Reach 10,000 monthly active users', done: false },
        { text: 'Establish enterprise integration RAG pipelines', done: false }
      ]
    },
    {
      id: 'g2',
      title: 'Master Advanced Machine Learning & Vector Datastores',
      tier: 'annual',
      progress: 68,
      category: 'learning',
      targetDate: '2026-12-31',
      milestones: [
        { text: 'Complete DeepLearning.AI specialization', done: true },
        { text: 'Deploy custom embedding RAG model locally', done: true },
        { text: 'Implement 5 custom neural agent architectures', done: false }
      ]
    },
    {
      id: 'g3',
      title: 'Launch SaaS premium module gateway and sign 3 clients',
      tier: 'monthly',
      progress: 30,
      category: 'financial',
      targetDate: '2026-07-31',
      milestones: [
        { text: 'Code pricing layout page', done: true },
        { text: 'Integrate Stripe microservices gateway', done: false },
        { text: 'Pitch to 10 potential tech agencies', done: false }
      ]
    },
    {
      id: 'g4',
      title: 'Deploy final telemetry socket leak security patches',
      tier: 'weekly',
      progress: 90,
      category: 'career',
      targetDate: '2026-07-04',
      milestones: [
        { text: 'Isolate Node cluster connection streams', done: true },
        { text: 'Write integration regression tests', done: true },
        { text: 'Merge telemetry pull request to production', done: false }
      ]
    }
  ]);

  // Goal Creation Forms state
  const [newTitle, setNewTitle] = useState('');
  const [newTier, setNewTier] = useState<Goal['tier']>('annual');
  const [newCategory, setNewCategory] = useState<Goal['category']>('learning');
  const [newDate, setNewDate] = useState('2026-12-31');

  // AI Assistant Analysis State
  const [selectedGoalId, setSelectedGoalId] = useState<string>('g2');
  const selectedGoal = goals.find(g => g.id === selectedGoalId) || goals[0];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newG: Goal = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle,
      tier: newTier,
      progress: 0,
      category: newCategory,
      targetDate: newDate,
      milestones: [
        { text: 'Phase 1: Initial research & outline', done: false },
        { text: 'Phase 2: Core development & checkin', done: false }
      ]
    };

    setGoals(prev => [newG, ...prev]);
    onRewardXP(40); // Reward XP for setting structured goals
    setNewTitle('');
  };

  const toggleMilestone = (goalId: string, index: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const nextMilestones = [...g.milestones];
      nextMilestones[index] = { ...nextMilestones[index], done: !nextMilestones[index].done };
      
      // Calculate progress based on completed milestones
      const doneCount = nextMilestones.filter(m => m.done).length;
      const progress = Math.round((doneCount / nextMilestones.length) * 100);
      
      if (progress === 100) {
        onRewardXP(100); // Massive XP bonus for fully finishing goal tier
      }

      return {
        ...g,
        milestones: nextMilestones,
        progress
      };
    }));
  };

  const getCategoryColor = (cat: Goal['category']) => {
    switch (cat) {
      case 'career': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'fitness': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'learning': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'financial': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'personal': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  // Simulated AI insights based on the selected goal progress and category
  const getAIAnalysis = (goal: Goal) => {
    const predictions: Record<string, {
      probability: number;
      delayReason: string;
      productivityBlock: string;
      bestNextAction: string;
      estimateTime: string;
    }> = {
      'g1': {
        probability: 72,
        delayReason: 'B2B outreach speed is currently dragging. Marketing RAG content creation has dried up in the last 2 weeks.',
        productivityBlock: 'High density of engineering tasks is crowding out brand-building and community interactions.',
        bestNextAction: 'Establish an automated Slack-to-Twitter content pipeline to trigger brand activity upon major GitHub commits.',
        estimateTime: '18 months to reach 10k users based on current velocity.'
      },
      'g2': {
        probability: 94,
        delayReason: 'No delays! You completed 2 core milestones 4 days ahead of schedule.',
        productivityBlock: 'Occasional flow state interruption by ad-hoc Slack sync channels on Tuesday afternoons.',
        bestNextAction: 'Block off a 3-hour "Deep Coding" chunk on Tuesdays. Start drafting the vector neural agent code.',
        estimateTime: 'Completed by October 15, 2026.'
      },
      'g3': {
        probability: 48,
        delayReason: 'Payment gateways integration is pending. Storing payment variables safely in Spring Boot environment needs research.',
        productivityBlock: 'Context switching between backend security audits and SaaS integration hubs.',
        bestNextAction: 'Complete the Stripe SDK webhook handler. Run testing simulator to record transaction logs.',
        estimateTime: '预计 6 周 (estimated 6 weeks) based on current backend ticket completion rates.'
      },
      'g4': {
        probability: 98,
        delayReason: 'Practically complete. Pull request is waiting for a final security telemetry review.',
        productivityBlock: 'None detected. Execution velocity is high.',
        bestNextAction: 'Request a quick peer review check from Carlos Menendez to merge the branch.',
        estimateTime: '2 hours.'
      }
    };

    return predictions[goal.id] || {
      probability: 60,
      delayReason: 'Initial setup phases require active milestone creation.',
      productivityBlock: 'Task distribution is unevenly distributed across weekly schedules.',
      bestNextAction: 'Break down current roadmap into at least 3 concrete milestones.',
      estimateTime: '4 weeks.'
    };
  };

  const aiAnalysis = getAIAnalysis(selectedGoal);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Hierarchy & Dashboard (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Tier Selector Navigation */}
        <div className="glass-card p-3 bg-white/2 border border-white/5 rounded-2xl flex flex-wrap gap-1">
          {(['vision', 'annual', 'monthly', 'weekly', 'daily'] as Goal['tier'][]).map(tier => {
            const count = goals.filter(g => g.tier === tier).length;
            return (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                  activeTier === tier
                    ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 text-white border border-[var(--accent-primary)]/30'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/4'
                }`}
              >
                {tier} ({count})
              </button>
            );
          })}
        </div>

        {/* Goals List in Active Tier */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <Target className="w-4 h-4 text-[var(--accent-primary)]" />
              Active {activeTier} Objectives
            </h3>
            <span className="text-[9px] font-mono text-[var(--text-muted)]">Target Timeline Tracking</span>
          </div>

          {goals.filter(g => g.tier === activeTier).length === 0 ? (
            <div className="glass-card p-10 bg-white/2 border border-white/5 rounded-2xl text-center">
              <HelpCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-xs text-[var(--text-secondary)]">No objectives mapped in this tier yet.</p>
            </div>
          ) : (
            goals.filter(g => g.tier === activeTier).map(goal => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={`glass-card p-5 bg-white/2 border transition-all cursor-pointer relative ${
                  selectedGoalId === goal.id ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' : 'border-white/5 hover:border-white/12'
                }`}
              >
                {/* Top Row */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="space-y-1">
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(goal.category)}`}>
                      {goal.category}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug mt-1">{goal.title}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[var(--accent-primary)] font-mono">{goal.progress}%</span>
                    <span className="text-[9px] text-[var(--text-muted)] block font-mono">Completed</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-tertiary)] rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                {/* Milestones list */}
                <div className="space-y-2 pt-3 border-t border-white/4">
                  <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Key Milestones</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {goal.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMilestone(goal.id, idx);
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between border cursor-pointer transition-colors ${
                          m.done 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 opacity-80' 
                            : 'bg-black/20 border-white/4 hover:border-white/12 text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="text-[9.5px] truncate pr-2">{m.text}</span>
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${m.done ? 'text-emerald-400' : 'text-white/20'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Goal Creator Form */}
        <form onSubmit={handleAddGoal} className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/35 border border-white/5 rounded-2xl space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">Add New Strategic Goal</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="e.g. Master system clustering and Docker load balances..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">Objective Tier</label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value as Goal['tier'])}
                className="w-full bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-secondary)] focus:outline-none"
              >
                <option value="vision">Vision</option>
                <option value="annual">Annual</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as Goal['category'])}
                className="w-full bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-secondary)] focus:outline-none"
              >
                <option value="learning">Learning</option>
                <option value="career">Career</option>
                <option value="financial">Financial</option>
                <option value="fitness">Fitness</option>
                <option value="personal">Personal Growth</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">Target Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-black/40 border border-white/8 rounded-xl py-1.5 px-3 text-xs text-[var(--text-secondary)] focus:outline-none"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Strategic Objective
          </button>
        </form>

      </div>

      {/* Right Column: AI Analytics & Predictions */}
      <div className="lg:col-span-1 space-y-6">
        
        <div className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/40 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col justify-between h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-secondary)]/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] pb-3 border-b border-white/5">
              <Brain className="w-5 h-5 animate-pulse" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Goal AI Co-Pilot Predictor</h3>
            </div>

            <div className="p-3 bg-black/35 border border-white/6 rounded-xl space-y-1">
              <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase tracking-wider block">Auditing Objective</span>
              <span className="text-xs font-bold text-white line-clamp-1">{selectedGoal.title}</span>
            </div>

            {/* Probability Gauge */}
            <div className="flex flex-col items-center py-4 border-b border-white/5">
              <div className="relative flex items-center justify-center">
                {/* SVG Radial Gauge */}
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke="url(#goalGlowGrad)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={288}
                    strokeDashoffset={288 - (288 * aiAnalysis.probability) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="goalGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-primary)" />
                      <stop offset="100%" stopColor="var(--accent-secondary)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-white font-mono">{aiAnalysis.probability}%</span>
                  <span className="text-[7.5px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Success Prob.</span>
                </div>
              </div>
            </div>

            {/* AI Insights Checklist */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[8px] font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Delay Factors / Risks
                </span>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  {aiAnalysis.delayReason}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Productivity Blocks
                </span>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  {aiAnalysis.productivityBlock}
                </p>
              </div>

              <div className="space-y-1 p-3 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 rounded-xl">
                <span className="text-[8px] font-mono text-[var(--accent-primary)] uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3 h-3" /> Recommended Next Action
                </span>
                <p className="text-[10.5px] text-[var(--text-primary)] font-semibold leading-relaxed mt-1">
                  {aiAnalysis.bestNextAction}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[9px] text-[var(--text-muted)] font-mono mt-4">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--accent-tertiary)]" />
              <span>Target: {selectedGoal.targetDate}</span>
            </div>
            <span>Time Est: {aiAnalysis.estimateTime}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
