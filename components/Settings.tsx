
import React from 'react';
// Added motion import from framer-motion to fix 'Cannot find name motion' error.
import { motion } from 'framer-motion';
import { AppSettings } from '../types';
import { Moon, Sun, Palette, Database, RefreshCw, Trash2, Check, Cloud, Key } from 'lucide-react';

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

  const handleUpdate = (updates: Partial<AppSettings>) => {
    onUpdate({ ...settings, ...updates });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-2">Personalize your Scholar Hub experience.</p>
      </header>

      <div className="space-y-8">
        {/* Appearance */}
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
            <Palette className="w-6 h-6" style={{ color: settings.primaryColor }} /> Appearance & Interface
          </h2>
          
          <div className="space-y-10">
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div>
                <p className="font-bold text-lg dark:text-white">Dark Mode</p>
                <p className="text-sm text-slate-500">Easier on the eyes for late-night sessions.</p>
              </div>
              <button 
                onClick={() => handleUpdate({ darkMode: !settings.darkMode })}
                className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all focus:outline-none ${settings.darkMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                style={settings.darkMode ? { backgroundColor: settings.primaryColor } : {}}
              >
                <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${settings.darkMode ? 'translate-x-11' : 'translate-x-1'}`}>
                  {settings.darkMode ? <Moon className="w-4 h-4 m-2 text-indigo-600" style={{ color: settings.primaryColor }} /> : <Sun className="w-4 h-4 text-orange-400 m-2" />}
                </span>
              </button>
            </div>

            <div>
              <p className="font-bold dark:text-white mb-6">Accent Color</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleUpdate({ primaryColor: preset.color })}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div 
                      className="w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-lg relative"
                      style={{ backgroundColor: preset.color }}
                    >
                      {settings.primaryColor === preset.color && (
                        <motion.div layoutId="check" className="text-white bg-white/20 p-2 rounded-full backdrop-blur-sm">
                          <Check className="w-6 h-6" />
                        </motion.div>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cloud Integration */}
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
            <Cloud className="w-6 h-6" style={{ color: settings.primaryColor }} /> Cloud Integrations
          </h2>
          
          <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Google Drive Client ID</label>
                   <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="password"
                        placeholder="Paste Client ID..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 py-4 font-medium dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                        value={settings.gdriveClientId || ''}
                        onChange={(e) => handleUpdate({ gdriveClientId: e.target.value })}
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Google API Key</label>
                   <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="password"
                        placeholder="Paste API Key..."
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 py-4 font-medium dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                        value={settings.gdriveKey || ''}
                        onChange={(e) => handleUpdate({ gdriveKey: e.target.value })}
                      />
                   </div>
                </div>
             </div>
             <p className="text-xs text-slate-400 italic">These keys are stored locally and used to sync your resources with Google Drive.</p>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
            <Database className="w-6 h-6" style={{ color: settings.primaryColor }} /> Data & Privacy
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-3 p-5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-[2rem] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> Export All Data (JSON)
            </button>
            <button 
              onClick={clearData}
              className="flex-1 flex items-center justify-center gap-3 p-5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold rounded-[2rem] hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all active:scale-95"
            >
              <Trash2 className="w-5 h-5" /> Factory Reset App
            </button>
          </div>
          <p className="text-center mt-6 text-slate-400 text-xs font-bold uppercase tracking-widest">Version 1.0.4 - Scholar Hub Pro</p>
        </section>
      </div>
    </div>
  );
};

export default Settings;
