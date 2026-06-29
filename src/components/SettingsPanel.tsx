import React, { useState } from 'react';
import { User, Save, Sliders, Bell } from 'lucide-react';

interface SettingsPanelProps {
  userName: string;
  setUserName: (name: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  showGlow: boolean;
  setShowGlow: (show: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  updateFreq: number;
  setUpdateFreq: (freq: number) => void;
  onSaveToast: (msg: string) => void;
  customApiKey: string | null;
  setCustomApiKey: (key: string | null) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  userName,
  setUserName,
  userRole,
  setUserRole,
  showGlow,
  setShowGlow,
  showGrid,
  setShowGrid,
  updateFreq,
  setUpdateFreq,
  onSaveToast,
  customApiKey,
  setCustomApiKey
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'tuning' | 'notifications'>('profile');
  
  // Local form states
  const [localName, setLocalName] = useState(userName);
  const [localRole, setLocalRole] = useState(userRole);
  const [localAutoSave, setLocalAutoSave] = useState(true);
  const [localAudioAlerts, setLocalAudioAlerts] = useState(false);
  const [localLiveSync, setLocalLiveSync] = useState(true);
  const [localApiKey, setLocalApiKey] = useState(customApiKey || '');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim() || !localRole.trim()) return;
    
    setUserName(localName);
    setUserRole(localRole);
    
    // Save to LocalStorage
    localStorage.setItem('techsetu-username', localName);
    localStorage.setItem('techsetu-userrole', localRole);
    
    onSaveToast('Profile settings saved successfully.');
  };

  const handleSaveTuning = () => {
    // Save visual toggles
    localStorage.setItem('techsetu-showglow', String(showGlow));
    localStorage.setItem('techsetu-showgrid', String(showGrid));
    localStorage.setItem('techsetu-updatefreq', String(updateFreq));
    
    const key = localApiKey.trim();
    if (key) {
      localStorage.setItem('techsetu-custom-gemini-key', key);
      setCustomApiKey(key);
    } else {
      localStorage.removeItem('techsetu-custom-gemini-key');
      setCustomApiKey(null);
    }
    
    onSaveToast('Workspace tuning configurations applied.');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[500px]">
      
      {/* Settings Navigation Tabs */}
      <div className="md:col-span-1 flex flex-col space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 px-1">
          Settings Categories
        </h3>
        
        <button
          onClick={() => setActiveTab('profile')}
          className={`sidebar-item ${
            activeTab === 'profile' ? 'sidebar-item-active' : ''
          }`}
        >
          <User className="w-4 h-4" />
          <span className="font-bold">User Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('tuning')}
          className={`sidebar-item ${
            activeTab === 'tuning' ? 'sidebar-item-active' : ''
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="font-bold">Workspace Tuning</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`sidebar-item ${
            activeTab === 'notifications' ? 'sidebar-item-active' : ''
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="font-bold">Feature Flags</span>
        </button>
      </div>

      {/* Main Settings Panel View */}
      <div className="md:col-span-3 glass-card bg-white/2 border border-white/5 p-6 flex flex-col h-full overflow-y-auto no-scrollbar justify-between">
        
        <div className="space-y-6">
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">User Profile Configurations</h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Customize your personal display node attributes.</p>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Display Name</label>
                <input
                  type="text"
                  required
                  className="text-xs max-w-sm"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-secondary)]">Operational Role</label>
                <input
                  type="text"
                  required
                  className="text-xs max-w-sm"
                  value={localRole}
                  onChange={(e) => setLocalRole(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Profile Details
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Workspace Tuning */}
          {activeTab === 'tuning' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Workspace Visual & Data Tuning</h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Configure theme layouts, overlays, and performance logs.</p>
              </div>

              {/* Toggle Glow Spheres */}
              <div className="switch-container max-w-md">
                <div className="leading-tight">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Ambient Glow Spheres</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Renders glowing floating circles in the corners.</span>
                </div>
                <label className="switch-toggle">
                  <input 
                    type="checkbox" 
                    checked={showGlow}
                    onChange={(e) => setShowGlow(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Toggle Grid overlay */}
              <div className="switch-container max-w-md">
                <div className="leading-tight">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Mesh Grid Overlay</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Displays geometric dots overlay across the screen.</span>
                </div>
                <label className="switch-toggle">
                  <input 
                    type="checkbox" 
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Telemetry Freq */}
              <div className="flex items-center justify-between max-w-md p-3 bg-black/15 rounded-xl border border-white/4">
                <div className="leading-tight">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Telemetry Simulation Frequency</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Configures speed intervals of performance logs.</span>
                </div>
                <select
                  className="text-xs py-1 px-2.5 bg-white/4 border border-white/8 text-[var(--accent-primary)] w-32"
                  value={updateFreq}
                  onChange={(e) => setUpdateFreq(Number(e.target.value))}
                >
                  <option value={1000}>1.0s (Fast)</option>
                  <option value={2000}>2.0s (Normal)</option>
                  <option value={5000}>5.0s (Eco)</option>
                </select>
              </div>

              {/* Gemini API Key */}
              <div className="flex flex-col space-y-2 max-w-md p-3 bg-black/15 rounded-xl border border-white/4">
                <div className="leading-tight">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Custom Gemini API Client Key</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Supply your own API key to bypass backend system key limits.</span>
                </div>
                <input
                  type="password"
                  placeholder="Paste AIzaSy... here"
                  className="w-full text-xs bg-black/25 border border-white/5 rounded-lg py-1.5 px-3 text-[var(--accent-primary)] font-mono focus:border-[var(--accent-primary)]"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveTuning}
                  className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Apply Workspace Settings
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Feature Flags */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="border-b border-white/5 pb-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Feature Flags & Workspace Hooks</h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Toggle advanced framework features and automation hooks.</p>
              </div>

              {/* Auto Save */}
              <div className="switch-container max-w-md">
                <div className="leading-tight">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Workspace Auto-Save</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Flashes save confirmations in collaborative document zones.</span>
                </div>
                <label className="switch-toggle">
                  <input 
                    type="checkbox" 
                    checked={localAutoSave}
                    onChange={(e) => setLocalAutoSave(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Sound Alerts */}
              <div className="switch-container max-w-md">
                <div className="leading-tight">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Direct Audio Alert Pings</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Play subtle UI click audio when pings are received.</span>
                </div>
                <label className="switch-toggle">
                  <input 
                    type="checkbox" 
                    checked={localAudioAlerts}
                    onChange={(e) => setLocalAudioAlerts(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Sync stream */}
              <div className="switch-container max-w-md">
                <div className="leading-tight">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">Teammate Pulse Live Stream Sync</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Synchronize mock git commit streams in real-time.</span>
                </div>
                <label className="switch-toggle">
                  <input 
                    type="checkbox" 
                    checked={localLiveSync}
                    onChange={(e) => setLocalLiveSync(e.target.checked)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
