import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Cpu, Network, Hourglass, Bot, MessageSquare, FileText, Activity } from 'lucide-react';

interface SystemStatsProps {
  updateFreq?: number;
  setUpdateFreq?: (freq: number) => void;
  jwtToken: string | null;
}

interface AnalyticsData {
  conversationsCount: number;
  resumesCount: number;
  agentsCompleted: number;
  agentsRunning: number;
  agentsFailed: number;
  totalTokensUsed: number;
  tokenTrend: { day: string; tokens: number }[];
  atsDistribution: { category: string; count: number }[];
}

export const SystemStats: React.FC<SystemStatsProps> = ({
  updateFreq: propUpdateFreq,
  setUpdateFreq: propSetUpdateFreq,
  jwtToken
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [localUpdateFreq, localSetUpdateFreq] = useState<number>(2000);

  const updateFreq = propUpdateFreq !== undefined ? propUpdateFreq : localUpdateFreq;
  const setUpdateFreq = propSetUpdateFreq !== undefined ? propSetUpdateFreq : localSetUpdateFreq;
  
  // Real-time telemetry metrics (simulated random walk)
  const [metrics, setMetrics] = useState({
    cpu: 34,
    memory: 5.8,
    connections: 84,
    latency: 12
  });

  // DB Analytics data
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Maintain telemetry log arrays for SVG charting
  const [cpuLog, setCpuLog] = useState<number[]>([30, 45, 35, 42, 38, 48, 40, 52, 44, 38, 32, 35]);
  const [latencyLog, setLatencyLog] = useState<number[]>([12, 18, 14, 22, 10, 15, 12, 28, 16, 11, 9, 14]);

  // Load backend analytics database metrics
  const loadAnalytics = async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/analytics`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    }
  };

  useEffect(() => {
    if (jwtToken) {
      loadAnalytics();
    }
  }, [jwtToken]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Random walk simulation for local server hardware metrics
      setMetrics(prev => {
        const nextCpu = Math.max(10, Math.min(95, prev.cpu + Math.floor(Math.random() * 15) - 7));
        const nextMem = Math.max(3.0, Math.min(15.5, Number((prev.memory + (Math.random() * 0.4) - 0.2).toFixed(1))));
        const nextConn = Math.max(50, Math.min(300, prev.connections + Math.floor(Math.random() * 11) - 5));
        const nextLatency = Math.max(4, Math.min(80, prev.latency + Math.floor(Math.random() * 9) - 4));

        // Append to logs
        setCpuLog(log => [...log.slice(1), nextCpu]);
        setLatencyLog(log => [...log.slice(1), nextLatency]);

        return {
          cpu: nextCpu,
          memory: nextMem,
          connections: nextConn,
          latency: nextLatency
        };
      });

    }, updateFreq);

    return () => clearInterval(interval);
  }, [isPaused, updateFreq]);

  // Create SVG path string from data logs
  const buildSvgPath = (data: number[], maxVal: number) => {
    const width = 500;
    const height = 120;
    const padding = 10;
    const step = width / (data.length - 1);
    
    const points = data.map((val, idx) => {
      const x = idx * step;
      const ratio = val / maxVal;
      const y = height - padding - (ratio * (height - 2 * padding));
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const buildSvgAreaPath = (data: number[], maxVal: number) => {
    const width = 500;
    const height = 120;
    const padding = 10;
    const linePath = buildSvgPath(data, maxVal);
    return `${linePath} L ${width},${height - padding} L 0,${height - padding} Z`;
  };

  // Build SVG path for token usage trend from database
  const buildTokenTrendPath = (trend: { tokens: number }[]) => {
    if (trend.length === 0) return '';
    const width = 500;
    const height = 120;
    const padding = 10;
    const maxVal = Math.max(...trend.map(t => t.tokens), 1000);
    const step = width / (trend.length - 1);

    const points = trend.map((t, idx) => {
      const x = idx * step;
      const ratio = t.tokens / maxVal;
      const y = height - padding - (ratio * (height - 2 * padding));
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const buildTokenTrendArea = (trend: { tokens: number }[]) => {
    const path = buildTokenTrendPath(trend);
    if (!path) return '';
    const width = 500;
    const height = 120;
    const padding = 10;
    return `${path} L ${width},${height - padding} L 0,${height - padding} Z`;
  };

  const cpuPath = buildSvgPath(cpuLog, 100);
  const cpuArea = buildSvgAreaPath(cpuLog, 100);
  const latencyPath = buildSvgPath(latencyLog, 100);
  const latencyArea = buildSvgAreaPath(latencyLog, 100);

  // If no auth token, request login
  if (!jwtToken) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center glass-card bg-white/2 border border-white/5 rounded-2xl h-[450px]">
        <Activity className="w-16 h-16 text-[var(--accent-primary)] animate-pulse mb-4" />
        <h3 className="text-base font-bold text-[var(--text-primary)]">Telemetry Node Locked</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-sm leading-relaxed">
          Authentication is required to query active database metrics and fetch AI token trends. Please sign in via the workspace controls.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 h-full">
      
      {/* Header telemetry settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-tertiary)] pulse-dot" style={{ animationDelay: '-1s' }}></span>
            Real-Time Node Telemetry
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Monitoring core container databases and Gemini API usage metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalytics}
            className="btn-secondary text-[10px] py-1.5 px-3 rounded-lg flex items-center gap-1.5"
          >
            Refresh Data
          </button>
          
          <div className="flex items-center gap-1.5 bg-black/25 border border-white/5 rounded-lg px-2.5 py-1">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Interval:</span>
            <select
              className="bg-transparent border-none p-0 text-[10px] font-bold text-[var(--accent-primary)] focus:ring-0"
              value={updateFreq}
              onChange={(e) => setUpdateFreq(Number(e.target.value))}
            >
              <option value={1000}>1.0s (Fast)</option>
              <option value={2000}>2.0s (Normal)</option>
              <option value={5000}>5.0s (Eco)</option>
            </select>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="btn-secondary text-[10px] py-1.5 px-3 flex items-center gap-1.5 rounded-lg"
          >
            {isPaused ? (
              <>Resume Telemetry</>
            ) : (
              <>Pause Streams</>
            )}
          </button>
        </div>
      </div>

      {/* Grid of four core DATABASE metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Chats */}
        <div className="glass-card p-4 bg-white/2 border border-white/5 flex items-center space-x-4">
          <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div className="leading-tight">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Total Chat Logs</span>
            <h3 className="text-lg font-extrabold mt-0.5">{analytics?.conversationsCount || 0}</h3>
            <span className="text-[9px] text-[var(--text-secondary)]">Active Mongo sessions</span>
          </div>
        </div>

        {/* Index Documents */}
        <div className="glass-card p-4 bg-white/2 border border-white/5 flex items-center space-x-4">
          <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <FileText className="w-5 h-5" />
          </span>
          <div className="leading-tight">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Indexed Files</span>
            <h3 className="text-lg font-extrabold mt-0.5">{analytics?.resumesCount || 0}</h3>
            <span className="text-[9px] text-[var(--text-secondary)]">Parsed vector segments</span>
          </div>
        </div>

        {/* Active AI Agent Task instances */}
        <div className="glass-card p-4 bg-white/2 border border-white/5 flex items-center space-x-4">
          <span className="p-2.5 rounded-xl bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)]">
            <Bot className="w-5 h-5" />
          </span>
          <div className="leading-tight">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">AI Task Agents</span>
            <h3 className="text-lg font-extrabold mt-0.5">{analytics?.agentsCompleted || 0}</h3>
            <span className="text-[9px] text-[var(--text-secondary)]">
              {analytics?.agentsRunning || 0} active in background
            </span>
          </div>
        </div>

        {/* Total Tokens load */}
        <div className="glass-card p-4 bg-white/2 border border-white/5 flex items-center space-x-4">
          <span className="p-2.5 rounded-xl bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]">
            <Network className="w-5 h-5" />
          </span>
          <div className="leading-tight">
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Gemini Tokens load</span>
            <h3 className="text-lg font-extrabold mt-0.5">{analytics?.totalTokensUsed ? `${analytics.totalTokensUsed.toLocaleString()}` : '0'}</h3>
            <span className="text-[9px] text-[var(--text-secondary)]">Cumulative API tokens</span>
          </div>
        </div>

      </div>

      {/* Database token trends SVG Graph */}
      {analytics?.tokenTrend && (
        <div className="glass-card p-5 bg-white/2 border border-white/5 flex flex-col h-[230px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Network className="w-4 h-4 text-[var(--accent-primary)]" />
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Gemini API Token Consumptions Trend (Week View)</h4>
            </div>
            <span className="text-[9px] font-mono text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full font-bold">
              Database log trends
            </span>
          </div>

          <div className="flex-1 bg-black/35 rounded-xl border border-white/4 p-2 relative overflow-hidden flex items-end">
            <svg className="w-full h-full animate-fade-in" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              <path d={buildTokenTrendArea(analytics.tokenTrend)} fill="url(#tokenTrendGrad)" />
              <path d={buildTokenTrendPath(analytics.tokenTrend)} fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
              
              <defs>
                <linearGradient id="tokenTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Grid labels */}
            <div className="absolute inset-x-0 bottom-1 px-4 flex justify-between text-[8px] font-mono text-[var(--text-muted)]">
              {analytics.tokenTrend.map((t, idx) => (
                <span key={idx}>{t.day} ({Math.round(t.tokens / 100) / 10}k)</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SVG Hardware Charts Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CPU Chart */}
        <div className="glass-card p-4 bg-white/2 border border-white/5 flex flex-col h-[220px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Core Container CPU Load History (%)</h4>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] pulse-dot"></span>
              <span>{metrics.cpu}% active</span>
            </div>
          </div>

          <div className="flex-1 bg-black/35 rounded-xl border border-white/4 p-2 relative overflow-hidden flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              <path d={cpuArea} fill="url(#cpuGrad)" className="transition-all duration-300" />
              <path d={cpuPath} fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" className="transition-all duration-300" />
              
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Latency Chart */}
        <div className="glass-card p-4 bg-white/2 border border-white/5 flex flex-col h-[220px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Hourglass className="w-4 h-4 text-[var(--accent-secondary)]" />
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Response Latency Threshold (ms)</h4>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)] pulse-dot"></span>
              <span>{metrics.latency} ms lag</span>
            </div>
          </div>

          <div className="flex-1 bg-black/35 rounded-xl border border-white/4 p-2 relative overflow-hidden flex items-end">
            <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
              <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              <path d={latencyArea} fill="url(#latencyGrad)" className="transition-all duration-300" />
              <path d={latencyPath} fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" className="transition-all duration-300" />
              
              <defs>
                <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
};
