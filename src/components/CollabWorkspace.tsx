import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Plus, 
  ShieldAlert, 
  GitPullRequest, 
  Terminal, 
  AlertCircle,
  Award,
  Layers,
  Settings
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  initials: string;
  content: string;
  timestamp: string;
}

interface CollabWorkspaceProps {
  onRewardXP: (xp: number) => void;
}

export const CollabWorkspace: React.FC<CollabWorkspaceProps> = ({ onRewardXP }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'Carlos Menendez',
      role: 'Lead Backend Developer',
      initials: 'CM',
      content: 'I noticed active socket connection pool leaks inside Node cluster environments. Deploying telemetry audit blocks.',
      timestamp: '10:45 AM'
    },
    {
      id: 'm2',
      sender: 'Sarah Chen',
      role: 'Product Designer',
      initials: 'SC',
      content: 'Reviewing the glow cycles on index.css. Tuning CSS keyframes and radial gradient blurs to optimize rendering frames.',
      timestamp: '11:12 AM'
    },
    {
      id: 'm3',
      sender: 'Emily Taylor',
      role: 'QA Engineer',
      initials: 'ET',
      content: 'Wrote layout transition rules for mobile docking scales. Verified build on local repository branches.',
      timestamp: '11:30 AM'
    }
  ]);

  const [chatInput, setChatInput] = useState('');
  const [activeSprint, setActiveSprint] = useState({
    name: 'Sprint 24: RAG Engine Gateway',
    velocity: 42,
    closedBugs: 14,
    openBugs: 3
  });

  const [workspacePermission, setWorkspacePermission] = useState<'Admin' | 'Writer' | 'Reader'>('Writer');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'Atul Verma (You)',
      role: 'Workspace Lead Developer',
      initials: 'AV',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    onRewardXP(15); // Reward XP for communicating in channel
    const text = chatInput.toLowerCase();
    setChatInput('');

    // Simulated Bot automatic reply logic
    setTimeout(() => {
      let replySender = 'Carlos Menendez';
      let replyInitials = 'CM';
      let replyRole = 'Lead Backend Developer';
      let replyContent = 'Acknowledged. Checking the telemetry dashboards logs right now to sync container gates.';

      if (text.includes('@sarah') || text.includes('design') || text.includes('css')) {
        replySender = 'Sarah Chen';
        replyInitials = 'SC';
        replyRole = 'Product Designer';
        replyContent = 'I agree, the gradient keyframes are looking beautiful on the UI but need testing across standard display grids.';
      } else if (text.includes('@emily') || text.includes('test') || text.includes('bug')) {
        replySender = 'Emily Taylor';
        replyInitials = 'ET';
        replyRole = 'QA Engineer';
        replyContent = 'On it, I will spin up the Docker simulation cluster to verify if we hit any latency bottlenecks.';
      } else if (text.includes('@carlos') || text.includes('backend') || text.includes('api')) {
        replySender = 'Carlos Menendez';
        replyInitials = 'CM';
        replyRole = 'Lead Backend Developer';
        replyContent = 'Understood. Reviewing the Spring Boot REST endpoints. Will secure authentication pathways.';
      }

      const botMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: replySender,
        role: replyRole,
        initials: replyInitials,
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Team Chat Room (span 2) */}
      <div className="lg:col-span-2 glass-card bg-white/2 border border-white/5 rounded-2xl flex flex-col h-[550px] justify-between">
        
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-white/5 bg-black/15 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <MessageSquare className="w-5 h-5 text-[var(--accent-primary)] animate-pulse" />
            <div>
              <h3 className="text-xs font-black uppercase text-white leading-none">Central Channel: Dev Sprint sync</h3>
              <span className="text-[9px] text-[var(--text-muted)] font-mono">4 Members Online</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="text-[8px] font-mono text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded border border-[var(--accent-primary)]/20 uppercase font-bold">
              Team Chat Active
            </span>
          </div>
        </div>

        {/* Chat messages viewport */}
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender.includes('You');
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse text-right' : 'text-left'
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${
                  isUser 
                    ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/35 text-[var(--accent-primary)]' 
                    : 'bg-white/5 border-white/10 text-[var(--accent-tertiary)]'
                }`}>
                  {msg.initials}
                </div>

                {/* Bubble details */}
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 text-[9.5px] font-mono ${
                    isUser ? 'justify-end' : ''
                  }`}>
                    <span className="font-bold text-white">{msg.sender}</span>
                    <span className="text-[var(--text-muted)]">({msg.role})</span>
                    <span className="text-[8px] text-[var(--text-muted)]">{msg.timestamp}</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                    isUser 
                      ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/15 text-white' 
                      : 'bg-black/30 border-white/4 text-[var(--text-secondary)]'
                  }`}>
                    {/* Render color overrides for mentions */}
                    {msg.content.includes('@Carlos') || msg.content.includes('@Sarah') || msg.content.includes('@Emily') ? (
                      <span>
                        {msg.content.split(' ').map((word, wIdx) => {
                          if (word.startsWith('@')) {
                            return <span key={wIdx} className="text-[var(--accent-primary)] font-bold">{word} </span>;
                          }
                          return word + ' ';
                        })}
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input form */}
        <form onSubmit={handleSendChat} className="p-4 border-t border-white/5 bg-black/10 flex gap-2.5">
          <input
            type="text"
            placeholder="Write message... Use @Carlos, @Sarah, or @Emily to request immediate bot checkin"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-black/40 border border-white/8 rounded-xl py-2.5 px-4 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
          <button type="submit" className="p-2.5 bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/35 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 rounded-xl transition-all cursor-pointer">
            <Send className="w-4 h-4 fill-[var(--accent-primary)]/20" />
          </button>
        </form>

      </div>

      {/* Right Column: Sprint Metrics & Bug Backlog */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Sprint Dashboard */}
        <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-3 border-b border-white/5">
            <Layers className="w-4.5 h-4.5 text-[var(--accent-tertiary)]" />
            Active Agile Sprint metrics
          </h4>

          <div className="space-y-3 font-mono text-[10.5px]">
            <div className="leading-tight mb-2.5">
              <span className="text-[9px] text-[var(--text-muted)] block uppercase font-bold">Current Milestone</span>
              <span className="text-xs font-bold text-white">{activeSprint.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Velocity Score</span>
              <span className="text-[var(--accent-primary)] font-bold">{activeSprint.velocity} pts/week</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Closed bugs</span>
              <span className="text-emerald-400 font-bold">{activeSprint.closedBugs} fixed</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Active backlog bugs</span>
              <span className="text-red-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 fill-red-500/10" />
                {activeSprint.openBugs} critical
              </span>
            </div>
          </div>
        </div>

        {/* Roles and Workspace Permission */}
        <div className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/45 border border-white/5 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-sky-400" />
              Collab Permissions Matrix
            </h4>
            <span className="text-[8px] font-mono text-slate-400 uppercase">RAG Roles</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-secondary)]">Your simulated role</span>
              <select
                value={workspacePermission}
                onChange={(e) => {
                  setWorkspacePermission(e.target.value as any);
                  onRewardXP(10);
                }}
                className="bg-black/50 border border-white/8 text-[10px] font-mono rounded-lg px-2.5 py-1 focus:outline-none focus:border-[var(--accent-primary)] text-[var(--accent-primary)]"
              >
                <option value="Admin">Administrator</option>
                <option value="Writer">Collaborating Writer</option>
                <option value="Reader">Auditing Reader</option>
              </select>
            </div>

            <p className="text-[9.5px] text-[var(--text-muted)] leading-relaxed font-mono">
              Role permissions configure access levels for vector databases RAG queries and git merge validations.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
