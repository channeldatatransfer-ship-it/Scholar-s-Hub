
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Plus, 
  FileText, 
  CheckSquare, 
  MessageSquare, 
  Sparkles, 
  Volume2, 
  ChevronRight, 
  X, 
  Send, 
  Trash2,
  Headphones,
  FileCheck,
  Zap,
  RefreshCw,
  Search,
  BookOpen,
  Info,
  Layers,
  ShieldCheck,
  Pause,
  Play
} from 'lucide-react';
import { AppSettings, Notebook, Note, Resource } from '../types';
import { chatWithNotebook, generateNotebookGuide, generateAudioOverview } from '../services/geminiService';

const Notebooks: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    const saved = localStorage.getItem('scholars_notebooks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newNotebook, setNewNotebook] = useState({ name: '', description: '' });

  const [notes, setNotes] = useState<Note[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeSourceIds, setActiveSourceIds] = useState<Set<string>>(new Set());

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('scholars_notebooks', JSON.stringify(notebooks));
  }, [notebooks]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('scholars_notes');
    const savedResources = localStorage.getItem('scholars_local_files');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedResources) setResources(JSON.parse(savedResources));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isAiLoading]);

  const handleCreate = () => {
    if (!newNotebook.name || activeSourceIds.size === 0) return;
    const nb: Notebook = {
      id: Date.now().toString(),
      name: newNotebook.name,
      description: newNotebook.description,
      sourceIds: Array.from(activeSourceIds),
      dateCreated: new Date().toISOString()
    };
    setNotebooks([...notebooks, nb]);
    setIsAdding(false);
    setNewNotebook({ name: '', description: '' });
    setActiveSourceIds(new Set());
  };

  const getSourceContent = () => {
    if (!activeNotebook) return [];
    const sourceTexts: string[] = [];
    activeNotebook.sourceIds.forEach(id => {
      const note = notes.find(n => n.id === id);
      if (note) sourceTexts.push(`[NOTE: ${note.title}]\n${note.content}`);
      const res = resources.find(r => r.id === id);
      if (res) sourceTexts.push(`[FILE: ${res.name}]\nMetadata: ${res.size}, Type: ${res.type}`);
    });
    return sourceTexts;
  };

  const handleChat = async () => {
    if (!input.trim() || !activeNotebook) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      const sources = getSourceContent();
      const response = await chatWithNotebook(userMsg, sources, messages.map(m => ({
        role: (m.role === 'user' ? 'user' : 'model'),
        parts: [{ text: m.text }]
      })));
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'ai', text: isBN ? 'দুঃখিত, কোনো সমস্যা হয়েছে।' : 'Sorry, grounding failed.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const generateGuide = async () => {
    if (!activeNotebook) return;
    setIsGeneratingGuide(true);
    try {
      const sources = getSourceContent();
      const guide = await generateNotebookGuide(sources);
      setMessages(prev => [...prev, { role: 'ai', text: guide, type: 'guide' }]);
    } catch (e) {
      alert("Failed to generate study guide.");
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const startAudioOverview = async () => {
    if (!activeNotebook) return;
    if (isAudioPlaying) {
      currentAudioSourceRef.current?.stop();
      setIsAudioPlaying(false);
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const sources = getSourceContent().join("\n").substring(0, 1500);
      const base64Audio = await generateAudioOverview(sources);
      if (base64Audio) {
        if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const ctx = audioContextRef.current;
        
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

        const buffer = await decodeAudioData(decode(base64Audio), ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        currentAudioSourceRef.current = source;
        setIsAudioPlaying(true);
        source.onended = () => setIsAudioPlaying(false);
        
        setMessages(prev => [...prev, { role: 'ai', text: isBN ? 'অডিও ওভারভিউ শুরু হয়েছে।' : 'Audio Overview generated. Playing podcast conversation...', type: 'audio' }]);
      }
    } catch (e) {
      alert("Audio podcast generation failed.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const toggleSourceSelection = (id: string) => {
    const next = new Set(activeSourceIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setActiveSourceIds(next);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 pb-10">
      {!activeNotebook ? (
        <div className="w-full space-y-10">
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-5xl font-black dark:text-white tracking-tighter flex items-center gap-4">
                  <Book className="w-14 h-14" style={{ color: settings.primaryColor }} /> 
                  {isBN ? 'আমার নোটবুক' : 'Notebook AI'}
               </h1>
               <p className="text-slate-500 dark:text-slate-400 text-lg">Group notes and documents into grounded AI workspaces.</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-10 py-5 rounded-[2.5rem] text-white font-black shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Plus /> Create Workspace
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {notebooks.map(nb => (
              <motion.div
                key={nb.id}
                {...({ layoutId: nb.id } as any)}
                onClick={() => { setActiveNotebook(nb); setMessages([]); }}
                className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-10">
                  <div className="p-6 rounded-[2rem]" style={{ backgroundColor: `${settings.primaryColor}1A` }}>
                    <BookOpen size={36} style={{ color: settings.primaryColor }} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setNotebooks(notebooks.filter(n => n.id !== nb.id)); }}
                    className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
                <h3 className="text-3xl font-black dark:text-white mb-3 leading-tight group-hover:text-indigo-600 transition-colors">{nb.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 line-clamp-2 leading-relaxed">{nb.description || (isBN ? 'কোনো বর্ণনা নেই।' : 'No description provided.')}</p>
                <div className="mt-auto flex items-center justify-between border-t dark:border-slate-800 pt-8">
                   <div className="flex items-center gap-2">
                     <Layers size={14} className="text-slate-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{nb.sourceIds.length} Linked Sources</span>
                   </div>
                   <ChevronRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row gap-6 h-full">
           <div className="w-full md:w-80 flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-8 border-b dark:border-slate-800">
                <button onClick={() => setActiveNotebook(null)} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-6 transition-colors text-xs uppercase tracking-widest">
                  <ChevronRight className="rotate-180" size={16} /> Exit Workspace
                </button>
                <h3 className="text-2xl font-black dark:text-white mb-1 line-clamp-1">{activeNotebook.name}</h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Grounding Context</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                 {activeNotebook.sourceIds.map(id => {
                    const note = notes.find(n => n.id === id);
                    const res = resources.find(r => r.id === id);
                    return (
                      <div key={id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center gap-4 border border-transparent hover:border-indigo-100 transition-all">
                         <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-400 shadow-sm">
                            {note ? <FileText size={18} /> : <Book size={18} />}
                         </div>
                         <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold dark:text-white truncate">{note?.title || res?.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black">{note ? 'Note' : 'PDF Source'}</p>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
           
           <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="p-8 border-b dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600" style={{ color: settings.primaryColor }}>
                       <Zap size={20} />
                    </div>
                    <div>
                       <h3 className="font-black text-sm dark:text-white">Workspace AI Chat</h3>
                       <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Grounded in {activeNotebook.sourceIds.length} files</p>
                    </div>
                 </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 dark:bg-slate-950/20 no-scrollbar">
                 {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-sm leading-relaxed shadow-sm ${
                          m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 rounded-tl-none'
                       }`} style={m.role === 'user' ? { backgroundColor: settings.primaryColor } : {}}>
                          <div className="whitespace-pre-wrap">{m.text}</div>
                       </div>
                    </div>
                 ))}
                 {isAiLoading && (
                    <div className="flex justify-start">
                       <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] rounded-tl-none border flex gap-1.5 animate-pulse">
                          <div className="w-2 h-2 bg-slate-300 rounded-full" /><div className="w-2 h-2 bg-slate-300 rounded-full" /><div className="w-2 h-2 bg-slate-300 rounded-full" />
                       </div>
                    </div>
                 )}
              </div>
              <div className="p-8 border-t dark:border-slate-800">
                 <div className="relative">
                    <input 
                       type="text" 
                       placeholder="Ask anything about these documents..." 
                       className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] py-5 pl-8 pr-16 text-sm font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                       value={input}
                       onChange={e => setInput(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleChat()}
                    />
                    <button 
                       onClick={handleChat}
                       disabled={!input.trim() || isAiLoading}
                       className="absolute right-2 top-2 p-3.5 bg-indigo-600 text-white rounded-[1.5rem] transition-all active:scale-90 disabled:opacity-30"
                       style={{ backgroundColor: settings.primaryColor }}
                    >
                       <Send size={20} />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)} className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl" onClick={() => setIsAdding(false)} />
            <motion.div {...({ initial: { opacity: 0, scale: 0.9, y: 40 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 40 } } as any)} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.4)] border dark:border-slate-800">
               <div className="flex justify-between items-center mb-10"><h3 className="text-3xl font-black dark:text-white">New Notebook AI</h3><button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500"><X /></button></div>
               <div className="space-y-8">
                  <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Workspace Name</label><input autoFocus className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 text-xl font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10 shadow-inner" placeholder="e.g. Physics Chapter 4 Prep" value={newNotebook.name} onChange={e => setNewNotebook({...newNotebook, name: e.target.value})} /></div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Select Sources</label>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto no-scrollbar p-2">
                        {notes.map(n => (
                           <button key={n.id} onClick={() => toggleSourceSelection(n.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${activeSourceIds.has(n.id) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`} style={activeSourceIds.has(n.id) ? { borderColor: settings.primaryColor } : {}}>
                              <div className="flex items-center gap-3"><FileText size={16} className="text-slate-400" /><span className="text-sm font-bold truncate">{n.title}</span></div>
                           </button>
                        ))}
                        {resources.map(r => (
                           <button key={r.id} onClick={() => toggleSourceSelection(r.id)} className={`p-4 rounded-2xl border-2 text-left transition-all ${activeSourceIds.has(r.id) ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`} style={activeSourceIds.has(r.id) ? { borderColor: settings.primaryColor } : {}}>
                              <div className="flex items-center gap-3"><Book size={16} className="text-slate-400" /><span className="text-sm font-bold truncate">{r.name}</span></div>
                           </button>
                        ))}
                     </div>
                  </div>
                  <button onClick={handleCreate} className="w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95" style={{ backgroundColor: settings.primaryColor }}>Initialize AI Grounding</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notebooks;
