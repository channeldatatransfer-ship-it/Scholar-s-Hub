
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
  ClipboardCheck
} from 'lucide-react';
import { Syllabus } from '../types';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const calculateProgress = () => {
      const saved = localStorage.getItem('scholars_syllabuses');
      if (saved) {
        const syllabuses: Syllabus[] = JSON.parse(saved);
        const allTopics = syllabuses.flatMap(s => s.topics);
        if (allTopics.length === 0) {
          setProgress(0);
          return;
        }
        const completed = allTopics.filter(t => t.completed).length;
        setProgress(Math.round((completed / allTopics.length) * 100));
      }
    };

    calculateProgress();
    // Listen for storage events to update progress across components
    window.addEventListener('storage', calculateProgress);
    // Custom event for same-window updates
    window.addEventListener('syllabusUpdate', calculateProgress);
    
    return () => {
      window.removeEventListener('storage', calculateProgress);
      window.removeEventListener('syllabusUpdate', calculateProgress);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Syllabus', path: '/syllabus', icon: ClipboardCheck },
    { name: 'Planner', path: '/planner', icon: Calendar },
    { name: 'Library', path: '/resources', icon: Library },
    { name: 'Flashcards', path: '/flashcards', icon: Layers },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Quiz AI', path: '/quiz', icon: BrainCircuit },
    { name: 'Focus', path: '/timer', icon: Timer },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <aside className={`
      relative h-screen bg-indigo-700 dark:bg-slate-800 transition-all duration-300 border-r border-indigo-500/20 shadow-xl z-50
      ${collapsed ? 'w-20' : 'w-64'}
    `}>
      <div className="p-6 mb-8 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">Scholar Hub</span>
          </div>
        )}
        {collapsed && <GraduationCap className="text-white w-8 h-8 mx-auto" />}
      </div>

      <nav className="px-3 space-y-1">
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
                  ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                  : 'text-indigo-100 hover:bg-white/10 hover:text-white'}
              `}
            >
              <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-indigo-600 dark:bg-indigo-500 text-white p-1.5 rounded-full shadow-lg hover:bg-indigo-500 transition-colors border-2 border-indigo-50"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!collapsed && (
        <div className="absolute bottom-8 left-6 right-6 p-4 glass-card rounded-2xl">
          <p className="text-xs text-indigo-100/70 mb-2 uppercase tracking-widest font-bold">Overall Progress</p>
          <div className="w-full bg-white/20 h-2 rounded-full mb-2">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-white">{progress}% Syllabus Done</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
