import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Calendar, User } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  description: string;
  column: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  onTasksChange: (value: React.SetStateAction<Task[]>) => void;
  userName?: string;
  showAddTaskModal: boolean;
  setShowAddTaskModal: (show: boolean) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTasksChange,
  showAddTaskModal,
  setShowAddTaskModal
}) => {
  const [filterText, setFilterText] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  // New task form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newColumn, setNewColumn] = useState<Task['column']>('backlog');
  const [newAssignee, setNewAssignee] = useState('Atul Verma');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);

  const columns: { id: Task['column']; title: string; color: string }[] = [
    { id: 'backlog', title: 'Backlog / Ideas', color: 'border-t-2 border-slate-500' },
    { id: 'in-progress', title: 'In Progress', color: 'border-t-2 border-[var(--accent-primary)]' },
    { id: 'review', title: 'Quality Review', color: 'border-t-2 border-[var(--accent-tertiary)]' },
    { id: 'done', title: 'Completed', color: 'border-t-2 border-[var(--accent-secondary)]' }
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetCol: Task['column']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onTasksChange(prev => prev.map(t => t.id === taskId ? { ...t, column: targetCol } : t));
    }
  };

  const handleMoveLeft = (taskId: string, currentCol: Task['column']) => {
    const colOrder: Task['column'][] = ['backlog', 'in-progress', 'review', 'done'];
    const idx = colOrder.indexOf(currentCol);
    if (idx > 0) {
      const targetCol = colOrder[idx - 1];
      onTasksChange(prev => prev.map(t => t.id === taskId ? { ...t, column: targetCol } : t));
    }
  };

  const handleMoveRight = (taskId: string, currentCol: Task['column']) => {
    const colOrder: Task['column'][] = ['backlog', 'in-progress', 'review', 'done'];
    const idx = colOrder.indexOf(currentCol);
    if (idx < colOrder.length - 1) {
      const targetCol = colOrder[idx + 1];
      onTasksChange(prev => prev.map(t => t.id === taskId ? { ...t, column: targetCol } : t));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    onTasksChange(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle,
      description: newDesc,
      column: newColumn,
      priority: newPriority,
      assignedTo: newAssignee,
      dueDate: newDueDate
    };

    onTasksChange(prev => [...prev, newTask]);
    
    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewColumn('backlog');
    setShowAddTaskModal(false);
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'badge badge-high';
      case 'medium':
        return 'badge badge-medium';
      case 'low':
        return 'badge badge-low';
      default:
        return 'badge';
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(filterText.toLowerCase()) || 
                          task.description.toLowerCase().includes(filterText.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] pulse-dot"></span>
            Workspace Flow Boards
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Drag-and-drop tasks to adjust lifecycle columns.</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search flow tasks..."
            className="w-48 bg-white/4 border border-white/8 text-xs py-1.5 px-3"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          
          <select
            className="bg-white/4 border border-white/8 text-xs py-1.5 px-3"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <button
            onClick={() => setShowAddTaskModal(true)}
            className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Grid columns */}
      <div className="kanban-board flex-1 items-start min-h-[500px]">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.column === col.id);
          return (
            <div
              key={col.id}
              className={`kanban-column`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="kanban-column-header">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {col.title}
                </span>
                <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-[var(--accent-primary)]">
                  {colTasks.length}
                </span>
              </div>

              <div className="kanban-card-list">
                {colTasks.length === 0 ? (
                  <div className="flex-1 border border-dashed border-white/5 rounded-xl flex items-center justify-center p-6 text-center text-[var(--text-muted)] text-[11px] min-h-[100px]">
                    Drag cards here
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="kanban-card group"
                    >
                      {/* Priority and delete */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={getPriorityClass(task.priority)}>
                          {task.priority}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-opacity p-0.5 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Title & Desc */}
                      <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">{task.title}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
                        {task.description}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px] text-[var(--text-muted)] font-mono">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[var(--accent-primary)]" />
                          <span>{task.assignedTo}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--accent-tertiary)]" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>

                      {/* Move controllers */}
                      <div className="flex items-center justify-end gap-1 mt-2.5 pt-1.5 border-t border-dashed border-white/5">
                        {col.id !== 'backlog' && (
                          <button
                            onClick={() => handleMoveLeft(task.id, task.column)}
                            className="p-1 bg-white/5 hover:bg-white/10 rounded cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => handleMoveRight(task.id, task.column)}
                            className="p-1 bg-white/5 hover:bg-white/10 rounded cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setShowAddTaskModal(false)} />
          
          <div className="relative w-full max-w-md glass-card bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[var(--accent-primary)]" /> Create New Workspace Task
            </h3>
            
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Review server performance logs..."
                  className="text-xs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide context and execution goals..."
                  className="text-xs bg-white/3"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Priority</label>
                  <select
                    className="text-xs"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Initial Column</label>
                  <select
                    className="text-xs"
                    value={newColumn}
                    onChange={(e) => setNewColumn(e.target.value as any)}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Assignee</label>
                  <input
                    type="text"
                    placeholder="e.g. Atul Verma"
                    className="text-xs"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Due Date</label>
                  <input
                    type="date"
                    className="text-xs"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="btn-secondary text-xs py-1.5 px-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-1.5 px-4 cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
