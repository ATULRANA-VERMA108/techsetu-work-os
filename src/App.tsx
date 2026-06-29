import { useState, useEffect } from 'react';
import { 
  Palette, 
  Layers, 
  Kanban, 
  Bot, 
  FileText, 
  Activity, 
  Cpu, 
  Clock, 
  CheckSquare, 
  MessageSquare,
  Sparkles,
  GitBranch,
  Search,
  Settings,
  Calendar,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CommandLauncher } from './components/CommandLauncher';
import { KanbanBoard } from './components/KanbanBoard';
import type { Task } from './components/KanbanBoard';
import { AIHub } from './components/AIHub';
import { DocWorkspace } from './components/DocWorkspace';
import { PulseStream } from './components/PulseStream';
import { SystemStats } from './components/SystemStats';
import { SettingsPanel } from './components/SettingsPanel';
import { CalendarPlanner } from './components/CalendarPlanner';
import { AuthModal } from './components/AuthModal';
import { SystemHealthAudit } from './components/SystemHealthAudit';


const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Audit telemetry connection leaks',
    description: 'Check active socket connection pools inside Node cluster environments for leak streams.',
    column: 'in-progress',
    priority: 'high',
    assignedTo: 'Carlos Menendez',
    dueDate: '2026-07-02'
  },
  {
    id: 'task-2',
    title: 'Optimize index.css stylesheet glow cycles',
    description: 'Tune CSS keyframes and radial gradient blur values for higher rendering performance.',
    column: 'review',
    priority: 'medium',
    assignedTo: 'Atul Verma',
    dueDate: '2026-06-30'
  },
  {
    id: 'task-3',
    title: 'Draft PRD specs for Command Center launch',
    description: 'Create markdown specifications outlining spotlight launcher hooks and event handlers.',
    column: 'done',
    priority: 'low',
    assignedTo: 'Sarah Chen',
    dueDate: '2026-06-25'
  },
  {
    id: 'task-4',
    title: 'Write custom layout transitions guidelines',
    description: 'Document standard animation speeds, transition bounds, and mobile dock scaling factors.',
    column: 'backlog',
    priority: 'medium',
    assignedTo: 'Emily Taylor',
    dueDate: '2026-07-08'
  }
];

function App() {
  const [view, setView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<string>(localStorage.getItem('techsetu-theme') || 'obsidian-aurora');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Settings Panel States
  const [userName, setUserName] = useState<string>(localStorage.getItem('techsetu-username') || 'Atul Verma');
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('techsetu-userrole') || 'Frontend Lead');
  const [showGlow, setShowGlow] = useState<boolean>(localStorage.getItem('techsetu-showglow') !== 'false');
  const [showGrid, setShowGrid] = useState<boolean>(localStorage.getItem('techsetu-showgrid') !== 'false');
  const [updateFreq, setUpdateFreq] = useState<number>(Number(localStorage.getItem('techsetu-updatefreq')) || 2000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication states
  const [jwtToken, setJwtToken] = useState<string | null>(localStorage.getItem('techsetu-jwt') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string | null>(localStorage.getItem('techsetu-custom-gemini-key') || null);

  const handleAuthSuccess = (token: string, name: string, email: string) => {
    localStorage.setItem('techsetu-jwt', token);
    localStorage.setItem('techsetu-username', name);
    localStorage.setItem('techsetu-email', email);
    setJwtToken(token);
    setUserName(name);
    showToast('Authenticated successfully.');
  };

  const handleSignOut = () => {
    localStorage.removeItem('techsetu-jwt');
    localStorage.removeItem('techsetu-username');
    localStorage.removeItem('techsetu-email');
    setJwtToken(null);
    setUserName('Atul Verma');
    setTasks(DEFAULT_TASKS);
    showToast('Signed out of workspace.');
  };

  // Toggle grid/glow body classes
  useEffect(() => {
    document.body.classList.toggle('hide-glow', !showGlow);
  }, [showGlow]);

  useEffect(() => {
    document.body.classList.toggle('hide-grid', !showGrid);
  }, [showGrid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initialize flow board tasks list
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('techsetu-tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved tasks", e);
      }
    }
    return DEFAULT_TASKS;
  });

  const fetchTasks = async () => {
    if (!jwtToken) return;
    try {
      const response = await fetch('http://localhost:8081/api/tasks', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        const tasksWithStrIds = data.map((t: any) => ({ ...t, id: String(t.id) }));
        setTasks(tasksWithStrIds);
      }
    } catch (e) {
      console.error("Failed to fetch tasks from backend", e);
    }
  };

  useEffect(() => {
    if (jwtToken) {
      fetchTasks();
    }
  }, [jwtToken]);

  const syncTasksWithApi = async (nextTasks: Task[], prevTasks: Task[]) => {
    if (!jwtToken) {
      localStorage.setItem('techsetu-tasks', JSON.stringify(nextTasks));
      return;
    }

    try {
      if (nextTasks.length > prevTasks.length) {
        const added = nextTasks.find(nt => !prevTasks.some(t => t.id === nt.id));
        if (added) {
          const { id, ...payload } = added;
          const response = await fetch('http://localhost:8081/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            fetchTasks();
          }
        }
      } 
      else if (nextTasks.length < prevTasks.length) {
        const deleted = prevTasks.find(t => !nextTasks.some(nt => nt.id === t.id));
        if (deleted) {
          await fetch(`http://localhost:8081/api/tasks/${deleted.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${jwtToken}` }
          });
        }
      } 
      else {
        for (let i = 0; i < nextTasks.length; i++) {
          const nt = nextTasks[i];
          const ot = prevTasks.find(t => t.id === nt.id);
          if (ot && (ot.column !== nt.column || ot.priority !== nt.priority || ot.title !== nt.title || ot.description !== nt.description || ot.assignedTo !== nt.assignedTo || ot.dueDate !== nt.dueDate)) {
            await fetch(`http://localhost:8081/api/tasks/${nt.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
              },
              body: JSON.stringify(nt)
            });
            break;
          }
        }
      }
    } catch (e) {
      console.error("Failed to sync tasks with backend", e);
    }
  };

  const handleSetTasks = (value: React.SetStateAction<Task[]>) => {
    setTasks(prev => {
      const next = typeof value === 'function' ? (value as any)(prev) : value;
      syncTasksWithApi(next, prev);
      return next;
    });
  };

  // Set initial theme dataset attribute on document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('techsetu-theme', theme);
  }, [theme]);

  // Command launcher shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddTaskTrigger = () => {
    setView('kanban');
    setShowAddTaskModal(true);
  };

  const getUserInitials = (name: string) => {
    return name.split(/\s+/).map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const getThemeDisplayName = (themeId: string) => {
    switch (themeId) {
      case 'obsidian-aurora':
        return 'Obsidian Aurora';
      case 'cyber-silver':
        return 'Cyber Silver';
      case 'solar-flare':
        return 'Solar Flare';
      default:
        return 'Default Theme';
    }
  };

  return (
    <div className="app-layout">
      {/* Background Glow Spheres */}
      <div className="ambient-glow glow-1" />
      <div className="ambient-glow glow-2" />
      <div className="ambient-glow glow-3" />

      {/* Sidebar Navigation */}
      <aside className={`sidebar collapsible-transition ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            {/* Sidebar Brand header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-black/40 shrink-0">
                  <Layers className="w-4 h-4 text-black" />
                </div>
                {!isSidebarCollapsed && (
                  <h1 className="text-sm font-black tracking-wider uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                    TechSetu
                    <span className="text-[8px] font-bold uppercase tracking-widest bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 px-1.5 py-0.5 rounded text-[var(--accent-primary)]">
                      OS
                    </span>
                  </h1>
                )}
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1 bg-white/4 hover:bg-white/8 border border-white/8 rounded-lg text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer"
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Sidebar Menu items */}
            <nav className="sidebar-menu">
              <button
                onClick={() => setView('dashboard')}
                className={`sidebar-item ${view === 'dashboard' ? 'sidebar-item-active' : ''}`}
              >
                <Activity className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Operations Hub</span>}
              </button>
              
              <button
                onClick={() => setView('kanban')}
                className={`sidebar-item ${view === 'kanban' ? 'sidebar-item-active' : ''}`}
              >
                <Kanban className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Flow Boards</span>}
              </button>

              <button
                onClick={() => setView('ai')}
                className={`sidebar-item ${view === 'ai' ? 'sidebar-item-active' : ''}`}
              >
                <Bot className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>AI Co-Pilots</span>}
              </button>

              <button
                onClick={() => setView('docs')}
                className={`sidebar-item ${view === 'docs' ? 'sidebar-item-active' : ''}`}
              >
                <FileText className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Wiki Documents</span>}
              </button>

              <button
                onClick={() => setView('pulse')}
                className={`sidebar-item ${view === 'pulse' ? 'sidebar-item-active' : ''}`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Collaboration</span>}
              </button>

              <button
                onClick={() => setView('calendar')}
                className={`sidebar-item ${view === 'calendar' ? 'sidebar-item-active' : ''}`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Calendar</span>}
              </button>

              <button
                onClick={() => setView('stats')}
                className={`sidebar-item ${view === 'stats' ? 'sidebar-item-active' : ''}`}
              >
                <Cpu className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Telemetry Stats</span>}
              </button>

              <button
                onClick={() => setView('audit')}
                className={`sidebar-item ${view === 'audit' ? 'sidebar-item-active' : ''}`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>System Audit</span>}
              </button>

              <button
                onClick={() => setView('settings')}
                className={`sidebar-item ${view === 'settings' ? 'sidebar-item-active' : ''}`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Settings</span>}
              </button>
            </nav>
          </div>

          {/* User profile dock inside sidebar */}
          <div className="border-t border-white/5 pt-4">
            {jwtToken === null ? (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 hover:from-[var(--accent-primary)]/30 hover:to-[var(--accent-secondary)]/30 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] text-[10px] py-2 px-3 uppercase tracking-wider font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <div className="relative group">
                <button className="w-full flex items-center justify-start gap-3 p-1.5 rounded-lg border border-white/5 bg-white/2 hover:bg-white/6 hover:border-[var(--accent-primary)] transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[var(--accent-primary)] shrink-0">
                    {getUserInitials(userName)}
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="text-left leading-tight truncate">
                      <span className="text-[10px] font-bold text-[var(--text-primary)] block truncate">{userName}</span>
                      <span className="text-[9px] text-[var(--text-muted)] block truncate">{userRole}</span>
                    </div>
                  )}
                </button>
                
                <div className="absolute left-0 bottom-12 w-48 glass-card bg-[var(--bg-secondary)] border border-[var(--border-color)] py-1.5 rounded-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30 shadow-2xl">
                  <div className="px-3 py-1.5 border-b border-white/5 mb-1 leading-tight">
                    <span className="text-[10px] font-bold text-[var(--text-primary)] block truncate">{userName}</span>
                    <span className="text-[9px] text-[var(--text-muted)] font-medium block truncate">{userRole}</span>
                  </div>
                  <button 
                    onClick={() => setView('settings')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[var(--text-primary)] hover:text-[var(--accent-primary)] block cursor-pointer"
                  >
                    Workspace Settings
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-red-400 hover:text-red-300 border-t border-white/5 mt-1 block cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Right Content container */}
      <div className="content-container">
        
        {/* Workspace Top Header Bar */}
        <header className="w-full z-20 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/30 backdrop-blur-md">
          {/* Left: active tickers */}
          <div className="flex items-center space-x-6 text-[10px] text-[var(--text-secondary)] font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] pulse-dot"></span>
              <span>Cluster: Green</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-tertiary)]" />
              <span>Pending Tasks: {tasks.filter(t => t.column !== 'done').length}</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <GitBranch className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              <span>Branch: main</span>
            </div>
          </div>

          {/* Right: Actions and theme */}
          <div className="flex items-center space-x-3">
            {/* Spotlight Launcher button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center space-x-2 bg-white/4 hover:bg-white/8 border border-white/10 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:inline">⌘K Launcher</span>
            </button>

            {/* Theme selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1.5 bg-white/4 hover:bg-white/8 border border-white/10 px-3 py-1.5 rounded-lg text-xs cursor-pointer">
                <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span className="hidden sm:inline text-[11px] font-bold">{getThemeDisplayName(theme)}</span>
              </button>
              
              <div className="absolute right-0 mt-1.5 w-44 glass-card bg-[var(--bg-secondary)] border border-[var(--border-color)] py-1.5 rounded-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-30 shadow-2xl">
                <span className="px-3 py-1 text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Design Theme</span>
                <button 
                  onClick={() => setTheme('obsidian-aurora')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[var(--text-primary)] hover:text-[var(--accent-primary)] flex items-center justify-between cursor-pointer"
                >
                  <span>Obsidian Aurora</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00f0b5]" />
                </button>
                <button 
                  onClick={() => setTheme('cyber-silver')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[var(--text-primary)] hover:text-sky-400 flex items-center justify-between cursor-pointer"
                >
                  <span>Cyber Silver</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                </button>
                <button 
                  onClick={() => setTheme('solar-flare')}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[var(--text-primary)] hover:text-orange-500 flex items-center justify-between cursor-pointer"
                >
                  <span>Solar Flare</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body content area */}
        <main className="main-workspace">
          {/* View Router */}
          <div className="w-full">
            {view === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left welcome widget */}
                <div className="md:col-span-2 space-y-6">
                  <div className="glass-card p-6 bg-gradient-to-br from-[var(--bg-card)] to-black/20 border border-[var(--border-color)] rounded-2xl relative overflow-hidden">
                    <div className="mesh-grid opacity-20" />
                    <div className="relative z-10 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-[var(--accent-primary)] tracking-widest px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/20">
                        Welcome back, {userName}
                      </span>
                      <h3 className="text-2xl font-black text-[var(--text-primary)] leading-tight mt-2">
                        Facilitating next-generation project velocity.
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-lg">
                        Explore the unified TechSetu Work OS layout. Open your Flow Boards, chat with specialized AI co-pilots, or monitor system metrics in real-time. Use the launcher shortcut <kbd className="font-mono bg-white/10 px-1 py-0.5 rounded text-[var(--accent-primary)]">Ctrl+K</kbd> to execute search actions.
                      </p>
                      <div className="flex items-center gap-3 pt-3">
                        <button 
                          onClick={() => setView('kanban')} 
                          className="btn-primary text-xs py-2 px-4 cursor-pointer"
                        >
                          Launch Flow Boards
                        </button>
                        <button 
                          onClick={() => setIsCommandOpen(true)}
                          className="btn-secondary text-xs py-2 px-4 border-white/5 hover:border-[var(--accent-primary)] cursor-pointer"
                        >
                          Open Search Launcher
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Operations Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="glass-card p-4.5 bg-white/2 border border-white/5 hover:border-[var(--border-hover)] transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className="p-2 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                          <Kanban className="w-4.5 h-4.5" />
                        </span>
                        <span className="text-[10px] font-mono text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded-full font-bold">
                          {tasks.length} Tasks
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">Flow Board Activity</h4>
                      <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed">
                        Check your task timelines. Active items are in progress across multiple engineers.
                      </p>
                      <button 
                        onClick={() => setView('kanban')}
                        className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline mt-3.5 block cursor-pointer"
                      >
                        View Board Timeline →
                      </button>
                    </div>

                    <div className="glass-card p-4.5 bg-white/2 border border-white/5 hover:border-[var(--border-hover)] transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className="p-2 rounded-lg bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]">
                          <Bot className="w-4.5 h-4.5" />
                        </span>
                        <span className="text-[10px] font-mono text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 px-2 py-0.5 rounded-full font-bold">
                          3 Agents
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">AI Co-Pilots active</h4>
                      <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed">
                        Ask specialized personas to draft PRDs, write release emails, or audit docker containers.
                      </p>
                      <button 
                        onClick={() => setView('ai')}
                        className="text-[10px] font-bold text-[var(--accent-secondary)] hover:underline mt-3.5 block cursor-pointer"
                      >
                        Initialize Chat Channels →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right widgets panel */}
                <div className="md:col-span-1 space-y-6">
                  {/* Quick actions box */}
                  <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                      System Control Widgets
                    </h4>

                    <div className="space-y-2.5">
                      <button
                        onClick={handleAddTaskTrigger}
                        className="w-full text-left p-3.5 bg-black/25 hover:bg-black/45 border border-white/4 rounded-xl flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="p-1 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                            <CheckSquare className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                            Create New Task
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">Ctrl + N</span>
                      </button>

                      <button
                        onClick={() => { setView('docs'); }}
                        className="w-full text-left p-3.5 bg-black/25 hover:bg-black/45 border border-white/4 rounded-xl flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="p-1 rounded bg-[var(--accent-tertiary)]/10 text-[var(--accent-tertiary)]">
                            <FileText className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-tertiary)] transition-colors">
                            Open Wiki Docs
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">Ctrl + D</span>
                      </button>

                      <button
                        onClick={() => { setView('stats'); }}
                        className="w-full text-left p-3.5 bg-black/25 hover:bg-black/45 border border-white/4 rounded-xl flex items-center justify-between group transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="p-1 rounded bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)]">
                            <Cpu className="w-3.5 h-3.5" />
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-secondary)] transition-colors">
                            Telemetry Stats
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">Ctrl + S</span>
                      </button>
                    </div>
                  </div>

                  {/* AI quick tip card */}
                  <div className="glass-card p-5 border border-[var(--border-color)] bg-gradient-to-br from-white/2 to-black/35 rounded-2xl space-y-3 relative overflow-hidden">
                    <div className="flex items-center space-x-2 text-[var(--accent-primary)]">
                      <Sparkles className="w-4.5 h-4.5" />
                      <span className="text-[10px] font-black uppercase tracking-wider">AI Recommendation</span>
                    </div>
                    <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed">
                      "I noticed 2 quality review items remain unassigned. Consider dispatching pings to Emily Taylor to secure release guidelines."
                    </p>
                    <button 
                      onClick={() => setView('pulse')}
                      className="text-[10px] font-bold text-[var(--accent-primary)] hover:underline block pt-1 cursor-pointer"
                    >
                      Open Collaboration channels →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {view === 'kanban' && (
              <KanbanBoard
                tasks={tasks}
                setTasks={handleSetTasks}
                showAddTaskModal={showAddTaskModal}
                setShowAddTaskModal={setShowAddTaskModal}
              />
            )}

            {view === 'ai' && <AIHub jwtToken={jwtToken} customApiKey={customApiKey} />}

            {view === 'docs' && <DocWorkspace jwtToken={jwtToken} customApiKey={customApiKey} />}

            {view === 'pulse' && <PulseStream />}

            {view === 'stats' && <SystemStats updateFreq={updateFreq} setUpdateFreq={setUpdateFreq} jwtToken={jwtToken} />}

            {view === 'audit' && <SystemHealthAudit jwtToken={jwtToken} customApiKey={customApiKey} />}

            {view === 'settings' && (
              <SettingsPanel
                userName={userName}
                setUserName={setUserName}
                userRole={userRole}
                setUserRole={setUserRole}
                showGlow={showGlow}
                setShowGlow={setShowGlow}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                updateFreq={updateFreq}
                setUpdateFreq={setUpdateFreq}
                onSaveToast={showToast}
                customApiKey={customApiKey}
                setCustomApiKey={setCustomApiKey}
              />
            )}

            {view === 'calendar' && (
              <CalendarPlanner
                tasks={tasks}
                onAddTaskClick={handleAddTaskTrigger}
              />
            )}
          </div>

          {/* Workspace Alerts Toast */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-40 glass-card bg-[var(--bg-secondary)] border border-[var(--border-hover)] px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl animate-fade-in text-xs font-bold text-[var(--accent-primary)]">
              <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              {toastMessage}
            </div>
          )}
        </main>

        {/* Footer Area */}
        <footer className="px-6 py-4 border-t border-white/5 bg-black/20 text-[10px] text-[var(--text-muted)] flex items-center justify-between font-mono">
          <span>&copy; 2026 TechSetu Work OS. All rights reserved.</span>
          <span>System Status: ALL NODES ONLINE</span>
        </footer>
      </div>

      {/* Command Launcher Modal overlay */}
      <CommandLauncher
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        setView={setView}
        setTheme={setTheme}
        onAddTaskClick={handleAddTaskTrigger}
      />

      {/* Identity Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;
