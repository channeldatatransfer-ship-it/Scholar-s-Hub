
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Layers, FileText, ClipboardCheck, Timer, Settings, Calendar } from 'lucide-react';

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const commands = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Syllabus Tracker', path: '/syllabus', icon: ClipboardCheck },
    { name: 'Study Planner', path: '/planner', icon: Calendar },
    { name: 'Flashcards', path: '/flashcards', icon: Layers },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Focus Timer', path: '/timer', icon: Timer },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = commands.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex items-center p-6 border-b dark:border-slate-800">
              <Search className="text-slate-400 mr-4" />
              <input
                autoFocus
                placeholder="Where to, Scholar?"
                className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">ESC</div>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
              {filtered.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(c.path)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <c.icon size={20} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:translate-x-1 transition-transform">{c.name}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-bold">No results for "{search}"</div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
