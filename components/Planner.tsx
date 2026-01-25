
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Coffee, 
  Moon, 
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Circle,
  X,
  ListTodo
} from 'lucide-react';
import { AppSettings, Task } from '../types';

interface RoutineSlot {
  hour: number;
  type: 'study' | 'sleep' | 'break' | 'none';
  label: string;
}

const Planner: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  
  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('scholars_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Routine State
  const [routine, setRoutine] = useState<RoutineSlot[]>(() => {
    const saved = localStorage.getItem('scholars_daily_routine');
    if (saved) return JSON.parse(saved);
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      type: 'none',
      label: ''
    }));
  });

  const [activeTab, setActiveTab] = useState<'routine' | 'tasks'>('routine');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('scholars_daily_routine', JSON.stringify(routine));
  }, [routine]);

  useEffect(() => {
    localStorage.setItem('scholars_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const updateSlot = (hour: number, type: RoutineSlot['type']) => {
    setRoutine(prev => prev.map(slot => 
      slot.hour === hour ? { ...slot, type, label: type === 'study' ? 'Study session' : type === 'break' ? 'Break' : type === 'sleep' ? 'Sleep' : '' } : slot
    ));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false
    };
    setTasks([task, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const currentHour = currentTime.getHours();
  const currentSlot = routine.find(s => s.hour === currentHour);

  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:00 ${period}`;
  };

  const stats = useMemo(() => {
    const study = routine.filter(s => s.type === 'study').length;
    const sleep = routine.filter(s => s.type === 'sleep').length;
    const breaks = routine.filter(s => s.type === 'break').length;
    return { study, sleep, breaks };
  }, [routine]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black dark:text-white tracking-tight flex items-center gap-4">
            <CalendarIcon className="w-12 h-12 text-indigo-600" />
            {isBN ? 'স্টাডি প্ল্যানার' : 'Smart Planner'}
          </h1>
          <p className="text-slate-500 font-medium">Structure your day and manage micro-tasks effectively.</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
           <button 
             onClick={() => setActiveTab('routine')}
             className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'routine' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
           >
             <Clock size={18} /> Routine
           </button>
           <button 
             onClick={() => setActiveTab('tasks')}
             className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
           >
             <ListTodo size={18} /> Tasks
           </button>
        </div>
      </header>

      {activeTab === 'routine' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <AlertCircle size={14} /> Right Now
                 </h3>
                 <div className="p-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-1">{formatHour(currentHour)}</p>
                    <div className="mt-4 flex items-center gap-3">
                       <div className={`p-2 rounded-lg ${currentSlot?.type === 'study' ? 'bg-emerald-500' : currentSlot?.type === 'sleep' ? 'bg-blue-500' : 'bg-orange-500'} text-white`}>
                          {currentSlot?.type === 'study' ? <BookOpen size={16} /> : currentSlot?.type === 'sleep' ? <Moon size={16} /> : <Coffee size={16} />}
                       </div>
                       <span className="font-bold dark:text-white capitalize">{currentSlot?.type === 'none' ? 'Free Time' : currentSlot?.type}</span>
                    </div>
                 </div>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Efficiency Stats</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold text-slate-500"><span>Study</span><span className="text-emerald-600">{stats.study}h</span></div>
                    <div className="flex justify-between text-sm font-bold text-slate-500"><span>Sleep</span><span className="text-blue-600">{stats.sleep}h</span></div>
                    <div className="flex justify-between text-sm font-bold text-slate-500"><span>Breaks</span><span className="text-orange-600">{stats.breaks}h</span></div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-9 bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-10 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                 <span className="font-black text-lg dark:text-white uppercase tracking-tighter">Your 24-Hour Cycle</span>
                 <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Study</div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase"><div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Sleep</div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto max-h-[700px] p-6 no-scrollbar">
                 <div className="grid grid-cols-1 gap-2">
                    {routine.map((slot) => (
                      <div key={slot.hour} className={`flex items-center gap-6 p-4 rounded-3xl transition-all border ${slot.hour === currentHour ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white dark:bg-slate-800/30 border-slate-50 dark:border-slate-800'}`}>
                         <div className="w-24 text-right"><span className="text-sm font-black text-slate-400">{formatHour(slot.hour)}</span></div>
                         <div className="flex-1 flex gap-2">
                            {(['study', 'sleep', 'break', 'none'] as const).map(t => (
                              <button key={t} onClick={() => updateSlot(slot.hour, t)} className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase transition-all ${slot.type === t ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-700 text-slate-400'}`}>
                                {t}
                              </button>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1 w-full relative">
                 <input 
                   type="text" 
                   placeholder={isBN ? "নতুন কাজ যোগ করুন..." : "Add a new task..."}
                   className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
                   value={newTaskTitle}
                   onChange={e => setNewTaskTitle(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && addTask()}
                 />
              </div>
              <button 
                onClick={addTask}
                className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
              >
                Add Task
              </button>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b dark:border-slate-800 flex justify-between items-center">
                 <h3 className="font-black text-lg dark:text-white uppercase">{isBN ? 'আজকের কাজসমূহ' : 'Tasks to Complete'}</h3>
                 <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500">{tasks.filter(t => !t.completed).length} Pending</span>
              </div>
              <div className="p-4 space-y-3 min-h-[400px]">
                 <AnimatePresence initial={false}>
                    {tasks.map(task => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${task.completed ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm hover:border-indigo-200'}`}
                      >
                         <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={() => toggleTask(task.id)}>
                            <div className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                               {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                            </div>
                            <span className={`text-lg font-bold transition-all ${task.completed ? 'line-through text-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>
                               {task.title}
                            </span>
                         </div>
                         <button onClick={() => deleteTask(task.id)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all">
                            <X size={20} />
                         </button>
                      </motion.div>
                    ))}
                 </AnimatePresence>
                 {tasks.length === 0 && (
                   <div className="py-20 flex flex-col items-center opacity-30 text-slate-500">
                      <ListTodo size={64} className="mb-4" />
                      <p className="font-bold">No tasks added yet.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
