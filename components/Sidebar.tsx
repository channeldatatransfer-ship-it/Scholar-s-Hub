
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Library, 
  Layers, 
  FileText, 
  BrainCircuit, 
  Timer, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ClipboardCheck,
  Zap,
  LayoutTemplate,
  BookMarked,
  Code2,
  Calculator,
  TrendingUp
} from 'lucide-react';
import { Syllabus, AppSettings } from '../types';

const Sidebar: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();
  const isBN = settings.language === 'BN';

  useEffect(() => {
    const calculateProgress = () => {
      const saved = localStorage.getItem('scholars_syllabuses_v2');
      if (saved) {
        const syllabuses: Syllabus[] = JSON.parse(saved);
        const allTopics = syllabuses.flatMap(s => s.chapters.flatMap(c => c.topics));
        if (allTopics.length === 0) {
          setProgress(0);
          return;
        }
        const completed = allTopics.filter(t => t.completed).length;
        setProgress(Math.round((completed / allTopics.length) * 100));
      }
    };

    calculateProgress();
    window.addEventListener('storage', calculateProgress);
    window.addEventListener('syllabusUpdate', calculateProgress);
    return () => {
      window.removeEventListener('storage', calculateProgress);
      window.removeEventListener('syllabusUpdate', calculateProgress);
    };
  }, []);

  const navItems = [
    { name: isBN ? 'ড্যাশবোর্ড' : 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: isBN ? 'এনালিটিক্স' : 'Analytics', path: '/analytics', icon: TrendingUp },
    { name: isBN ? 'সিলেবাস' : 'Syllabus', path: '/syllabus', icon: ClipboardCheck },
    { name: isBN ? 'জিপিএ' : 'GPA Calc', path: '/gpa', icon: Calculator },
    { name: isBN ? 'প্ল্যানার' : 'Planner', path: '/planner', icon: Calendar },
    { name: isBN ? 'লাইব্রেরি' : 'Library', path: '/resources', icon: Library },
    { name: isBN ? 'ফ্ল্যাশকার্ড' : 'Flashcards', path: '/flashcards', icon: Layers },
    { name: isBN ? 'নোটবুক' : 'Notebooks', path: '/notebooks', icon: BookMarked },
    { name: isBN ? 'কুইজ এআই' : 'Quiz AI', path: '/quiz', icon: BrainCircuit },
    { name: isBN ? 'টাইমার' : 'Focus', path: '/timer', icon: Timer },
    { name: isBN ? 'সেটিংস' : 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside 
      style={{ 
        backgroundColor: settings.darkMode ? undefined : settings.primaryColor,
        background: settings.darkMode ? undefined : `linear-gradient(180deg, ${settings.primaryColor} 0%, ${settings.primaryColor}EE 100%)`
      }}
      className={`
        relative h-screen transition-all duration-300 border-r dark:border-slate-800 shadow-xl z-50
        ${settings.darkMode ? 'bg-slate-900 border-slate-800' : 'text-white border-transparent'}
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      <div className="p-6 mb-8 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Scholar Hub</span>
          </div>
        )}
        {collapsed && <GraduationCap className="text-white w-8 h-8 mx-auto" />}
      </div>

      <nav className="px-3 space-y-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-250px)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-white text-slate-900 shadow-lg' 
                  : settings.darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}
              `}
              style={isActive && !settings.darkMode ? { color: settings.primaryColor } : {}}
            >
              <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {!collapsed && <span className="font-medium whitespace-nowrap text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 text-white p-1.5 rounded-full shadow-lg hover:brightness-110 transition-all border-2 dark:border-slate-800 border-white"
        style={{ backgroundColor: settings.primaryColor }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!collapsed && (
        <div className="absolute bottom-8 left-6 right-6 p-4 glass-card rounded-2xl">
          <p className="text-[9px] text-white/70 mb-2 uppercase tracking-widest font-bold">Academic Progress</p>
          <div className="w-full bg-white/20 h-2 rounded-full mb-2">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-white font-black">{progress}% Completed</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
