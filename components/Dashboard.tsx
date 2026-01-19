
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  History,
  Sparkles,
  RefreshCw,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { Syllabus, AppSettings, FocusLog, CalendarEvent } from '../types';
import { getStudyAdvise } from '../services/geminiService';

const Dashboard: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([
    { id: '1', title: isBN ? 'ক্যালকুলাস রিভিশন' : 'Calculus Revision', completed: false, category: 'Math' },
    { id: '2', title: isBN ? 'জীববিজ্ঞান পেপার প্র্যাকটিস' : 'Biology Paper Practice', completed: true, category: 'Science' },
    { id: '3', title: isBN ? 'বাংলা ২য় পত্র আবেদন' : 'Bangla 2nd Paper Application', completed: false, category: 'Languages' },
  ]);

  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [aiAdvise, setAiAdvise] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const savedSyllabus = localStorage.getItem('scholars_syllabuses_v2');
    if (savedSyllabus) setSyllabuses(JSON.parse(savedSyllabus));
    
    const savedLogs = localStorage.getItem('scholars_focus_logs');
    if (savedLogs) setFocusLogs(JSON.parse(savedLogs));

    const savedEvents = localStorage.getItem('scholars_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));
  }, []);

  const performanceData = useMemo(() => {
    const topics = syllabuses.flatMap(s => s.chapters.flatMap(c => c.topics)).filter(t => t.score !== undefined);
    if (topics.length === 0) return [{ name: 'Start', score: 0 }];
    return topics.map((t, i) => ({ name: t.title.substring(0, 10), score: t.score }));
  }, [syllabuses]);

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
      intensity: Math.min(Math.floor((counts[date] || 0) / 30), 4)
    }));
  }, [focusLogs]);

  const fetchAiCoach = async () => {
    setIsAiLoading(true);
    try {
      const advice = await getStudyAdvise(JSON.stringify(syllabuses), JSON.stringify(focusLogs));
      setAiAdvise(advice);
    } catch (e) {
      setAiAdvise("Your progress looks solid! Focus on your weakest topics today.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const getProgress = (syllabus: Syllabus) => {
    const allTopics = syllabus.chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const INTENSITY_COLORS = ['#f1f5f9', '#e0e7ff', '#818cf8', '#4f46e5', '#312e81'];

  const totalFocusMinutes = focusLogs.reduce((a, b) => a + b.minutes, 0);
  const avgScore = performanceData.some(d => (d.score ?? 0) > 0) 
    ? Math.round(performanceData.reduce((a, b) => a + (b.score || 0), 0) / performanceData.length)
    : 0;
  
  const overallMastery = syllabuses.length 
    ? Math.round(syllabuses.reduce((a, b) => a + getProgress(b), 0) / syllabuses.length) 
    : 0;

  const stats = [
    { label: isBN ? 'অধ্যয়ন স্ট্রিক' : 'Study Streak', value: '12 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', path: '/planner' },
    { label: isBN ? 'মোট ফোকাস' : 'Total Focus', value: `${Math.round(totalFocusMinutes / 60)} hrs`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/timer' },
    { label: isBN ? 'গড় স্কোর' : 'Avg Score', value: `${avgScore}%`, icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', path: '/syllabus' },
    { label: isBN ? 'মাস্টারি' : 'Mastery', value: `${overallMastery}%`, icon: CheckCircle2, color: 'dynamic-primary-text', bg: 'bg-slate-50 dark:bg-slate-800/50', path: '/syllabus' },
  ];

  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-5xl font-black dark:text-white tracking-tighter">
            {isBN ? 'স্বাগতম, স্কলার!' : 'Welcome, Scholar!'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Your academic trajectory is looking promising today.</p>
        </div>
        <div 
          onClick={() => navigate('/planner')}
          className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        >
           <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
             <CalendarDays size={28} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isBN ? 'পরবর্তী পরীক্ষা' : 'Next Major Milestone'}</p>
              <p className="font-black text-slate-700 dark:text-white text-xl">HSC EXAM 2025</p>
              <p className="text-xs font-bold text-amber-600">45 Days Remaining</p>
           </div>
           <ChevronRight className="text-slate-300 ml-4" />
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl group cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-6">
              <div className={`${stat.bg} p-5 rounded-3xl group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon className={`w-8 h-8 ${stat.color === 'dynamic-primary-text' ? 'dynamic-primary-text' : stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black dark:text-white tracking-tight">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* AI Coach Card - Linked to ScholarAI through UI prompt */}
          <section className="bg-indigo-600 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden text-white group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl shadow-lg">
                    <Sparkles size={28} className="text-indigo-100" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{isBN ? 'এআই স্টাডি কোচ' : 'AI Study Coach'}</h2>
                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Personalized Insights</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); fetchAiCoach(); }}
                  disabled={isAiLoading}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all shadow-xl active:scale-90"
                >
                  <RefreshCw className={isAiLoading ? 'animate-spin' : ''} size={24} />
                </button>
              </div>
              
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-[2.5rem] p-8 min-h-[160px] border border-white/10">
                {aiAdvise ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose prose-invert prose-lg max-w-none font-medium leading-relaxed">
                    {aiAdvise}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-70">
                    <div className="p-4 bg-white/10 rounded-full"><BrainChartIcon className="w-12 h-12" /></div>
                    <p className="text-sm font-bold max-w-xs">Click refresh for a personalized performance analysis from Scholar AI.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Quick Action Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div 
              onClick={() => navigate('/vault')}
              className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
             >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <ArrowUpRight className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white mb-2">{isBN ? 'কনসেপ্ট ভল্ট' : 'Concept Vault'}</h3>
                  <p className="text-xs text-slate-400 font-medium">Browse your saved formulas and definitions.</p>
                </div>
             </div>

             <div 
              onClick={() => navigate('/resources')}
              className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
             >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <ArrowUpRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-black dark:text-white mb-2">{isBN ? 'রিসোর্স লাইব্রেরি' : 'Resource Library'}</h3>
                  <p className="text-xs text-slate-400 font-medium">Access your textbooks and PDF materials.</p>
                </div>
             </div>
          </div>

          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                   <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-600 shadow-inner" style={{ color: settings.primaryColor }}>
                     <History size={24} />
                   </div>
                   <div>
                    <h2 className="text-2xl font-black dark:text-white">{isBN ? 'পড়াশোনার ধারাবাহিকতা' : 'Consistency Heatmap'}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 30 Days of Focus</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-full">
                   <span>Less</span>
                   <div className="flex gap-1 mx-2">
                      {INTENSITY_COLORS.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />)}
                   </div>
                   <span>More</span>
                </div>
             </div>
             <div className="flex flex-wrap gap-4">
                {heatmapData.map((day, i) => (
                  <div 
                    key={i} 
                    title={`${day.date}: ${day.minutes} mins`}
                    className="w-10 h-10 rounded-[1rem] transition-all hover:scale-125 hover:shadow-xl cursor-help"
                    style={{ backgroundColor: day.intensity === 0 ? (settings.darkMode ? '#1e293b' : '#f8fafc') : INTENSITY_COLORS[day.intensity] }}
                  />
                ))}
             </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-4 mb-10">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-yellow-500 shadow-inner">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black dark:text-white">{isBN ? 'পারফরম্যান্স ট্রেন্ড' : 'Performance Analysis'}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery over time</p>
                </div>
             </div>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={settings.primaryColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={settings.primaryColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={settings.darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip 
                        contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', backgroundColor: settings.darkMode ? '#0f172a' : '#fff'}}
                      />
                      <Area type="monotone" dataKey="score" stroke={settings.primaryColor} strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Quick Tasks Section */}
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black dark:text-white">{isBN ? 'টু-ডু লিস্ট' : 'Action Items'}</h2>
              <button 
                onClick={() => navigate('/planner')}
                className="dynamic-primary-text p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group">
                  <div 
                    onClick={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}
                    className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    {task.completed && <CheckCircle2 size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold transition-all ${task.completed ? 'line-through text-slate-300 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{task.category}</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/planner')}
                className="w-full py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
              >
                View Planner →
              </button>
            </div>
          </section>

          {/* Upcoming Events Section */}
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white">{isBN ? 'আসন্ন ইভেন্ট' : 'Schedule'}</h2>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-indigo-600" style={{ color: settings.primaryColor }}>
                  <CalendarDays size={20} />
                </div>
             </div>
             <div className="space-y-6">
                {upcomingEvents.length > 0 ? upcomingEvents.map(ev => (
                  <div key={ev.id} className="flex gap-5 group cursor-pointer" onClick={() => navigate('/planner')}>
                     <div className="flex flex-col items-center justify-center w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date(ev.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                        <span className="text-xl font-black text-slate-800 dark:text-white" style={groupHoverColor(settings.primaryColor)}>{new Date(ev.date).getDate()}</span>
                     </div>
                     <div className="flex-1">
                        <p className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{ev.title}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ev.time} • {ev.category}</p>
                     </div>
                  </div>
                )) : (
                  <div className="py-10 text-center flex flex-col items-center">
                    <History className="text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-300">No upcoming events.</p>
                  </div>
                )}
             </div>
          </section>

          {/* Goal Mastery Section */}
          <section 
            onClick={() => navigate('/syllabus')}
            className="p-12 rounded-[4.5rem] shadow-2xl text-white relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
            style={{ background: `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.primaryColor}CC 100%)` }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
               <Target size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black mb-4">{isBN ? 'লক্ষ্য অর্জন' : 'Goal Mastery'}</h3>
              <p className="text-white/80 text-sm mb-12 leading-relaxed font-medium">
                Your syllabus mastery is at <strong className="text-white text-lg">{overallMastery}%</strong>. 
                Keep pushing toward <strong className="text-white">100%</strong> to secure your top grade!
              </p>
              
              <div className="flex items-end justify-between mb-6">
                <div className="p-5 bg-white/20 backdrop-blur-md rounded-[2.5rem] shadow-lg">
                   <Target size={40} />
                </div>
                <div className="text-right">
                  <span className="text-5xl font-black">{overallMastery}%</span>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Overall Done</p>
                </div>
              </div>
              
              <div className="w-full bg-white/20 h-4 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${overallMastery}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-white h-full shadow-[0_0_20px_white]"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const groupHoverColor = (color: string) => ({
  '--hover-color': color,
} as React.CSSProperties);

const BrainChartIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z" />
    <path d="m16 12-4-4-4 4" />
    <path d="M12 8v8" />
  </svg>
);

export default Dashboard;
