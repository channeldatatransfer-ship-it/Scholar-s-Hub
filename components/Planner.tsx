
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Wand2, Trash2, Clock, MapPin } from 'lucide-react';
import { AppSettings, CalendarEvent } from '../types';

const Planner: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  // Helper to get local date string YYYY-MM-DD
  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [viewDate, setViewDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('scholars_events');
    const today = toLocalDateString(new Date());
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Calculus Final Prep', date: today, time: '10:00 AM', category: 'Math' },
      { id: '2', title: 'Biology Mock Test', date: today, time: '02:00 PM', category: 'Science' },
    ];
  });

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', category: 'General', time: '09:00' });

  useEffect(() => {
    localStorage.setItem('scholars_events', JSON.stringify(events));
  }, [events]);

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const handleAddEvent = () => {
    if (!newEvent.title) return;
    const ev: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      category: newEvent.category,
      time: newEvent.time,
      date: toLocalDateString(viewDate)
    };
    setEvents([...events, ev]);
    setShowAddEvent(false);
    setNewEvent({ title: '', category: 'General', time: '09:00' });
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = [];
  const totalDaysCount = daysInMonth(month, year);
  const startDay = firstDayOfMonth(month, year);

  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDaysCount; i++) calendarDays.push(i);

  const selectedDateStr = toLocalDateString(viewDate);
  const dayEvents = events.filter(e => e.date === selectedDateStr);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black dark:text-white">Study Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your roadmap to academic excellence.</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={() => alert("AI is analyzing your empty slots... (Simulated)")}
            className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-8 py-4 rounded-[2rem] font-bold flex items-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800"
            style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}1A`, borderColor: `${settings.primaryColor}33` }}
           >
             <Wand2 className="w-5 h-5" /> AI Auto-Schedule
           </button>
           <button 
            onClick={() => setShowAddEvent(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] font-bold flex items-center gap-2 shadow-2xl transition-all active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
           >
             <Plus className="w-5 h-5" /> New Event
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black dark:text-white">{monthName} {year}</h2>
            <div className="flex gap-4">
              <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-colors"><ChevronLeft /></button>
              <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-colors"><ChevronRight /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px mb-6">
            {days.map(day => (
              <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] py-4">{day}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              
              const dateObj = new Date(year, month, day);
              const currentDayStr = toLocalDateString(dateObj);
              const isSelected = selectedDateStr === currentDayStr;
              const hasEvents = events.some(e => e.date === currentDayStr);
              
              return (
                <div 
                  key={day} 
                  onClick={() => setViewDate(dateObj)}
                  className={`
                    aspect-square p-4 rounded-3xl border flex flex-col items-end transition-all cursor-pointer group relative
                    ${isSelected ? 'shadow-2xl ring-4 ring-indigo-500/10' : 'border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}
                  `}
                  style={isSelected ? { backgroundColor: `${settings.primaryColor}1A`, borderColor: settings.primaryColor } : {}}
                >
                  <span className={`text-sm font-black transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-600'}`} style={isSelected ? { color: settings.primaryColor } : {}}>{day}</span>
                  {hasEvents && (
                    <div className="mt-auto flex gap-1">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
           <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm h-full flex flex-col">
              <div className="mb-8">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Timeline</h3>
                <h2 className="text-xl font-black dark:text-white">{viewDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h2>
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto">
                {dayEvents.map(event => (
                  <div key={event.id} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 relative group animate-in slide-in-from-right duration-300">
                    <button 
                      onClick={() => deleteEvent(event.id)}
                      className="absolute top-4 right-4 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: settings.primaryColor }}>{event.category}</p>
                    <p className="font-bold text-slate-800 dark:text-white mb-4 leading-tight">{event.title}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                       <span className="flex items-center gap-1"><MapPin size={12} /> Study Hall</span>
                    </div>
                  </div>
                ))}
                {dayEvents.length === 0 && (
                  <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                      <CalendarIcon size={24} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 max-w-[150px]">No events for this date. Time to rest?</p>
                  </div>
                )}
              </div>
           </section>
        </div>
      </div>

      {showAddEvent && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddEvent(false)} />
           <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in duration-300">
              <h3 className="text-3xl font-black mb-10 dark:text-white">New Study Event</h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Title</label>
                   <input 
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Revision Session, Test..."
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</label>
                      <input 
                        type="time"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 font-bold dark:text-white"
                        value={newEvent.time}
                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 font-bold dark:text-white appearance-none"
                        value={newEvent.category}
                        onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                      >
                         <option>General</option>
                         <option>Math</option>
                         <option>Science</option>
                         <option>Languages</option>
                      </select>
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button onClick={() => setShowAddEvent(false)} className="flex-1 py-5 font-bold text-slate-400">Cancel</button>
                    <button 
                      onClick={handleAddEvent}
                      className="flex-[2] py-5 rounded-[2rem] text-white font-black text-lg shadow-xl"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      Save Event
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
