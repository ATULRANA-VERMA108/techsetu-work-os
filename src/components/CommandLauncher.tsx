import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, Kanban, Bot, FileText, Activity, ShieldAlert, Cpu, Palette, Command, Settings, Calendar } from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  setView: (view: string) => void;
  setTheme: (theme: string) => void;
  onAddTaskClick: () => void;
}

export const CommandLauncher: React.FC<CommandLauncherProps> = ({
  isOpen,
  onClose,
  setView,
  setTheme,
  onAddTaskClick
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    {
      id: 'view-dashboard',
      title: 'Navigate to Operations Dashboard',
      category: 'Navigation',
      shortcut: '↵ DS',
      icon: <Activity className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('dashboard'); onClose(); }
    },
    {
      id: 'view-kanban',
      title: 'Open Flow Boards (Kanban)',
      category: 'Navigation',
      shortcut: '↵ KB',
      icon: <Kanban className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('kanban'); onClose(); }
    },
    {
      id: 'view-ai',
      title: 'Launch Unified AI Hub & Agents',
      category: 'Navigation',
      shortcut: '↵ AI',
      icon: <Bot className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('ai'); onClose(); }
    },
    {
      id: 'view-docs',
      title: 'Open Collaborative Doc Workspace',
      category: 'Navigation',
      shortcut: '↵ DC',
      icon: <FileText className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('docs'); onClose(); }
    },
    {
      id: 'view-pulse',
      title: 'Check Live Collaboration Pulse',
      category: 'Navigation',
      shortcut: '↵ PL',
      icon: <ShieldAlert className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('pulse'); onClose(); }
    },
    {
      id: 'view-stats',
      title: 'Open System Telemetry & Performance',
      category: 'Navigation',
      shortcut: '↵ ST',
      icon: <Cpu className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('stats'); onClose(); }
    },
    {
      id: 'view-settings',
      title: 'Open Workspace Settings & Flags',
      category: 'Navigation',
      shortcut: '↵ SE',
      icon: <Settings className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('settings'); onClose(); }
    },
    {
      id: 'view-calendar',
      title: 'Open Workspace Calendar & Timeline Planner',
      category: 'Navigation',
      shortcut: '↵ CL',
      icon: <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setView('calendar'); onClose(); }
    },
    {
      id: 'task-add',
      title: 'Create New Task on Flow Board',
      category: 'Actions',
      shortcut: '⌘ N',
      icon: <Terminal className="w-4 h-4 text-[var(--accent-secondary)]" />,
      action: () => { onAddTaskClick(); onClose(); }
    },
    {
      id: 'theme-aurora',
      title: 'Activate Theme: Obsidian Aurora (Mint/Coral)',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-[var(--accent-primary)]" />,
      action: () => { setTheme('obsidian-aurora'); onClose(); }
    },
    {
      id: 'theme-silver',
      title: 'Activate Theme: Cyber Silver (Stark/Ice)',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-sky-400" />,
      action: () => { setTheme('cyber-silver'); onClose(); }
    },
    {
      id: 'theme-solar',
      title: 'Activate Theme: Solar Flare (Amber/Lava)',
      category: 'Appearance',
      icon: <Palette className="w-4 h-4 text-orange-500" />,
      action: () => { setTheme('solar-flare'); onClose(); }
    }
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    // Keep active element in view
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        const listHeight = listRef.current.clientHeight;
        const elemTop = activeEl.offsetTop;
        const elemHeight = activeEl.offsetHeight;
        
        if (elemTop + elemHeight > listRef.current.scrollTop + listHeight) {
          listRef.current.scrollTop = elemTop + elemHeight - listHeight;
        } else if (elemTop < listRef.current.scrollTop) {
          listRef.current.scrollTop = elemTop;
        }
      }
    }
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Search Dialog */}
      <div className="relative w-full max-w-xl glass-card border border-[var(--border-hover)] bg-[var(--bg-secondary)] shadow-2xl rounded-2xl flex flex-col max-h-[450px]">
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--border-color)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none p-0 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 focus:shadow-none"
            placeholder="Type a command or search workspace..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center space-x-1 ml-2">
            <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[var(--text-muted)]">ESC</span>
          </div>
        </div>

        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto py-2 no-scrollbar"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] text-sm">
              <Command className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No commands found for "{search}"
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <div
                key={cmd.id}
                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                  idx === selectedIndex 
                    ? 'bg-white/5 text-[var(--accent-primary)] border-l-2 border-[var(--accent-primary)]' 
                    : 'text-[var(--text-secondary)] hover:bg-white/2 hover:text-[var(--text-primary)] border-l-2 border-transparent'
                }`}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="flex items-center space-x-3">
                  {cmd.icon}
                  <span className="text-sm font-medium">{cmd.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] mr-2">{cmd.category}</span>
                  {cmd.shortcut && (
                    <span className="text-[10px] bg-white/5 border border-white/15 px-1.5 py-0.5 rounded font-mono text-[var(--text-muted)]">
                      {cmd.shortcut}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-black/20 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center space-x-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <div>
            <span>TechSetu Command Center</span>
          </div>
        </div>
      </div>
    </div>
  );
};
