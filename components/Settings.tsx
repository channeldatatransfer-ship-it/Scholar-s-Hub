
import React from 'react';
import { AppSettings } from '../types';
import { Moon, Sun, Palette, Shield, Key, Database, RefreshCw, Trash2 } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const clearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

      <div className="space-y-6">
        <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 dark:text-white">
            <Palette className="w-5 h-5 text-indigo-600" /> Appearance
          </h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <div>
              <p className="font-bold dark:text-white">Dark Mode</p>
              <p className="text-sm text-slate-500">Enable a darker interface for night study sessions</p>
            </div>
            <button 
              onClick={() => onUpdate({ ...settings, darkMode: !settings.darkMode })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-7' : 'translate-x-1'}`}>
                {settings.darkMode ? <Moon className="w-3 h-3 text-indigo-600 m-1.5" /> : <Sun className="w-3 h-3 text-orange-400 m-1.5" />}
              </span>
            </button>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 dark:text-white">
            <Key className="w-5 h-5 text-indigo-600" /> API Integrations
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">Gemini API Key</label>
              <input 
                type="password" 
                placeholder="Enter your Google AI API Key"
                value={settings.geminiKey || ''}
                onChange={(e) => onUpdate({ ...settings, geminiKey: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">G-Drive Client ID</label>
                  <input 
                    type="text" 
                    placeholder="OAuth Client ID"
                    value={settings.gdriveClientId || ''}
                    onChange={(e) => onUpdate({ ...settings, gdriveClientId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                  />
               </div>
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-widest">G-Drive API Key</label>
                  <input 
                    type="password" 
                    placeholder="Google Drive API Key"
                    value={settings.gdriveKey || ''}
                    onChange={(e) => onUpdate({ ...settings, gdriveKey: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                  />
               </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 dark:text-white">
            <Database className="w-5 h-5 text-indigo-600" /> Data Management
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-2xl hover:bg-indigo-100 transition-colors">
              <RefreshCw className="w-5 h-5" /> Backup to Local Storage
            </button>
            <button 
              onClick={clearData}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" /> Reset App Content
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
