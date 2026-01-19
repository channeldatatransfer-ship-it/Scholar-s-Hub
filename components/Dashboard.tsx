
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Plus,
  Zap,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Syllabus, AppSettings, FocusLog } from '../types';

const Dashboard: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Revise Calculus Ch. 4', completed: false },
    { id: '2', title: 'Biology Flashcards', completed: true },
    { id: '3', title: 'Prepare Physics Mock', completed: false },
  ]);

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);

  useEffect(() => {
    const savedSyllabus = localStorage.getItem('scholars_syllabuses_v2');
    if (savedSyllabus) setSyllabuses(JSON.parse(savedSyllabus));
    
    const savedLogs = localStorage.getItem('scholars_focus_logs');
    if (savedLogs) setFocusLogs(JSON.parse(savedLogs));
  }, []);

  const performanceData = useMemo(() => {
    const topics = syllabuses.flatMap(s => s.chapters.flatMap(c => c.topics)).filter(t => t.score !== undefined);
    return topics.map((t, i) => ({ name: `Test ${i+1}`, score: t.score }));
  }, [syllabuses]);

  const focusData = useMemo(() => {
    const distribution: Record<string, number> = {};
    focusLogs.forEach(log => {
      distribution[log.subjectId] = (distribution[log.subjectId] || 0) + log.minutes;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [focusLogs]);

  const getProgress = (syllabus: Syllabus) => {
    const allTopics = syllabus.chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const COLORS = [settings.primaryColor, '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#0ea5e9'];

  const stats = [
    { label: 'Study Streak', value: '12 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Total Focus', value: `${Math.round(focusLogs.reduce((a,b) => a + b.minutes, 0) / 60)} hrs`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Avg Score', value: performanceData.length ? `${Math.round(performanceData.reduce((a,b) => a + (b.score || 0), 0) / performanceData.length)}%` : 'N/A', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Mastery', value: `${syllabuses.length ? Math.round(syllabuses.reduce((a,b) => a + getProgress(b), 0) / syllabuses.length) : 0}%`, icon: CheckCircle2, color: 'dynamic-primary-text', bg: 'bg-slate-50 dark:bg-slate-800/50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black dark:text-white tracking-tight">Welcome back, Scholar! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your momentum is strong. You've focused for {Math.round(focusLogs.reduce((a,b) => a + b.minutes, 0))} minutes total.</p>
        </div>
        <button 
          className="flex items-center gap-3 text-white px-8 py-4 rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95 dynamic-primary-glow font-bold"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <Zap className="w-5 h-5 fill-current" />
          Jump Into Deep Work
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group">
            <div className="flex items-center gap-5">
              <div className={`${stat.bg} p-4 rounded-3xl transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-8 h-8 ${stat.color === 'dynamic-primary-text' ? 'dynamic-primary-text' : stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Trend Chart */}
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-yellow-500">
                  <BarChart3 />
                </div>
                <h2 className="text-2xl font-black dark:text-white">Performance Analytics</h2>
             </div>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip 
                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', backgroundColor: settings.darkMode ? '#0f172a' : '#fff'}}
                      />
                      <Line type="monotone" dataKey="score" stroke={settings.primaryColor} strokeWidth={4} dot={{ r: 6, fill: settings.primaryColor, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <TrendingUp className="text-indigo-600" style={{ color: settings.primaryColor }} />
                 </div>
                 <h2 className="text-2xl font-black dark:text-white">Time Distribution</h2>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {focusData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={focusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {focusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-400 font-bold">Start a focus session to see distribution.</div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black dark:text-white">To-Do</h2>
              <button className="dynamic-primary-text p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}
                    className="w-6 h-6 rounded-lg border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 transition-all"
                  />
                  <span className={`flex-1 font-bold ${task.completed ? 'line-through text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section 
            className="p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group dynamic-primary-glow"
            style={{ background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.primaryColor}CC 100%)` }}
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3">Weekly Rank</h3>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">Complete 5 more sessions to reach the <strong>Elite Scholar</strong> tier.</p>
              <div className="flex items-end justify-between mb-3">
                <span className="text-5xl font-black">#4</span>
                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Top 5%</span>
              </div>
              <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000" style={{width: '85%'}}></div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12">
              <Trophy className="w-48 h-48" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
