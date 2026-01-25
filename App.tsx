
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import ResourceLibrary from './components/ResourceLibrary';
import Flashcards from './components/Flashcards';
import Notes from './components/Notes';
import QuizGenerator from './components/QuizGenerator';
import FocusTimer from './components/FocusTimer';
import Settings from './components/Settings';
import SyllabusTracker from './components/SyllabusTracker';
import ScholarAI from './components/ScholarAI';
import CommandPalette from './components/CommandPalette';
import ConceptVault from './components/ConceptVault';
import TemplateHub from './components/TemplateHub';
import Notebooks from './components/Notebooks';
import CodeRunner from './components/CodeRunner';
import Analytics from './components/Analytics';
import GPACalculator from './components/GPACalculator';
import { AppSettings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('scholars_settings');
    const defaultSettings: AppSettings = {
      darkMode: false,
      primaryColor: '#4338ca',
      examLevel: 'HSC',
      language: 'BN',
      focusDurations: {
        work: 25,
        short: 5,
        long: 15
      }
    };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });

  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('scholars_settings', JSON.stringify(settings));
    
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--primary-glow', `${settings.primaryColor}4D`); 
    
    const font = settings.language === 'BN' ? "'Hind Siliguri', sans-serif" : "'Inter', sans-serif";
    root.style.setProperty('--dynamic-font', font);
    
    if (settings.darkMode) {
      root.classList.add('dark');
      document.body.className = 'bg-slate-950 text-white min-h-screen';
    } else {
      root.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 min-h-screen';
    }
  }, [settings]);

  return (
    <div className="flex min-h-screen selection:bg-indigo-500/20">
      <CommandPalette settings={settings} />
      <Sidebar settings={settings} />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen relative scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            {...({
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -10 },
              transition: { duration: 0.3 }
            } as any)}
            className="h-full"
          >
            <Routes location={location}>
              <Route path="/" element={<Dashboard settings={settings} />} />
              <Route path="/analytics" element={<Analytics settings={settings} />} />
              <Route path="/gpa" element={<GPACalculator settings={settings} />} />
              <Route path="/syllabus" element={<SyllabusTracker settings={settings} />} />
              <Route path="/planner" element={<Planner settings={settings} />} />
              <Route path="/resources" element={<ResourceLibrary settings={settings} />} />
              <Route path="/flashcards" element={<Flashcards settings={settings} />} />
              <Route path="/notebooks" element={<Notebooks settings={settings} />} />
              <Route path="/notes" element={<Notes settings={settings} />} />
              <Route path="/quiz" element={<QuizGenerator settings={settings} />} />
              <Route path="/timer" element={<FocusTimer settings={settings} onUpdate={(updates) => setSettings({...settings, ...updates})} />} />
              <Route path="/settings" element={<Settings settings={settings} onUpdate={setSettings} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
        <ScholarAI settings={settings} />
      </main>
    </div>
  );
};

export default App;
