
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  Circle,
  ChevronRight,
  BookOpen,
  Sparkles,
  Edit3,
  Check,
  X,
  GraduationCap,
  BrainCircuit,
  Loader2,
  Layers,
  MoreVertical,
  FilterX
} from 'lucide-react';
import { AppSettings, Syllabus, Chapter, Topic } from '../types';
import { fetchSyllabusForLevel } from '../services/geminiService';

const SyllabusTracker: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const loadSyllabus = () => {
      const saved = localStorage.getItem('scholars_syllabuses_v2');
      if (saved) {
        setSyllabuses(JSON.parse(saved));
      }
    };
    loadSyllabus();
    window.addEventListener('syllabusUpdate', loadSyllabus);
    return () => window.removeEventListener('syllabusUpdate', loadSyllabus);
  }, []);

  const saveSyllabuses = (data: Syllabus[]) => {
    setSyllabuses(data);
    localStorage.setItem('scholars_syllabuses_v2', JSON.stringify(data));
    window.dispatchEvent(new Event('syllabusUpdate'));
  };

  const handleAiSync = async () => {
    const confirmMsg = isBN 
      ? "এআই ব্যবহার করে সিলেবাস সিঙ্ক করতে চান? এটি আপনার স্তরের জন্য স্ট্যান্ডার্ড কারিকুলাম খুঁজে বের করবে।" 
      : "Sync your syllabus with AI? This will fetch standard chapters and topics for your academic level.";
      
    if (confirm(confirmMsg)) {
      setIsSyncing(true);
      
      const updateStatus = async (msg: string, progress: number, delay = 1200) => {
        setSyncStatus(msg);
        setSyncProgress(progress);
        await new Promise(r => setTimeout(r, delay));
      };

      try {
        await updateStatus(isBN ? "এআই ইঞ্জিন প্রস্তুত হচ্ছে..." : "Initializing AI Engine...", 10);
        await updateStatus(isBN ? "অফিসিয়াল কারিকুলাম খুঁজছি..." : "Searching official curriculum...", 30);
        
        const fetchedSyllabus = await fetchSyllabusForLevel(settings.examLevel, settings.academicGroup || 'Science');
        
        if (fetchedSyllabus && Array.isArray(fetchedSyllabus)) {
          await updateStatus(isBN ? "টপিকগুলো বিশ্লেষণ করছি..." : "Analyzing topics...", 60);
          await updateStatus(isBN ? "অধ্যায়গুলো সাজাচ্ছি..." : "Organizing chapters...", 85);
          
          const formatted: Syllabus[] = fetchedSyllabus.map((s: any, idx: number) => ({
            id: `ai-${Date.now()}-${idx}`,
            subject: s.subject,
            color: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5],
            chapters: (s.chapters || []).map((ch: any, cIdx: number) => ({
              id: `ai-ch-${Date.now()}-${idx}-${cIdx}`,
              title: ch.title,
              completed: false,
              topics: (ch.topics || []).map((t: string, tIdx: number) => ({
                id: `ai-tp-${Date.now()}-${idx}-${cIdx}-${tIdx}`,
                title: t,
                completed: false
              }))
            }))
          }));
          
          await updateStatus(isBN ? "সবকিছু গুছিয়ে দিচ্ছি, স্কলার!" : "Finalizing your workspace, Scholar!", 98);
          
          const next = [...syllabuses, ...formatted];
          saveSyllabuses(next);
          if (formatted.length > 0) setActiveSubjectId(formatted[0].id);
        } else {
          throw new Error("Invalid response");
        }
      } catch (e) {
        setSyncStatus(isBN ? "দুঃখিত, কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।" : "Oops, something went wrong. Please try again.");
        await new Promise(r => setTimeout(r, 2000));
      } finally {
        setIsSyncing(false);
        setSyncStatus('');
        setSyncProgress(0);
      }
    }
  };

  // Editing Handlers
  const startEditing = (id: string, value: string) => {
    setEditingId(id);
    setEditValue(value);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const updateSubjectName = (id: string) => {
    if (!editValue.trim()) return cancelEditing();
    const next = syllabuses.map(s => s.id === id ? { ...s, subject: editValue } : s);
    saveSyllabuses(next);
    cancelEditing();
  };

  const updateChapterName = (subjectId: string, chapterId: string) => {
    if (!editValue.trim()) return cancelEditing();
    const next = syllabuses.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => c.id === chapterId ? { ...c, title: editValue } : c)
      };
    });
    saveSyllabuses(next);
    cancelEditing();
  };

  const updateTopicName = (subjectId: string, chapterId: string, topicId: string) => {
    if (!editValue.trim()) return cancelEditing();
    const next = syllabuses.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => {
          if (c.id !== chapterId) return c;
          return {
            ...c,
            topics: c.topics.map(t => t.id === topicId ? { ...t, title: editValue } : t)
          };
        })
      };
    });
    saveSyllabuses(next);
    cancelEditing();
  };

  const toggleTopic = (subjectId: string, chapterId: string, topicId: string) => {
    const next = syllabuses.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => {
          if (c.id !== chapterId) return c;
          return {
            ...c,
            topics: c.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
          };
        })
      };
    });
    saveSyllabuses(next);
  };

  const deleteSubject = (id: string) => {
    if (confirm(isBN ? "আপনি কি এই বিষয়টি মুছতে চান?" : "Delete this subject?")) {
      const next = syllabuses.filter(s => s.id !== id);
      saveSyllabuses(next);
      if (activeSubjectId === id) setActiveSubjectId(null);
    }
  };

  const deleteChapter = (subjectId: string, chapterId: string) => {
    if (confirm(isBN ? "অধ্যায়টি মুছে ফেলবেন?" : "Delete this chapter?")) {
      const next = syllabuses.map(s => {
        if (s.id !== subjectId) return s;
        return { ...s, chapters: s.chapters.filter(c => c.id !== chapterId) };
      });
      saveSyllabuses(next);
    }
  };

  const deleteTopic = (subjectId: string, chapterId: string, topicId: string) => {
    const next = syllabuses.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => {
          if (c.id !== chapterId) return c;
          return { ...c, topics: c.topics.filter(t => t.id !== topicId) };
        })
      };
    });
    saveSyllabuses(next);
  };

  const addSubjectManually = () => {
    const newSub: Syllabus = {
      id: `man-${Date.now()}`,
      subject: isBN ? 'নতুন বিষয়' : 'New Subject',
      chapters: [],
      color: '#4f46e5'
    };
    saveSyllabuses([...syllabuses, newSub]);
    setActiveSubjectId(newSub.id);
    startEditing(newSub.id, newSub.subject);
  };

  const addChapter = (subjectId: string) => {
    const next = syllabuses.map(s => {
      if (s.id !== subjectId) return s;
      const newCh: Chapter = {
        id: `ch-${Date.now()}`,
        title: isBN ? 'নতুন অধ্যায়' : 'New Chapter',
        topics: []
      };
      return { ...s, chapters: [...s.chapters, newCh] };
    });
    saveSyllabuses(next);
  };

  const addTopic = (subjectId: string, chapterId: string) => {
    const next = syllabuses.map(s => {
      if (s.id !== subjectId) return s;
      return {
        ...s,
        chapters: s.chapters.map(c => {
          if (c.id !== chapterId) return c;
          const newTp: Topic = {
            id: `tp-${Date.now()}`,
            title: isBN ? 'নতুন টপিক' : 'New Topic',
            completed: false
          };
          return { ...c, topics: [...c.topics, newTp] };
        })
      };
    });
    saveSyllabuses(next);
  };

  const getProgress = (chapters: Chapter[]) => {
    const allTopics = chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  // --- Deep Search Logic ---
  const filteredSyllabuses = useMemo(() => {
    if (!searchTerm.trim()) return syllabuses;
    const lowerSearch = searchTerm.toLowerCase();
    
    return syllabuses.filter(s => {
      const subjectMatch = s.subject.toLowerCase().includes(lowerSearch);
      const chapterMatch = s.chapters.some(c => c.title.toLowerCase().includes(lowerSearch));
      const topicMatch = s.chapters.some(c => c.topics.some(t => t.title.toLowerCase().includes(lowerSearch)));
      return subjectMatch || chapterMatch || topicMatch;
    });
  }, [syllabuses, searchTerm]);

  const activeSubject = syllabuses.find(s => s.id === activeSubjectId);

  const displayChapters = useMemo(() => {
    if (!activeSubject) return [];
    if (!searchTerm.trim()) return activeSubject.chapters;

    const lowerSearch = searchTerm.toLowerCase();
    return activeSubject.chapters.map(chapter => {
      const chapterMatch = chapter.title.toLowerCase().includes(lowerSearch);
      const filteredTopics = chapter.topics.filter(topic => 
        topic.title.toLowerCase().includes(lowerSearch)
      );

      // If chapter matches or has matching topics, we show it
      if (chapterMatch || filteredTopics.length > 0) {
        return {
          ...chapter,
          // If the chapter title itself matches, we could show all topics or just filtered.
          // For a true filter experience, we show only matching topics if any, 
          // otherwise if only chapter matches, show all its topics.
          topics: filteredTopics.length > 0 ? filteredTopics : chapter.topics
        };
      }
      return null;
    }).filter((c): c is Chapter => c !== null);
  }, [activeSubject, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500 relative">
      
      {/* AI SYNC OVERLAY */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="flex flex-col items-center gap-8 p-12 bg-white dark:bg-slate-900 rounded-[4rem] shadow-2xl border border-indigo-100 dark:border-slate-800 max-w-md w-full text-center"
            >
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 rounded-[2rem] border-4 border-dashed border-indigo-200 dark:border-slate-700 flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BrainCircuit className="w-10 h-10 text-indigo-600 animate-pulse" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-bounce" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-black dark:text-white leading-tight">{isBN ? 'এআই কারিকুলাম সিঙ্ক' : 'AI Curriculum Sync'}</h3>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={syncStatus} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-indigo-600 dark:text-indigo-400 font-black text-lg min-h-[1.5em]"
                  >
                    {syncStatus}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="w-full space-y-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-600" 
                    initial={{ width: "0%" }}
                    animate={{ width: `${syncProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{syncProgress}% COMPLETE</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Subject List */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600" style={{ color: settings.primaryColor }}>
                <ClipboardCheck size={24} />
             </div>
             <div>
                <h2 className="font-black text-lg dark:text-white leading-none mb-1">{isBN ? 'সিলেবাস' : 'Syllabus'}</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{settings.examLevel}</p>
             </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={isBN ? 'বিষয় বা টপিক খুঁজুন...' : 'Search subject or topic...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl pl-11 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-300 hover:text-rose-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleAiSync} disabled={isSyncing}
              className={`flex-1 py-4 rounded-2xl text-white font-black text-[11px] uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${!syllabuses.length ? 'animate-pulse ring-4 ring-indigo-500/10' : ''}`}
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Sparkles size={14} /> {isBN ? 'এআই সিঙ্ক' : 'AI Sync'}
            </button>
            <button 
              onClick={addSubjectManually}
              className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {filteredSyllabuses.map((s) => {
            const progress = getProgress(s.chapters);
            const isEditing = editingId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => !isEditing && setActiveSubjectId(s.id)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all group relative overflow-hidden cursor-pointer ${activeSubjectId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/30 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 overflow-hidden pr-2">
                    {isEditing ? (
                      <input 
                        autoFocus className="w-full bg-white dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-sm font-black focus:ring-2 focus:ring-indigo-500/20"
                        value={editValue} onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => updateSubjectName(s.id)}
                        onKeyDown={(e) => e.key === 'Enter' && updateSubjectName(s.id)}
                      />
                    ) : (
                      <span className={`font-black text-base truncate block ${activeSubjectId === s.id ? 'text-indigo-700 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`} style={activeSubjectId === s.id ? { color: settings.primaryColor } : {}}>
                        {s.subject}
                      </span>
                    )}
                  </div>
                  {!isEditing && (
                    <button onClick={(e) => { e.stopPropagation(); startEditing(s.id, s.subject); }} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all"><Edit3 size={12} /></button>
                  )}
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: settings.primaryColor }} />
                </div>
              </div>
            );
          })}
          {filteredSyllabuses.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              {isBN ? 'কিছু পাওয়া যায়নি' : 'No results found'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Chapters & Topics */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
        {activeSubject ? (
          <>
            <div className="p-10 border-b dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-950/20">
               <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <h2 className="text-3xl font-black dark:text-white mb-1">{activeSubject.subject}</h2>
                    <button onClick={() => startEditing(activeSubject.id, activeSubject.subject)} className="p-2 text-slate-300 hover:text-indigo-600"><Edit3 size={18} /></button>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">{getProgress(activeSubject.chapters)}% Completed</p>
                    {searchTerm && (
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-100 dark:border-indigo-800 uppercase">
                        {isBN ? `ফিল্টার করা হয়েছে: "${searchTerm}"` : `Filtered by: "${searchTerm}"`}
                      </span>
                    )}
                  </div>
               </div>
               <div className="flex gap-3">
                  <button onClick={() => addChapter(activeSubject.id)} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl text-xs font-black uppercase text-indigo-600 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all"><Plus size={16} /> {isBN ? 'অধ্যায় যোগ করুন' : 'Add Chapter'}</button>
                  <button onClick={() => deleteSubject(activeSubject.id)} className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-500 hover:bg-rose-100 transition-all"><Trash2 size={20} /></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
               {displayChapters.map((chapter) => (
                 <section key={chapter.id} className="space-y-6">
                    <div className="flex items-center justify-between group/ch">
                       <div className="flex items-center gap-4 flex-1">
                          <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                          {editingId === chapter.id ? (
                            <input 
                              autoFocus className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-3 py-1.5 text-xl font-black focus:ring-2 focus:ring-indigo-500/20"
                              value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => updateChapterName(activeSubject.id, chapter.id)}
                              onKeyDown={(e) => e.key === 'Enter' && updateChapterName(activeSubject.id, chapter.id)}
                            />
                          ) : (
                            <h3 className="text-2xl font-black dark:text-white leading-tight">
                              {chapter.title}
                              {searchTerm && chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) && (
                                <span className="ml-3 inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                              )}
                            </h3>
                          )}
                          <div className="opacity-0 group-hover/ch:opacity-100 flex gap-1 transition-opacity">
                             <button onClick={() => startEditing(chapter.id, chapter.title)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={16} /></button>
                             <button onClick={() => deleteChapter(activeSubject.id, chapter.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                          </div>
                       </div>
                       <button onClick={() => addTopic(activeSubject.id, chapter.id)} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition-all"><Plus size={20} /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {chapter.topics.map((topic) => {
                         const isMatch = searchTerm && topic.title.toLowerCase().includes(searchTerm.toLowerCase());
                         
                         return (
                           <div
                             key={topic.id}
                             className={`group/tp relative flex items-center gap-5 p-6 rounded-[2.5rem] border transition-all text-left ${topic.completed ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-800 hover:border-indigo-200'} ${isMatch ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                           >
                              <button
                                onClick={() => toggleTopic(activeSubject.id, chapter.id, topic.id)}
                                className={`shrink-0 transition-colors ${topic.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
                              >
                                 {topic.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                              </button>
                              
                              <div className="flex-1 overflow-hidden">
                                {editingId === topic.id ? (
                                  <input 
                                    autoFocus className="w-full bg-white dark:bg-slate-900 border-none rounded-lg px-2 py-1 text-base font-bold focus:ring-2 focus:ring-indigo-500/20"
                                    value={editValue} onChange={(e) => setEditValue(e.target.value)}
                                    onBlur={() => updateTopicName(activeSubject.id, chapter.id, topic.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && updateTopicName(activeSubject.id, chapter.id, topic.id)}
                                  />
                                ) : (
                                  <span className={`font-bold text-base block ${topic.completed ? 'line-through text-slate-300' : 'text-slate-700 dark:text-slate-200'} ${isMatch ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                                     {topic.title}
                                  </span>
                                )}
                              </div>

                              <div className="opacity-0 group-hover/tp:opacity-100 flex gap-1 items-center transition-opacity ml-2">
                                 <button onClick={() => startEditing(topic.id, topic.title)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 size={14} /></button>
                                 <button onClick={() => deleteTopic(activeSubject.id, chapter.id, topic.id)} className="p-2 text-slate-400 hover:text-rose-500"><X size={16} /></button>
                              </div>
                           </div>
                         );
                       })}
                       {chapter.topics.length === 0 && (
                         <button onClick={() => addTopic(activeSubject.id, chapter.id)} className="md:col-span-2 py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-400 transition-all">
                           <Layers className="mb-2 opacity-20" size={32} />
                           <p className="text-sm font-bold uppercase tracking-widest">{isBN ? 'টপিক যোগ করুন' : 'Add First Topic'}</p>
                         </button>
                       )}
                    </div>
                 </section>
               ))}

               {displayChapters.length === 0 && (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <FilterX size={40} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black dark:text-white">{isBN ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No results matching your search'}</h4>
                      <p className="text-slate-400 text-sm">{isBN ? 'আপনার সার্চ কিউয়ার্ডটি পরিবর্তন করে দেখুন।' : 'Try adjusting your search terms.'}</p>
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        {isBN ? 'সার্চ রিসেট করুন' : 'Reset Search'}
                      </button>
                    </div>
                  </div>
               )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8">
             <div className="w-40 h-40 bg-slate-50 dark:bg-slate-800 rounded-[4rem] flex items-center justify-center text-slate-200 shadow-inner">
                <GraduationCap size={80} />
             </div>
             <div className="max-w-md space-y-4">
                <h3 className="text-3xl font-black dark:text-white">{isBN ? 'সিলেবাস নির্বাচন করুন' : 'Select a Subject'}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                   {isBN ? 'বাম পাশের তালিকা থেকে একটি বিষয় বেছে নিন অথবা স্মার্ট সিঙ্ক ব্যবহার করে নতুন সিলেবাস জেনারেট করুন।' : 'Choose a subject from the sidebar or use AI Sync to generate official curriculums instantly.'}
                </p>
             </div>
             <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAiSync} 
                  className="px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3" 
                  style={{ backgroundColor: settings.primaryColor }}
                >
                   <Sparkles /> {isBN ? 'স্মার্ট সিঙ্ক শুরু করুন' : 'Start AI Sync'}
                </button>
                <button onClick={addSubjectManually} className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2.5rem] font-black border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all">{isBN ? 'ম্যানুয়ালি যোগ করুন' : 'Add Manually'}</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusTracker;
