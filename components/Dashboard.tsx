
import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Plus,
  Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Revise Calculus Ch. 4', completed: false },
    { id: '2', title: 'Biology Flashcards', completed: true },
    { id: '3', title: 'Prepare Physics Mock', completed: false },
  ]);

  const stats = [
    { label: 'Study Streak', value: '12 Days', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Time Studied', value: '42.5 hrs', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Quiz Score', value: '88%', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Tasks Done', value: '18/24', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const studyData = [
    { day: 'Mon', hours: 4 },
    { day: 'Tue', hours: 6 },
    { day: 'Wed', hours: 5 },
    { day: 'Thu', hours: 8 },
    { day: 'Fri', hours: 3 },
    { day: 'Sat', hours: 7 },
    { day: 'Sun', hours: 9 },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Welcome back, Scholar! 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Your exam is in 14 days. You've got this.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95">
          <Zap className="w-5 h-5 fill-current" />
          Quick Study Session
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`${stat.bg} dark:bg-slate-700 p-3 rounded-2xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold dark:text-white">Study Activity</h2>
              <select className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm p-2 focus:ring-0">
                <option>Weekly View</option>
                <option>Monthly View</option>
              </select>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studyData}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4338ca" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4338ca" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#4338ca" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-6 dark:text-white">Next Scheduled Event</h2>
            <div className="flex items-center gap-6 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
              <div className="bg-indigo-600 text-white p-4 rounded-xl text-center min-w-[80px]">
                <p className="text-xs uppercase font-bold opacity-80">MAY</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg dark:text-white">Chemistry Practical Exam</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                   <Clock className="w-4 h-4" /> 09:00 AM - 12:00 PM • Lab 3
                </p>
              </div>
              <button className="p-3 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors">
                 <Plus className="text-indigo-600" />
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold dark:text-white">Active Tasks</h2>
              <button className="text-indigo-600 hover:text-indigo-700 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors group">
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    onChange={() => {
                      setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t));
                    }}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`flex-1 text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                    {task.title}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-slate-400 text-center py-4 italic">No tasks yet!</p>}
            </div>
          </section>

          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Weekly Goal</h3>
              <p className="text-white/80 text-sm mb-6">Complete 12 Study Sessions to unlock the "Master Scholar" badge.</p>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">8/12</span>
                <span className="text-sm font-bold opacity-80">66% Complete</span>
              </div>
              <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000" style={{width: '66%'}}></div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Trophy className="w-32 h-32" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
