
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import ResourceLibrary from './components/ResourceLibrary';
import Flashcards from './components/Flashcards';
import Notes from './components/Notes';
import QuizGenerator from './components/QuizGenerator';
import FocusTimer from './components/FocusTimer';
import Settings from './components/Settings';
import { AppSettings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('scholars_settings');
    return saved ? JSON.parse(saved) : {
      darkMode: false,
      primaryColor: '#4338ca',
    };
  });

  useEffect(() => {
    localStorage.setItem('scholars_settings', JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-indigo-50');
      document.body.classList.add('bg-slate-900', 'text-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-indigo-50');
      document.body.classList.remove('bg-slate-900', 'text-white');
    }
  }, [settings]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/resources" element={<ResourceLibrary />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/quiz" element={<QuizGenerator settings={settings} />} />
          <Route path="/timer" element={<FocusTimer />} />
          <Route path="/settings" element={<Settings settings={settings} onUpdate={setSettings} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
