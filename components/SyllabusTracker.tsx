
import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Filter,
  Layers,
  GraduationCap,
  X
} from 'lucide-react';
import { AppSettings, Syllabus, Chapter, Topic } from '../types';
import { fetchSyllabusForLevel } from '../services/geminiService';

const SyllabusTracker: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

  // Load syllabus from local storage on component mount
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

  // Save syllabus to local storage and trigger global update event
  const saveSyllabuses = (data: Syllabus[]) => {
    setSyllabuses(data);
    localStorage.setItem('scholars_syllabuses_v2', JSON.stringify(data));
    window.dispatchEvent(new Event('syllabusUpdate'));
  };

  // Fetch syllabus using Gemini AI service
  const handleFetch = async () => {
    setIsFetching(true);
    try {
      const data = await fetchSyllabusForLevel(settings.examLevel, settings.academicGroup);
      if (data && Array.isArray(data)) {
        const formatted: Syllabus[] = data.map((s: any, i: number) => ({
          id: Date.now().toString() + i,
          subject: s.subject,
          color: 'indigo',
          chapters: s.chapters.map((c: any, ci: number) => ({
            id: 'ch-' + Date.now() + ci,
            title: c.title,
            topics: c.topics.map((t: string, ti: number) => ({
              id: 'tp-' + Date.now() + ti,
              title: t,
              completed: false
            }))
          }))
        }));
        saveSyllabuses(formatted);
        if (formatted.length > 0) setActiveSubjectId(formatted[0].id);
      }
    } catch (err) {
      console.error(err);
      alert(isBN ? "সিলেবাস লোড করতে সমস্যা হয়েছে।" : "Error fetching syllabus.");
    } finally {
      setIsFetching(false);
    }
  };

  // Toggle completion status of a topic
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

  // Delete a subject from the tracker
  const deleteSubject = (id: string) => {
    if (confirm(isBN ? "আপনি কি এই বিষয়টি মুছতে চান?" : "Delete this subject?")) {
      const next = syllabuses.filter(s => s.id !== id);
      saveSyllabuses(next);
      if (activeSubjectId === id) setActiveSubjectId(null);
    }
  };

  const filteredSyllabuses = syllabuses.filter(s => 
    s.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubject = syllabuses.find(s => s.id === activeSubjectId);

  // Calculate progress percentage for a subject
  const getProgress = (chapters: Chapter[]) => {
    const allTopics = chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
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
              placeholder={isBN ? 'খুঁজুন...' : 'Search subjects...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl pl-11 py-3 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
            />
          </div>

          <button 
            onClick={handleFetch}
            disabled={isFetching}
            className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: settings.primaryColor }}
          >
            {isFetching ? <RefreshCw className="animate-spin w-4 h-4" /> : <Sparkles size={18} />}
            {isFetching ? 'Fetching...' : (isBN ? 'স্মার্ট ফেচ সিলেবাস' : 'Smart Fetch')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {filteredSyllabuses.map((s) => {
            const progress = getProgress(s.chapters);
            return (
              <button
                key={s.id}
                onClick={() => setActiveSubjectId(s.id)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all group relative overflow-hidden ${activeSubjectId === s.id ? 'bg-indigo-50 dark:bg-indigo-900/30 shadow-inner' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`font-black text-base truncate pr-4 ${activeSubjectId === s.id ? 'text-indigo-700 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`} style={activeSubjectId === s.id ? { color: settings.primaryColor } : {}}>
                    {s.subject}
                  </span>
                  <div className="bg-white/50 dark:bg-slate-700 px-2 py-1 rounded-lg text-[10px] font-black text-slate-400">{progress}%</div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: settings.primaryColor }} />
                </div>
              </button>
            );
          })}
          
          {filteredSyllabuses.length === 0 && !isFetching && (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
               {isBN ? 'কোনো সিলেবাস পাওয়া যায়নি।' : 'No syllabus loaded yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Chapters & Topics */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
        {activeSubject ? (
          <>
            <div className="p-10 border-b dark:border-slate-800 flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-black dark:text-white mb-1">{activeSubject.subject}</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.2em]">{getProgress(activeSubject.chapters)}% Global Progress</p>
               </div>
               <div className="flex gap-3">
                  <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] text-slate-400 hover:text-indigo-600 transition-all shadow-sm"><RefreshCw size={20} /></button>
                  <button onClick={() => deleteSubject(activeSubject.id)} className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-[1.5rem] text-rose-500 hover:bg-rose-100 transition-all shadow-sm"><Trash2 size={20} /></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
               {activeSubject.chapters.map((chapter) => (
                 <section key={chapter.id} className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black dark:text-white flex items-center gap-4">
                          <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
                          {chapter.title}
                       </h3>
                       <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{chapter.topics.filter(t => t.completed).length}/{chapter.topics.length} Done</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {chapter.topics.map((topic) => (
                         <button
                           key={topic.id}
                           onClick={() => toggleTopic(activeSubject.id, chapter.id, topic.id)}
                           className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all text-left group ${topic.completed ? 'bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-800 hover:border-indigo-200'}`}
                         >
                            <div className={`shrink-0 transition-colors ${topic.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                               {topic.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </div>
                            <span className={`font-bold text-base flex-1 ${topic.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                               {topic.title}
                            </span>
                         </button>
                       ))}
                    </div>
                 </section>
               ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8">
             <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center text-slate-200">
                <GraduationCap size={64} />
             </div>
             <div className="max-w-md space-y-3">
                <h3 className="text-2xl font-black dark:text-white">{isBN ? 'সিলেবাস নির্বাচন করুন' : 'Select a Subject'}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                   {isBN ? 'বাম পাশের তালিকা থেকে একটি বিষয় বেছে নিন অথবা স্মার্ট ফেচ ব্যবহার করে নতুন সিলেবাস লোড করুন।' : 'Choose a subject from the sidebar to track your progress or use Smart Fetch to download official NCTB syllabuses.'}
                </p>
             </div>
             <div className="flex gap-4">
                <button onClick={handleFetch} className="px-10 py-5 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: settings.primaryColor }}>
                   Start Smart Fetch
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusTracker;
