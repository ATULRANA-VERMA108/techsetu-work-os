import React, { useState, useEffect } from 'react';
import { BarChart3, RefreshCw, FileSpreadsheet, Play, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface PowerBIDashboardProps {
  tasks: any[];
  smartsheetRows?: any[];
  quickbaseTables?: Record<string, any[]>;
}

export const PowerBIDashboard: React.FC<PowerBIDashboardProps> = ({
  tasks,
  smartsheetRows = [],
  quickbaseTables = {}
}) => {
  // Input fields for reports simulation
  const [targetVelocity, setTargetVelocity] = useState(80);
  const [budgetCap, setBudgetCap] = useState(50000);
  const [marketingBudget, setMarketingBudget] = useState(15000);
  const [marketingCTR, setMarketingCTR] = useState(3.8); // CTR in %
  const [headcount, setHeadcount] = useState(12);

  // Derived metrics from Kanban board
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.column === 'done').length;
  const reviewTasks = tasks.filter(t => t.column === 'review').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 60;

  // Derived metrics from Smartsheet
  const smartsheetTotalCost = smartsheetRows.reduce((acc, row) => acc + (Number(row.cost) || 0), 0);
  const smartsheetDoneCount = smartsheetRows.filter(row => row.status === 'Completed').length;

  // Derived metrics from Quickbase
  const tableNames = Object.keys(quickbaseTables);
  const totalRecords = tableNames.reduce((acc, name) => acc + (quickbaseTables[name]?.length || 0), 0);

  // Auto-calculated variables
  const costBurnRate = smartsheetTotalCost > 0 ? Math.round((smartsheetTotalCost / budgetCap) * 100) : 45;
  const roiMultiplier = marketingCTR > 0 ? (marketingCTR * 1.8).toFixed(1) : '2.1';

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-400 animate-pulse" />
            PowerBI Workspace Report Canvas
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time visual report builder connected to SaaS pipelines and Kanban nodes.
          </p>
        </div>
        <button 
          onClick={() => {}} 
          className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Datasets</span>
        </button>
      </div>

      {/* Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="powerbi-metric-card">
          <span className="text-[10px] uppercase font-bold text-sky-400">Total SaaS Budget</span>
          <span className="text-2xl font-black text-white">${budgetCap.toLocaleString()}</span>
          <span className="text-[9px] text-[var(--text-muted)]">Set cap capacity</span>
        </div>

        <div className="powerbi-metric-card">
          <span className="text-[10px] uppercase font-bold text-[var(--accent-primary)]">RAG Cost Burn</span>
          <span className="text-2xl font-black text-white">${smartsheetTotalCost.toLocaleString()}</span>
          <span className="text-[9px] text-emerald-400">{costBurnRate}% consumed</span>
        </div>

        <div className="powerbi-metric-card">
          <span className="text-[10px] uppercase font-bold text-[var(--accent-tertiary)]">Task Velocity</span>
          <span className="text-2xl font-black text-white">{targetVelocity} pts/wk</span>
          <span className="text-[9px] text-[var(--text-muted)]">Target production velocity</span>
        </div>

        <div className="powerbi-metric-card">
          <span className="text-[10px] uppercase font-bold text-[var(--accent-secondary)]">Marketing ROI</span>
          <span className="text-2xl font-black text-white">{roiMultiplier}x</span>
          <span className="text-[9px] text-emerald-400">Based on {marketingCTR}% CTR</span>
        </div>
      </div>

      {/* Main reporting workspace */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Input console to dynamically tune charts */}
        <div className="md:col-span-1 glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] pb-2 border-b border-white/5">
            Dynamic Reporting Inputs
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                <span>Target Velocity</span>
                <span className="text-sky-400">{targetVelocity} pts</span>
              </div>
              <input
                type="range"
                min="20"
                max="150"
                value={targetVelocity}
                onChange={(e) => setTargetVelocity(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                <span>Workspace Budget</span>
                <span className="text-[var(--accent-primary)]">${budgetCap.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="5000"
                value={budgetCap}
                onChange={(e) => setBudgetCap(Number(e.target.value))}
                className="w-full accent-[var(--accent-primary)] cursor-pointer"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-[var(--text-secondary)]">
                <span>Marketing CTR</span>
                <span className="text-[var(--accent-secondary)]">{marketingCTR}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.1"
                value={marketingCTR}
                onChange={(e) => setMarketingCTR(Number(e.target.value))}
                className="w-full accent-[var(--accent-secondary)] cursor-pointer"
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Active Headcount</label>
              <input
                type="number"
                min="1"
                max="100"
                value={headcount}
                onChange={(e) => setHeadcount(Math.max(1, Number(e.target.value)))}
                className="text-xs w-full bg-black/20 border border-white/8 rounded-lg p-2 text-white"
              />
            </div>
          </div>

          <div className="p-3.5 bg-black/25 border border-white/4 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
              <FileSpreadsheet className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>CONNECTED SAAS DATASOURCES</span>
            </div>
            <div className="text-[10px] space-y-1.5 font-mono text-[var(--text-muted)]">
              <div className="flex justify-between">
                <span>Smartsheet cost records:</span>
                <span className="text-white">{smartsheetRows.length} rows</span>
              </div>
              <div className="flex justify-between">
                <span>Quickbase databases:</span>
                <span className="text-white">{tableNames.length} tables ({totalRecords} records)</span>
              </div>
              <div className="flex justify-between">
                <span>ClickUp task board:</span>
                <span className="text-white">{totalTasks} cards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: SVG Visualization charts */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Main Visual grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Chart 1: Project Progress Gauge */}
            <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col items-center text-center">
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-4">Milestone Completion Gauge</h4>
              
              {/* SVG Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset="62.8" /* represents a 3/4 circle */
                    strokeLinecap="round"
                  />
                  {/* Active gauge progress */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (188.4 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                  <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-primary)" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text overlay */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{progressPercent}%</span>
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Tasks Completed</span>
                </div>
              </div>

              <div className="flex justify-between w-full mt-4 text-[10px] text-[var(--text-secondary)] font-mono px-4">
                <span>Done: {doneTasks}</span>
                <span>Review: {reviewTasks}</span>
                <span>Total: {totalTasks}</span>
              </div>
            </div>

            {/* Chart 2: Task Allocation Columns */}
            <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl">
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-4">Task Allocations by Lane</h4>
              
              <div className="flex items-end justify-around h-32 pt-2 border-b border-white/5 px-2">
                {['backlog', 'in-progress', 'review', 'done'].map((col) => {
                  const count = tasks.filter(t => t.column === col).length;
                  const maxCount = Math.max(1, ...['backlog', 'in-progress', 'review', 'done'].map(c => tasks.filter(t => t.column === c).length));
                  const heightPct = Math.max(12, Math.round((count / maxCount) * 100));
                  
                  // Color coding
                  let barColor = 'bg-slate-500';
                  if (col === 'in-progress') barColor = 'bg-sky-400';
                  if (col === 'review') barColor = 'bg-amber-400';
                  if (col === 'done') barColor = 'bg-[var(--accent-primary)]';

                  return (
                    <div key={col} className="flex flex-col items-center gap-2 w-10">
                      <span className="text-[9px] font-bold text-white">{count}</span>
                      <div 
                        className={`w-4 ${barColor} rounded-t-sm transition-all duration-500`}
                        style={{ height: `${heightPct}px` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-around mt-2 text-[8.5px] uppercase font-bold text-[var(--text-muted)] font-mono">
                <span>Idea</span>
                <span>Prog</span>
                <span>Revw</span>
                <span>Done</span>
              </div>
            </div>

          </div>

          {/* Line Trend chart: Project Cumulative Velocity */}
          <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Weekly Velocity Trend (6 Weeks)</h4>
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-secondary)]">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Burn Up active</span>
              </div>
            </div>

            {/* SVG line graph */}
            <div className="w-full h-36">
              <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                {/* Grid guidelines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="60" x2="600" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="130" x2="600" y2="130" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />

                {/* Trend line */}
                <path
                  d={`M 50 110 L 150 90 L 250 85 L 350 60 L 450 45 L 550 ${130 - (targetVelocity * 0.9)}`}
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Area under curve gradient fill */}
                <path
                  d={`M 50 130 L 50 110 L 150 90 L 250 85 L 350 60 L 450 45 L 550 ${130 - (targetVelocity * 0.9)} L 550 130 Z`}
                  fill="url(#trendAreaGradient)"
                  className="transition-all duration-500"
                />

                <defs>
                  <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="flex justify-between mt-2 text-[9px] text-[var(--text-muted)] font-mono">
              <span>Wk 21</span>
              <span>Wk 22</span>
              <span>Wk 23</span>
              <span>Wk 24</span>
              <span>Wk 25</span>
              <span>Wk 26 (Current)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
