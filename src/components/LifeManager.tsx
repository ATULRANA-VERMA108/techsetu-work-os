import React, { useState } from 'react';
import { 
  DollarSign, 
  Coffee, 
  BookOpen, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Heart, 
  Zap,
  TrendingUp,
  Grid
} from 'lucide-react';

interface Transaction {
  id: string;
  desc: string;
  amount: number;
  category: 'work' | 'health' | 'food' | 'growth' | 'leisure';
  date: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  progress: number; // percentage
}

interface LifeManagerProps {
  onRewardXP: (xp: number) => void;
}

export const LifeManager: React.FC<LifeManagerProps> = ({ onRewardXP }) => {
  const [lifeTab, setLifeTab] = useState<'finance' | 'meals' | 'reading' | 'vision'>('finance');

  // Finance states
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', desc: 'AWS server cluster deployment cost', amount: 84.50, category: 'work', date: '2026-06-29' },
    { id: 't2', desc: 'Monthly gym nodes fee', amount: 45.00, category: 'health', date: '2026-06-28' },
    { id: 't3', desc: 'Vector database subscription', amount: 19.00, category: 'work', date: '2026-06-26' }
  ]);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCat, setNewCat] = useState<Transaction['category']>('work');

  // Reading states
  const [books, setBooks] = useState<Book[]>([
    { id: 'b1', title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', progress: 60 },
    { id: 'b2', title: 'Atomic Habits', author: 'James Clear', progress: 95 },
    { id: 'b3', title: 'Life 3.0: Being Human in the Age of AI', author: 'Max Tegmark', progress: 35 }
  ]);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');

  // Vision Board states
  const [visions, setVisions] = useState<any[]>([
    { id: 'v1', title: 'Launch TechSetu SaaS Ecosystem', desc: 'Reach v1.0 deployment with 10k monthly active agents.', scale: 'Large' },
    { id: 'v2', title: 'Establish AI RAG Research Lab', desc: 'Pioneer multi-agent orchestration frameworks.', scale: 'Medium' },
    { id: 'v3', title: 'Achieve Peak Physical Fitness', desc: 'Consistent cardiovascular & hydration daily streak loops.', scale: 'Daily' }
  ]);
  const [newVisionTitle, setNewVisionTitle] = useState('');

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount) return;

    const newT: Transaction = {
      id: Math.random().toString(),
      desc: newDesc,
      amount: parseFloat(newAmount),
      category: newCat,
      date: new Date().toISOString().split('T')[0]
    };

    setTransactions(prev => [newT, ...prev]);
    onRewardXP(15); // XP for finance log
    setNewDesc('');
    setNewAmount('');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newB: Book = {
      id: Math.random().toString(),
      title: newBookTitle,
      author: newBookAuthor || 'Unknown Author',
      progress: 0
    };

    setBooks(prev => [...prev, newB]);
    onRewardXP(20); // XP for reading logging
    setNewBookTitle('');
    setNewBookAuthor('');
  };

  const updateBookProgress = (id: string, progress: number) => {
    setBooks(prev => prev.map(b => {
      if (b.id !== id) return b;
      const nextProgress = Math.min(100, Math.max(0, progress));
      if (nextProgress === 100) {
        onRewardXP(50); // Completed reading reward
      }
      return { ...b, progress: nextProgress };
    }));
  };

  const handleAddVision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisionTitle.trim()) return;

    const newV = {
      id: Math.random().toString(),
      title: newVisionTitle,
      desc: 'Formulate action items to hit this vision node milestone.',
      scale: 'Medium'
    };

    setVisions(prev => [newV, ...prev]);
    onRewardXP(30); // XP for manifest vision
    setNewVisionTitle('');
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Navigation & Core Module viewport (span 2) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Module Subtabs */}
        <div className="glass-card p-3 bg-white/2 border border-white/5 rounded-2xl flex flex-wrap gap-1">
          {[
            { id: 'finance', label: 'Expense Tracker', icon: <DollarSign className="w-4 h-4" /> },
            { id: 'meals', label: 'Meal Planner Grid', icon: <Coffee className="w-4 h-4" /> },
            { id: 'reading', label: 'Reading Shelf', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'vision', label: 'Vision Board', icon: <ImageIcon className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setLifeTab(tab.id as any)}
              className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs uppercase font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                lifeTab === tab.id
                  ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 text-white border border-[var(--accent-primary)]/30'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/4'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic viewport */}
        {lifeTab === 'finance' && (
          <div className="space-y-4 animate-fade-in">
            {/* Summary statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass-card p-4.5 bg-white/2 border border-white/5 flex justify-between items-center">
                <div className="leading-tight">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Total Monthly Outflow</span>
                  <h3 className="text-xl font-black text-white font-mono mt-1">${totalExpenses.toFixed(2)}</h3>
                </div>
                <TrendingUp className="w-6 h-6 text-rose-400" />
              </div>

              <div className="glass-card p-4.5 bg-white/2 border border-white/5 flex justify-between items-center">
                <div className="leading-tight">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Active Budget Limit</span>
                  <h3 className="text-xl font-black text-[var(--accent-primary)] font-mono mt-1">$1500.00</h3>
                </div>
                <Heart className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
            </div>

            {/* List transactions */}
            <div className="glass-card bg-white/2 border border-white/5 rounded-2xl overflow-hidden">
              <span className="p-4 border-b border-white/5 block text-xs font-bold text-white uppercase tracking-wider bg-black/15">Transactions Ledger</span>
              <div className="divide-y divide-white/4 max-h-[220px] overflow-y-auto no-scrollbar">
                {transactions.length === 0 ? (
                  <p className="p-4 text-[10px] text-[var(--text-muted)] italic text-center">No finance records logged.</p>
                ) : (
                  transactions.map(t => (
                    <div key={t.id} className="p-3.5 flex justify-between items-center hover:bg-white/2 transition-colors">
                      <div className="leading-tight">
                        <span className="text-xs font-bold text-white block">{t.desc}</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{t.category} • {t.date}</span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-xs font-bold text-rose-400">-${t.amount.toFixed(2)}</span>
                        <button
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="text-[var(--text-muted)] hover:text-red-400 p-0.5 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Transaction Add Form */}
            <form onSubmit={handleAddTransaction} className="glass-card p-4 bg-gradient-to-br from-white/2 to-black/35 border border-white/5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="AWS deployment, meal nodes expense..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-[10px] text-[var(--text-muted)]">$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-white/8 rounded-xl py-1.5 pl-6 pr-3 text-xs text-[var(--text-primary)] focus:outline-none"
                />
              </div>
              <div>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-secondary)] focus:outline-none"
                >
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="food">Food</option>
                  <option value="growth">Growth</option>
                  <option value="leisure">Leisure</option>
                </select>
              </div>
              <button type="submit" className="btn-primary py-1.5 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" /> Log expense
              </button>
            </form>
          </div>
        )}

        {lifeTab === 'meals' && (
          <div className="glass-card p-5 bg-white/2 border border-white/5 rounded-2xl space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">Weekly NutriPlan Grid</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { day: 'Breakfast', menu: 'Oats, blueberries, protein whey, almonds', cal: 450, tag: 'Energy focus' },
                { day: 'Lunch', menu: 'Grilled salmon, brown rice, avocado slots, broccoli', cal: 680, tag: 'Omega high' },
                { day: 'Dinner', menu: 'Tofu stirfry, sweet potato cubes, spinach salad', cal: 500, tag: 'Sleep induction' }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-black/25 border border-white/4 rounded-xl space-y-2">
                  <span className="text-[9px] font-mono text-[var(--accent-primary)] uppercase tracking-wider block font-bold">{item.day}</span>
                  <p className="text-[10.5px] text-[var(--text-primary)] font-semibold leading-relaxed">{item.menu}</p>
                  <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] font-mono pt-2 border-t border-white/4">
                    <span>{item.tag}</span>
                    <span>{item.cal} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lifeTab === 'reading' && (
          <div className="space-y-4 animate-fade-in">
            {/* Reading List */}
            <div className="space-y-3">
              {books.map(book => (
                <div key={book.id} className="glass-card p-4 bg-white/2 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="leading-tight">
                    <h4 className="text-xs font-bold text-white">{book.title}</h4>
                    <span className="text-[9px] text-[var(--text-muted)] font-mono">Author: {book.author}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-[10.5px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[var(--text-muted)]">Read progress:</span>
                      <input
                        type="number"
                        value={book.progress}
                        onChange={(e) => updateBookProgress(book.id, parseInt(e.target.value) || 0)}
                        className="w-12 bg-black/40 border border-white/8 rounded px-1.5 py-0.5 text-center text-sky-400"
                        min="0"
                        max="100"
                      />
                      <span className="text-white">%</span>
                    </div>

                    <div className="w-20 h-1 bg-black/45 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-sky-400" style={{ width: `${book.progress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Book form */}
            <form onSubmit={handleAddBook} className="glass-card p-4 bg-gradient-to-br from-white/2 to-black/35 border border-white/5 rounded-2xl flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Book title..."
                value={newBookTitle}
                onChange={(e) => setNewBookTitle(e.target.value)}
                required
                className="flex-1 bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Author..."
                value={newBookAuthor}
                onChange={(e) => setNewBookAuthor(e.target.value)}
                className="bg-black/40 border border-white/8 rounded-xl py-2 px-3 text-xs text-[var(--text-primary)] focus:outline-none"
              />
              <button type="submit" className="btn-primary py-2 px-5 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" /> Add Book
              </button>
            </form>
          </div>
        )}

        {lifeTab === 'vision' && (
          <div className="space-y-4 animate-fade-in">
            {/* Vision Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {visions.map(vis => (
                <div key={vis.id} className="glass-card p-4 bg-black/35 border border-white/4 rounded-xl flex flex-col justify-between h-40">
                  <div className="space-y-2">
                    <span className="text-[8px] font-mono text-[var(--accent-primary)] uppercase tracking-wider block font-bold">{vis.scale} Goal Tier</span>
                    <h4 className="text-xs font-black text-white leading-snug">{vis.title}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed line-clamp-3">{vis.desc}</p>
                  </div>
                  <span className="text-[8px] font-mono text-[var(--text-muted)] uppercase mt-2 block">Manifest active</span>
                </div>
              ))}
            </div>

            {/* Add Vision form */}
            <form onSubmit={handleAddVision} className="glass-card p-4 bg-gradient-to-br from-white/2 to-black/35 border border-white/5 rounded-2xl flex gap-3">
              <input
                type="text"
                placeholder="Manifest a new vision node milestone (e.g. Speak at a TEDx conference...)"
                value={newVisionTitle}
                onChange={(e) => setNewVisionTitle(e.target.value)}
                required
                className="flex-1 bg-black/40 border border-white/8 rounded-xl py-2 px-3.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
              <button type="submit" className="btn-primary py-2 px-5 text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus className="w-4 h-4" /> Manifest
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Right Column: AI Coach Advisory */}
      <div className="lg:col-span-1 space-y-6">
        
        <div className="glass-card p-5 bg-gradient-to-br from-white/2 to-black/40 border border-white/5 rounded-2xl flex flex-col justify-between h-full">
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-2 pb-3 border-b border-white/5">
              <Grid className="w-4.5 h-4.5" />
              AI Life Optimizer Coach
            </h4>

            <div className="space-y-4 text-[10px] leading-relaxed text-[var(--text-secondary)]">
              <div className="space-y-1.5 p-3 bg-black/30 border border-white/4 rounded-xl">
                <span className="text-[8.5px] uppercase font-mono text-emerald-400 font-bold">Finance Check</span>
                <p>
                  "Server hosting and vector RAG subscriptions account for 85% of work outflow. Excellent prioritization of assets."
                </p>
              </div>

              <div className="space-y-1.5 p-3 bg-black/30 border border-white/4 rounded-xl">
                <span className="text-[8.5px] uppercase font-mono text-sky-400 font-bold">Nutrition Check</span>
                <p>
                  "Meal plans contain high protein and omega profiles. Hydration streaks suggest optimal oxygen intake for coding sessions."
                </p>
              </div>

              <div className="space-y-1.5 p-3 bg-black/30 border border-white/4 rounded-xl">
                <span className="text-[8.5px] uppercase font-mono text-amber-400 font-bold">Reading Check</span>
                <p>
                  "You are reading 2 concurrent engineering manuals. Finish 'Atomic Habits' first to secure full v1.0 manifest milestones."
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 rounded-xl flex gap-2 items-center text-[9px] font-mono text-white">
            <Zap className="w-4 h-4 text-[var(--accent-primary)] shrink-0 animate-bounce" />
            <span>Advisory: Maintain reading streaks to boost cognitive focus index by 12%.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
