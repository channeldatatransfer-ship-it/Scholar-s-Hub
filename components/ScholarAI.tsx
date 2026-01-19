
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
  Timer
} from 'lucide-react';
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
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('scholars_ai_history');
    return saved ? JSON.parse(saved) : [
      { role: 'ai', text: isBN ? 'হ্যালো স্কলার! আমি তোমার স্টাডি বাডি। আজ তোমাকে কিভাবে সাহায্য করতে পারি?' : 'Hello Scholar! I am your AI Study Buddy. How can I help you ace your exams today?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      setMessages(prev => [...prev, { role: 'ai', text: isBN ? "সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে আপনার ইন্টারনেট চেক করুন।" : "I'm having trouble connecting right now. Please check your connection." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const clearMsg = isBN ? "চ্যাট হিস্ট্রি মুছে ফেলবেন?" : "Clear chat history?";
    if (confirm(clearMsg)) {
      setMessages([{ role: 'ai', text: isBN ? 'হিস্ট্রি মুছে ফেলা হয়েছে। এখন আমরা কি নিয়ে পড়ব?' : 'History cleared. What should we study next?' }]);
    }
  };

  const suggestions = [
    { text: isBN ? "আমার অগ্রগতি কেমন?" : "How's my progress?", icon: BookOpen },
    { text: isBN ? "গণিতের জন্য টিপস" : "Study tips for Math", icon: Brain },
    { text: isBN ? "ফোকাস টাইমার বোঝান" : "Explain Focus Timer", icon: Timer },
    { text: isBN ? "আমাকে অনুপ্রাণিত করুন" : "Help me stay motivated", icon: Sparkles }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isMaximized ? '600px' : '400px',
              height: isMaximized ? '700px' : '550px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300"
          >
            {/* Header */}
            <div className="p-5 border-b dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}1A` }}>
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm dark:text-white tracking-tight">{isBN ? 'স্কলার এআই বাডি' : 'Scholar AI Buddy'}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{isBN ? 'অ্যাক্টিভ' : 'Active Assistant'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button 
                  onClick={clearChat} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Suggestions Chips */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(s.text)}
                  className="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all active:scale-95 shadow-sm"
                >
                  <s.icon size={12} /> {s.text}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/30 dark:bg-slate-950/20">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${m.role === 'user' ? 'bg-white dark:bg-slate-800' : 'text-white'}`} style={m.role === 'ai' ? { backgroundColor: settings.primaryColor } : {}}>
                      {m.role === 'user' ? <GraduationCap size={16} className="text-slate-400" /> : <Sparkles size={16} />}
                    </div>
                    <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
                    }`}
                    style={m.role === 'user' ? { backgroundColor: settings.primaryColor } : {}}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                       <RefreshCw size={14} className="text-slate-400 animate-spin" />
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-5 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
              <div className="relative group">
                <input
                  type="text"
                  placeholder={isBN ? "পরামর্শ বা ব্যাখ্যা জিজ্ঞাসা করুন..." : "Ask for advice, explanations..."}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[1.5rem] py-4 pl-5 pr-14 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 dark:text-white shadow-inner transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-2 p-2.5 rounded-xl text-white shadow-xl transition-all active:scale-90 disabled:opacity-0"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-3 text-[9px] text-center font-black text-slate-300 uppercase tracking-widest">{isBN ? 'স্কলার এআই দ্বারা চালিত' : 'Powered by Scholar AI Intelligence'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95, rotate: -5 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group p-5 rounded-[2rem] shadow-2xl text-white flex items-center justify-center relative overflow-hidden transition-all duration-300"
        style={{ backgroundColor: settings.primaryColor }}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-2">
          {isOpen ? <X size={28} /> : (
            <>
              <MessageSquare size={28} />
              <span className="text-xs font-black uppercase tracking-widest pr-2 hidden md:inline">{isBN ? 'স্টাডি বাডি' : 'Study Buddy'}</span>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default ScholarAI;
