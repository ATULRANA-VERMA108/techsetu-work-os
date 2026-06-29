import React, { useState } from 'react';
import { ShieldCheck, User, Mail, Lock, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, userName: string, userEmail: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      onSuccess(data.token, data.name, data.email);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection to authentication server failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg('Account registered successfully! Please sign in.');
      setActiveTab('signin');
      setPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm glass-card bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-start">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6 mt-2">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-lg shadow-black/30">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-base font-black uppercase tracking-wider text-[var(--text-primary)]">
            TechSetu Identity Gate
          </h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">Authenticate to synchronize workspaces.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 mb-5 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
            className={`flex-1 pb-2 border-b-2 text-center transition-all ${
              activeTab === 'signin' 
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' 
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('signup'); setErrorMsg(null); }}
            className={`flex-1 pb-2 border-b-2 text-center transition-all ${
              activeTab === 'signup' 
                ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]' 
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Errors & Success logs */}
        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[10.5px] leading-relaxed">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10.5px] leading-relaxed">
            {successMsg}
          </div>
        )}

        {/* Forms Router */}
        {activeTab === 'signin' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  className="w-full text-xs pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full text-xs pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2 px-4 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In and Launch'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">Full Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Atul Verma"
                  className="w-full text-xs pl-9"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  className="w-full text-xs pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[var(--text-secondary)]">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-xs py-2 px-4 mt-2"
            >
              {loading ? 'Registering...' : 'Register New Account'}
            </button>
          </form>
        )}

        <div className="mt-5 pt-3.5 border-t border-white/5 text-[9px] text-[var(--text-muted)] text-center">
          Secure JWT Sessions encrypted.
        </div>
      </div>
    </div>
  );
};
