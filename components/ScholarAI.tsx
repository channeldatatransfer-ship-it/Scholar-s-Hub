
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  GraduationCap, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  RefreshCw,
  BookOpen,
  Brain,
  Timer,
  Mic,
  MicOff,
  Volume2,
  Headphones
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { scholarChat } from '../services/geminiService';
import { AppSettings } from '../types';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const ScholarAI: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('scholars_ai_history');
    return saved ? JSON.parse(saved) : [
      { role: 'ai', text: isBN ? 'হ্যালো স্কলার! আমি তোমার স্টাডি বাডি। আজ তোমাকে কিভাবে সাহায্য করতে পারি?' : 'Hello Scholar! I am your AI Study Buddy. How can I help you ace your exams today?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Live API State
  const [isMicOn, setIsMicOn] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('scholars_ai_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const historyForApi = messages.map(m => ({
        role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text }]
      }));
      const response = await scholarChat(userMsg, historyForApi);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: isBN ? "সংযোগ করতে সমস্যা হচ্ছে।" : "Connection trouble." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LIVE MODE LOGIC ---
  const startLiveMode = async () => {
    setIsLiveMode(true);
    setIsMicOn(true);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
            const pcmBlob = {
              data: encode(new Uint8Array(int16.buffer)),
              mimeType: 'audio/pcm;rate=16000',
            };
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContextRef.current!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioData) {
            const ctx = outputAudioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
          if (message.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
          if (message.serverContent?.outputTranscription) {
             const text = message.serverContent.outputTranscription.text;
             setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'ai' && isLiveMode) {
                  return [...prev.slice(0, -1), { role: 'ai', text: last.text + text }];
                }
                return [...prev, { role: 'ai', text }];
             });
          }
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
        outputAudioTranscription: {},
        systemInstruction: 'You are a supportive academic tutor. Speak clearly and encourage the student.'
      }
    });
    
    liveSessionRef.current = await sessionPromise;
  };

  const stopLiveMode = () => {
    if (liveSessionRef.current) liveSessionRef.current.close();
    inputAudioContextRef.current?.close();
    outputAudioContextRef.current?.close();
    setIsLiveMode(false);
    setIsMicOn(false);
  };

  const clearChat = () => {
    if (confirm(isBN ? "হিস্ট্রি মুছে ফেলবেন?" : "Clear history?")) {
      setMessages([{ role: 'ai', text: isBN ? 'হিস্ট্রি মুছে ফেলা হয়েছে।' : 'History cleared.' }]);
    }
  };

  const suggestions = [
    { text: isBN ? "আমার অগ্রগতি কেমন?" : "How's my progress?", icon: BookOpen },
    { text: isBN ? "গণিতের জন্য টিপস" : "Study tips for Math", icon: Brain },
    { text: isBN ? "ফোকাস টাইমার বোঝান" : "Explain Focus Timer", icon: Timer }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMaximized ? '700px' : '400px',
              height: isMaximized ? '800px' : '600px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300"
          >
            {/* Header */}
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isLiveMode ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600'}`} style={!isLiveMode ? { color: settings.primaryColor } : {}}>
                  {isLiveMode ? <Mic size={20} /> : <Sparkles size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-sm dark:text-white tracking-tight">{isLiveMode ? (isBN ? 'লাইভ টিউটর' : 'Live Voice Tutor') : (isBN ? 'স্কলার এআই' : 'Scholar AI')}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isLiveMode ? 'bg-emerald-500 animate-ping' : 'bg-indigo-500'}`} />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{isLiveMode ? 'Listening' : 'Online'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => isLiveMode ? stopLiveMode() : startLiveMode()} className={`p-2.5 rounded-xl transition-all ${isLiveMode ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                  {isLiveMode ? <Volume2 size={18} /> : <Headphones size={18} />}
                </button>
                <button onClick={() => setIsMaximized(!isMaximized)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400">
                  {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400"><X size={20} /></button>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className={`flex-1 overflow-y-auto p-6 space-y-6 ${isLiveMode ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : 'bg-slate-50/30 dark:bg-slate-950/20'}`}>
              {isLiveMode && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center animate-pulse">
                    <Mic size={40} className="text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-black text-emerald-900 dark:text-emerald-400">Voice Mode Active</h4>
                  <p className="text-sm text-slate-500">I can hear you! Go ahead and ask me anything about your syllabus or a specific concept.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-white' : 'text-white'}`} style={m.role === 'ai' ? { backgroundColor: settings.primaryColor } : {}}>
                      {m.role === 'user' ? <GraduationCap size={16} className="text-slate-400" /> : <Sparkles size={14} />}
                    </div>
                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-slate-200 rounded-tl-none border dark:border-slate-700'
                    }`} style={m.role === 'user' ? { backgroundColor: settings.primaryColor } : {}}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <RefreshCw size={14} className="text-slate-400 animate-spin" />
                  </div>
                  <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-2xl flex gap-1">
                     <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                     <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
              {isLiveMode ? (
                <div className="flex items-center justify-center py-4">
                  <button onClick={stopLiveMode} className="flex items-center gap-3 px-12 py-4 bg-rose-500 text-white rounded-[2rem] font-black shadow-xl shadow-rose-500/30 active:scale-95 transition-all">
                    <MicOff size={20} /> End Voice Session
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {suggestions.map((s, idx) => (
                      <button key={idx} onClick={() => handleSend(s.text)} className="whitespace-nowrap px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
                        {s.text}
                      </button>
                    ))}
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder={isBN ? "বলো স্কলার..." : "Talk to me, Scholar..."}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] py-5 pl-6 pr-16 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2.5 top-2.5 p-3 rounded-2xl text-white shadow-xl transition-all active:scale-90 disabled:opacity-0"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group p-5 rounded-[2.5rem] shadow-2xl text-white flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default ScholarAI;
