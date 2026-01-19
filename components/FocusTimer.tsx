
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, CloudRain, TreePine, Wind, BellRing } from 'lucide-react';

const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'forest' | 'white'>('none');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60);
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    resetTimer();
  }, [mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ambientSounds = [
    { id: 'rain', icon: CloudRain, label: 'Rain', color: 'bg-blue-100 text-blue-600' },
    { id: 'forest', icon: TreePine, label: 'Forest', color: 'bg-green-100 text-green-600' },
    { id: 'white', icon: Wind, label: 'Wind', color: 'bg-slate-100 text-slate-600' },
  ];

  const progress = (timeLeft / (mode === 'work' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60)) * 100;

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[80vh] animate-in slide-in-from-bottom duration-500">
      <div className="mb-12 flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <button 
          onClick={() => setMode('work')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'work' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Pomodoro
        </button>
        <button 
          onClick={() => setMode('short')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'short' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Short Break
        </button>
        <button 
          onClick={() => setMode('long')}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'long' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        >
          Long Break
        </button>
      </div>

      <div className="relative w-80 h-80 flex items-center justify-center mb-12">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="160" cy="160" r="150"
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="160" cy="160" r="150"
            className="stroke-indigo-600"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={942}
            strokeDashoffset={942 - (942 * progress) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-7xl font-black tracking-tighter text-slate-800 dark:text-white">{formatTime(timeLeft)}</span>
          <span className="text-slate-400 font-medium uppercase tracking-widest text-sm">{mode === 'work' ? 'Focusing' : 'Relaxing'}</span>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-16">
        <button 
          onClick={resetTimer}
          className="p-4 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-105"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button 
          onClick={toggleTimer}
          className="p-8 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-300 dark:shadow-none transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
        >
          {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
        </button>
        <button 
          className="p-4 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-105"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm w-full max-w-lg">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <CloudRain className="w-4 h-4" /> Zen Mode Ambient
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {ambientSounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => setAmbientSound(ambientSound === sound.id ? 'none' : sound.id as any)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${ambientSound === sound.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40'}`}
            >
              <sound.icon className="w-6 h-6" />
              <span className="text-xs font-bold">{sound.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;
