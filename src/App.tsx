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
  Compass,
  Menu,
  Smile,
  Mail
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
import { API_BASE_URL } from './config';
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
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  
  // Authentication Portal States
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [signupName, setSignupName] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newRecoveryPassword, setNewRecoveryPassword] = useState("");
  const [simulatedCode, setSimulatedCode] = useState("");
  const [alert, setAlert] = useState<{ type: 'error' | 'success' | 'info'; message: string } | null>(null);

  const triggerAlert = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(prev => prev && prev.message === message ? null : prev);
    }, 4000);
  };

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const fetchWithTimeout = async (url: string, options: any, timeoutMs = 4000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  const handleNavClick = (newView: string) => {
    setView(newView);
    if (window.innerWidth <= 768) {
      setIsSidebarCollapsed(true);
    }
  };
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
          const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });
          setPostgresOnline(res.status !== 500);
        } catch (e) {
          setPostgresOnline(false);
        }

        try {
          const res = await fetch(`${API_BASE_URL}/api/analytics`);
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
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
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
          const response = await fetch(`${API_BASE_URL}/api/tasks`, {
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
          await fetch(`${API_BASE_URL}/api/tasks/${deleted.id}`, {
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
            await fetch(`${API_BASE_URL}/api/tasks/${nt.id}`, {
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

    if (!isValidEmail(emailInput)) {
      triggerAlert('Please enter a valid email address.', 'error');
      return;
    }

    setAuthError(null);
    setIsAuthenticating(true);

    // Check recovery override cache
    const savedOverrides = JSON.parse(localStorage.getItem('techsetu-auth-overrides') || '{}');
    if (savedOverrides[emailInput] && savedOverrides[emailInput] === passwordInput) {
      localStorage.setItem('techsetu-jwt', 'demo-recovered-token');
      localStorage.setItem('techsetu-username', emailInput.split('@')[0]);
      localStorage.setItem('techsetu-email', emailInput);
      setJwtToken('demo-recovered-token');
      setUserName(emailInput.split('@')[0]);
      showToast('System node handshaked with recovered credentials.');
      setIsAuthenticating(false);
      return;
    }

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      }, 4000);

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('techsetu-jwt', data.token);
        localStorage.setItem('techsetu-username', data.email.split('@')[0]);
        localStorage.setItem('techsetu-email', data.email);
        setJwtToken(data.token);
        setUserName(data.email.split('@')[0]);
        showToast('System node handshaked successfully.');
      } else {
        const data = await response.json().catch(() => ({ error: 'Invalid email or access key.' }));
        const errMsg = data.error || 'Invalid email or access key.';
        triggerAlert(errMsg, 'error');
      }
    } catch (err) {
      // Offline fallback: check local sandbox users
      console.warn('API Gateway unreachable. Checking local storage user registry.');
      const localUsers = JSON.parse(localStorage.getItem('techsetu-local-users') || '{}');
      if (localUsers[emailInput] && localUsers[emailInput].password === passwordInput) {
        const localUser = localUsers[emailInput];
        localStorage.setItem('techsetu-jwt', 'local-sandbox-token');
        localStorage.setItem('techsetu-username', localUser.name);
        localStorage.setItem('techsetu-email', emailInput);
        setJwtToken('local-sandbox-token');
        setUserName(localUser.name);
        showToast('Connected to localized secure sandbox node.');
      } else {
        triggerAlert('Gateway connection failed & credentials not found in local registry.', 'error');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Signup Handler (Direct Auth Registration)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !emailInput.trim() || !passwordInput.trim() || !signupConfirmPassword.trim()) {
      triggerAlert('All fields are required.', 'error');
      return;
    }

    if (!isValidEmail(emailInput)) {
      triggerAlert('Please enter a valid email address.', 'error');
      return;
    }

    if (passwordInput.length < 6) {
      triggerAlert('Password must be at least 6 characters.', 'error');
      return;
    }

    if (passwordInput !== signupConfirmPassword) {
      triggerAlert('Passwords do not match.', 'error');
      return;
    }

    setAuthError(null);
    setIsAuthenticating(true);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signupName, email: emailInput, password: passwordInput })
      }, 4000);

      if (response.ok) {
        triggerAlert('Account registered successfully! You may now sign in.', 'success');
        setAuthMode('login');
        setPasswordInput('');
        setSignupConfirmPassword('');
      } else {
        const data = await response.json().catch(() => ({ error: 'Registration failed.' }));
        const errMsg = data.error || 'Registration failed.';
        triggerAlert(errMsg, 'error');
      }
    } catch (err) {
      // Offline fallback: register locally inside localStorage
      console.warn('API Gateway offline. Activating secure local registration sandbox.');
      const localUsers = JSON.parse(localStorage.getItem('techsetu-local-users') || '{}');
      
      if (localUsers[emailInput]) {
        triggerAlert('Email address already registered in local sandbox.', 'error');
      } else {
        localUsers[emailInput] = { name: signupName, password: passwordInput };
        localStorage.setItem('techsetu-local-users', JSON.stringify(localUsers));
        triggerAlert('Gateway offline. Account created successfully in localized secure sandbox!', 'success');
        setAuthMode('login');
        setPasswordInput('');
        setSignupConfirmPassword('');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Simulated Forgot Password flows
  const handleForgotPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim() || !isValidEmail(recoveryEmail)) {
      triggerAlert('Please enter a valid recovery email address.', 'error');
      return;
    }

    setIsAuthenticating(true);
    
    setTimeout(() => {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedCode(generatedCode);
      setIsAuthenticating(false);
      setRecoveryStep(2);
      triggerAlert(`Cryptographic handshake reset code sent to ${recoveryEmail}! Check console.`, 'success');
      console.log(`[TechSetu OS SECURITY PATHWAY] Recovery code for ${recoveryEmail}: ${generatedCode}`);
    }, 1200);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryCode.trim() === simulatedCode) {
      setRecoveryStep(3);
      triggerAlert('Access authorized. Enter your new security credentials.', 'success');
    } else {
      triggerAlert('Cryptographic key code incorrect.', 'error');
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecoveryPassword.trim() || newRecoveryPassword.length < 6) {
      triggerAlert('Password must be at least 6 characters.', 'error');
      return;
    }

    const savedOverrides = JSON.parse(localStorage.getItem('techsetu-auth-overrides') || '{}');
    savedOverrides[recoveryEmail] = newRecoveryPassword;
    localStorage.setItem('techsetu-auth-overrides', JSON.stringify(savedOverrides));

    // Also update localized storage if exists
    const localUsers = JSON.parse(localStorage.getItem('techsetu-local-users') || '{}');
    if (localUsers[recoveryEmail]) {
      localUsers[recoveryEmail].password = newRecoveryPassword;
      localStorage.setItem('techsetu-local-users', JSON.stringify(localUsers));
    }

    setEmailInput(recoveryEmail);
    setPasswordInput(newRecoveryPassword);

    setRecoveryStep(1);
    setRecoveryEmail('');
    setRecoveryCode('');
    setNewRecoveryPassword('');
    setSimulatedCode('');
    setAuthMode('login');

    triggerAlert('Access Key updated successfully! Please login with your new password.', 'success');
  };

  // Google Fast Auth Sign-In / Sign-Up Handshake
  const handleGoogleLogin = async (email: string, displayName: string) => {
    setAuthError(null);
    setIsAuthenticating(true);
    setShowGoogleModal(false);

    const mockPassword = `GoogleUserAuthPassWord99#_${email}`;

    try {
      // 1. Try to log in
      let response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: mockPassword })
      }, 4000);

      if (!response.ok) {
        // 2. If login fails, try to sign up (register)
        const signupResponse = await fetchWithTimeout(`${API_BASE_URL}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: displayName, email, password: mockPassword })
        }, 4000);

        if (signupResponse.ok) {
          // Retry login
          response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: mockPassword })
          }, 4000);
        } else {
          const errData = await signupResponse.json().catch(() => ({ error: 'Auto-registration failed.' }));
          throw new Error(errData.error || 'Failed to auto-register Google account.');
        }
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('techsetu-jwt', data.token);
        localStorage.setItem('techsetu-username', data.name);
        localStorage.setItem('techsetu-email', data.email);
        setJwtToken(data.token);
        setUserName(data.name);
        showToast(`Google session verified. Welcome, ${data.name}!`);
      } else {
        throw new Error('Google Authentication handshake failed.');
      }
    } catch (err: any) {
      console.warn('Google backend handshake failed. Proceeding with local sandbox login.');
      localStorage.setItem('techsetu-jwt', 'local-google-token');
      localStorage.setItem('techsetu-username', displayName);
      localStorage.setItem('techsetu-email', email);
      setJwtToken('local-google-token');
      setUserName(displayName);
      showToast(`Google sandbox login complete. Welcome, ${displayName}!`);
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

        {/* Floating animated alert notification */}
        {alert && (
          <div className={`floating-alert floating-alert-${alert.type} animate-slide-in`}>
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {alert.type === 'error' ? '❌' : alert.type === 'success' ? '✅' : 'ℹ️'}
              </span>
              <span className="text-xs font-bold text-white leading-tight">{alert.message}</span>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-[14px] text-white/50 hover:text-white bg-transparent border-none p-0 cursor-pointer ml-3 font-bold"
            >
              ×
            </button>
          </div>
        )}

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

          {authMode !== 'forgot' && (
            <div className="auth-tabs mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
              >
                Create Account
              </button>
            </div>
          )}

          {authMode === 'login' && (
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
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[var(--accent-secondary)]" /> Access Key / Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setRecoveryStep(1); setAuthError(null); }}
                    className="text-[9px] text-[var(--accent-primary)] hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <button type="submit" disabled={isAuthenticating} className="btn-primary w-full cursor-pointer py-2.5">
                {isAuthenticating ? 'Authorizing Node...' : 'Access Workspace'}
              </button>
            </form>
          )}

          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="landing-input-group">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <User className="w-3 h-3 text-[var(--accent-primary)]" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="Atul Verma"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>

              <div className="landing-input-group">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[var(--accent-secondary)]" /> Email Address
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
                  <Lock className="w-3 h-3 text-[var(--accent-tertiary)]" /> Access Key / Password
                </label>
                <input
                  type="password"
                  placeholder="•••••••• (Min. 6 chars)"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <div className="landing-input-group">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[var(--accent-tertiary)]" /> Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={isAuthenticating} className="btn-primary w-full cursor-pointer py-2.5">
                {isAuthenticating ? 'Creating Account...' : 'Sign Up Node'}
              </button>
            </form>
          )}

          {authMode === 'forgot' && (
            <div className="space-y-4 text-left">
              <h2 className="text-sm font-black uppercase text-[var(--text-primary)] border-b border-white/5 pb-2 mb-2 flex items-center gap-1.5">
                🔒 Security Recovery Protocol
              </h2>
              
              {recoveryStep === 1 && (
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Enter your registered email address below. We will transmit a 6-digit cryptographic handshake reset code.
                  </p>
                  <div className="landing-input-group">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Email Address</label>
                    <input
                      type="text"
                      placeholder="developer@techsetu.com"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={isAuthenticating} className="btn-primary w-full cursor-pointer py-2.5">
                    {isAuthenticating ? 'Generating Reset Code...' : 'Send Recovery Code'}
                  </button>
                </form>
              )}

              {recoveryStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <p className="text-[11px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-lg leading-relaxed">
                    Cryptographic key dispatched! Enter the 6-digit verification code below to authorize security overrides.
                  </p>
                  <div className="landing-input-group">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">6-Digit Code</label>
                    <input
                      type="text"
                      placeholder="Enter code"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full cursor-pointer py-2.5">
                    Verify Code & Authorize
                  </button>
                </form>
              )}

              {recoveryStep === 3 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Authorization verified. Choose a new secure Access Key / Password to connect to your workspace node.
                  </p>
                  <div className="landing-input-group">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">New Password</label>
                    <input
                      type="password"
                      placeholder="•••••••• (Min. 6 chars)"
                      required
                      value={newRecoveryPassword}
                      onChange={(e) => setNewRecoveryPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full cursor-pointer py-2.5">
                    Save New Access Key
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setRecoveryStep(1); }}
                  className="text-[10px] text-[var(--text-muted)] hover:text-white transition-all cursor-pointer underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

          {authMode !== 'forgot' && (
            <>
              {/* Google Sign-in button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="google-signin-btn-main w-full flex items-center justify-center gap-2.5 py-2.5 mt-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 text-xs font-bold text-white transition-all cursor-pointer shadow-md hover:border-white/12"
              >
                <svg className="shrink-0" style={{ width: '16px', height: '16px', display: 'block' }} viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.72 5.72 0 0 1 8.24 12.87a5.72 5.72 0 0 1 5.751-5.73 5.59 5.59 0 0 1 3.93 1.575l3.05-3.05A9.97 9.97 0 0 0 13.99 2.22 10.02 10.02 0 0 0 4 12.23a10.02 10.02 0 0 0 10.01 10.01 9.87 9.87 0 0 0 9.91-10.01c0-.663-.06-1.285-.18-1.945H12.24z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>

              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[9px] text-[var(--text-muted)] uppercase font-bold">Or</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>
            </>
          )}

          <button onClick={handleGuestExplore} className="btn-secondary w-full cursor-pointer py-2">
            Explore Demo Environment
          </button>
        </div>

        {/* Google Account Chooser Modal */}
        {showGoogleModal && (
          <div className="google-modal-overlay">
            <div className="google-modal-card">
              <div className="google-modal-header">
                <svg className="w-5 h-5 mx-auto mb-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <h3 className="google-modal-title">Sign in with Google</h3>
                <p className="google-modal-subtitle">Choose an account to continue to TechSetu OS</p>
              </div>

              <div className="google-accounts-list">
                <button
                  onClick={() => handleGoogleLogin("vatulrana104@gmail.com", "Atul Verma")}
                  className="google-account-item"
                >
                  <div className="google-avatar">
                    <span>AV</span>
                  </div>
                  <div className="google-account-details">
                    <span className="google-account-name">Atul Verma</span>
                    <span className="google-account-email">vatulrana104@gmail.com</span>
                  </div>
                </button>

                <button
                  onClick={() => handleGoogleLogin("atulrana.work@gmail.com", "Atul Rana")}
                  className="google-account-item"
                >
                  <div className="google-avatar google-avatar-blue">
                    <span>AR</span>
                  </div>
                  <div className="google-account-details">
                    <span className="google-account-name">Atul Rana</span>
                    <span className="google-account-email">atulrana.work@gmail.com</span>
                  </div>
                </button>
              </div>

              <div className="google-custom-account">
                <span className="google-custom-title">Or use another account:</span>
                <div className="flex gap-2 mt-1.5">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="google-custom-input"
                  />
                  <button
                    onClick={() => {
                      if (customGoogleEmail.trim() && customGoogleEmail.includes("@")) {
                        const baseName = customGoogleEmail.split("@")[0];
                        const formattedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
                        handleGoogleLogin(customGoogleEmail.trim(), formattedName);
                      } else {
                        showToast("Please enter a valid email address.");
                      }
                    }}
                    className="google-custom-btn"
                  >
                    Next
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowGoogleModal(false)}
                className="google-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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
        <div className="sidebar-wrapper">
          <div className="sidebar-top">
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
          </div>

          {/* Sidebar Menu items */}
          <nav className="sidebar-menu">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`sidebar-item ${view === 'dashboard' ? 'sidebar-item-active' : ''}`}
                title="Operations Hub - See my stats, daily trends, and overall growth"
              >
                <Activity className="w-4 h-4 shrink-0 text-sky-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Space Dashboard 🏠' : 'Operations Hub'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('tasks')}
                className={`sidebar-item ${view === 'tasks' ? 'sidebar-item-active' : ''}`}
                title="AI Task Manager - Write my play and study checklists"
              >
                <CheckSquare className="w-4 h-4 shrink-0 text-emerald-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My To-Do Stars ⭐' : 'AI Task Manager'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('calendar')}
                className={`sidebar-item ${view === 'calendar' ? 'sidebar-item-active' : ''}`}
                title="Smart Scheduler - View dates and times for play and work"
              >
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Play Calendar 📅' : 'Smart Scheduler'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('goals')}
                className={`sidebar-item ${view === 'goals' ? 'sidebar-item-active' : ''}`}
                title="AI Goal Tracker - Write my wishes and lifetime dreams"
              >
                <Target className="w-4 h-4 shrink-0 text-pink-500" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Big Dreams 🎯' : 'AI Goal Tracker'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('planner')}
                className={`sidebar-item ${view === 'planner' ? 'sidebar-item-active' : ''}`}
                title="Daily Planner - Plan my morning play and night reflections"
              >
                <Sun className="w-4 h-4 shrink-0 text-yellow-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Day Plan ☀️' : 'Daily Planner'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('habits')}
                className={`sidebar-item ${view === 'habits' ? 'sidebar-item-active' : ''}`}
                title="Habits Hub - Build daily habits streaks"
              >
                <Flame className="w-4 h-4 shrink-0 text-orange-500 animate-pulse" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Daily Habits 🍀' : 'Habit Hub'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('focus')}
                className={`sidebar-item ${view === 'focus' ? 'sidebar-item-active' : ''}`}
                title="Focus Engine - Run Pomodoro study timer with fun music sounds"
              >
                <Zap className="w-4 h-4 shrink-0 text-purple-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Focus Timer ⏱️' : 'Focus Engine'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('ai')}
                className={`sidebar-item ${view === 'ai' ? 'sidebar-item-active' : ''}`}
                title="AI Co-Pilots - Talk to my intelligent robot friends"
              >
                <Bot className="w-4 h-4 shrink-0 text-teal-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My AI Friends 🤖' : 'AI Co-Pilots'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('docs')}
                className={`sidebar-item ${view === 'docs' ? 'sidebar-item-active' : ''}`}
                title="Second Brain - Write notes and documents"
              >
                <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Notebook 📝' : 'Second Brain'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('workspaces')}
                className={`sidebar-item ${view === 'workspaces' ? 'sidebar-item-active' : ''}`}
                title="Workspaces - Chat with team members and friends"
              >
                <Layers className="w-4 h-4 shrink-0 text-indigo-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Team Chat 🤝' : 'Workspaces'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('life')}
                className={`sidebar-item ${view === 'life' ? 'sidebar-item-active' : ''}`}
                title="Life Manager - Track books, meal plans, and piggybank savings"
              >
                <Compass className="w-4 h-4 shrink-0 text-rose-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Wish & Cash 💰' : 'Life Manager'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('automation')}
                className={`sidebar-item ${view === 'automation' ? 'sidebar-item-active' : ''}`}
                title="Automation Lab - Create trigger-action zaps"
              >
                <Cpu className="w-4 h-4 shrink-0 text-green-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Magic Actions ⚡' : 'Automation Lab'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('gamification')}
                className={`sidebar-item ${view === 'gamification' ? 'sidebar-item-active' : ''}`}
                title="Gamification - Check XP points, levels, and leaderboards"
              >
                <Trophy className="w-4 h-4 shrink-0 text-amber-500" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'My Levels & Badges 🏆' : 'Gamification'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('kids')}
                className={`sidebar-item ${view === 'kids' ? 'sidebar-item-active' : ''}`}
                title="Kids Game Lab - Design and play custom 3D games"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-pink-400 animate-pulse" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Kids Game Lab 🎮' : '3D Play & Build 🎨'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('demo')}
                className={`sidebar-item ${view === 'demo' ? 'sidebar-item-active' : ''}`}
                title="System Tour & Interactive Demo - Learn how to use all features"
              >
                <Compass className="w-4 h-4 shrink-0 text-cyan-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'App Demo Tour 🧭' : 'Interactive Tour & Demo'}</span>}
              </button>

              <button
                onClick={() => handleNavClick('system')}
                className={`sidebar-item ${view === 'system' ? 'sidebar-item-active' : ''}`}
                title="System Settings - Change user profile and interface themes"
              >
                <Settings className="w-4 h-4 shrink-0 text-gray-400" />
                {!isSidebarCollapsed && <span>{isEasyMode ? 'Settings & Themes ⚙️' : 'System & Connect'}</span>}
              </button>
            </nav>

          {/* User profile dock inside sidebar */}
          <div className="sidebar-bottom">
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
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="mobile-toggle p-1.5 mr-2 bg-white/4 hover:bg-white/8 border border-white/8 rounded-lg text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title="Toggle Sidebar Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
          
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
            <div className="relative">
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="btn-secondary text-[10px] p-2 flex items-center justify-center cursor-pointer rounded-xl hover:text-[var(--accent-primary)] transition-all"
                title="Choose Design Theme"
              >
                <Smile className="w-4 h-4 text-[var(--accent-primary)]" />
              </button>
              
              {isThemeOpen && (
                <div className="absolute right-0 mt-1.5 w-44 glass-card bg-[var(--bg-secondary)] border border-[var(--border-color)] py-1.5 rounded-xl z-30 shadow-2xl animate-scale-in">
                  <span className="px-3 py-1 text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">Design Theme</span>
                  <button 
                    onClick={() => { setTheme('obsidian-aurora'); setIsThemeOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[var(--text-primary)] hover:text-[var(--accent-primary)] flex items-center justify-between cursor-pointer"
                  >
                    <span>Obsidian Aurora</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00f0b5]" />
                  </button>
                  <button 
                    onClick={() => { setTheme('cyber-silver'); setIsThemeOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[var(--text-primary)] hover:text-sky-400 flex items-center justify-between cursor-pointer"
                  >
                    <span>Cyber Silver</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                  </button>
                  <button 
                    onClick={() => { setTheme('solar-flare'); setIsThemeOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-[var(--text-primary)] hover:text-orange-500 flex items-center justify-between cursor-pointer"
                  >
                    <span>Solar Flare</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
                  </button>
                </div>
              )}
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
