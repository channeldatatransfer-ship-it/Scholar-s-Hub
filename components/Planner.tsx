
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Wand2 } from 'lucide-react';

const Planner: React.FC = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: 'Calculus Study Session', time: '10:00 AM', category: 'Math' },
    { id: 2, title: 'Physics Mock Test', time: '2:00 PM', category: 'Science' },
  ]);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Simple calendar generator for the month of May (hardcoded for demo simplicity)
  const currentMonthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Study Planner</h1>
          <p className="text-slate-500 dark:text-slate-400">Map out your road to success.</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800">
             <Wand2 className="w-5 h-5" /> AI Auto-Schedule
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
             <Plus className="w-5 h-5" /> Add Event
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold dark:text-white">May 2024</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"><ChevronLeft /></button>
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl"><ChevronRight /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px mb-4">
            {days.map(day => (
              <div key={day} className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-4">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            {currentMonthDays.map(day => {
              const hasEvent = day === 24 || day === 20;
              return (
                <div key={day} className={`
                  aspect-square p-2 rounded-2xl border flex flex-col items-end transition-all cursor-pointer
                  ${hasEvent ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 shadow-sm' : 'border-slate-50 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'}
                `}>
                  <span className={`text-sm font-bold ${hasEvent ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'}`}>{day}</span>
                  {hasEvent && <div className="mt-auto w-2 h-2 bg-indigo-600 rounded-full"></div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
           <section className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold mb-6 dark:text-white">Upcoming Events</h3>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{event.category}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{event.title}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Today, {event.time}</p>
                  </div>
                ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default Planner;
