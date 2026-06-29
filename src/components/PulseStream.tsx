import React, { useState, useEffect } from 'react';
import { ShieldCheck, GitCommit, MessageSquare, Terminal, RefreshCw, Send, CheckCircle } from 'lucide-react';

interface Teammate {
  id: string;
  name: string;
  role: string;
  status: 'coding' | 'reviewing' | 'idle' | 'offline';
  statusText: string;
  avatarInitials: string;
  activeTask: string;
}

interface FeedItem {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'commit' | 'comment' | 'deploy' | 'system';
  target: string;
}

export const PulseStream: React.FC = () => {
  const [teammates] = useState<Teammate[]>([
    {
      id: 'atul',
      name: 'Atul Verma (You)',
      role: 'Frontend Lead',
      status: 'coding',
      statusText: 'Designing Work OS UX',
      avatarInitials: 'AV',
      activeTask: 'Obsidian Aurora CSS System'
    },
    {
      id: 'sarah',
      name: 'Sarah Chen',
      role: 'Staff AI Engineer',
      status: 'reviewing',
      statusText: 'Reviewing AI Hub responses',
      avatarInitials: 'SC',
      activeTask: 'Specialist agent response models'
    },
    {
      id: 'carlos',
      name: 'Carlos Menendez',
      role: 'DevOps Architect',
      status: 'idle',
      statusText: 'Monitoring telemetry logs',
      avatarInitials: 'CM',
      activeTask: 'Deploy telemetry pipelines'
    },
    {
      id: 'emily',
      name: 'Emily Taylor',
      role: 'QA Specialist',
      status: 'offline',
      statusText: 'Away from workstation',
      avatarInitials: 'ET',
      activeTask: 'SSO validation checklists'
    }
  ]);

  const [feed, setFeed] = useState<FeedItem[]>([
    {
      id: '1',
      user: 'Carlos Menendez',
      action: 'completed deployment swap',
      target: 'Green production cluster swap',
      time: '13:42',
      type: 'deploy'
    },
    {
      id: '2',
      user: 'Sarah Chen',
      action: 'committed code changes to',
      target: 'main:agents-hub-integration',
      time: '13:38',
      type: 'commit'
    },
    {
      id: '3',
      user: 'Atul Verma',
      action: 'created document specifications for',
      target: 'TechSetu Specs v1.0',
      time: '13:30',
      type: 'comment'
    },
    {
      id: '4',
      user: 'Emily Taylor',
      action: 'shifted task to QA Review:',
      target: 'Implement OAuth callback hooks',
      time: '13:12',
      type: 'system'
    }
  ]);

  const [pingTarget, setPingTarget] = useState<Teammate | null>(null);
  const [pingMessage, setPingMessage] = useState('');
  const [sentAlert, setSentAlert] = useState(false);

  // Periodically insert random mock logs to simulate live feed activity
  useEffect(() => {
    const mockUsers = ['Sarah Chen', 'Carlos Menendez', 'Automated CI Daemon', 'Emily Taylor'];
    const mockActions = [
      { action: 'committed patch files to', target: 'patch-v1.2.1-telemetry', type: 'commit' },
      { action: 'triggered smoketest run on', target: 'staging-sandbox-node-3', type: 'system' },
      { action: 'created comments on task', target: 'Fix memory leaks in connection socket', type: 'comment' },
      { action: 'compiled container artifact', target: 'docker-registry:work-os-v1.2', type: 'deploy' }
    ];

    const interval = setInterval(() => {
      const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      const randomDetail = mockActions[Math.floor(Math.random() * mockActions.length)];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newItem: FeedItem = {
        id: Math.random().toString(),
        user: randomUser,
        action: randomDetail.action,
        target: randomDetail.target,
        time: timeStr,
        type: randomDetail.type as any
      };

      setFeed(prev => [newItem, ...prev.slice(0, 7)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handlePing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pingTarget || !pingMessage.trim()) return;

    // Simulate sending message
    setSentAlert(true);
    setTimeout(() => {
      setSentAlert(false);
      setPingTarget(null);
      setPingMessage('');
    }, 1500);
  };

  const getStatusColor = (status: Teammate['status']) => {
    switch (status) {
      case 'coding':
        return 'bg-[var(--accent-primary)]';
      case 'reviewing':
        return 'bg-[var(--accent-tertiary)]';
      case 'idle':
        return 'bg-amber-400';
      case 'offline':
        return 'bg-slate-500';
    }
  };

  const getFeedIcon = (type: FeedItem['type']) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="w-3.5 h-3.5 text-[var(--accent-tertiary)]" />;
      case 'comment':
        return <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />;
      case 'deploy':
        return <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-primary)]" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[560px]">
      
      {/* Active Teammates Grid */}
      <div className="md:col-span-2 flex flex-col space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1 px-1">
          Active Workspace Nodes
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
          {teammates.map(member => (
            <div
              key={member.id}
              onClick={() => setPingTarget(member)}
              className="glass-card p-4 bg-white/2 border border-white/5 hover:border-[var(--border-hover)] cursor-pointer flex flex-col justify-between transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-[var(--accent-primary)]">
                    {member.avatarInitials}
                  </div>
                  
                  <div className="leading-tight">
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{member.name}</h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">{member.role}</span>
                  </div>
                </div>

                {/* Status Dot */}
                <div className="flex items-center space-x-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(member.status)} ${member.status !== 'offline' ? 'pulse-dot' : ''}`} />
                  <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">{member.status}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Currently Working On:</span>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed truncate">{member.activeTask}</p>
                <p className="text-[10px] text-[var(--text-muted)] italic">"{member.statusText}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Collaboration Feed */}
      <div className="md:col-span-1 glass-card bg-white/2 border border-white/5 flex flex-col h-full">
        <div className="px-4 py-3 border-b border-white/5 bg-black/15 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[var(--accent-primary)] animate-spin" style={{ animationDuration: '4s' }} />
            Collaboration Stream
          </h3>
          <span className="text-[9px] uppercase font-bold tracking-wider bg-white/5 px-2 py-0.5 rounded-full text-[var(--text-muted)]">Live</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
          {feed.map(item => (
            <div key={item.id} className="flex gap-2.5 items-start text-xs border-b border-white/3 pb-3">
              <span className="p-1 rounded bg-white/4 border border-white/8 shrink-0 mt-0.5">
                {getFeedIcon(item.type)}
              </span>
              <div className="leading-normal flex-1">
                <p className="text-[11px] text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)] font-bold">{item.user}</strong> {item.action}{' '}
                  <span className="text-cyan-300 font-mono text-[10.5px] bg-black/25 px-1 py-0.5 rounded border border-white/5">{item.target}</span>
                </p>
                <span className="text-[9px] text-[var(--text-muted)] mt-1 block">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Ping / Msg Dialog */}
      {pingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setPingTarget(null)} />
          
          <div className="relative w-full max-w-sm glass-card bg-[var(--bg-secondary)] border border-[var(--border-color)] p-5 rounded-2xl">
            <h3 className="text-xs font-bold mb-3 uppercase tracking-wider text-[var(--text-muted)]">
              Direct Channels: {pingTarget.name}
            </h3>
            
            {sentAlert ? (
              <div className="py-8 text-center text-emerald-400 flex flex-col items-center justify-center space-y-2">
                <CheckCircle className="w-10 h-10 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider">Ping Dispatched to Agent Client</span>
              </div>
            ) : (
              <form onSubmit={handlePing} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Direct Message / Task Ping</label>
                  <textarea
                    rows={3}
                    required
                    placeholder={`e.g. Sarah, can you review the auth API parameters?`}
                    className="text-xs"
                    value={pingMessage}
                    onChange={(e) => setPingMessage(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPingTarget(null)}
                    className="btn-secondary text-[10px] py-1 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-[10px] py-1.5 px-4 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Dispatch Ping
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
