import React, { useState, useRef } from 'react';
import { useApp } from '@/App';
import { downloadFile } from '@/lib/utils';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Sun, Moon, Monitor, Download, Upload, RotateCcw, Trash2, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { settings, setSettings, profile, setProfile, exportData, importData, resetData, addToast } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const handleExport = () => {
    const data = exportData();
    downloadFile(data, `cognios_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    addToast('Data exported successfully.', 'success');
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
          addToast('Data imported successfully.', 'success');
        } else {
          addToast('Invalid JSON file.', 'error');
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
    addToast('Data reset to defaults.', 'success');
  };

  const handleClear = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your preferences and data.</p>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Appearance</h2>
        <div className="flex gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = settings.theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSettings((s) => ({ ...s, theme: opt.value }))}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                    : 'border-gray-200 dark:border-dark-400 hover:border-gray-300 dark:hover:border-dark-500'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Name</label>
            <input
              className="input-field"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input
              className="input-field"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">Title</label>
            <input
              className="input-field"
              value={profile.title}
              onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">Avatar Initials</label>
            <input
              className="input-field"
              value={profile.avatarInitials}
              onChange={(e) => setProfile((p) => ({ ...p, avatarInitials: e.target.value }))}
              maxLength={2}
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Data Management</h2>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-200">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Export All Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Download all your data as a JSON file.</p>
            </div>
            <button onClick={handleExport} className="btn-secondary shrink-0">
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-200">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Import Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Import data from a previously exported JSON file.</p>
            </div>
            <label className="btn-secondary shrink-0 cursor-pointer">
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Reset to Demo Data</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Restore the default seed data.</p>
            </div>
            <button onClick={() => setConfirmReset(true)} className="btn-secondary shrink-0 !border-amber-300 dark:!border-amber-700 !text-amber-700 dark:!text-amber-400">
              <RotateCcw className="w-4 h-4" /> Reset Data
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Clear All Data</p>
              <p className="text-xs text-red-600 dark:text-red-400">Permanently delete all data. This cannot be undone.</p>
            </div>
            <button onClick={() => setConfirmClear(true)} className="btn-danger shrink-0">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Version info */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">CogniOS v1.0.0 — by Shiv Dhakad</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Your Personal Learning & Competency Hub</p>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title="Reset Data"
        message="This will replace all your current data with the default seed data. Continue?"
        confirmLabel="Reset"
        destructive={false}
      />
      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClear}
        title="Clear All Data"
        message="This will permanently delete ALL application data. This action cannot be undone."
        confirmLabel="Clear Everything"
      />
    </div>
  );
}
