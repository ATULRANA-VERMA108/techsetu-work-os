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
  Sparkles,
  GitBranch,
  Search,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Lock,
  BarChart3,
  Network,
  Target,
  Sun,
  Flame,
  Zap,
  Trophy,
  Compass
} from 'lucide-react';
import { CommandLauncher } from './components/CommandLauncher';
import { KanbanBoard } from './components/KanbanBoard';
import type { Task } from './components/KanbanBoard';
import { AIHub } from './components/AIHub';
import { DocWorkspace } from './components/DocWorkspace';
import { SystemStats } from './components/SystemStats';
import { SettingsPanel } from './components/SettingsPanel';
import { SystemHealthAudit } from './components/SystemHealthAudit';
import { PowerBIDashboard } from './components/PowerBIDashboard';
import { SaaSIntegrationHub } from './components/SaaSIntegrationHub';
import { CalendarPlanner } from './components/CalendarPlanner';

// New Module Imports
import { TaskManager } from './components/TaskManager';
import { GoalTracker } from './components/GoalTracker';
import { DailyPlanner } from './components/DailyPlanner';
import { HabitTracker } from './components/HabitTracker';
import { FocusMode } from './components/FocusMode';
import { CollabWorkspace } from './components/CollabWorkspace';
import { LifeManager } from './components/LifeManager';
import { AutomationLab } from './components/AutomationLab';
import { GamificationCenter } from './components/GamificationCenter';
import { Logo } from './components/Logo';
import { KidsGameLab } from './components/KidsGameLab';
import { SystemDemoCenter } from './components/SystemDemoCenter';


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
  const [systemSubView, setSystemSubView] = useState<'settings' | 'stats' | 'audit' | 'powerbi' | 'saas'>('settings');
  const [theme, setTheme] = useState<string>(localStorage.getItem('techsetu-theme') || 'obsidian-aurora');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Global Kids Mode / Easy Mode State
  const [isEasyMode, setIsEasyMode] = useState<boolean>(() => {
    return localStorage.getItem('techsetu-easymode') === 'true';
  });

  const toggleEasyMode = () => {
    setIsEasyMode(prev => {
      const next = !prev;
      localStorage.setItem('techsetu-easymode', String(next));
      return next;
    });
  };

  // Global Gamification & XP State
  const [xp, setXp] = useState<number>(() => {
    return Number(localStorage.getItem('techsetu-xp')) || 120;
  });
  const [level, setLevel] = useState<number>(() => {
    return Number(localStorage.getItem('techsetu-level')) || 1;
  });
  const [streak, setStreak] = useState<number>(() => {
    return Number(localStorage.getItem('techsetu-streak')) || 4;
  });

  const handleRewardXp = (amount: number) => {
    setXp(prev => {
      const nextXp = prev + amount;
      const needed = level * 300;
      if (nextXp >= needed) {
        setLevel(l => {
          const nl = l + 1;
          localStorage.setItem('techsetu-level', String(nl));
          showToast(`Level Up! You reached Level ${nl}! 🏆`);
          return nl;
        });
        const remainingXp = nextXp - needed;
        localStorage.setItem('techsetu-xp', String(remainingXp));
        return remainingXp;
      }
      localStorage.setItem('techsetu-xp', String(nextXp));
      return nextXp;
    });
    showToast(`+${amount} XP Awarded ✨`);
  };


  // Settings Panel States
  const [userName, setUserName] = useState<string>(localStorage.getItem('techsetu-username') || 'Guest User');
  const [userRole, setUserRole] = useState<string>(localStorage.getItem('techsetu-userrole') || 'Workspace Observer');
  const [showGlow, setShowGlow] = useState<boolean>(localStorage.getItem('techsetu-showglow') !== 'false');
  const [showGrid, setShowGrid] = useState<boolean>(localStorage.getItem('techsetu-showgrid') !== 'false');
  const [updateFreq, setUpdateFreq] = useState<number>(Number(localStorage.getItem('techsetu-updatefreq')) || 2000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication states
  const [jwtToken, setJwtToken] = useState<string | null>(localStorage.getItem('techsetu-jwt') || null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string | null>(localStorage.getItem('techsetu-custom-gemini-key') || null);

  // Landing Page Forms
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Database Tickers
  const [postgresOnline, setPostgresOnline] = useState<boolean | null>(null);
  const [mongoOnline, setMongoOnline] = useState<boolean | null>(null);

  // Shared Smartsheet cost rows state
  const [smartsheetRows, setSmartsheetRows] = useState<any[]>([
    { title: 'Setup Node server routes', cost: 1800, status: 'Completed', owner: 'Atul Verma' },
    { title: 'Design radial keyframe flows', cost: 950, status: 'In Progress', owner: 'Emily Taylor' },
    { title: 'Vectorize document database', cost: 2400, status: 'Review', owner: 'Sarah Chen' }
  ]);

  // Shared Quickbase tables state
  const [quickbaseTables, setQuickbaseTables] = useState<Record<string, any[]>>({
    'Inventory': [
      { id: 'rec-01', timestamp: '10:42 AM', status: 'Active' },
      { id: 'rec-02', timestamp: '11:15 AM', status: 'Active' }
    ],
    'Contracts': [
      { id: 'rec-03', timestamp: '01:30 PM', status: 'Active' }
    ]
  });

  // Stored tasks
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

  // Feature Toggles (Customizations)
  const [toggleGrid, setToggleGrid] = useState<boolean>(localStorage.getItem('techsetu-toggle-grid') !== 'false');
  const [toggleAICard, setToggleAICard] = useState<boolean>(localStorage.getItem('techsetu-toggle-aicard') !== 'false');
  const [toggleQuickWidgets, setToggleQuickWidgets] = useState<boolean>(localStorage.getItem('techsetu-toggle-widgets') !== 'false');

  const handleToggleFeature = (feature: string, val: boolean) => {
    if (feature === 'grid') {
      setToggleGrid(val);
      localStorage.setItem('techsetu-toggle-grid', String(val));
    } else if (feature === 'aicard') {
      setToggleAICard(val);
      localStorage.setItem('techsetu-toggle-aicard', String(val));
    } else if (feature === 'widgets') {
      setToggleQuickWidgets(val);
      localStorage.setItem('techsetu-toggle-widgets', String(val));
    }
  };

  // GitHub contribution data
  const [contributions, setContributions] = useState<Record<string, number>>({});

  // Generate GitHub-style contribution data
  useEffect(() => {
    const mockContribs: Record<string, number> = {};
    const today = new Date();
    // Generate 140 days history
    for (let i = 0; i < 140; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      // Randomly populate completed tasks (0 to 4)
      if (Math.random() > 0.4) {
        mockContribs[dateString] = Math.floor(Math.random() * 5);
      }
    }
    setContributions(mockContribs);
  }, []);

  // Sync contributions grid with completed Kanban tasks
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const doneTasksCount = tasks.filter(t => t.column === 'done').length;
    setContributions(prev => ({
      ...prev,
      [todayStr]: Math.min(4, doneTasksCount)
    }));
  }, [tasks]);

  // Probe database nodes on Landing page
  useEffect(() => {
    if (jwtToken === null) {
      const probeApis = async () => {
        try {
          const res = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          setPostgresOnline(res.status !== 500);
        } catch (e) {
          setPostgresOnline(false);
        }

        try {
          const res = await fetch('http://localhost:8081/api/analytics');
          setMongoOnline(res.status !== 404);
        } catch (e) {
          setMongoOnline(false);
        }
      };
      probeApis();
    }
  }, [jwtToken]);

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

  // Command launcher shortcut listener (Ctrl+K)
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
    setView('tasks');
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Login Handler (Direct Auth)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) return;

    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('techsetu-jwt', data.token);
        localStorage.setItem('techsetu-username', data.email.split('@')[0]);
        localStorage.setItem('techsetu-email', data.email);
        setJwtToken(data.token);
        setUserName(data.email.split('@')[0]);
        showToast('System node handshaked successfully.');
      } else {
        const errText = await response.text();
        setAuthError(errText || 'Invalid credentials.');
      }
    } catch (err) {
      setAuthError('Connection refused by API gateway.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Guest exploration login override
  const handleGuestExplore = () => {
    localStorage.setItem('techsetu-jwt', 'demo-guest-token');
    localStorage.setItem('techsetu-username', 'Atul Verma');
    localStorage.setItem('techsetu-userrole', 'Guest Lead Developer');
    setJwtToken('demo-guest-token');
    setUserName('Atul Verma');
    setUserRole('Guest Lead Developer');
    showToast('Demo environment activated.');
  };

  const handleSignOut = () => {
    localStorage.removeItem('techsetu-jwt');
    localStorage.removeItem('techsetu-username');
    localStorage.removeItem('techsetu-email');
    setJwtToken(null);
    setUserName('Guest User');
    setUserRole('Workspace Observer');
    setTasks(DEFAULT_TASKS);
    showToast('Session terminated.');
  };

  // Landing Page Render (Security Gate)
  if (jwtToken === null) {
    return (
      <div className="landing-portal">
        <div className="magical-bg">
          <div className="glow-blob blob-1" />
          <div className="glow-blob blob-2" />
          <div className="glow-blob blob-3" />
        </div>

        <div className="landing-card animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <Logo size={48} className="mb-3" />
            <h1 className="text-2xl font-black uppercase tracking-widest text-[var(--text-primary)]">
              TechSetu <span className="text-[var(--accent-primary)]">OS</span>
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Initialize workspace nodes and secure RAG data pathways.
            </p>
          </div>

          {/* Database diagnostic lights */}
          <div className="flex justify-center gap-4 mb-6 bg-black/35 p-3 rounded-xl border border-white/4">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-secondary)]">
              <span className={`indicator-light ${postgresOnline === true ? 'indicator-green' : postgresOnline === false ? 'indicator-red' : 'indicator-yellow'} indicator-pulse`} />
              PostgreSQL
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[var(--text-secondary)]">
              <span className={`indicator-light ${mongoOnline === true ? 'indicator-green' : mongoOnline === false ? 'indicator-red' : 'indicator-yellow'} indicator-pulse`} />
              MongoDB
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="landing-input-group">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-1">
                <User className="w-3 h-3 text-[var(--accent-primary)]" /> Username / Email
              </label>
              <input
                type="text"
                placeholder="developer@techsetu.com"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>

            <div className="landing-input-group">
              <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[var(--accent-secondary)]" /> Access Key / Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>

            {authError && (
              <p className="text-[10px] text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                {authError}
              </p>
            )}

            <button type="submit" disabled={isAuthenticating} className="btn-primary w-full cursor-pointer py-2.5">
              {isAuthenticating ? 'Authorizing Node...' : 'Access Workspace'}
            </button>
          </form>

          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[9px] text-[var(--text-muted)] uppercase font-bold">Or</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <button onClick={handleGuestExplore} className="btn-secondary w-full cursor-pointer py-2">
            Explore Demo Environment
          </button>
        </div>
      </div>
    );
  }

  // Generate date label strings for contribution tooltip
  const getContributionTooltip = (dateString: string, count: number) => {
    const d = new Date(dateString);
    const formattedDate = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return `${count || 0} task${count === 1 ? '' : 's'} completed on ${formattedDate}`;
  };

  return (
    <div className={`app-layout ${isEasyMode ? 'kids-theme' : ''}`}>
      {/* Background Glow Spheres */}
      <div className="magical-bg">
        <div className="glow-blob blob-1" />
        <div className="glow-blob blob-2" />
        <div className="glow-blob blob-3" />
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
            {/* Sidebar Brand header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <Logo size={32} className="shrink-0" />
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

            {/* Kids Mode Toggle */}
            {!isSidebarCollapsed ? (
              <div className="mx-2 p-2.5 flex items-center justify-between bg-black/40 border border-white/8 rounded-xl">
                <span className="text-[10px] font-black text-pink-400 flex items-center gap-1.5 uppercase tracking-wider">
                  🧸 Kids Mode
                </span>
                <button
                  onClick={toggleEasyMode}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEasyMode ? 'bg-pink-500 animate-pulse' : 'bg-white/10'
                  }`}
                  title="Toggle simplified Kids Mode / Easy Mode interface"
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isEasyMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ) : (
              <button
                onClick={toggleEasyMode}
                className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  isEasyMode ? 'bg-pink-500/20 border-pink-500/40 text-pink-400' : 'bg-white/2 border-white/6 text-[var(--text-secondary)] hover:text-white'
                }`}
                title="Toggle simplified Kids Mode / Easy Mode interface"
              >
                🧸
              </button>
            )}

            {/* Sidebar Menu items */}
            <nav className="sidebar-menu">
              <button
                onClick={() => setView('dashboard')}
                className={`sidebar-item ${view === 'dashboard' ? 'sidebar-item-active' : ''}`}
                title="Operations Hub - See my stats, daily trends, and overall growth"
              >
                <Activity className="w-4 h-4 shrink-0 text-sky-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Space Dashboard 🏠' : 'Operations Hub'}</span>}
              </button>

              <button
                onClick={() => setView('tasks')}
                className={`sidebar-item ${view === 'tasks' ? 'sidebar-item-active' : ''}`}
                title="AI Task Manager - Write my play and study checklists"
              >
                <CheckSquare className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My To-Do Stars ⭐' : 'AI Task Manager'}</span>}
              </button>

              <button
                onClick={() => setView('calendar')}
                className={`sidebar-item ${view === 'calendar' ? 'sidebar-item-active' : ''}`}
                title="Smart Scheduler - View dates and times for play and work"
              >
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Play Calendar 📅' : 'Smart Scheduler'}</span>}
              </button>

              <button
                onClick={() => setView('goals')}
                className={`sidebar-item ${view === 'goals' ? 'sidebar-item-active' : ''}`}
                title="AI Goal Tracker - Write my wishes and lifetime dreams"
              >
                <Target className="w-4 h-4 shrink-0 text-pink-500" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Big Dreams 🎯' : 'AI Goal Tracker'}</span>}
              </button>

              <button
                onClick={() => setView('planner')}
                className={`sidebar-item ${view === 'planner' ? 'sidebar-item-active' : ''}`}
                title="Daily Planner - Plan my morning play and night reflections"
              >
                <Sun className="w-4 h-4 shrink-0 text-yellow-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Day Plan ☀️' : 'Daily Planner'}</span>}
              </button>

              <button
                onClick={() => setView('habits')}
                className={`sidebar-item ${view === 'habits' ? 'sidebar-item-active' : ''}`}
                title="Habits Hub - Build daily habits streaks"
              >
                <Flame className="w-4 h-4 shrink-0 text-orange-500 animate-pulse" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Daily Habits 🍀' : 'Habit Hub'}</span>}
              </button>

              <button
                onClick={() => setView('focus')}
                className={`sidebar-item ${view === 'focus' ? 'sidebar-item-active' : ''}`}
                title="Focus Engine - Run Pomodoro study timer with fun music sounds"
              >
                <Zap className="w-4 h-4 shrink-0 text-purple-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Focus Timer ⏱️' : 'Focus Engine'}</span>}
              </button>

              <button
                onClick={() => setView('ai')}
                className={`sidebar-item ${view === 'ai' ? 'sidebar-item-active' : ''}`}
                title="AI Co-Pilots - Talk to my intelligent robot friends"
              >
                <Bot className="w-4 h-4 shrink-0 text-teal-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My AI Friends 🤖' : 'AI Co-Pilots'}</span>}
              </button>

              <button
                onClick={() => setView('docs')}
                className={`sidebar-item ${view === 'docs' ? 'sidebar-item-active' : ''}`}
                title="Second Brain - Write notes and documents"
              >
                <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Notebook 📝' : 'Second Brain'}</span>}
              </button>

              <button
                onClick={() => setView('workspaces')}
                className={`sidebar-item ${view === 'workspaces' ? 'sidebar-item-active' : ''}`}
                title="Workspaces - Chat with team members and friends"
              >
                <Layers className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Team Chat 🤝' : 'Workspaces'}</span>}
              </button>

              <button
                onClick={() => setView('life')}
                className={`sidebar-item ${view === 'life' ? 'sidebar-item-active' : ''}`}
                title="Life Manager - Track books, meal plans, and piggybank savings"
              >
                <Compass className="w-4 h-4 shrink-0 text-rose-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Wish & Cash 💰' : 'Life Manager'}</span>}
              </button>

              <button
                onClick={() => setView('automation')}
                className={`sidebar-item ${view === 'automation' ? 'sidebar-item-active' : ''}`}
                title="Automation Lab - Create trigger-action zaps"
              >
                <Cpu className="w-4 h-4 shrink-0 text-green-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Magic Actions ⚡' : 'Automation Lab'}</span>}
              </button>

              <button
                onClick={() => setView('gamification')}
                className={`sidebar-item ${view === 'gamification' ? 'sidebar-item-active' : ''}`}
                title="Gamification - Check XP points, levels, and leaderboards"
              >
                <Trophy className="w-4 h-4 shrink-0 text-amber-500" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Levels & Badges 🏆' : 'Gamification'}</span>}
              </button>

              <button
                onClick={() => setView('kids')}
                className={`sidebar-item ${view === 'kids' ? 'sidebar-item-active' : ''}`}
                title="Kids Game Lab - Design and play custom 3D games"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-pink-400 animate-pulse" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Kids Game Lab 🎮' : '3D Play & Build 🎨'}</span>}
              </button>

              <button
                onClick={() => setView('demo')}
                className={`sidebar-item ${view === 'demo' ? 'sidebar-item-active' : ''}`}
                title="System Tour & Interactive Demo - Learn how to use all features"
              >
                <Compass className="w-4 h-4 shrink-0 text-cyan-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'App Demo Tour 🧭' : 'Interactive Tour & Demo'}</span>}
              </button>

              <button
                onClick={() => setView('system')}
                className={`sidebar-item ${view === 'system' ? 'sidebar-item-active' : ''}`}
                title="System Settings - Change user profile and interface themes"
              >
                <Settings className="w-4 h-4 shrink-0 text-gray-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Settings & Themes ⚙️' : 'System & Connect'}</span>}
              </button>
            </nav>
          </div>

          {/* User profile dock inside sidebar */}
          <div className="border-t border-white/5 pt-4">
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
          </div>
        </div>
      </aside>

      {/* Right Content container */}
      <div className="content-container">
        
        {/* Workspace Top Header Bar */}
        <header className="header-section">
          {/* Left: active tickers */}
          <div className="flex items-center space-x-6 text-[10px] text-[var(--text-secondary)] font-mono">
            <div className="flex items-center space-x-2">
              <span className="ticker-active"></span>
              <span>Cluster: Nodes Online</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-tertiary)]" />
              <span>Pending Tasks: {tasks.filter(t => t.column !== 'done').length}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <GitBranch className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              <span>Branch: main</span>
            </div>
          </div>

          {/* Right: Actions and theme */}
          <div className="flex items-center space-x-3">
            {/* Spotlight Launcher button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="btn-secondary text-[10px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>⌘K Launcher</span>
            </button>

            {/* Theme selector */}
            <div className="relative group">
              <button className="btn-secondary text-[10px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer">
                <Palette className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>{getThemeDisplayName(theme)}</span>
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
          <div className="w-full animate-fade-in">
            {view === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left panel: Welcome & Performance Grid */}
                <div className="md:col-span-2 space-y-6">
                  <div className="glass-card p-6 bg-gradient-to-br from-[var(--bg-card)] to-black/20 border border-[var(--border-color)] rounded-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-3">
                      <span className="text-[10px] uppercase font-bold text-[var(--accent-primary)] tracking-widest px-2.5 py-0.5 rounded-full bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/20">
                        Lead Center
                      </span>
                      <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight mt-2">
                        Welcome back, {userName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-lg">
                        You are connected to the central Work OS gateway node. Use this dashboard to coordinate kanban flows, run local API diagnostics, and query documentation using RAG channels.
                      </p>
                      <div className="flex items-center gap-3 pt-3">
                        <button 
                          onClick={() => setView('tasks')} 
                          className="btn-primary text-xs cursor-pointer"
                        >
                          Launch Flow Boards
                        </button>
                        <button 
                          onClick={() => setIsCommandOpen(true)}
                          className="btn-secondary text-xs cursor-pointer"
                        >
                          Open Search Launcher
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GitHub Style Consistency Grid */}
                  {toggleGrid && (
                    <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-[var(--accent-primary)]" />
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">Task Execution Consistency (Past 20 Weeks)</h4>
                        </div>
                        <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">GitHub Style grid</span>
                      </div>

                      <div className="git-grid-container">
                        <div className="git-grid no-scrollbar">
                          {Array.from({ length: 20 }).map((_, colIdx) => {
                            const today = new Date();
                            return (
                              <div key={colIdx} className="git-column">
                                {Array.from({ length: 7 }).map((_, rowIdx) => {
                                  const dayIndex = colIdx * 7 + rowIdx;
                                  const targetDate = new Date(today);
                                  targetDate.setDate(today.getDate() - (139 - dayIndex));
                                  const dateStr = targetDate.toISOString().split('T')[0];
                                  const count = contributions[dateStr] || 0;
                                  const cellClass = `git-cell git-cell-${count}`;
                                  
                                  return (
                                    <div key={rowIdx} className={cellClass}>
                                      <span className="git-tooltip">
                                        {getContributionTooltip(dateStr, count)}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] font-mono mt-3 px-1">
                        <span>140 Days Ago</span>
                        <div className="flex items-center gap-1.5">
                          <span>Less</span>
                          <span className="w-2.5 h-2.5 rounded-sm bg-white/5" />
                          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)]/20" />
                          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)]/50" />
                          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)]/80" />
                          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--accent-primary)]" style={{ boxShadow: '0 0 4px var(--accent-primary)' }} />
                          <span>More</span>
                        </div>
                        <span>Today</span>
                      </div>
                    </div>
                  )}

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
                        Drag-and-drop or move task cards inside structured lanes.
                      </p>
                      <button 
                        onClick={() => setView('tasks')}
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
                        Connect with specialized developer bot roles.
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

                {/* Right panel: Feature toggles & Quick Actions */}
                <div className="md:col-span-1 space-y-6">
                  {/* Modular Feature Toggles */}
                  <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl flex flex-col space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)] pb-1.5 border-b border-white/5">
                      Modular Dashboard
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="switch-container">
                        <div className="leading-tight">
                          <span className="text-xs font-bold text-[var(--text-primary)] block">Performance Grid</span>
                          <span className="text-[9px] text-[var(--text-muted)]">GitHub-style activity tracker.</span>
                        </div>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={toggleGrid}
                            onChange={(e) => handleToggleFeature('grid', e.target.checked)}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>

                      <div className="switch-container">
                        <div className="leading-tight">
                          <span className="text-xs font-bold text-[var(--text-primary)] block">AI Recommendation</span>
                          <span className="text-[9px] text-[var(--text-muted)]">AI specialist quick tips.</span>
                        </div>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={toggleAICard}
                            onChange={(e) => handleToggleFeature('aicard', e.target.checked)}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>

                      <div className="switch-container">
                        <div className="leading-tight">
                          <span className="text-xs font-bold text-[var(--text-primary)] block">Quick Operations</span>
                          <span className="text-[9px] text-[var(--text-muted)]">Create task, telemetry shortcuts.</span>
                        </div>
                        <label className="switch-toggle">
                          <input 
                            type="checkbox" 
                            checked={toggleQuickWidgets}
                            onChange={(e) => handleToggleFeature('widgets', e.target.checked)}
                          />
                          <span className="switch-slider" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Panel */}
                  {toggleQuickWidgets && (
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
                  )}

                  {/* AI Quick recommendation card */}
                  {toggleAICard && (
                    <div className="glass-card p-5 border border-[var(--border-color)] bg-gradient-to-br from-white/2 to-black/35 rounded-2xl space-y-3 relative overflow-hidden">
                      <div className="flex items-center space-x-2 text-[var(--accent-primary)]">
                        <Sparkles className="w-4.5 h-4.5" />
                        <span className="text-[10px] font-black uppercase tracking-wider">AI Recommendation</span>
                      </div>
                      <p className="text-[10.5px] text-[var(--text-secondary)] leading-relaxed">
                        "I noticed 2 quality review items remain unassigned. Consider dispatching pings to Emily Taylor to secure release guidelines."
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'tasks' && (
              <TaskManager
                tasks={tasks}
                onTasksChange={handleSetTasks}
                userName={userName}
                showAddTaskModal={showAddTaskModal}
                setShowAddTaskModal={setShowAddTaskModal}
                onRewardXP={handleRewardXp}
              />
            )}

            {view === 'calendar' && (
              <CalendarPlanner
                tasks={tasks}
                onAddTaskClick={handleAddTaskTrigger}
              />
            )}

            {view === 'goals' && (
              <GoalTracker
                onRewardXP={handleRewardXp}
                isEasyMode={isEasyMode}
              />
            )}

            {view === 'planner' && (
              <DailyPlanner
                onRewardXP={handleRewardXp}
                isEasyMode={isEasyMode}
              />
            )}

            {view === 'habits' && (
              <HabitTracker
                onRewardXP={handleRewardXp}
              />
            )}

            {view === 'focus' && (
              <FocusMode
                onRewardXP={handleRewardXp}
              />
            )}

            {view === 'ai' && <AIHub jwtToken={jwtToken} customApiKey={customApiKey} />}

            {view === 'docs' && <DocWorkspace jwtToken={jwtToken} customApiKey={customApiKey} />}

            {view === 'workspaces' && (
              <CollabWorkspace
                onRewardXP={handleRewardXp}
              />
            )}

            {view === 'life' && (
              <LifeManager
                onRewardXP={handleRewardXp}
              />
            )}

            {view === 'automation' && (
              <AutomationLab
                onRewardXP={handleRewardXp}
              />
            )}

            {view === 'gamification' && (
              <GamificationCenter
                xp={xp}
                level={level}
                streak={streak}
              />
            )}

            {view === 'kids' && (
              <KidsGameLab
                onRewardXP={handleRewardXp}
                isEasyMode={isEasyMode}
              />
            )}

            {view === 'demo' && (
              <SystemDemoCenter
                setView={setView}
                onRewardXP={handleRewardXp}
                isEasyMode={isEasyMode}
                toggleEasyMode={toggleEasyMode}
                openCommandFinder={() => setIsCommandOpen(true)}
              />
            )}

            {view === 'system' && (
              <div className="space-y-6">
                <div className="glass-card p-3 bg-white/2 border border-white/5 rounded-2xl flex flex-wrap gap-1">
                  {[
                    { id: 'settings', label: 'Settings Panel' },
                    { id: 'stats', label: 'Telemetry Stats' },
                    { id: 'audit', label: 'System Health Audit' },
                    { id: 'saas', label: 'SaaS Connect Hub' },
                    { id: 'powerbi', label: 'PowerBI Reports' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSystemSubView(tab.id as any)}
                      className={`flex-grow py-2.5 px-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                        systemSubView === tab.id
                          ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 text-white border border-[var(--accent-primary)]/30'
                          : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/4'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="animate-fade-in">
                  {systemSubView === 'settings' && (
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
                  {systemSubView === 'stats' && <SystemStats updateFreq={updateFreq} setUpdateFreq={setUpdateFreq} jwtToken={jwtToken} />}
                  {systemSubView === 'audit' && <SystemHealthAudit jwtToken={jwtToken} customApiKey={customApiKey} />}
                  {systemSubView === 'powerbi' && (
                    <PowerBIDashboard 
                      tasks={tasks} 
                      smartsheetRows={smartsheetRows} 
                      quickbaseTables={quickbaseTables} 
                    />
                  )}
                  {systemSubView === 'saas' && (
                    <SaaSIntegrationHub 
                      tasks={tasks} 
                      onTasksChange={handleSetTasks} 
                      smartsheetRows={smartsheetRows} 
                      setSmartsheetRows={setSmartsheetRows} 
                      quickbaseTables={quickbaseTables} 
                      setQuickbaseTables={setQuickbaseTables} 
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Command Launcher spotlight dialog */}
      <CommandLauncher
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        setView={setView}
        setTheme={setTheme}
        onAddTaskClick={handleAddTaskTrigger}
      />

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-40 glass-card bg-[var(--bg-secondary)] border border-[var(--border-hover)] px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl animate-fade-in text-xs font-bold text-[var(--accent-primary)]">
          <Sparkles className="w-4 h-4" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
