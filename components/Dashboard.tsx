
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
  CalendarDays,
  Target,
  Sparkles,
  RefreshCw,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Zap,
  Lightbulb,
  Circle,
  Timer,
  Calculator
} from 'lucide-react';
import { Syllabus, AppSettings, FocusLog, Task } from '../types';
import { getStudyAdvise } from '../services/geminiService';

const Dashboard: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([]);
  const [aiAdvise, setAiAdvise] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, mins: number}>({days: 0, hours: 0, mins: 0});

  useEffect(() => {
    const savedTasks = localStorage.getItem('scholars_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    const savedSyllabus = localStorage.getItem('scholars_syllabuses_v2');
    if (savedSyllabus) setSyllabuses(JSON.parse(savedSyllabus));
    
    const savedLogs = localStorage.getItem('scholars_focus_logs');
    if (savedLogs) setFocusLogs(JSON.parse(savedLogs));

    // Countdown Logic (Target: April 1, 2027 for HSC 27)
    const target = new Date('2027-04-01T00:00:00');
    const timer = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      
      // Ensure we don't show negative values if the date passed
      const remaining = Math.max(0, diff);
      
      setTimeLeft({
        days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((remaining / (1000 * 60 * 60)) % 24),
        mins: Math.floor((remaining / 1000 / 60) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalFocusMinutes = focusLogs.reduce((a, b) => a + b.minutes, 0);
  
  const stats = [
    { label: isBN ? 'অধ্যয়ন স্ট্রিক' : 'Study Streak', value: '12 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', path: '/analytics' },
    { label: isBN ? 'মোট ফোকাস' : 'Total Focus', value: `${Math.round(totalFocusMinutes / 60)} hrs`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/analytics' },
    { label: isBN ? 'সাপ্তাহিক লক্ষ্য' : 'Weekly Goal', value: '85%', icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', path: '/analytics' },
    { label: isBN ? 'কাজ সম্পন্ন' : 'Tasks Done', value: `${tasks.filter(t => t.completed).length}/${tasks.length}`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', path: '/planner' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 px-4 md:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-5xl font-black dark:text-white tracking-tighter">
            {isBN ? 'স্বাগতম, স্কলার!' : 'Welcome, Scholar!'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Ready to crush your academic goals today?</p>
        </div>
        
        {/* Exam Countdown */}
        <div className="bg-indigo-600 p-8 rounded-[3.5rem] shadow-xl text-white flex gap-6 items-center">
           <Timer className="w-10 h-10 opacity-50" />
           <div className="flex gap-4">
              <div className="text-center">
                 <p className="text-2xl font-black">{timeLeft.days}</p>
                 <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{isBN ? 'দিন' : 'Days'}</p>
              </div>
              <div className="text-2xl font-black opacity-30">:</div>
              <div className="text-center">
                 <p className="text-2xl font-black">{timeLeft.hours}</p>
                 <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{isBN ? 'ঘণ্টা' : 'Hrs'}</p>
              </div>
              <div className="text-center">
                 <p className="text-2xl font-black">{timeLeft.mins}</p>
                 <p className="text-[8px] font-black uppercase tracking-widest opacity-60">{isBN ? 'মিনিট' : 'Mins'}</p>
              </div>
           </div>
           <div className="h-10 w-px bg-white/20 mx-2" />
           <p className="text-xs font-black uppercase tracking-tighter leading-none">{settings.examLevel}<br/>Exam 2027</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-2xl group cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-6">
              <div className={`${stat.bg} p-5 rounded-[2rem] group-hover:scale-110 transition-transform shadow-inner`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
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
          <section className="bg-indigo-600 p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden text-white">
            <div className="relative z-10">
               <div className="flex items-center gap-5 mb-8">
                  <Sparkles size={32} className="text-indigo-100" />
                  <h2 className="text-3xl font-black">{isBN ? 'এআই স্টাডি কোচ' : 'AI Performance Coach'}</h2>
               </div>
               <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-10 min-h-[120px] border border-white/10">
                  <p className="text-lg font-medium leading-relaxed opacity-90">
                    {isBN ? "তোমার পড়াশোনার ধারাবাহিকতা অসাধারণ! পদার্থবিজ্ঞানের ৩য় অধ্যায়টি আজ রিভিশন দিলে ভালো হবে।" : "Your study consistency is peaking! Consider reviewing Physics Chapter 3 to maintain momentum."}
                  </p>
               </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div onClick={() => navigate('/gpa')} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
                <div className="p-5 bg-amber-50 rounded-2xl text-amber-600 w-fit mb-6"><Calculator className="w-8 h-8" /></div>
                <h3 className="text-2xl font-black dark:text-white mb-2">{isBN ? 'জিপিএ ক্যালকুলেটর' : 'GPA Calculator'}</h3>
                <p className="text-sm text-slate-500">Predict your academic grades.</p>
             </div>
             <div onClick={() => navigate('/analytics')} className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all cursor-pointer group">
                <div className="p-5 bg-emerald-50 rounded-2xl text-emerald-600 w-fit mb-6"><TrendingUp className="w-8 h-8" /></div>
                <h3 className="text-2xl font-black dark:text-white mb-2">{isBN ? 'এনালিটিক্স' : 'Analytics'}</h3>
                <p className="text-sm text-slate-500">Track your deep work hours.</p>
             </div>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-sm border border-slate-100 dark:border-slate-800">
            <h2 className="text-2xl font-black dark:text-white mb-10">{isBN ? 'আজকের কাজসমূহ' : 'Daily Tasks'}</h2>
            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group cursor-pointer" onClick={() => navigate('/planner')}>
                    <div className={`shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    <p className={`font-bold text-base transition-all line-clamp-1 ${task.completed ? 'line-through text-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-slate-400 font-medium text-sm">No tasks for today. Relax!</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
