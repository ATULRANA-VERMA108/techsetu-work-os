import React, { useState } from 'react';
import { 
  Layers, 
  Calendar, 
  Grid, 
  TrendingUp, 
  UserCheck, 
  CheckSquare, 
  Database, 
  MessageSquare,
  Milestone,
  Plus,
  Play,
  Pause,
  ListTodo
} from 'lucide-react';
import type { Task } from './KanbanBoard';

interface SaaSIntegrationHubProps {
  tasks: Task[];
  onTasksChange: (value: React.SetStateAction<Task[]>) => void;
  smartsheetRows: any[];
  setSmartsheetRows: React.Dispatch<React.SetStateAction<any[]>>;
  quickbaseTables: Record<string, any[]>;
  setQuickbaseTables: React.Dispatch<React.SetStateAction<Record<string, any[]>>>;
}

export const SaaSIntegrationHub: React.FC<SaaSIntegrationHubProps> = ({
  tasks,
  onTasksChange,
  smartsheetRows,
  setSmartsheetRows,
  quickbaseTables,
  setQuickbaseTables
}) => {
  const [activeSaaS, setActiveSaaS] = useState<string>('monday');

  // Wrike presets
  const WRIKE_TEMPLATES = [
    {
      name: 'Web UI Overhaul Sprint',
      tasks: [
        { title: 'Write grid layout CSS utilities', desc: 'Add responsive polyfills matching flex box setups.', priority: 'high', assignee: 'Atul Verma' },
        { title: 'Design magical entry portal card', desc: 'Setup radial bloom glow containers.', priority: 'medium', assignee: 'Emily Taylor' }
      ]
    },
    {
      name: 'RAG Pipeline Deployment',
      tasks: [
        { title: 'Audit PostgreSQL Hikari connection pools', desc: 'Secure backend active channels.', priority: 'high', assignee: 'Carlos Menendez' },
        { title: 'Index Markdown Wiki doc guidelines', desc: 'Vectorize document workspace uploads.', priority: 'low', assignee: 'Sarah Chen' }
      ]
    }
  ];

  // Bonsai Agency states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [bonsaiInvoices] = useState([
    { id: 'inv-101', client: 'Acme Corp', amount: 3500, status: 'Paid' },
    { id: 'inv-102', client: 'Hedgehog LLC', amount: 1800, status: 'Sent' }
  ]);

  // Quickbase database states
  const [newTableName, setNewTableName] = useState('');
  const [activeTable, setActiveTable] = useState<string>('Inventory');

  // MeisterTask feedback state
  const [meisterComments, setMeisterComments] = useState([
    { user: 'Sarah Chen', text: 'Telemetry sync latency looking solid. Tested on 2s normal update cycle.', time: '2 mins ago' },
    { user: 'Carlos Menendez', text: 'I updated the postgres connections. Hikari connection pool is stable.', time: '1 hr ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  // Nifty milestone tasks mapping
  const MILESTONES = [
    { name: 'Milestone v1.2: RAG Integration', targetDone: 2, key: 'rag' },
    { name: 'Milestone v1.3: Mobile Layouts', targetDone: 4, key: 'mobile' }
  ];

  // Timer runner for Bonsai Resource tracking
  React.useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Add tasks from Wrike templates
  const handleLoadWrikeTemplate = (templateIndex: number) => {
    const selected = WRIKE_TEMPLATES[templateIndex];
    const newTasksList: Task[] = selected.tasks.map((t, idx) => ({
      id: `wrike-${Date.now()}-${idx}`,
      title: t.title,
      description: t.desc,
      column: 'backlog',
      priority: t.priority as any,
      assignedTo: t.assignee,
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    }));

    onTasksChange(prev => [...prev, ...newTasksList]);
    alert(`Loaded ${newTasksList.length} tasks from "${selected.name}" template into Kanban Board!`);
  };

  // Quickbase Add Row / Table
  const handleCreateQuickbaseTable = () => {
    if (!newTableName.trim()) return;
    setQuickbaseTables(prev => ({
      ...prev,
      [newTableName]: []
    }));
    setActiveTable(newTableName);
    setNewTableName('');
  };

  const handleAddQuickbaseRecord = () => {
    const newRec = { id: `rec-${Date.now()}`, timestamp: new Date().toLocaleTimeString(), status: 'Active' };
    setQuickbaseTables(prev => ({
      ...prev,
      [activeTable]: [...(prev[activeTable] || []), newRec]
    }));
  };

  // MeisterTask Add comment
  const handleAddMeisterComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setMeisterComments(prev => [
      { user: 'Atul Verma', text: newComment, time: 'Just now' },
      ...prev
    ]);
    setNewComment('');
  };

  // Smartsheet edits
  const handleSheetCellChange = (index: number, field: string, val: string) => {
    setSmartsheetRows(prev => prev.map((row, idx) => {
      if (idx === index) {
        return { ...row, [field]: val };
      }
      return row;
    }));
  };

  const handleAddSheetRow = () => {
    setSmartsheetRows(prev => [
      ...prev,
      { title: 'New Task Record', cost: 1200, status: 'In Progress', owner: 'Atul Verma' }
    ]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[500px]">
      
      {/* SaaS Hub side switcher */}
      <div className="md:col-span-1 flex flex-col space-y-1 bg-black/20 p-2.5 rounded-2xl border border-white/4">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] p-2">SaaS Suites Connect</span>
        
        {[
          { id: 'monday', label: '1. Monday.com', subtitle: 'Roadmap timeline', icon: <Calendar className="w-4 h-4" /> },
          { id: 'smartsheet', label: '2. Smartsheet', subtitle: 'Grid sheets', icon: <Grid className="w-4 h-4" /> },
          { id: 'wrike', label: '3. Wrike', subtitle: 'Task templates', icon: <ListTodo className="w-4 h-4" /> },
          { id: 'hive', label: '4. Hive', subtitle: 'Marketing funnels', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'bonsai', label: '5. Bonsai Agency', subtitle: 'Resource & tracking', icon: <UserCheck className="w-4 h-4" /> },
          { id: 'zoho', label: '6. Zoho Projects', subtitle: 'Allocation Gantt', icon: <Layers className="w-4 h-4" /> },
          { id: 'clickup', label: '7. ClickUp', subtitle: 'Fields & lanes', icon: <CheckSquare className="w-4 h-4" /> },
          { id: 'quickbase', label: '8. Quickbase', subtitle: 'Custom DB builder', icon: <Database className="w-4 h-4" /> },
          { id: 'meistertask', label: '9. MeisterTask', subtitle: 'Collaboration logs', icon: <MessageSquare className="w-4 h-4" /> },
          { id: 'nifty', label: '10. Nifty', subtitle: 'Milestone tracking', icon: <Milestone className="w-4 h-4" /> }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSaaS(item.id)}
            className={`sidebar-item flex items-center justify-between py-2 px-3 ${
              activeSaaS === item.id ? 'sidebar-item-active' : ''
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              {item.icon}
              <div className="leading-none">
                <span className="text-xs font-semibold block">{item.label}</span>
                <span className="text-[9px] text-[var(--text-muted)]">{item.subtitle}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Main SaaS integration view panel */}
      <div className="md:col-span-3 glass-card bg-white/2 border border-white/5 p-6 flex flex-col justify-between">
        
        <div className="space-y-6">
          
          {/* Monday.com Simulation */}
          {activeSaaS === 'monday' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">Monday.com — Visual Project Roadmaps</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Renders visual phases, sprints timeline, and status bars.</p>
              </div>

              {/* Visual timeline */}
              <div className="space-y-3.5">
                {[
                  { phase: 'Planning / Spec Design', duration: 'Weeks 1-2', progress: 100, color: 'bg-emerald-400' },
                  { phase: 'Vite / CSS Overhaul Development', duration: 'Weeks 2-4', progress: 85, color: 'bg-sky-400' },
                  { phase: 'SaaS Integration Hub Coding', duration: 'Weeks 4-5', progress: 50, color: 'bg-amber-400' },
                  { phase: 'Telemetry Verification & QA', duration: 'Weeks 5-6', progress: 0, color: 'bg-slate-500' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-black/20 p-3 rounded-xl border border-white/4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="leading-tight">
                      <span className="font-semibold text-white block">{item.phase}</span>
                      <span className="text-[9.5px] text-[var(--text-muted)]">{item.duration}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-48">
                      <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className="font-mono text-[10px] w-8 text-right text-white">{item.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smartsheet Simulation */}
          {activeSaaS === 'smartsheet' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">Smartsheet — Scaling Organization Sheets</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">Spreadsheet style cost and resource matrix. Syncs directly with PowerBI RAG burn rates.</p>
                </div>
                <button onClick={handleAddSheetRow} className="btn-primary text-[10px] py-1 px-2.5 flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              {/* Grid sheet */}
              <div className="sheet-container">
                <table className="sheet-table">
                  <thead>
                    <tr>
                      <th className="sheet-th">Task / Resource</th>
                      <th className="sheet-th" style={{ width: '90px' }}>Owner</th>
                      <th className="sheet-th" style={{ width: '90px' }}>Status</th>
                      <th className="sheet-th" style={{ width: '90px' }}>Cost ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {smartsheetRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="sheet-td">
                          <input
                            type="text"
                            value={row.title}
                            onChange={(e) => handleSheetCellChange(idx, 'title', e.target.value)}
                          />
                        </td>
                        <td className="sheet-td">
                          <input
                            type="text"
                            value={row.owner}
                            onChange={(e) => handleSheetCellChange(idx, 'owner', e.target.value)}
                          />
                        </td>
                        <td className="sheet-td">
                          <select
                            value={row.status}
                            onChange={(e) => handleSheetCellChange(idx, 'status', e.target.value)}
                          >
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                          </select>
                        </td>
                        <td className="sheet-td">
                          <input
                            type="number"
                            value={row.cost}
                            onChange={(e) => handleSheetCellChange(idx, 'cost', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary calculations */}
              <div className="flex justify-end text-xs font-bold text-white px-2">
                <span>Sum total consumption: ${smartsheetRows.reduce((acc, row) => acc + (Number(row.cost) || 0), 0)}</span>
              </div>
            </div>
          )}

          {/* Wrike Simulation */}
          {activeSaaS === 'wrike' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">Wrike — Built-in Templates</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Select templates to automatically generate structured tasks inside Kanban board.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {WRIKE_TEMPLATES.map((item, idx) => (
                  <div key={idx} className="bg-black/25 p-4 rounded-xl border border-white/4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white mb-2">{item.name}</h4>
                      <ul className="text-[10px] text-[var(--text-secondary)] space-y-1 mb-4 list-disc pl-4">
                        {item.tasks.map((t, i) => (
                          <li key={i}>{t.title} ({t.priority})</li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleLoadWrikeTemplate(idx)}
                      className="btn-secondary w-full text-[10px] py-1 cursor-pointer"
                    >
                      Load Template Tasks
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hive Simulation */}
          {activeSaaS === 'hive' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">Hive — Digital Marketing Campaign Dashboard</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Simulates campaign click funnels, ROI metrics, and marketing data.</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/20 p-3 rounded-xl border border-white/4 text-center">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Impressions</span>
                  <h4 className="text-lg font-black text-white mt-1">125.4K</h4>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/4 text-center">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Conversion Rate</span>
                  <h4 className="text-lg font-black text-emerald-400 mt-1">4.2%</h4>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/4 text-center">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Campaign Cost</span>
                  <h4 className="text-lg font-black text-white mt-1">$4,800</h4>
                </div>
              </div>

              {/* Marketing lists */}
              <div className="bg-black/20 p-4 rounded-xl border border-white/4 space-y-3">
                <span className="text-[10px] font-bold text-white uppercase block">Active Marketing Campaigns</span>
                {[
                  { name: 'Vite UI Launch Spec', status: 'Running', leads: 420 },
                  { name: 'RAG Document Release Campaign', status: 'Completed', leads: 980 }
                ].map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-xs text-[var(--text-secondary)]">
                    <span>{c.name}</span>
                    <span className="font-mono text-white text-[10px]">{c.leads} leads ({c.status})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bonsai Agency Simulation */}
          {activeSaaS === 'bonsai' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">Bonsai Agency — Resource & Invoicing</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Billable resource hour tracking timers and invoice tracking ledger.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Active timer card */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/4 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Resource billable hour tracker</span>
                    <div className="font-mono text-2xl font-bold text-[var(--accent-primary)] mt-2">
                      {formatTimer(timerSeconds)}
                    </div>
                    <span className="text-[9px] text-[var(--text-muted)]">Tracking: Atul Verma (Development)</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className="btn-primary text-xs py-1 px-3 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                    </button>
                    <button
                      onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}
                      className="btn-secondary text-xs py-1 px-3 cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Invoices list card */}
                <div className="bg-black/20 p-4 rounded-xl border border-white/4 space-y-3">
                  <span className="text-[10px] font-bold text-white uppercase block">Client Invoices status</span>
                  {bonsaiInvoices.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center text-xs text-[var(--text-secondary)] pb-1.5 border-b border-white/5">
                      <span>{inv.client} ({inv.id})</span>
                      <span className={`font-mono text-[10.5px] font-bold ${inv.status === 'Paid' ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-tertiary)]'}`}>
                        ${inv.amount} - {inv.status}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

          {/* Zoho Projects Simulation */}
          {activeSaaS === 'zoho' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">Zoho Projects — Resource Workload Allocations</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Renders Gantt bars mapping resource allocation capacity limits.</p>
              </div>

              <div className="gantt-chart-container">
                <div className="gantt-header">
                  <span>Resource Name</span>
                  <div className="gantt-grid-lines">
                    <span>Idea</span>
                    <span>Prog</span>
                    <span>Review</span>
                    <span>Done</span>
                  </div>
                </div>

                {[
                  { name: 'Atul Verma', startOffset: 25, widthPct: 50, label: 'UI Overhaul', color: 'linear-gradient(135deg, #00f0b5 0%, #38bdf8 100%)' },
                  { name: 'Carlos Menendez', startOffset: 50, widthPct: 25, label: 'Audit DB Leaks', color: 'linear-gradient(135deg, #ffaa2b 0%, #ff4a4a 100%)' },
                  { name: 'Sarah Chen', startOffset: 12, widthPct: 38, label: 'RAG indexing', color: 'linear-gradient(135deg, #38bdf8 0%, #00f0b5 100%)' }
                ].map((res, i) => (
                  <div key={i} className="gantt-row">
                    <span className="text-xs font-semibold text-white">{res.name}</span>
                    <div className="gantt-track">
                      <div
                        className="gantt-bar"
                        style={{
                          left: `${res.startOffset}%`,
                          width: `${res.widthPct}%`,
                          background: res.color
                        }}
                      >
                        <span className="text-[9.5px] truncate max-w-full">{res.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ClickUp Simulation */}
          {activeSaaS === 'clickup' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">ClickUp — Custom Field Task Editor</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Configure tags, assignees, and custom estimation metrics on Kanban items.</p>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/4 space-y-4">
                <span className="text-[10px] font-bold text-white uppercase block">Quick Task custom fields config</span>
                
                <div className="space-y-3.5">
                  {tasks.slice(0, 3).map((t, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-3 border-b border-white/5">
                      <div className="leading-tight flex-1">
                        <span className="font-semibold text-white block">{t.title}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">Due: {t.dueDate}</span>
                      </div>

                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono text-[9px]">
                          Assignee: {t.assignedTo}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px]">
                          Column: {t.column}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quickbase Simulation */}
          {activeSaaS === 'quickbase' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-white">Quickbase — Custom Database Builder</h3>
                  <p className="text-[10px] text-[var(--text-muted)]">Define custom tables and add records. Data reports sync with PowerBI metrics.</p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="New Table Name"
                    className="text-xs w-32 py-1 px-2.5"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                  />
                  <button onClick={handleCreateQuickbaseTable} className="btn-primary text-[10px] py-1 px-3 cursor-pointer">
                    Create
                  </button>
                </div>
              </div>

              {/* Table selectors */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5">
                {Object.keys(quickbaseTables).map(name => (
                  <button
                    key={name}
                    onClick={() => setActiveTable(name)}
                    className={`text-[10px] py-1 px-2.5 rounded-lg border font-bold ${
                      activeTable === name ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-white/2 border-white/5 text-[var(--text-secondary)]'
                    } cursor-pointer`}
                  >
                    {name} ({quickbaseTables[name]?.length || 0})
                  </button>
                ))}
              </div>

              {/* Active table rows display */}
              <div className="bg-black/20 p-4 rounded-xl border border-white/4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white uppercase">Table Records: {activeTable}</span>
                  <button onClick={handleAddQuickbaseRecord} className="btn-secondary text-[10px] py-1 px-2 cursor-pointer">
                    + Insert Row
                  </button>
                </div>

                {(!quickbaseTables[activeTable] || quickbaseTables[activeTable].length === 0) ? (
                  <div className="text-center py-6 text-[var(--text-muted)] text-xs">No records inside this database. Click Insert Row above.</div>
                ) : (
                  <div className="space-y-1.5">
                    {quickbaseTables[activeTable].map((rec, i) => (
                      <div key={i} className="flex justify-between items-center text-xs font-mono text-[var(--text-secondary)] pb-1.5 border-b border-white/5">
                        <span>Record: {rec.id}</span>
                        <span className="text-white">Timestamp: {rec.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MeisterTask Simulation */}
          {activeSaaS === 'meistertask' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">MeisterTask — Team Collaboration Comments</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Mock chat comments log showing collaborative team interaction details.</p>
              </div>

              {/* Comment submission form */}
              <form onSubmit={handleAddMeisterComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask team a question or post comment..."
                  className="text-xs flex-1"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn-primary text-xs py-2 px-4 cursor-pointer">
                  Post
                </button>
              </form>

              {/* Comments feed */}
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {meisterComments.map((comment, i) => (
                  <div key={i} className="bg-black/20 p-3 rounded-xl border border-white/4 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-[var(--accent-primary)]">{comment.user}</span>
                      <span className="text-[var(--text-muted)]">{comment.time}</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nifty Simulation */}
          {activeSaaS === 'nifty' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h3 className="text-base font-bold text-white">Nifty — Milestone Progress Tracker</h3>
                <p className="text-[10px] text-[var(--text-muted)]">Monitors cumulative milestone completion goals against current tasks status.</p>
              </div>

              <div className="space-y-4">
                {MILESTONES.map((milestone, idx) => {
                  const doneCount = tasks.filter(t => t.column === 'done').length;
                  const pct = Math.min(100, Math.round((doneCount / milestone.targetDone) * 100));

                  return (
                    <div key={idx} className="bg-black/20 p-4 rounded-xl border border-white/4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{milestone.name}</span>
                        <span className="text-[var(--accent-primary)] font-mono">{pct}%</span>
                      </div>
                      
                      <div className="bg-white/5 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-sky-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-mono">
                        <span>Status: {pct === 100 ? 'Milestone Cleared' : 'In Progress'}</span>
                        <span>Completed: {doneCount} / {milestone.targetDone} tasks</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
