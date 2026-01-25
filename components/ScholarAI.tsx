
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  RefreshCw,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Waves,
  Pause,
  Play
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { scholarChat } from '../services/geminiService';
import { AppSettings } from '../types';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const ScholarAI: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('scholars_ai_history');
    return saved ? JSON.parse(saved) : [
      { role: 'ai', text: isBN ? 'হ্যালো স্কলার! আমি তোমার স্টাডি বাডি। আজ তোমাকে পড়াশোনায় কিভাবে সাহায্য করতে পারি?' : 'Hello Scholar! I am your study buddy. How can I help you with your studies today?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Live API Refs
  const liveSessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('scholars_ai_history', JSON.stringify(messages));
  }, [messages]);

  // Audio Encoding/Decoding helpers
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startLiveSession = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const outCtx = audioContextRef.current;
    const inCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: async () => {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = inCtx.createMediaStreamSource(stream);
          const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            const pcmBlob: Blob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000'
            };
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inCtx.destination);
          setIsLiveMode(true);
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), outCtx);
            const source = outCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        },
        onclose: () => setIsLiveMode(false),
        onerror: () => setIsLiveMode(false)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: `You are Scholar Hub's Voice Assistant. You help students in Bangladesh with their studies. Respond naturally and encouragingly in Bengali (Bangla). Use English only for specific technical terms.`
      }
    });

    liveSessionRef.current = await sessionPromise;
  };

  const stopLiveSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    setIsLiveMode(false);
  };

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text }]
      }));
      const response = await scholarChat(textToSend, history);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: isBN ? "দুঃখিত, সংযোগে সমস্যা হচ্ছে।" : "Sorry, connection error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          // Fix: Removed broken comment within JSX parentheses to avoid operator and name errors
          <motion.div
            {...({
              initial: { opacity: 0, y: 20, scale: 0.95 },
              animate: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                width: isMaximized ? 'min(90vw, 750px)' : '400px',
                height: isMaximized ? '80vh' : '600px',
              },
              exit: { opacity: 0, y: 20, scale: 0.95 }
            } as any)}
            className="mb-4 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600" style={{ color: settings.primaryColor }}>
                  <Sparkles size={20} className={isLiveMode ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <h3 className="font-black text-sm dark:text-white">Scholar AI {isLiveMode ? '(Live)' : ''}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{isLiveMode ? 'Listening' : 'Ready'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => isLiveMode ? stopLiveSession() : startLiveSession()} 
                  className={`p-2 rounded-xl transition-all ${isLiveMode ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}
                >
                  {isLiveMode ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white"><Maximize2 size={16} /></button>
                <button onClick={() => { stopLiveSession(); setIsOpen(false); }} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl dark:text-white"><X size={20} /></button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 no-scrollbar">
              {isLiveMode ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8">
                  <div className="relative">
                    <motion.div 
                      {...({ animate: { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }, transition: { duration: 2, repeat: Infinity } } as any)}
                      className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl"
                    />
                    <div className="relative w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl">
                      <Waves className="text-white w-16 h-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black dark:text-white">Live Voice Mode</h4>
                    <p className="text-slate-500 text-sm max-w-[200px]">Speak naturally. AI will listen and respond in Bengali.</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                        m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-none'
                      }`} style={m.role === 'user' ? { backgroundColor: settings.primaryColor } : {}}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] rounded-tl-none border flex gap-1.5 animate-pulse">
                        <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {!isLiveMode && (
              <div className="p-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isBN ? "বলো স্কলার..." : "Ask Scholar..."}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] py-5 pl-6 pr-16 text-sm font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-2 p-3.5 bg-indigo-600 text-white rounded-[1.5rem] transition-all active:scale-90 disabled:opacity-30"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fix: Removed broken comment within JSX parentheses to avoid name errors */}
      <motion.button
        {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)}
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] text-white flex items-center justify-center relative overflow-hidden group"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        {isLiveMode && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ScholarAI;
