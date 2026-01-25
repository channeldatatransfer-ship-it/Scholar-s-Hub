
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Clock, Target, Calendar, Award } from 'lucide-react';
import { AppSettings, FocusLog } from '../types';

const Analytics: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  
  const focusLogs: FocusLog[] = useMemo(() => {
    const saved = localStorage.getItem('scholars_focus_logs');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayLogs = focusLogs.filter(log => log.date.startsWith(date));
      const totalMinutes = dayLogs.reduce((acc, log) => acc + log.minutes, 0);
      return {
        name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        minutes: totalMinutes
      };
    });
  }, [focusLogs]);

  const totalTime = focusLogs.reduce((a, b) => a + b.minutes, 0);
  const avgTime = Math.round(totalTime / (focusLogs.length || 1));

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header>
        <h1 className="text-4xl font-black dark:text-white tracking-tight flex items-center gap-4">
          <TrendingUp className="w-12 h-12 text-emerald-500" />
          {isBN ? 'স্টাডি এনালিটিক্স' : 'Performance Analytics'}
        </h1>
        <p className="text-slate-500 font-medium">Visualize your growth and study consistency.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Clock /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Time</p>
           </div>
           <h2 className="text-4xl font-black dark:text-white">{Math.round(totalTime / 60)} <span className="text-sm text-slate-400">Hours</span></h2>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Target /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average / Session</p>
           </div>
           <h2 className="text-4xl font-black dark:text-white">{avgTime} <span className="text-sm text-slate-400">Minutes</span></h2>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><Award /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</p>
           </div>
           <h2 className="text-4xl font-black dark:text-white">Gold <span className="text-sm text-slate-400">Rank</span></h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm">
         <h3 className="text-xl font-black dark:text-white mb-10">{isBN ? 'গত ৭ দিনের চিত্র' : 'Last 7 Days Study Trend'}</h3>
         <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dx={-10} />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                  <Area type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorMin)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
