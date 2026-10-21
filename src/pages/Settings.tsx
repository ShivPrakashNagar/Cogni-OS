import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/App';
import { downloadFile } from '@/lib/utils';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Sun, Moon, Monitor, Download, Upload, RotateCcw, Trash2, Check, User, Shield, LogOut } from 'lucide-react';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, setSettings, profile, setProfile, session, logout, exportData, importData, resetData, addToast } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const handleExport = () => {
    const data = exportData();
    downloadFile(data, `cognios_backup_${(session?.name || 'user').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    addToast('Your personal workspace data was exported successfully.', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      try {
        const success = importData(content);
        if (success) {
          addToast('Data imported successfully into your account.', 'success');
        } else {
          addToast('Invalid backup JSON file.', 'error');
        }
      } catch {
        addToast('Failed to import data.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    resetData();
    addToast('Data reset to default demo content.', 'success');
  };

  const handleClear = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedProfile(true);
    addToast('Profile updated successfully.', 'success');
    setTimeout(() => setSavedProfile(false), 2500);
  };

  const handleLogoutConfirm = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title">Settings & Account</h1>
        <p className="page-subtitle">Manage your personal developer profile, preferences, and workspace data.</p>
      </div>

      {/* Account & Security Banner */}
      <div className="card p-5 sm:p-6 bg-gradient-to-r from-brand-50/50 to-white dark:from-brand-950/20 dark:to-dark-100 border-brand-100 dark:border-brand-900/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 dark:bg-brand-400/10 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{session?.name || profile.name}</h2>
                <span className="badge bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px]">
                  Authenticated
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{session?.email || profile.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="btn-secondary text-xs sm:text-sm self-start sm:self-auto !border-red-200 dark:!border-red-800 !text-red-600 dark:!text-red-400 hover:!bg-red-50 dark:hover:!bg-red-950/30"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-5 sm:p-6">
        <h2 className="section-title mb-3 sm:mb-4">Theme & Appearance</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = settings.theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSettings((s) => ({ ...s, theme: opt.value }))}
                className={`flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 shadow-xs'
                    : 'border-gray-200 dark:border-dark-400 hover:border-gray-300 dark:hover:border-dark-500'
                }`}
                aria-pressed={isActive}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
                <span className={`text-xs sm:text-sm font-medium ${isActive ? 'text-brand-700 dark:text-brand-300 font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Form */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="section-title">Developer Profile</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">These details appear across your dashboard, sidebar, and ATS resume</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="input-label">Full Name *</label>
              <input
                className="input-field"
                value={profile.name || ''}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="Shiv Dhakad"
                required
              />
            </div>
            <div>
              <label className="input-label">Email Address *</label>
              <input
                type="email"
                className="input-field"
                value={profile.email || ''}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="shiv.dhakad@example.com"
                required
              />
            </div>
            <div>
              <label className="input-label">Professional Role Title *</label>
              <input
                className="input-field"
                value={profile.title || ''}
                onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                placeholder="Java Full Stack Developer"
                required
              />
            </div>
            <div>
              <label className="input-label">Avatar Initials (1-2 chars)</label>
              <input
                className="input-field uppercase"
                value={profile.avatarInitials || ''}
                onChange={(e) => setProfile((p) => ({ ...p, avatarInitials: e.target.value.slice(0, 2) }))}
                maxLength={2}
                placeholder="SD"
              />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input
                type="tel"
                className="input-field"
                value={profile.phone || ''}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="input-label">LinkedIn Profile URL</label>
              <input
                type="url"
                className="input-field"
                value={profile.linkedin || ''}
                onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))}
                placeholder="https://linkedin.com/in/shivdhakad"
              />
            </div>
            <div>
              <label className="input-label">GitHub Profile URL</label>
              <input
                type="url"
                className="input-field"
                value={profile.github || ''}
                onChange={(e) => setProfile((p) => ({ ...p, github: e.target.value }))}
                placeholder="https://github.com/shivdhakad"
              />
            </div>
            <div>
              <label className="input-label">Portfolio / Website URL</label>
              <input
                type="url"
                className="input-field"
                value={profile.portfolio || ''}
                onChange={(e) => setProfile((p) => ({ ...p, portfolio: e.target.value }))}
                placeholder="https://shivdhakad.dev"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary w-full sm:w-auto">
              {savedProfile ? <Check className="w-4 h-4 text-white" /> : null}
              <span>{savedProfile ? 'Profile Saved!' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Data Management */}
      <div className="card p-5 sm:p-6">
        <h2 className="section-title mb-3 sm:mb-4">Workspace Backup & Isolation</h2>
        <div className="space-y-3">
          {/* Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-200 border border-gray-100 dark:border-dark-300">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Export My Workspace Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download a JSON backup containing all your personal skills, projects, courses, and notes.</p>
            </div>
            <button onClick={handleExport} className="btn-secondary w-full sm:w-auto shrink-0">
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>

          {/* Import */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-200 border border-gray-100 dark:border-dark-300">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Import Workspace Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Restore or import data from an exported CogniOS JSON backup file.</p>
            </div>
            <label className="btn-secondary w-full sm:w-auto shrink-0 cursor-pointer text-center justify-center">
              <Upload className="w-4 h-4" /> Import JSON
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Reset Demo Data</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Reset entries in your current session to default sample items.</p>
            </div>
            <button
              onClick={() => setConfirmReset(true)}
              className="btn-secondary w-full sm:w-auto shrink-0 !border-amber-300 dark:!border-amber-700 !text-amber-800 dark:!text-amber-300 hover:!bg-amber-100/50"
            >
              <RotateCcw className="w-4 h-4" /> Reset Data
            </button>
          </div>

          {/* Clear */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div>
              <p className="text-sm font-semibold text-red-900 dark:text-red-300">Purge Storage</p>
              <p className="text-xs text-red-700 dark:text-red-400">Permanently delete stored local data across all sessions.</p>
            </div>
            <button
              onClick={() => setConfirmClear(true)}
              className="btn-danger w-full sm:w-auto shrink-0"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Version info footer */}
      <div className="text-center py-4 border-t border-gray-100 dark:border-dark-300">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">CogniOS v1.0.0 — Secured with SHA-256 Authentication</p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Your Personal Learning & Competency Hub</p>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset Data"
        message="This will overwrite your current entries with default sample items. Continue?"
        confirmLabel="Reset to Defaults"
        destructive={false}
      />
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClear}
        title="Clear All Data"
        message="This will permanently delete all skills, projects, courses, library items, and resume profiles. This cannot be undone."
        confirmLabel="Clear Everything"
        destructive={true}
      />
      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmLabel="Sign Out"
        destructive={false}
      />
    </div>
  );
}
