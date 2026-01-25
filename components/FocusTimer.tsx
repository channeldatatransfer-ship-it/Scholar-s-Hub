
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Coffee,
  Brain,
  Zap,
  CheckCircle2,
  Target,
  Maximize2,
  Minimize2,
  Waves
} from 'lucide-react';
import { AppSettings, Syllabus, FocusLog, Task } from '../types';

const AMBIENT_URLS = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/2443/2443-preview.mp3',
  forest: 'https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3',
  white: 'https://assets.mixkit.co/active_storage/sfx/2355/2355-preview.mp3'
};

const FocusTimer: React.FC<{ settings: AppSettings, onUpdate: (updates: Partial<AppSettings>) => void }> = ({ settings, onUpdate }) => {
  const isBN = settings.language === 'BN';
  const durations = settings.focusDurations;

  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [timeLeft, setTimeLeft] = useState(durations[mode] * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);
  
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'forest' | 'white'>('none');
  const [volume, setVolume] = useState(0.5);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('scholars_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(durations[mode] * 60);
    }
  }, [mode, durations]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current = null;
    }

    if (ambientSound !== 'none') {
      const audio = new Audio(AMBIENT_URLS[ambientSound as keyof typeof AMBIENT_URLS]);
      audio.loop = true;
      audio.volume = volume;
      audio.play().catch(() => {});
      ambientAudioRef.current = audio;
    }

    return () => ambientAudioRef.current?.pause();
  }, [ambientSound]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    const finishSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    finishSound.volume = volume;
    finishSound.play().catch(() => {});

    if (mode === 'work') {
      const newSessionCount = sessionsCompleted + 1;
      setSessionsCompleted(newSessionCount);
      logSession(durations.work);
      
      if (newSessionCount % 4 === 0) {
        setMode('long');
      } else {
        setMode('short');
      }
    } else {
      setMode('work');
    }
  };

  const logSession = (mins: number) => {
    const logs: FocusLog[] = JSON.parse(localStorage.getItem('scholars_focus_logs') || '[]');
    const newLog: FocusLog = {
      id: Date.now().toString(),
      subjectId: selectedTaskId === 'none' ? 'General' : tasks.find(t => t.id === selectedTaskId)?.title || 'General',
      minutes: mins,
      date: new Date().toISOString()
    };
    localStorage.setItem('scholars_focus_logs', JSON.stringify([...logs, newLog]));
    window.dispatchEvent(new Event('focusUpdate'));
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[mode] * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTaskObj = tasks.find(t => t.id === selectedTaskId);

  // Dynamic Theme Colors
  const colors = {
    work: settings.primaryColor,
    short: '#10b981',
    long: '#f59e0b'
  };

  return (
    <div className={`max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col items-center justify-center transition-all duration-700 ${isZenMode ? 'p-0' : 'p-4'}`}>
      
      <AnimatePresence mode="wait">
        {!isZenMode && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl flex flex-col items-center mb-12"
          >
            <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 mb-8 w-full md:w-auto">
              {(['work', 'short', 'long'] as const).map((m) => (
                <button 
                  key={m}
                  onClick={() => { setMode(m); setIsActive(false); }}
                  className={`px-8 py-3 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${mode === m ? 'text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  style={mode === m ? { backgroundColor: colors[m] } : {}}
                >
                  {m === 'work' ? (isBN ? 'ফোকাস' : 'Focus') : m === 'short' ? (isBN ? 'ছোট বিরতি' : 'Short') : (isBN ? 'বড় বিরতি' : 'Long')}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:border-indigo-200 transition-all shadow-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <Target size={20} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{isBN ? 'বর্তমান লক্ষ্য' : 'Focus Goal'}</p>
                  <select 
                    className="w-full bg-transparent border-none p-0 text-sm font-bold focus:ring-0 dark:text-white appearance-none cursor-pointer"
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                  >
                    <option value="none">{isBN ? 'সাধারণ পড়াশোনা' : 'General Study Session'}</option>
                    {tasks.filter(t => !t.completed).map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm min-w-[200px]">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <Zap size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{isBN ? 'সেশন' : 'Streak'}</p>
                  <div className="flex gap-1.5 mt-1">
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} className={`w-3 h-1.5 rounded-full transition-all duration-500 ${sessionsCompleted >= s ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-800'}`} style={sessionsCompleted >= s ? { backgroundColor: colors.work } : {}} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative flex flex-col items-center justify-center transition-all duration-1000 ${isZenMode ? 'scale-125' : 'scale-100'}`}>
        {/* The Fluid Blob - The Main "New Style" Element */}
        <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
          <motion.div
            {...({
              animate: {
                borderRadius: isActive 
                  ? ["40% 60% 70% 30% / 40% 50% 60% 50%", "30% 60% 70% 40% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"] 
                  : "50% 50% 50% 50% / 50% 50% 50% 50%",
                scale: isActive ? [1, 1.05, 1] : 1,
              },
              transition: {
                borderRadius: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }
            } as any)}
            className="absolute inset-0 shadow-2xl opacity-80 backdrop-blur-xl"
            style={{ 
              backgroundColor: colors[mode],
              boxShadow: `0 0 80px ${colors[mode]}4D`
            }}
          />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              {mode === 'work' ? (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="p-4 bg-white/20 rounded-3xl mb-4 text-white">
                  <Brain size={32} />
                </motion.div>
              ) : (
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="p-4 bg-white/20 rounded-3xl mb-4 text-white">
                  <Coffee size={32} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <h2 className="text-8xl md:text-9xl font-black text-white tracking-tighter tabular-nums drop-shadow-lg">
              {formatTime(timeLeft)}
            </h2>
            
            <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px] mt-4">
              {isActive ? (isBN ? 'গভীর মনোযোগ' : 'Deep Work') : (isBN ? 'প্রস্তুত হও' : 'Ready to Start')}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8 mt-16 relative z-20">
          <button 
            onClick={resetTimer} 
            className="p-5 bg-white dark:bg-slate-900 rounded-full shadow-lg border border-slate-100 dark:border-slate-800 transition-all hover:scale-110 active:scale-95 text-slate-400"
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={toggleTimer} 
            className="p-10 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center bg-white dark:bg-slate-900 text-indigo-600 border border-slate-100 dark:border-slate-800"
            style={{ color: colors[mode] }}
          >
            {isActive ? <Pause size={48} className="fill-current" /> : <Play size={48} className="fill-current ml-2" />}
          </button>

          <button 
            onClick={() => setAmbientSound(ambientSound === 'none' ? 'rain' : 'none')} 
            className={`p-5 rounded-full shadow-lg border transition-all hover:scale-110 active:scale-95 ${ambientSound !== 'none' ? 'bg-indigo-600 text-white border-transparent' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800'}`}
            style={ambientSound !== 'none' ? { backgroundColor: colors[mode] } : {}}
          >
            {ambientSound === 'none' ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>

      {/* Footer Controls */}
      <div className={`fixed bottom-12 flex gap-4 transition-all duration-700 ${isZenMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
        <button 
          onClick={() => setIsZenMode(!isZenMode)}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all"
        >
          {isZenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          {isZenMode ? 'Exit Zen' : 'Zen Focus'}
        </button>

        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          {(['rain', 'forest', 'white'] as const).map(sound => (
            <button
              key={sound}
              onClick={() => setAmbientSound(ambientSound === sound ? 'none' : sound)}
              className={`p-3 rounded-xl transition-all ${ambientSound === sound ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
              style={ambientSound === sound ? { color: colors[mode], backgroundColor: `${colors[mode]}1A` } : {}}
            >
              <Waves size={16} />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isZenMode && activeTaskObj && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-12 bg-white/10 backdrop-blur-md px-8 py-4 rounded-[2rem] border border-white/10 flex items-center gap-4"
          >
            <div className="p-2 bg-indigo-500 rounded-full text-white"><CheckCircle2 size={16} /></div>
            <span className="text-white font-bold tracking-tight">{activeTaskObj.title}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FocusTimer;
