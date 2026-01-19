
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  GraduationCap, 
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  Headphones,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
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
      { role: 'ai', text: 'হ্যালো স্কলার! আমি তোমার স্টাডি বাডি। আজ তোমাকে পড়াশোনায় কিভাবে সাহায্য করতে পারি?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

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
      setMessages(prev => [...prev, { role: 'ai', text: "দুঃখিত, সংযোগে সমস্যা হচ্ছে।" }]);
    } finally {
      setIsLoading(false);
    }
  };

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
            className="mb-4 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600" style={{ color: settings.primaryColor }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm dark:text-white">Scholar AI (বাংলা)</h3>
                  <span className="text-[10px] text-emerald-500 font-black uppercase">Active Now</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsMaximized(!isMaximized)} className="p-2 bg-slate-50 rounded-xl"><Maximize2 size={16} /></button>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-50 rounded-xl"><X size={20} /></button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                    m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 dark:text-white border'
                  }`} style={m.role === 'user' ? { backgroundColor: settings.primaryColor } : {}}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border-t">
              <div className="relative">
                <input
                  type="text"
                  placeholder="বলো স্কলার..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] py-5 pl-6 pr-16 text-sm font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-[2rem]"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 rounded-[2.5rem] shadow-2xl text-white flex items-center justify-center"
        style={{ backgroundColor: settings.primaryColor }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default ScholarAI;
