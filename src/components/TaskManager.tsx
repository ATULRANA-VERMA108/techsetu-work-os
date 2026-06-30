import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './KanbanBoard';
import type { Task } from './KanbanBoard';
import { 
  Sparkles, 
  List, 
  Kanban, 
  Table, 
  Network, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Brain,
  Zap,
  ChevronDown,
  Layers
} from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onTasksChange: (value: React.SetStateAction<Task[]>) => void;
  userName: string;
  showAddTaskModal: boolean;
  setShowAddTaskModal: (show: boolean) => void;
  onRewardXP: (xp: number) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  onTasksChange,
  userName,
  showAddTaskModal,
  setShowAddTaskModal,
  onRewardXP
}) => {
  const [currentView, setCurrentView] = useState<'kanban' | 'list' | 'table' | 'mindmap'>('kanban');
  const [nlpText, setNlpText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    title: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
    assignedTo: string;
    column: Task['column'];
  } | null>(null);

  const [activeSubtasks, setActiveSubtasks] = useState<Record<string, { text: string; done: boolean }[]>>({});
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState<string | null>(null);

  // Live NLP parsing effect
  useEffect(() => {
    if (!nlpText.trim()) {
      setParsedPreview(null);
      return;
    }

    const text = nlpText.toLowerCase();
    
    // Parse priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (text.includes('high priority') || text.includes('urgent') || text.includes('asap') || text.includes('critical')) {
      priority = 'high';
    } else if (text.includes('low priority') || text.includes('minor') || text.includes('leisure')) {
      priority = 'low';
    }

    // Parse due date
    let dueDate = new Date().toISOString().split('T')[0];
    const today = new Date();
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
    } else if (text.includes('next week') || text.includes('in a week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      dueDate = nextWeek.toISOString().split('T')[0];
    } else if (text.includes('friday')) {
      const nextFriday = new Date(today);
      const currentDay = today.getDay();
      const distance = (5 - currentDay + 7) % 7 || 7;
      nextFriday.setDate(today.getDate() + distance);
      dueDate = nextFriday.toISOString().split('T')[0];
    } else if (text.includes('monday')) {
      const nextMonday = new Date(today);
      const currentDay = today.getDay();
      const distance = (1 - currentDay + 7) % 7 || 7;
      nextMonday.setDate(today.getDate() + distance);
      dueDate = nextMonday.toISOString().split('T')[0];
    }

    // Parse assignee
    let assignedTo = userName || 'Atul Verma';
    if (text.includes('carlos') || text.includes('assign to carlos')) {
      assignedTo = 'Carlos Menendez';
    } else if (text.includes('sarah') || text.includes('assign to sarah')) {
      assignedTo = 'Sarah Chen';
    } else if (text.includes('emily') || text.includes('assign to emily')) {
      assignedTo = 'Emily Taylor';
    }

    // Parse column
    let column: Task['column'] = 'backlog';
    if (text.includes('progress') || text.includes('doing')) {
      column = 'in-progress';
    } else if (text.includes('review') || text.includes('audit')) {
      column = 'review';
    } else if (text.includes('completed') || text.includes('done') || text.includes('finished')) {
      column = 'done';
    }

    // Clean up title text by stripping out keywords
    let title = nlpText;
    const phrasesToRemove = [
      'remind me to',
      'i want to',
      'need to',
      'tomorrow',
      'next week',
      'friday',
      'monday',
      'at high priority',
      'high priority',
      'at low priority',
      'low priority',
      'urgent',
      'asap',
      'assign to carlos',
      'assign to sarah',
      'assign to emily',
      'carlos',
      'sarah',
      'emily'
    ];

    phrasesToRemove.forEach(p => {
      const regex = new RegExp(p, 'gi');
      title = title.replace(regex, '');
    });

    title = title.replace(/\s+/g, ' ').trim();
    if (!title) {
      title = 'New AI Task';
    } else {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    setParsedPreview({
      title,
      priority,
      dueDate,
      assignedTo,
      column
    });
  }, [nlpText, userName]);

  const handleNlpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedPreview) return;

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: parsedPreview.title,
      description: `Auto-generated task via Natural Language Input: "${nlpText}"`,
      column: parsedPreview.column,
      priority: parsedPreview.priority,
      assignedTo: parsedPreview.assignedTo,
      dueDate: parsedPreview.dueDate
    };

    onTasksChange(prev => [...prev, newTask]);
    onRewardXP(15); // Reward XP for creating task via AI NLP
    setNlpText('');
    setParsedPreview(null);
  };

  // Generate AI subtasks simulation
  const handleGenerateSubtasks = (taskId: string, title: string) => {
    setIsGeneratingSubtasks(taskId);
    setTimeout(() => {
      const mockSubtasks = [
        { text: `Research specifications for "${title}"`, done: false },
        { text: `Design modular logic interface`, done: false },
        { text: `Code validation unit tests`, done: false },
        { text: `Conduct peer security review`, done: false }
      ];
      setActiveSubtasks(prev => ({
        ...prev,
        [taskId]: mockSubtasks
      }));
      setIsGeneratingSubtasks(null);
      onRewardXP(10); // Reward XP for leveraging AI Copilot
    }, 1200);
  };

  const toggleSubtask = (taskId: string, index: number) => {
    setActiveSubtasks(prev => {
      const list = [...(prev[taskId] || [])];
      list[index] = { ...list[index], done: !list[index].done };
      
      // If completed all, award extra XP
      if (list.every(s => s.done)) {
        setTimeout(() => onRewardXP(30), 200);
      }
      
      return {
        ...prev,
        [taskId]: list
      };
    });
  };

  const handleTaskDelete = (taskId: string) => {
    onTasksChange(prev => prev.filter(t => t.id !== taskId));
  };

  const updateTaskStatus = (taskId: string, nextCol: Task['column']) => {
    onTasksChange(prev => prev.map(t => t.id === taskId ? { ...t, column: nextCol } : t));
    if (nextCol === 'done') {
      onRewardXP(50); // Completed task reward
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* 1. Smart AI NLP Input Bar */}
      <div className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/40 border border-white/5 rounded-2xl relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-primary)]/5 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-2 text-[var(--accent-primary)] mb-2.5">
          <Sparkles className="w-4 h-4 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider">AI Copilot Natural Language Task Input</span>
        </div>

        <form onSubmit={handleNlpSubmit} className="relative flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. 'Remind me to publish the dashboard prototype tomorrow at high priority assign to Carlos'"
              value={nlpText}
              onChange={(e) => setNlpText(e.target.value)}
              className="w-full bg-black/40 border border-white/8 hover:border-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)] rounded-xl py-3 px-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
            />
            {nlpText && (
              <span className="absolute right-3.5 top-3.5 text-[9px] uppercase font-mono text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-1.5 py-0.5 rounded border border-[var(--accent-primary)]/20 animate-pulse">
                Parsing Input
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={!parsedPreview}
            className={`btn-primary flex items-center justify-center gap-2 text-xs py-3 px-6 rounded-xl cursor-pointer ${
              !parsedPreview ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </form>

        {/* Live parsed preview visualization */}
        {parsedPreview && (
          <div className="mt-4 p-3 bg-black/35 border border-white/6 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-3 text-[10px] font-mono text-[var(--text-secondary)] animate-fade-in">
            <div className="col-span-2">
              <span className="text-[var(--text-muted)] block uppercase font-bold text-[8px]">Extracted Title</span>
              <span className="text-[var(--text-primary)] font-bold truncate block">{parsedPreview.title}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block uppercase font-bold text-[8px]">Priority</span>
              <span className={`font-bold capitalize ${
                parsedPreview.priority === 'high' ? 'text-red-400' : parsedPreview.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}>{parsedPreview.priority}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block uppercase font-bold text-[8px]">Due Date</span>
              <span className="text-sky-400 font-bold block">{parsedPreview.dueDate}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block uppercase font-bold text-[8px]">Assignee</span>
              <span className="text-[var(--accent-primary)] font-bold block">{parsedPreview.assignedTo}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Controls and View toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-base font-black flex items-center gap-2 uppercase tracking-wider text-[var(--text-primary)]">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            AI Task command center
          </h2>
          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Toggle workspaces, list views, and generate subtasks</p>
        </div>

        <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl gap-1 shrink-0 self-start">
          <button
            onClick={() => setCurrentView('kanban')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'kanban' ? 'bg-white/5 text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setCurrentView('list')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'list' ? 'bg-white/5 text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setCurrentView('table')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'table' ? 'bg-white/5 text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Notion Table</span>
          </button>
          <button
            onClick={() => setCurrentView('mindmap')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              currentView === 'mindmap' ? 'bg-white/5 text-[var(--accent-primary)] font-bold' : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Mind Map</span>
          </button>
        </div>
      </div>

      {/* 3. Main Views router */}
      <div className="flex-1 min-h-[500px]">
        {currentView === 'kanban' && (
          <KanbanBoard
            tasks={tasks}
            onTasksChange={onTasksChange}
            userName={userName}
            showAddTaskModal={showAddTaskModal}
            setShowAddTaskModal={setShowAddTaskModal}
          />
        )}

        {currentView === 'list' && (
          <div className="space-y-4 animate-fade-in">
            {['backlog', 'in-progress', 'review', 'done'].map(col => {
              const colTasks = tasks.filter(t => t.column === col);
              return (
                <div key={col} className="glass-card p-4 bg-white/2 border border-white/5">
                  <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        col === 'backlog' ? 'bg-slate-400' : col === 'in-progress' ? 'bg-[var(--accent-primary)]' : col === 'review' ? 'bg-[var(--accent-tertiary)]' : 'bg-[var(--accent-secondary)]'
                      }`} />
                      {col.replace('-', ' ')}
                    </h3>
                    <span className="text-[10px] font-mono text-[var(--accent-primary)] bg-white/5 px-2 py-0.5 rounded-full">{colTasks.length} tasks</span>
                  </div>

                  <div className="space-y-2">
                    {colTasks.length === 0 ? (
                      <p className="text-[10px] text-[var(--text-muted)] italic py-2">No tasks in this lane.</p>
                    ) : (
                      colTasks.map(task => (
                        <div key={task.id} className="p-3 bg-black/20 border border-white/4 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>{task.priority}</span>
                              <h4 className="text-xs font-bold text-white">{task.title}</h4>
                            </div>
                            <p className="text-[10px] text-[var(--text-secondary)]">{task.description}</p>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 text-[10px] font-mono text-[var(--text-muted)]">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                              <span>{task.assignedTo}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[var(--accent-tertiary)]" />
                              <span>{task.dueDate}</span>
                            </div>

                            <div className="flex items-center gap-2 pl-2 border-l border-white/5">
                              <button
                                onClick={() => handleGenerateSubtasks(task.id, task.title)}
                                className="text-[9px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-[var(--accent-primary)]/20 transition-all cursor-pointer"
                              >
                                <Brain className="w-3 h-3" />
                                <span>AI Subtasks</span>
                              </button>
                              <button
                                onClick={() => handleTaskDelete(task.id)}
                                className="p-1 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {currentView === 'table' && (
          <div className="glass-card bg-white/2 border border-white/5 rounded-2xl overflow-x-auto animate-fade-in no-scrollbar">
            <table className="w-full border-collapse text-[11px] font-mono text-left">
              <thead>
                <tr className="bg-black/40 border-b border-white/8 text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="p-3.5 font-bold">Task ID</th>
                  <th className="p-3.5 font-bold">Title</th>
                  <th className="p-3.5 font-bold">Column Status</th>
                  <th className="p-3.5 font-bold">Priority</th>
                  <th className="p-3.5 font-bold">Due Date</th>
                  <th className="p-3.5 font-bold">Assignee</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/2 transition-colors">
                    <td className="p-3.5 text-[var(--text-muted)]">#{task.id}</td>
                    <td className="p-3.5 text-[var(--text-primary)] font-bold">{task.title}</td>
                    <td className="p-3.5 text-[var(--accent-primary)] font-bold">
                      <select
                        value={task.column}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['column'])}
                        className="bg-black/50 border border-white/8 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:border-[var(--accent-primary)]"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Completed</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>{task.priority}</span>
                    </td>
                    <td className="p-3.5 text-sky-400">{task.dueDate}</td>
                    <td className="p-3.5 text-white">{task.assignedTo}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleGenerateSubtasks(task.id, task.title)}
                          className="bg-white/5 hover:bg-white/10 text-[9px] py-1 px-2.5 rounded border border-white/8 text-[var(--text-secondary)] cursor-pointer"
                        >
                          AI Subtasks
                        </button>
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="p-1 hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentView === 'mindmap' && (
          <div className="glass-card p-6 bg-white/2 border border-white/5 rounded-2xl flex flex-col items-center justify-center animate-fade-in relative min-h-[500px] overflow-hidden">
            {/* Holographic grid lines */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent-primary)_0%,transparent_70%)] opacity-[0.03] pointer-events-none" />

            <div className="relative w-full max-w-2xl min-h-[400px] flex items-center justify-center">
              {/* Central Nucleus Node */}
              <div className="absolute z-10 w-28 h-28 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex flex-col items-center justify-center text-center shadow-lg shadow-black border border-white/10 animate-pulse">
                <Brain className="w-6 h-6 text-black mb-1" />
                <span className="text-[10px] font-black uppercase text-black tracking-widest leading-none">WorkOS</span>
                <span className="text-[8px] font-bold text-black/60 uppercase mt-0.5">MindMap</span>
              </div>

              {/* Status Nodes radiating out */}
              {/* Backlog Node */}
              <div className="absolute top-8 left-8 p-3.5 bg-black/40 border border-slate-500/30 rounded-2xl w-44 shadow-md text-left z-10 hover:border-slate-400 transition-colors">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Backlog Ideas</span>
                <div className="space-y-1.5">
                  {tasks.filter(t => t.column === 'backlog').slice(0, 2).map(t => (
                    <div key={t.id} className="text-[9.5px] truncate text-[var(--text-secondary)] border-l-2 border-slate-500 pl-1.5">{t.title}</div>
                  ))}
                  {tasks.filter(t => t.column === 'backlog').length > 2 && (
                    <div className="text-[8px] text-[var(--text-muted)] italic">+{tasks.filter(t => t.column === 'backlog').length - 2} more</div>
                  )}
                </div>
              </div>

              {/* In Progress Node */}
              <div className="absolute top-8 right-8 p-3.5 bg-black/40 border border-[var(--accent-primary)]/20 rounded-2xl w-44 shadow-md text-left z-10 hover:border-[var(--accent-primary)]/50 transition-colors">
                <span className="text-[8px] font-bold text-[var(--accent-primary)] uppercase tracking-widest block mb-1.5">Active Sprint</span>
                <div className="space-y-1.5">
                  {tasks.filter(t => t.column === 'in-progress').slice(0, 2).map(t => (
                    <div key={t.id} className="text-[9.5px] truncate text-[var(--text-secondary)] border-l-2 border-[var(--accent-primary)] pl-1.5">{t.title}</div>
                  ))}
                  {tasks.filter(t => t.column === 'in-progress').length > 2 && (
                    <div className="text-[8px] text-[var(--text-muted)] italic">+{tasks.filter(t => t.column === 'in-progress').length - 2} more</div>
                  )}
                </div>
              </div>

              {/* Quality Review Node */}
              <div className="absolute bottom-8 left-8 p-3.5 bg-black/40 border border-[var(--accent-tertiary)]/20 rounded-2xl w-44 shadow-md text-left z-10 hover:border-[var(--accent-tertiary)]/50 transition-colors">
                <span className="text-[8px] font-bold text-[var(--accent-tertiary)] uppercase tracking-widest block mb-1.5">Quality Audit</span>
                <div className="space-y-1.5">
                  {tasks.filter(t => t.column === 'review').slice(0, 2).map(t => (
                    <div key={t.id} className="text-[9.5px] truncate text-[var(--text-secondary)] border-l-2 border-[var(--accent-tertiary)] pl-1.5">{t.title}</div>
                  ))}
                  {tasks.filter(t => t.column === 'review').length > 2 && (
                    <div className="text-[8px] text-[var(--text-muted)] italic">+{tasks.filter(t => t.column === 'review').length - 2} more</div>
                  )}
                </div>
              </div>

              {/* Completed Node */}
              <div className="absolute bottom-8 right-8 p-3.5 bg-black/40 border border-[var(--accent-secondary)]/20 rounded-2xl w-44 shadow-md text-left z-10 hover:border-[var(--accent-secondary)]/50 transition-colors">
                <span className="text-[8px] font-bold text-[var(--accent-secondary)] uppercase tracking-widest block mb-1.5">Done & Locked</span>
                <div className="space-y-1.5">
                  {tasks.filter(t => t.column === 'done').slice(0, 2).map(t => (
                    <div key={t.id} className="text-[9.5px] truncate text-[var(--text-secondary)] border-l-2 border-[var(--accent-secondary)] pl-1.5">{t.title}</div>
                  ))}
                  {tasks.filter(t => t.column === 'done').length > 2 && (
                    <div className="text-[8px] text-[var(--text-muted)] italic">+{tasks.filter(t => t.column === 'done').length - 2} more</div>
                  )}
                </div>
              </div>

              {/* Connecting lines via SVG */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '400px' }}>
                {/* Backlog Line */}
                <line x1="22%" y1="20%" x2="50%" y2="50%" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3,3" />
                {/* In Progress Line */}
                <line x1="78%" y1="20%" x2="50%" y2="50%" stroke="var(--accent-primary)" strokeWidth="1.5" />
                {/* Review Line */}
                <line x1="22%" y1="80%" x2="50%" y2="50%" stroke="var(--accent-tertiary)" strokeWidth="1.5" />
                {/* Completed Line */}
                <line x1="78%" y1="80%" x2="50%" y2="50%" stroke="var(--accent-secondary)" strokeWidth="1" strokeDasharray="3,3" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* 4. Subtasks details card overlays */}
      <div className="space-y-4">
        {tasks.map(task => {
          const subtasks = activeSubtasks[task.id] || [];
          if (subtasks.length === 0 && !isGeneratingSubtasks) return null;

          return (
            <div key={`sub-${task.id}`} className="glass-card p-4.5 bg-black/35 border border-white/5 rounded-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-xs font-bold text-white">AI Subtask Checklist: {task.title}</h4>
                </div>
                <button
                  onClick={() => setActiveSubtasks(prev => {
                    const next = { ...prev };
                    delete next[task.id];
                    return next;
                  })}
                  className="text-[9px] uppercase font-mono text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                >
                  Clear Checklist
                </button>
              </div>

              {isGeneratingSubtasks === task.id ? (
                <div className="flex items-center gap-2 py-4 text-[10px] font-mono text-[var(--accent-primary)] animate-pulse">
                  <Zap className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Copilot generating subtask tree structure...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {subtasks.map((sub, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleSubtask(task.id, idx)}
                      className={`p-3 bg-black/40 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        sub.done ? 'border-emerald-500/20 opacity-60' : 'border-white/4 hover:border-white/12'
                      }`}
                    >
                      <span className={`text-[10px] ${sub.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]'}`}>
                        {sub.text}
                      </span>
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        sub.done ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'border-white/20'
                      }`}>
                        {sub.done && '✓'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
