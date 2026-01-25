
import React from 'react';
import { motion } from 'framer-motion';
import { AppSettings, ExamLevel, AcademicGroup } from '../types';
import { Moon, Sun, Palette, Database, RefreshCw, Trash2, Check, Cloud, Key, BookOpen, Globe, GraduationCap, Timer } from 'lucide-react';

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
  const isBN = settings.language === 'BN';
  
  const EXAM_LEVELS: { id: ExamLevel; label: string }[] = [
    { id: 'SSC', label: isBN ? 'এসএসসি (১০ম শ্রেণি)' : 'SSC (Class 10)' },
    { id: 'HSC', label: isBN ? 'এইচএসসি (১২তম শ্রেণি)' : 'HSC (Class 12)' },
    { id: 'Engineering', label: isBN ? 'প্রকৌশল ভর্তি (BUET/CKRUET)' : 'Engineering Admission (BUET/CKRUET)' },
    { id: 'Medical', label: isBN ? 'মেডিকেল ভর্তি' : 'Medical Admission' },
    { id: 'General', label: isBN ? 'অন্যান্য/সাধারণ' : 'Other/General' },
  ];

  const GROUPS: { id: AcademicGroup; label: string }[] = [
    { id: 'Science', label: isBN ? 'বিজ্ঞান' : 'Science' },
    { id: 'Commerce', label: isBN ? 'ব্যবসায় শিক্ষা' : 'Commerce' },
    { id: 'Humanities', label: isBN ? 'মানবিক' : 'Humanities' },
  ];

  const clearData = () => {
    if (confirm(isBN ? "আপনি কি নিশ্চিত যে আপনি সমস্ত ডেটা মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।" : "Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleUpdate = (updates: Partial<AppSettings>) => {
    onUpdate({ ...settings, ...updates });
  };

  const handleDurationUpdate = (key: keyof AppSettings['focusDurations'], val: string) => {
    const num = parseInt(val) || 1;
    handleUpdate({
      focusDurations: {
        ...settings.focusDurations,
        [key]: Math.max(1, Math.min(120, num))
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-4xl font-black dark:text-white tracking-tight">{isBN ? 'সেটিংস' : 'Settings'}</h1>
        <p className="text-slate-500 mt-2">{isBN ? 'বাংলাদেশে আপনার পড়াশোনার জন্য স্কলার হাবকে পার্সোনালাইজ করুন।' : 'Personalize Scholar Hub for your studies in Bangladesh.'}</p>
      </header>

      <div className="space-y-8">
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
            <BookOpen className="w-6 h-6" style={{ color: settings.primaryColor }} /> {isBN ? 'একাডেমিক প্রোফাইল' : 'Academic Profile'}
          </h2>
          
          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">{isBN ? 'বর্তমান পরীক্ষার লক্ষ্য' : 'Current Exam Focus'}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXAM_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleUpdate({ examLevel: level.id })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      settings.examLevel === level.id 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                    }`}
                    style={settings.examLevel === level.id ? { borderColor: settings.primaryColor, backgroundColor: `${settings.primaryColor}1A` } : {}}
                  >
                    <p className={`font-bold ${settings.examLevel === level.id ? 'text-indigo-700 dark:text-white' : 'text-slate-500'}`}
                       style={settings.examLevel === level.id ? { color: settings.primaryColor } : {}}>
                      {level.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">{isBN ? 'বিভাগ' : 'Academic Group'}</label>
              <div className="flex bg-slate-50 dark:bg-slate-800 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                {GROUPS.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleUpdate({ academicGroup: group.id })}
                    className={`flex-1 px-6 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${
                      settings.academicGroup === group.id 
                        ? 'text-white shadow-xl' 
                        : 'text-slate-400 hover:text-indigo-600'
                    }`}
                    style={settings.academicGroup === group.id ? { backgroundColor: settings.primaryColor } : {}}
                  >
                    {group.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
              <div>
                <p className="font-bold dark:text-white flex items-center gap-2">
                  <Globe size={18} /> {isBN ? 'অ্যাপের ভাষা' : 'UI Language'}
                </p>
                <p className="text-sm text-slate-500">{isBN ? 'ইংরেজি এবং বাংলা ইন্টারফেসের মধ্যে বেছে নিন।' : 'Choose between English and Bengali interface.'}</p>
              </div>
              <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border dark:border-slate-700">
                <button 
                  onClick={() => handleUpdate({ language: 'EN' })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.language === 'EN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                  style={settings.language === 'EN' ? { backgroundColor: settings.primaryColor } : {}}
                >
                  English
                </button>
                <button 
                  onClick={() => handleUpdate({ language: 'BN' })}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.language === 'BN' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                  style={settings.language === 'BN' ? { backgroundColor: settings.primaryColor } : {}}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* New Focus Timer Settings Section */}
        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
            <Timer className="w-6 h-6" style={{ color: settings.primaryColor }} /> {isBN ? 'ফোকাস টাইমার সেটিংস' : 'Focus Timer Intervals'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isBN ? 'পড়ার সময়' : 'Work Session'}</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  value={settings.focusDurations.work}
                  onChange={(e) => handleDurationUpdate('work', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner pr-12"
                />
                <span className="absolute right-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MIN</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isBN ? 'ছোট বিরতি' : 'Short Break'}</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  value={settings.focusDurations.short}
                  onChange={(e) => handleDurationUpdate('short', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner pr-12"
                />
                <span className="absolute right-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MIN</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isBN ? 'বড় বিরতি' : 'Long Break'}</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  value={settings.focusDurations.long}
                  onChange={(e) => handleDurationUpdate('long', e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold dark:text-white focus:ring-2 focus:ring-indigo-500/20 shadow-inner pr-12"
                />
                <span className="absolute right-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MIN</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500 italic font-medium">
            {isBN ? '* টাইমার চলাকালীন পরিবর্তনগুলো সরাসরি প্রভাব ফেলবে না।' : '* Changes won\'t reset an active session currently in progress.'}
          </p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
            <Palette className="w-6 h-6" style={{ color: settings.primaryColor }} /> {isBN ? 'চেহারা' : 'Appearance'}
          </h2>
          
          <div className="space-y-10">
            <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl">
              <div>
                <p className="font-bold text-lg dark:text-white">{isBN ? 'ডার্ক মোড' : 'Dark Mode'}</p>
                <p className="text-sm text-slate-500">{isBN ? 'রাতের পড়াশোনার জন্য সেরা।' : 'Best for night-time study sessions.'}</p>
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
              <p className="font-bold dark:text-white mb-6">{isBN ? 'অ্যাকসেন্ট কালার' : 'Accent Color'}</p>
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
                        <motion.div {...({ layoutId: "check" } as any)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-sm">
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

        <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white">
            <Database className="w-6 h-6" style={{ color: settings.primaryColor }} /> {isBN ? 'ডেটা কন্ট্রোল' : 'Data Control'}
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <button className="flex-1 flex items-center justify-center gap-3 p-5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-[2rem] hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">
              <RefreshCw className="w-5 h-5" /> {isBN ? 'অগ্রগতি এক্সপোর্ট করুন' : 'Export Progress'}
            </button>
            <button 
              onClick={clearData}
              className="flex-1 flex items-center justify-center gap-3 p-5 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 font-bold rounded-[2rem] hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all active:scale-95"
            >
              <Trash2 className="w-5 h-5" /> {isBN ? 'সমস্ত ডেটা রিসেট করুন' : 'Reset All Data'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
