import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User, Plus, LayoutGrid, CalendarRange } from 'lucide-react';
import type { Task } from './KanbanBoard';

interface CalendarPlannerProps {
  tasks: Task[];
  onAddTaskClick: () => void;
}

export const CalendarPlanner: React.FC<CalendarPlannerProps> = ({ tasks, onAddTaskClick }) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed, so 5 is June)
  const [selectedDay, setSelectedDay] = useState<number | null>(28); // Default to current day
  const [plannerMode, setPlannerMode] = useState<'month' | 'timeline'>('month');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // June 2026 details: June 1, 2026 starts on Monday. It has 30 days.
  // Get days of the month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get starting day index of the month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Helper to check if a task is due on a specific year-month-day
  const getTasksForDate = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(null);
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-2 border-red-400';
      case 'medium': return 'border-l-2 border-amber-400';
      case 'low': return 'border-l-2 border-emerald-400';
      default: return 'border-l-2 border-slate-500';
    }
  };

  // Generate date array for the month grid
  const daysArray: (number | null)[] = [];
  // Fill initial blanks
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Fill month dates
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i);
  }

  // Next 7 days list for Gantt view
  const getNext7Days = () => {
    const arr = [];
    const date = new Date(currentYear, currentMonth, selectedDay || 28);
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + i);
      arr.push(nextDate);
    }
    return arr;
  };

  const ganttDates = getNext7Days();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[550px]">
      
      {/* Left Column: Calendar Grid / Gantt Timeline */}
      <div className="md:col-span-2 glass-card bg-white/2 border border-white/5 flex flex-col h-full overflow-hidden">
        
        {/* Toggle Mode controls */}
        <div className="px-4 py-3 border-b border-white/5 bg-black/15 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4.5 h-4.5 text-[var(--accent-primary)]" />
            <h3 className="text-xs font-bold text-[var(--text-primary)]">Workspace Scheduler</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPlannerMode('month')}
              className={`text-[10px] py-1 px-2.5 rounded flex items-center gap-1 transition-all ${
                plannerMode === 'month'
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                  : 'bg-white/2 border border-white/4 text-[var(--text-secondary)] hover:bg-white/4'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Monthly Grid
            </button>
            <button
              onClick={() => setPlannerMode('timeline')}
              className={`text-[10px] py-1 px-2.5 rounded flex items-center gap-1 transition-all ${
                plannerMode === 'timeline'
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20'
                  : 'bg-white/2 border border-white/4 text-[var(--text-secondary)] hover:bg-white/4'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" /> Gantt Timeline
            </button>
          </div>
        </div>

        {plannerMode === 'month' ? (
          /* Monthly Grid View */
          <div className="p-4 flex-1 flex flex-col justify-between">
            {/* Header navigator */}
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div className="flex items-center space-x-1">
                <button onClick={handlePrevMonth} className="p-1 bg-white/4 hover:bg-white/8 border border-white/8 rounded">
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button onClick={handleNextMonth} className="p-1 bg-white/4 hover:bg-white/8 border border-white/8 rounded">
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Grid days */}
            <div className="grid grid-cols-7 gap-1.5 flex-1 items-stretch">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] uppercase font-bold text-[var(--text-muted)] py-1">
                  {d}
                </div>
              ))}

              {daysArray.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="bg-transparent" />;
                }

                const dayTasks = getTasksForDate(day);
                const isSelected = selectedDay === day;

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDay(day)}
                    className={`rounded-xl p-2 cursor-pointer transition-all flex flex-col justify-between border ${
                      isSelected 
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5' 
                        : 'border-white/4 bg-black/15 hover:border-white/12 hover:bg-white/2'
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${
                      isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                    }`}>
                      {day}
                    </span>

                    {/* Task dot badges */}
                    <div className="flex gap-1 mt-2.5 overflow-hidden">
                      {dayTasks.map(t => (
                        <span
                          key={t.id}
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          title={t.title}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Gantt Timeline view */
          <div className="p-4 flex-1 flex flex-col justify-start space-y-4 overflow-y-auto no-scrollbar">
            <div className="text-xs text-[var(--text-secondary)] font-medium border-b border-white/5 pb-2">
              Showing horizontal gantt timelines from {monthNames[currentMonth]} {selectedDay || 28}, {currentYear}
            </div>

            <div className="space-y-4">
              {tasks.map(task => {
                // Check if task is within the next 7 days range
                const taskDate = new Date(task.dueDate);
                const startRange = ganttDates[0];
                const endRange = ganttDates[6];

                const isWithinRange = taskDate >= startRange && taskDate <= endRange;
                if (!isWithinRange) return null;

                const dayIdx = ganttDates.findIndex(d => d.getDate() === taskDate.getDate() && d.getMonth() === taskDate.getMonth());

                return (
                  <div key={task.id} className="grid grid-cols-7 gap-2 items-center bg-black/15 border border-white/4 p-3 rounded-xl">
                    <div className="col-span-2 leading-tight pr-2">
                      <h4 className="text-[11px] font-bold text-[var(--text-primary)] truncate">{task.title}</h4>
                      <span className="text-[9px] text-[var(--text-muted)] font-mono">{task.assignedTo}</span>
                    </div>

                    <div className="col-span-5 grid grid-cols-7 h-5 bg-white/2 rounded border border-white/4 relative overflow-hidden">
                      {/* Highlighted Gantt Bar on the specific date column */}
                      {dayIdx !== -1 && (
                        <div
                          className={`absolute top-1 bottom-1 rounded shadow-sm opacity-85 ${
                            task.priority === 'high' 
                              ? 'bg-red-500' 
                              : task.priority === 'medium' 
                                ? 'bg-amber-500' 
                                : 'bg-emerald-500'
                          }`}
                          style={{
                            left: `${(dayIdx / 7) * 100}%`,
                            width: `${100 / 7}%`
                          }}
                          title={`Due Date: ${task.dueDate}`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Legend column headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-[8.5px] uppercase font-mono text-[var(--text-muted)] pt-2 border-t border-white/5">
              <div className="col-span-2" />
              {ganttDates.map((d, idx) => (
                <div key={idx}>
                  {d.toLocaleDateString([], { weekday: 'short' })}<br/>{d.getDate()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Day Details Panel */}
      <div className="md:col-span-1 glass-card bg-white/2 border border-white/5 p-4.5 flex flex-col h-full justify-between">
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[9px] uppercase font-mono text-[var(--text-muted)] tracking-wider block">Inspecting timeline</span>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">
              {selectedDay !== null 
                ? `${monthNames[currentMonth]} ${selectedDay}, ${currentYear}` 
                : 'Select a Date'}
            </h4>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar">
            {selectedDay === null ? (
              <p className="text-[10px] text-[var(--text-muted)] italic text-center py-10">Select a day in the calendar grid to audit task deadlines.</p>
            ) : getTasksForDate(selectedDay).length === 0 ? (
              <p className="text-[10px] text-[var(--text-muted)] italic text-center py-10">No workspace task deadlines mapped to this date node.</p>
            ) : (
              getTasksForDate(selectedDay).map(task => (
                <div key={task.id} className={`p-3 bg-black/25 border border-white/4 rounded-xl space-y-2 ${getPriorityBorder(task.priority)}`}>
                  <h5 className="text-[11px] font-bold text-[var(--text-primary)]">{task.title}</h5>
                  <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{task.description}</p>
                  
                  <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)] pt-1.5 border-t border-white/4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-[var(--accent-primary)]" />
                      <span>{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--accent-tertiary)]" />
                      <span className="capitalize">{task.column}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={onAddTaskClick}
          className="btn-primary w-full text-[10px] py-2 px-3 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> Map Task to Timeline
        </button>
      </div>

    </div>
  );
};
