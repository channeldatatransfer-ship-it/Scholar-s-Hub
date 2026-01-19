
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Plus,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Target,
  History
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Syllabus, AppSettings, FocusLog } from '../types';

const Dashboard: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  
  const [tasks, setTasks] = useState([
    { id: '1', title: isBN ? 'ক্যালকুলাস রিভিশন' : 'Calculus Revision', completed: false },
    { id: '2', title: isBN ? 'জীববিজ্ঞান পেপার প্র্যাকটিস' : 'Biology Paper Practice', completed: true },
    { id: '3', title: isBN ? 'বাংলা ২য় পত্র আবেদন' : 'Bangla 2nd Paper Application', completed: false },
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
    if (topics.length === 0) return [{ name: 'Start', score: 0 }];
    return topics.map((t, i) => ({ name: `T${i+1}`, score: t.score }));
  }, [syllabuses]);

  const focusData = useMemo(() => {
    const distribution: Record<string, number> = {};
    focusLogs.forEach(log => {
      distribution[log.subjectId] = (distribution[log.subjectId] || 0) + log.minutes;
    });
    return Object.entries(distribution).map(([name, value]) => ({ name, value }));
  }, [focusLogs]);

  // Consistency Heatmap logic
  const heatmapData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    const counts: Record<string, number> = {};
    focusLogs.forEach(log => {
      const dateStr = log.date.split('T')[0];
      counts[dateStr] = (counts[dateStr] || 0) + log.minutes;
    });

    return last30Days.map(date => ({
      date,
      minutes: counts[date] || 0,
      intensity: Math.min(Math.floor((counts[date] || 0) / 30), 4) // max intensity at 2 hours
    }));
  }, [focusLogs]);

  const getProgress = (syllabus: Syllabus) => {
    const allTopics = syllabus.chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const COLORS = [settings.primaryColor, '#10b981', '#f59e0b', '#e11d48', '#8b5cf6', '#0ea5e9'];
  const INTENSITY_COLORS = ['#f1f5f9', '#e0e7ff', '#818cf8', '#4f46e5', '#312e81'];

  const avgScore = performanceData.some(d => (d.score ?? 0) > 0) 
    ? Math.round(performanceData.reduce((a, b) => a + (b.score || 0), 0) / performanceData.length)
    : 0;

  const stats = [
    { label: isBN ? 'অধ্যয়ন স্ট্রিক' : 'Study Streak', value: '12 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: isBN ? 'মোট ফোকাস' : 'Total Focus', value: `${Math.round(focusLogs.reduce((a,b) => a + b.minutes, 0) / 60)} hrs`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: isBN ? 'গড় স্কোর' : 'Avg Score', value: `${avgScore}%`, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: isBN ? 'মাস্টারি' : 'Mastery', value: `${syllabuses.length ? Math.round(syllabuses.reduce((a,b) => a+getProgress(b),0)/syllabuses.length) : 0}%`, icon: CheckCircle2, color: 'dynamic-primary-text', bg: 'bg-slate-50 dark:bg-slate-800/50' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-black dark:text-white tracking-tight">{isBN ? 'স্বাগতম, স্কলার!' : 'Welcome, Scholar!'} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Consistency is the bridge between goals and accomplishment.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600">
             <CalendarDays size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HSC EXAM 2025</p>
              <p className="font-bold text-slate-700 dark:text-white">45 Days Remaining</p>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl group">
            <div className="flex items-center gap-5">
              <div className={`${stat.bg} p-5 rounded-3xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-8 h-8 ${stat.color === 'dynamic-primary-text' ? 'dynamic-primary-text' : stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Heatmap Section */}
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-indigo-600" style={{ color: settings.primaryColor }}>
                     <History size={20} />
                   </div>
                   <h2 className="text-2xl font-black dark:text-white">{isBN ? 'পড়াশোনার ধারাবাহিকতা' : 'Study Consistency'}</h2>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <span>Less</span>
                   <div className="flex gap-1">
                      {INTENSITY_COLORS.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />)}
                   </div>
                   <span>More</span>
                </div>
             </div>
             <div className="flex flex-wrap gap-3">
                {heatmapData.map((day, i) => (
                  <div 
                    key={i} 
                    title={`${day.date}: ${day.minutes} mins`}
                    className="w-10 h-10 rounded-xl transition-all hover:scale-110 cursor-help"
                    style={{ backgroundColor: day.intensity === 0 ? (settings.darkMode ? '#1e293b' : '#f8fafc') : INTENSITY_COLORS[day.intensity] }}
                  />
                ))}
             </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3 mb-10">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-yellow-500">
                  <BarChart3 />
                </div>
                <h2 className="text-2xl font-black dark:text-white">{isBN ? 'পারফরম্যান্স ট্রেন্ড' : 'Performance Trend'}</h2>
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
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black dark:text-white">{isBN ? 'টু-ডু লিস্ট' : 'Quick Tasks'}</h2>
              <button className="dynamic-primary-text p-2 hover:bg-slate-50 rounded-xl transition-all">
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-all cursor-pointer border border-transparent hover:border-slate-100">
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
            className="p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group dynamic-primary-glow"
            style={{ background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.primaryColor}CC 100%)` }}
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-3">{isBN ? 'লক্ষ্য অর্জন' : 'Goal Tracking'}</h3>
              <p className="text-white/70 text-sm mb-10 leading-relaxed">
                You've completed <strong className="text-white">92%</strong> of your weekly goals. Stay focused on your admission target!
              </p>
              <div className="flex items-end justify-between mb-4">
                <div className="p-4 bg-white/20 rounded-[2rem]">
                   <Target size={32} />
                </div>
                <span className="text-3xl font-black">92%</span>
              </div>
              <div className="w-full bg-white/20 h-5 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000 shadow-[0_0_15px_white]" style={{width: '92%'}}></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
