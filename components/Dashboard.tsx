
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Plus,
  Zap,
  TrendingUp,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Syllabus, AppSettings } from '../types';

const Dashboard: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Revise Calculus Ch. 4', completed: false },
    { id: '2', title: 'Biology Flashcards', completed: true },
    { id: '3', title: 'Prepare Physics Mock', completed: false },
  ]);

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('scholars_syllabuses_v2');
    if (saved) setSyllabuses(JSON.parse(saved));
  }, []);

  const getProgress = (syllabus: Syllabus) => {
    const allTopics = syllabus.chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const allTopicsInApp = syllabuses.flatMap(s => s.chapters.flatMap(c => c.topics));
  const totalTopics = allTopicsInApp.length;
  const completedTopics = allTopicsInApp.filter(t => t.completed).length;
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const distributionData = useMemo(() => {
    return syllabuses.map(s => ({
      name: s.subject,
      value: s.chapters.flatMap(c => c.topics).length
    })).filter(d => d.value > 0);
  }, [syllabuses]);

  const COLORS = [settings.primaryColor, '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#0ea5e9'];

  const stats = [
    { label: 'Study Streak', value: '12 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Time Studied', value: '42.5 hrs', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Quiz Score', value: '88%', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Mastery', value: `${overallProgress}%`, icon: CheckCircle2, color: 'dynamic-primary-text', bg: 'bg-slate-50 dark:bg-slate-800/50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black dark:text-white tracking-tight">Welcome back, Scholar! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your momentum is strong. You've mastered 4 new topics today.</p>
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
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <TrendingUp className="text-indigo-600" style={{ color: settings.primaryColor }} />
                 </div>
                 <h2 className="text-2xl font-black dark:text-white">Study Activity</h2>
              </div>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-bold p-3 focus:ring-0 dark:text-white">
                <option>Past 7 Days</option>
                <option>Past 30 Days</option>
              </select>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { day: 'Mon', h: 4 }, { day: 'Tue', h: 6 }, { day: 'Wed', h: 5 }, 
                  { day: 'Thu', h: 8 }, { day: 'Fri', h: 3 }, { day: 'Sat', h: 7 }, { day: 'Sun', h: 9 }
                ]}>
                  <defs>
                    <linearGradient id="colorH" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={settings.primaryColor} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={settings.primaryColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.darkMode ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', backgroundColor: settings.darkMode ? '#0f172a' : '#fff'}}
                  />
                  <Area type="monotone" dataKey="h" stroke={settings.primaryColor} strokeWidth={4} fillOpacity={1} fill="url(#colorH)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <PieIcon className="text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-black dark:text-white">Syllabus Health</h2>
               </div>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData.length ? distributionData : [{name: 'Empty', value: 1}]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={300}
                        animationDuration={1500}
                      >
                        {distributionData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-2 mt-4">
                  {distributionData.slice(0, 4).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{d.name}</span>
                    </div>
                  ))}
               </div>
            </section>

            <section className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-black dark:text-white mb-6">Course Status</h2>
              <div className="space-y-5">
                {syllabuses.slice(0, 3).map(s => (
                  <div key={s.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                       <span className="dark:text-slate-300">{s.subject}</span>
                       <span className="text-slate-400">{getProgress(s)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full transition-all duration-1000" style={{ width: `${getProgress(s)}%`, backgroundColor: settings.primaryColor }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
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
