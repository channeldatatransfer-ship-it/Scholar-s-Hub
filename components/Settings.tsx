
import React from 'react';
import { AppSettings } from '../types';
import { Moon, Sun, Palette, Database, RefreshCw, Trash2, Check } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const THEME_PRESETS = [
  { name: 'Indigo', color: '#4338ca' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Amber', color: '#d97706' },
  { name: 'Violet', color: '#7c3aed' },
  { name: 'Slate', color: '#475569' },
];

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const clearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

      <div className="space-y-6">
        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 dark:text-white">
            <Palette className="w-5 h-5 dynamic-primary-text" /> Theme & Appearance
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div>
                <p className="font-bold dark:text-white">Dark Mode</p>
                <p className="text-sm text-slate-500">Optimized for night study sessions</p>
              </div>
              <button 
                onClick={() => onUpdate({ ...settings, darkMode: !settings.darkMode })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                style={settings.darkMode ? { backgroundColor: settings.primaryColor } : {}}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-7' : 'translate-x-1'}`}>
                  {settings.darkMode ? <Moon className="w-3 h-3 m-1.5 dynamic-primary-text" /> : <Sun className="w-3 h-3 text-orange-400 m-1.5" />}
                </span>
              </button>
            </div>

            <div>
              <p className="font-bold dark:text-white mb-4">Primary Brand Color</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onUpdate({ ...settings, primaryColor: preset.color })}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg"
                      style={{ backgroundColor: preset.color }}
                    >
                      {settings.primaryColor === preset.color && <Check className="text-white w-6 h-6" />}
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3 dark:text-white">
            <Database className="w-5 h-5 dynamic-primary-text" /> Data Management
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-5 h-5" /> Backup Data
            </button>
            <button 
              onClick={clearData}
              className="flex-1 flex items-center justify-center gap-2 p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
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
