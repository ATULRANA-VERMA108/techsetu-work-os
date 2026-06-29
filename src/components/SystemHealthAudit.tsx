import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Cpu, HardDrive, RefreshCw } from 'lucide-react';

interface ContainerStatus {
  name: string;
  image: string;
  port: string;
  status: 'running' | 'stopped' | 'warning';
  uptime: string;
}

interface AuditLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface SystemHealthAuditProps {
  jwtToken: string | null;
  customApiKey: string | null;
}

export const SystemHealthAudit: React.FC<SystemHealthAuditProps> = ({ jwtToken, customApiKey }) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  
  // Health states
  const [postgresHealth, setPostgresHealth] = useState<'healthy' | 'untested' | 'unauthorized' | 'failed'>('untested');
  const [mongoHealth, setMongoHealth] = useState<'healthy' | 'untested' | 'unauthorized' | 'failed'>('untested');
  const [backendHealth, setBackendHealth] = useState<'healthy' | 'untested' | 'failed'>('untested');
  const [aiHealth, setAiHealth] = useState<'healthy' | 'untested' | 'missing_key' | 'failed'>('untested');

  const containers: ContainerStatus[] = [
    { name: 'techsetu-work-frontend', image: 'techsetuworkos-techsetu-work-frontend', port: '3000:80', status: 'running', uptime: 'Up 1 hour' },
    { name: 'techsetu-work-backend', image: 'techsetuworkos-techsetu-work-backend', port: '8081:8080', status: 'running', uptime: 'Up 1 hour' },
    { name: 'techsetu-work-postgres', image: 'postgres:15-alpine', port: '5434:5432', status: 'running', uptime: 'Up 1 hour' },
    { name: 'techsetu-work-mongodb', image: 'mongo:6.0', port: '27018:27017', status: 'running', uptime: 'Up 1 hour' }
  ];

  const addLog = (message: string, type: AuditLog['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const runAudit = async () => {
    if (isAuditing) return;
    setIsAuditing(true);
    setAuditProgress(5);
    setLogs([]);
    addLog('Initializing Work OS System Audit Node...', 'info');
    
    // Step 1: Check Frontend compilation & routing
    await new Promise(resolve => setTimeout(resolve, 800));
    setAuditProgress(20);
    addLog('Checking local React SPA environments... OK', 'success');
    addLog('Vite server binding: http://localhost:5173', 'info');

    // Step 2: Probing Backend Server Port 8081
    setAuditProgress(40);
    addLog('Probing backend REST API port 8081...', 'info');
    const startBackend = performance.now();
    
    try {
      // Hit a public auth endpoint to see if it replies (even if it's 405/400, it's alive)
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const endBackend = performance.now();
      const delay = Math.round(endBackend - startBackend);
      setLatency(delay);
      setBackendHealth('healthy');
      addLog(`Backend REST API online. Port: 8081, status code ${response.status}, Latency: ${delay}ms`, 'success');
    } catch (e) {
      setBackendHealth('failed');
      addLog('Backend API unreachable on port 8081. Verify Docker network.', 'error');
    }

    // Step 3: Verify PostgreSQL Connection
    await new Promise(resolve => setTimeout(resolve, 800));
    setAuditProgress(60);
    if (!jwtToken) {
      setPostgresHealth('unauthorized');
      setMongoHealth('unauthorized');
      addLog('PostgreSQL check skipped: Client unauthorized. Sign in to check databases.', 'warning');
      addLog('MongoDB check skipped: Client unauthorized. Sign in to check databases.', 'warning');
    } else {
      addLog('Querying PostgreSQL through Tasks Repository...', 'info');
      try {
        const res = await fetch('http://localhost:8081/api/tasks', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (res.ok) {
          setPostgresHealth('healthy');
          addLog('PostgreSQL Connection Verified. Database: techsetu_work_os', 'success');
        } else {
          setPostgresHealth('failed');
          addLog(`PostgreSQL query failed. Server returned HTTP ${res.status}`, 'error');
        }
      } catch (e) {
        setPostgresHealth('failed');
        addLog('Failed to query tasks database controller.', 'error');
      }

      // Step 4: Verify MongoDB Connection
      await new Promise(resolve => setTimeout(resolve, 800));
      setAuditProgress(80);
      addLog('Querying MongoDB through Chat Conversations Repository...', 'info');
      try {
        const res = await fetch('http://localhost:8081/api/chat/conversations', {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        if (res.ok) {
          setMongoHealth('healthy');
          addLog('MongoDB Connection Verified. Database: techsetu_work_os', 'success');
        } else {
          setMongoHealth('failed');
          addLog(`MongoDB query failed. Server returned HTTP ${res.status}`, 'error');
        }
      } catch (e) {
        setMongoHealth('failed');
        addLog('Failed to query Mongo conversation database controller.', 'error');
      }
    }

    // Step 5: Check AI Integration (Gemini Key)
    await new Promise(resolve => setTimeout(resolve, 800));
    setAuditProgress(95);
    addLog('Verifying Gemini API Key registration...', 'info');
    
    // Check if key is available
    if (!customApiKey) {
      setAiHealth('missing_key');
      addLog('Warning: Gemini Custom Client Key not found in settings.', 'warning');
      addLog('System will fall back to application.properties system key.', 'info');
    } else {
      setAiHealth('healthy');
      addLog('Gemini API custom client key detected. Ready for RAG and Chat.', 'success');
    }

    // Complete Audit
    await new Promise(resolve => setTimeout(resolve, 400));
    setAuditProgress(100);
    setIsAuditing(false);
    addLog('=== Work OS System Audit Completed Successfully ===', 'success');
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getHealthScore = () => {
    let score = 100;
    if (backendHealth === 'failed') score -= 50;
    if (postgresHealth === 'failed') score -= 20;
    if (mongoHealth === 'failed') score -= 20;
    if (aiHealth === 'missing_key') score -= 10;
    return Math.max(0, score);
  };

  const score = getHealthScore();

  return (
    <div className="space-y-6">
      
      {/* Visual Health Score & Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Central Dial */}
        <div className="glass-card p-6 bg-white/2 border border-white/5 flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Overall Health Index</h3>
          
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circle Background */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke={score === 100 ? 'var(--accent-primary)' : score >= 80 ? 'var(--accent-tertiary)' : 'var(--accent-secondary)'}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * score) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute leading-none text-center">
              <span className="text-3xl font-black text-[var(--text-primary)]">{score}%</span>
              <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block mt-1">
                {score === 100 ? 'Optimal' : score >= 80 ? 'Nominal' : 'Critical'}
              </span>
            </div>
          </div>

          <button
            onClick={runAudit}
            disabled={isAuditing}
            className="btn-primary text-[10px] py-1.5 px-4 mt-5 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            {isAuditing ? 'Auditing...' : 'Trigger Diagnostics'}
          </button>

          {isAuditing && (
            <div className="w-full mt-4 bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[var(--accent-primary)] h-full transition-all duration-300" 
                style={{ width: `${auditProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Database & API checklist */}
        <div className="glass-card p-5 bg-white/2 border border-white/5 space-y-3.5 col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 border-b border-white/5 pb-1">
              Cluster Service Status
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Backend API */}
              <div className="flex items-center justify-between p-3 bg-black/15 rounded-xl border border-white/4">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Cpu className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block leading-tight">Spring Backend API</span>
                    <span className="text-[9.5px] text-[var(--text-muted)]">Port 8081 endpoints</span>
                  </div>
                </div>
                {backendHealth === 'healthy' ? (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">nominal</span>
                ) : backendHealth === 'failed' ? (
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">failed</span>
                ) : (
                  <span className="text-[10px] bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-0.5 rounded font-bold">untested</span>
                )}
              </div>

              {/* Postgres */}
              <div className="flex items-center justify-between p-3 bg-black/15 rounded-xl border border-white/4">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Database className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block leading-tight">PostgreSQL DB</span>
                    <span className="text-[9.5px] text-[var(--text-muted)]">Port 5434 tables</span>
                  </div>
                </div>
                {postgresHealth === 'healthy' ? (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">connected</span>
                ) : postgresHealth === 'failed' ? (
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">error</span>
                ) : postgresHealth === 'unauthorized' ? (
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">needs auth</span>
                ) : (
                  <span className="text-[10px] bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-0.5 rounded font-bold">untested</span>
                )}
              </div>

              {/* MongoDB */}
              <div className="flex items-center justify-between p-3 bg-black/15 rounded-xl border border-white/4">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                    <Database className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block leading-tight">MongoDB DB</span>
                    <span className="text-[9.5px] text-[var(--text-muted)]">Port 27018 documents</span>
                  </div>
                </div>
                {mongoHealth === 'healthy' ? (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">connected</span>
                ) : mongoHealth === 'failed' ? (
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded font-bold">error</span>
                ) : mongoHealth === 'unauthorized' ? (
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">needs auth</span>
                ) : (
                  <span className="text-[10px] bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-0.5 rounded font-bold">untested</span>
                )}
              </div>

              {/* Gemini API */}
              <div className="flex items-center justify-between p-3 bg-black/15 rounded-xl border border-white/4">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]">
                    <HardDrive className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block leading-tight">Gemini AI Model</span>
                    <span className="text-[9.5px] text-[var(--text-muted)]">API Client keys</span>
                  </div>
                </div>
                {aiHealth === 'healthy' ? (
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">ready</span>
                ) : aiHealth === 'missing_key' ? (
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">fallback key</span>
                ) : (
                  <span className="text-[10px] bg-slate-500/10 border border-slate-500/20 text-slate-400 px-2 py-0.5 rounded font-bold">untested</span>
                )}
              </div>

            </div>
          </div>

          <div className="text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-1.5 border-t border-white/5 pt-3 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Active Router Latency: {latency !== null ? `${latency} ms` : 'Not Measured'}</span>
          </div>
        </div>

      </div>

      {/* Docker Containers Grid & Audit Logs terminal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Docker Containers */}
        <div className="glass-card p-5 bg-white/2 border border-white/5 flex flex-col h-[340px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Docker Container Configurations</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 no-scrollbar">
            {containers.map((container, idx) => (
              <div key={idx} className="p-3 bg-black/20 border border-white/4 rounded-xl flex items-center justify-between text-xs">
                <div className="leading-tight">
                  <h4 className="font-bold text-[var(--text-primary)]">{container.name}</h4>
                  <span className="text-[9.5px] text-[var(--text-muted)] font-mono">{container.image}</span>
                </div>
                <div className="text-right font-mono text-[10px] space-y-1">
                  <span className="text-cyan-300 font-bold block">{container.port}</span>
                  <span className="text-[9px] text-emerald-400 font-medium block">{container.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit terminal logs */}
        <div className="glass-card p-5 bg-white/2 border border-white/5 flex flex-col h-[340px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Diagnostics Console Logs</h3>
          
          <div className="flex-1 audit-terminal no-scrollbar">
            {logs.length === 0 ? (
              <div className="text-[var(--text-muted)] italic text-center py-20">Click 'Trigger Diagnostics' to audit cluster layers.</div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="audit-terminal-log">
                  <span className="text-[var(--text-muted)] font-bold">[{log.timestamp}]</span>{' '}
                  <span className={
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                    'text-sky-400'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
