import React, { useState, useEffect, useRef } from 'react';
/* Added missing AnimatePresence and motion imports from framer-motion to fix the identified errors */
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  CloudRain, 
  TreePine, 
  Wind, 
  BookOpen, 
  VolumeX,
  Volume1,
  Coffee,
  Brain,
  Sparkles
} from 'lucide-react';
import { AppSettings, Syllabus, FocusLog } from '../types';

const AMBIENT_URLS = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/2443/2443-preview.mp3', // Generic rain loop
  forest: 'https://assets.mixkit.co/active_storage/sfx/1117/1117-preview.mp3', // Generic forest loop
  white: 'https://assets.mixkit.co/active_storage/sfx/2355/2355-preview.mp3' // Generic wind/white noise
};

const FocusTimer: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  
  // Audio State
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'forest' | 'white'>('none');
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  // App Data
  const [subjects, setSubjects] = useState<Syllabus[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('General');
  
  // Refs for Audio Objects
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('scholars_syllabuses_v2');
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  // Handle Mode Change
  useEffect(() => {
    const times = {
      work: 25 * 60,
      short: 5 * 60,
      long: 15 * 60
    };
    setTimeLeft(times[mode]);
    setIsActive(false);
  }, [mode]);

  // Handle Ambient Sound Playback
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current = null;
    }

    if (ambientSound !== 'none') {
      const audio = new Audio(AMBIENT_URLS[ambientSound as keyof typeof AMBIENT_URLS]);
      audio.loop = true;
      audio.volume = volume;
      audio.play().catch(e => console.log("Audio play blocked by browser policy"));
      ambientAudioRef.current = audio;
    }

    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, [ambientSound]);

  // Update Volume
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = volume;
    }
  }, [volume]);

  // Main Timer Effect
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
    // Play Notification
    const finishSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    finishSound.volume = volume;
    finishSound.play();

    if (mode === 'work') {
      logSession(25);
      const msg = isBN ? 'দারুণ! আপনার ফোকাস সেশন শেষ হয়েছে। ৫ মিনিট বিরতি নিন।' : 'Great job! Focus session complete. Take a 5-minute break.';
      alert(msg);
      setMode('short');
    } else {
      const msg = isBN ? 'বিরতি শেষ! আবার পড়ার সময় হয়েছে।' : 'Break over! Time to get back to work.';
      alert(msg);
      setMode('work');
    }
  };

  const logSession = (mins: number) => {
    const logs: FocusLog[] = JSON.parse(localStorage.getItem('scholars_focus_logs') || '[]');
    const newLog: FocusLog = {
      id: Date.now().toString(),
      subjectId: selectedSubject,
      minutes: mins,
      date: new Date().toISOString()
    };
    localStorage.setItem('scholars_focus_logs', JSON.stringify([...logs, newLog]));
    window.dispatchEvent(new Event('focusUpdate'));
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    const times = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
    setTimeLeft(times[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ambientSounds = [
    { id: 'rain', icon: CloudRain, label: isBN ? 'বৃষ্টি' : 'Rain' },
    { id: 'forest', icon: TreePine, label: isBN ? 'বন' : 'Forest' },
    { id: 'white', icon: Wind, label: isBN ? 'বাতাস' : 'Wind' },
  ];

  const totalTime = mode === 'work' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60;
  const progress = (timeLeft / totalTime) * 100;
  
  // Theme Color based on Mode
  const modeColor = mode === 'work' ? settings.primaryColor : mode === 'short' ? '#10b981' : '#f59e0b';
  const modeIcon = mode === 'work' ? <Brain size={20} /> : <Coffee size={20} />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in zoom-in duration-500 pb-12">
      
      {/* Header Info */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black dark:text-white tracking-tight mb-2">
          {isBN ? 'ফোকাস টাইমার' : 'Zen Focus Timer'}
        </h1>
        <p className="text-slate-400 font-medium">
          {isBN ? 'গভীর মনোযোগের সাথে আপনার লক্ষ্য অর্জন করুন।' : 'Reach your flow state with deep concentration.'}
        </p>
      </div>

      {/* Subject Picker & Mode Selector */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 w-full max-w-2xl">
        <div className="flex-1 flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-4 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <BookOpen size={18} className="text-slate-400" />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isBN ? 'বিষয়:' : 'Studying:'}</span>
            <select 
              className="bg-transparent border-none text-sm font-bold focus:ring-0 dark:text-white cursor-pointer p-0"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="General">{isBN ? 'সাধারণ' : 'General Study'}</option>
              {subjects.map(s => <option key={s.id} value={s.subject}>{s.subject}</option>)}
            </select>
          </div>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          {(['work', 'short', 'long'] as const).map((m) => (
            <button 
              key={m}
              onClick={() => setMode(m)}
              className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${mode === m ? 'text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              style={mode === m ? { backgroundColor: modeColor } : {}}
            >
              {m === 'work' ? (isBN ? 'পমোডোরো' : 'Focus') : m === 'short' ? (isBN ? 'বিরতি' : 'Short') : (isBN ? 'দীর্ঘ বিরতি' : 'Long')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="relative w-80 h-80 flex items-center justify-center mb-12">
        <div 
          className={`absolute inset-0 rounded-full transition-all duration-1000 ${isActive ? 'opacity-20 animate-pulse' : 'opacity-0'}`}
          style={{ backgroundColor: modeColor, transform: 'scale(1.1)' }}
        />
        <svg className="w-full h-full -rotate-90 relative z-10">
          <circle
            cx="160" cy="160" r="145"
            className="stroke-slate-100 dark:stroke-slate-800/50"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="160" cy="160" r="145"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={911}
            strokeDashoffset={911 - (911 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
            style={{ 
              stroke: modeColor,
              filter: isActive ? `drop-shadow(0 0 8px ${modeColor}80)` : 'none'
            }}
          />
        </svg>
        <div className="absolute flex flex-col items-center z-20">
          <div className="p-3 rounded-2xl mb-2" style={{ backgroundColor: `${modeColor}1A`, color: modeColor }}>
            {modeIcon}
          </div>
          <span className="text-7xl font-black tracking-tighter text-slate-800 dark:text-white tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            {mode === 'work' ? (isBN ? 'মনোযোগ দিন' : 'Focus Mode') : (isBN ? 'বিশ্রাম' : 'Break Time')}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mb-16 relative">
        <button 
          onClick={resetTimer}
          className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:scale-110 active:scale-95 text-slate-400 hover:text-rose-500"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button 
          onClick={toggleTimer}
          className="p-10 text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative overflow-hidden group"
          style={{ backgroundColor: modeColor }}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isActive ? <Pause className="w-12 h-12 fill-current" /> : <Play className="w-12 h-12 fill-current ml-2" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            className={`p-5 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:scale-110 active:scale-95 ${showVolumeSlider ? 'text-indigo-600' : 'text-slate-400'}`}
            style={showVolumeSlider ? { color: modeColor } : {}}
          >
            {volume === 0 ? <VolumeX size={24} /> : volume < 0.5 ? <Volume1 size={24} /> : <Volume2 size={24} />}
          </button>
          
          <AnimatePresence>
            {showVolumeSlider && (
              /* Converted container to motion.div and added animation props to work correctly with AnimatePresence */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800"
              >
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  className="h-32 accent-indigo-600" 
                  style={{ writingMode: 'bt-lr', appearance: 'slider-vertical' } as any}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ambient Soundscape Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm w-full max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-indigo-500" /> {isBN ? 'জেন অ্যাম্বিয়েন্ট সাউন্ড' : 'Zen Ambient Soundscapes'}
          </h3>
          {ambientSound !== 'none' && (
            <button 
              onClick={() => setAmbientSound('none')}
              className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline"
            >
              {isBN ? 'বন্ধ করুন' : 'Turn Off'}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {ambientSounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => setAmbientSound(ambientSound === sound.id ? 'none' : sound.id as any)}
              className={`flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all group ${ambientSound === sound.id ? 'text-white shadow-xl translate-y-[-4px]' : 'bg-slate-50/50 dark:bg-slate-800/50 border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600'}`}
              style={ambientSound === sound.id ? { backgroundColor: modeColor, borderColor: modeColor } : {}}
            >
              <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${ambientSound === sound.id ? 'bg-white/20' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                <sound.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest">{sound.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
