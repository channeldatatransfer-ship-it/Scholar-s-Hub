
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  BookOpen, 
  CheckCircle2, 
  Edit3,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Check,
  Star,
  Sparkles,
  Trophy,
  BookMarked,
  GraduationCap,
  Zap,
  Layers,
  Search,
  ChevronLeft,
  X
} from 'lucide-react';
import { Syllabus, AppSettings, AcademicGroup, Chapter, Topic } from '../types';
import { fetchSyllabusForLevel } from '../services/geminiService';

const EditableLabel: React.FC<{ 
  value: string, 
  onSave: (val: string) => void, 
  className?: string,
  inputClassName?: string
}> = ({ value, onSave, className, inputClassName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    if (tempValue.trim() && tempValue !== value) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <input 
          autoFocus
          className={`bg-slate-100 dark:bg-slate-900 border-none rounded-lg px-2 py-1 text-inherit focus:ring-2 focus:ring-indigo-500/50 w-full ${inputClassName}`}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <button onClick={handleSave} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg">
          <Check size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group/label ${className}`}>
      <span className="truncate">{value}</span>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
        className="opacity-0 group-hover/label:opacity-100 p-1 text-slate-400 hover:text-indigo-500 transition-opacity"
      >
        <Edit3 size={14} />
      </button>
    </div>
  );
};

const SyllabusTracker: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(() => {
    const saved = localStorage.getItem('scholars_syllabuses_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(syllabuses[0]?.id || null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // Sync States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState<AcademicGroup>(settings.academicGroup || 'Science');
  const [syncData, setSyncData] = useState<Syllabus[] | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('scholars_syllabuses_v2', JSON.stringify(syllabuses));
    window.dispatchEvent(new Event('syllabusUpdate'));
  }, [syllabuses]);

  const getSubjectProgress = (syllabus: Syllabus) => {
    const allTopics = syllabus.chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const overallProgress = syllabuses.length > 0 
    ? Math.round(syllabuses.reduce((acc, s) => acc + getSubjectProgress(s), 0) / syllabuses.length) 
    : 0;

  const updateSubject = (id: string, updater: (s: Syllabus) => Syllabus) => {
    setSyllabuses(prev => prev.map(s => s.id === id ? updater(s) : s));
  };

  const updateChapter = (sId: string, cId: string, updater: (c: Chapter) => Chapter) => {
    updateSubject(sId, s => ({
      ...s,
      chapters: s.chapters.map(c => c.id === cId ? updater(c) : c)
    }));
  };

  const updateTopic = (sId: string, cId: string, tId: string, updater: (t: Topic) => Topic) => {
    updateChapter(sId, cId, c => ({
      ...c,
      topics: c.topics.map(t => t.id === tId ? updater(t) : t)
    }));
  };

  const handleSyncInitiate = async () => {
    setIsSyncing(true);
    setSyncStep(1); // Searching
    try {
      const data = await fetchSyllabusForLevel(settings.examLevel, selectedGroup);
      setSyncStep(2); // Parsing
      await new Promise(r => setTimeout(r, 800));
      
      if (data && Array.isArray(data)) {
        const colors = ['indigo', 'emerald', 'rose', 'amber', 'purple', 'blue', 'cyan', 'teal'];
        const mapped: Syllabus[] = data.map((item: any, idx: number) => ({
          id: `sync-${idx}-${Date.now()}`,
          subject: item.subject,
          color: colors[idx % colors.length],
          chapters: (item.chapters || []).map((ch: any, cIdx: number) => ({
            id: `ch-${idx}-${cIdx}-${Date.now()}`,
            title: ch.title,
            topics: (ch.topics || []).map((tp: string, tIdx: number) => ({
              id: `tp-${idx}-${cIdx}-${tIdx}-${Date.now()}`,
              title: tp,
              completed: false
            }))
          }))
        }));
        setSyncData(mapped);
        setSyncStep(3); // Review
      } else {
        throw new Error("Invalid data format");
      }
    } catch (err) {
      alert("Failed to sync syllabus. Please try again.");
      setIsSyncing(false);
      setSyncStep(0);
    }
  };

  const applySync = (type: 'replace' | 'append') => {
    if (!syncData) return;
    if (type === 'replace') {
      setSyllabuses(syncData);
    } else {
      setSyllabuses([...syllabuses, ...syncData]);
    }
    if (syncData.length > 0) setActiveSubjectId(syncData[0].id);
    setIsSyncing(false);
    setSyncStep(0);
    setSyncData(null);
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const colors = ['indigo', 'emerald', 'rose', 'amber', 'purple', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newSyllabus: Syllabus = { 
      id: Date.now().toString(), 
      subject: newSubjectName, 
      color: randomColor, 
      chapters: [] 
    };
    setSyllabuses(prev => [...prev, newSyllabus]);
    setNewSubjectName('');
    setActiveSubjectId(newSyllabus.id);
  };

  const deleteSubject = (id: string) => {
    if (!confirm(isBN ? "পুরো বিষয়টি মুছে ফেলবেন?" : "Delete entire subject?")) return;
    const filtered = syllabuses.filter(s => s.id !== id);
    setSyllabuses(filtered);
    if (activeSubjectId === id) setActiveSubjectId(filtered[0]?.id || null);
  };

  const addChapter = (sId: string) => {
    const title = prompt(isBN ? "অধ্যায়ের নাম:" : "Chapter Name:");
    if (!title) return;
    updateSubject(sId, s => ({
      ...s,
      chapters: [...s.chapters, { id: Date.now().toString(), title, topics: [] }]
    }));
  };

  const addTopic = (sId: string, cId: string) => {
    const title = prompt(isBN ? "টপিকের নাম:" : "Topic Name:");
    if (!title) return;
    updateChapter(sId, cId, c => ({
      ...c,
      topics: [...c.topics, { id: Date.now().toString(), title, completed: false }]
    }));
  };

  const toggleTopic = (sId: string, cId: string, tId: string) => {
    updateTopic(sId, cId, tId, t => ({ ...t, completed: !t.completed }));
  };

  const setTopicScore = (sId: string, cId: string, tId: string) => {
    const score = prompt(isBN ? "স্কোর (০-১০০):" : "Score (0-100):");
    if (score === null) return;
    const num = parseInt(score);
    if (!isNaN(num)) {
      updateTopic(sId, cId, tId, t => ({ ...t, score: num }));
    }
  };

  const toggleChapterExpand = (id: string) => {
    const next = new Set(expandedChapters);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedChapters(next);
  };

  const activeSubject = syllabuses.find(s => s.id === activeSubjectId);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-[2.5rem] bg-indigo-600 shadow-2xl shadow-indigo-500/20" style={{ backgroundColor: settings.primaryColor }}>
             <ClipboardCheck className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black dark:text-white tracking-tight">
              {isBN ? 'অ্যাকাডেমিক প্রোফাইল' : 'Academic Profile'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {isBN ? `${settings.examLevel} (${selectedGroup})` : `${settings.examLevel} Curriculum - ${selectedGroup}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             {(['Science', 'Commerce', 'Humanities'] as AcademicGroup[]).map(group => (
               <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-5 py-2.5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${selectedGroup === group ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-indigo-600'}`}
                style={selectedGroup === group ? { backgroundColor: settings.primaryColor } : {}}
               >
                 {group}
               </button>
             ))}
          </div>

          <button 
            onClick={handleSyncInitiate}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-8 py-4 rounded-[2rem] font-black text-white transition-all shadow-xl active:scale-95 whitespace-nowrap ${isSyncing ? 'opacity-70' : ''}`}
            style={{ backgroundColor: settings.primaryColor }}
          >
            {isSyncing ? <RefreshCw className="animate-spin" /> : <Sparkles />}
            {isBN ? 'অফিসিয়াল সিলেবাস সিঙ্ক' : 'Sync Official Syllabus'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
           <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BookMarked size={14} /> {isBN ? 'বিষয় সমুহ' : 'Subjects'}
                </h2>
                <div className="flex items-center gap-2">
                   <input 
                    type="text" 
                    placeholder="+"
                    className="w-12 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-center text-sm font-bold focus:ring-2 focus:ring-indigo-500/20"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSubject()}
                   />
                </div>
              </div>
              <div className="space-y-3">
                {syllabuses.map((s) => {
                  const prog = getSubjectProgress(s);
                  const isActive = activeSubjectId === s.id;
                  return (
                    <div 
                      key={s.id} onClick={() => setActiveSubjectId(s.id)}
                      className={`p-5 rounded-[1.5rem] border transition-all cursor-pointer group relative overflow-hidden ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      style={isActive ? { borderColor: settings.primaryColor } : { borderColor: 'transparent' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <EditableLabel 
                          value={s.subject} 
                          onSave={(val) => updateSubject(s.id, subj => ({ ...subj, subject: val }))} 
                          className={`text-sm font-bold ${isActive ? 'text-indigo-700 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`} 
                        />
                        <button onClick={(e) => { e.stopPropagation(); deleteSubject(s.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity"><Trash2 size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full transition-all duration-700" style={{ width: `${prog}%`, backgroundColor: settings.primaryColor }} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400">{prog}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-500/30">
              <Trophy className="w-10 h-10 mb-6 opacity-40" />
              <h3 className="text-xl font-black mb-2">{isBN ? 'সামগ্রিক আয়ত্ত' : 'Overall Mastery'}</h3>
              <div className="text-5xl font-black mb-6">{overallProgress}%</div>
              <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden mb-2">
                 <div className="bg-white h-full shadow-[0_0_15px_white]" style={{ width: `${overallProgress}%` }} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 opacity-70">
                {isBN ? `${syllabuses.length} টি বিষয়ের তথ্য` : `Tracking ${syllabuses.length} subjects`}
              </p>
           </div>
        </aside>

        <main className="lg:col-span-3 space-y-6">
          {activeSubject ? (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black dark:text-white flex items-center gap-3">
                    <BookOpen className="text-indigo-600" style={{ color: settings.primaryColor }} />
                    {activeSubject.subject}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium">{activeSubject.chapters.length} Chapters in this subject</p>
                </div>
                <button 
                  onClick={() => addChapter(activeSubject.id)} 
                  className="flex items-center gap-2 px-8 py-4 rounded-[2rem] text-white font-black text-sm shadow-xl transition-all active:scale-95" 
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <Plus size={18} /> {isBN ? 'অধ্যায় যোগ' : 'Add Chapter'}
                </button>
              </div>

              {activeSubject.chapters.map((chapter) => {
                const isExpanded = expandedChapters.has(chapter.id);
                const completedCount = chapter.topics.filter(t => t.completed).length;
                const totalCount = chapter.topics.length;
                const chProg = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div key={chapter.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group/chapter">
                    <div onClick={() => toggleChapterExpand(chapter.id)} className="p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-6 flex-1">
                        <div className={`p-4 rounded-2xl transition-all ${isExpanded ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                          {isExpanded ? <ChevronDown size={22} className="text-indigo-600" style={{ color: settings.primaryColor }} /> : <ChevronRight size={22} className="text-slate-400" />}
                        </div>
                        <div className="flex-1">
                          <EditableLabel 
                            value={chapter.title} 
                            onSave={(val) => updateChapter(activeSubject.id, chapter.id, c => ({ ...c, title: val }))} 
                            className="font-black text-2xl dark:text-white" 
                          />
                          <div className="flex items-center gap-3 mt-3">
                             <div className="w-32 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full transition-all duration-700" style={{ width: `${chProg}%`, backgroundColor: settings.primaryColor }} />
                             </div>
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedCount} / {totalCount} Topics Done</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 opacity-0 group-hover/chapter:opacity-100 transition-all">
                        <button onClick={(e) => { e.stopPropagation(); addTopic(activeSubject.id, chapter.id); }} className="px-6 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                          + Topic
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-10 pb-10 pt-2 space-y-3 border-t border-slate-50 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/20">
                        {chapter.topics.map((topic) => (
                          <div key={topic.id} className="flex items-center gap-6 p-5 rounded-[1.5rem] border border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900/60 group/topic hover:shadow-lg transition-all">
                            <button 
                              onClick={() => toggleTopic(activeSubject.id, chapter.id, topic.id)} 
                              className={`w-9 h-9 rounded-[1rem] border-2 flex items-center justify-center transition-all ${topic.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}
                            >
                              {topic.completed && <CheckCircle2 size={20} />}
                            </button>
                            <EditableLabel 
                              value={topic.title} 
                              onSave={(val) => updateTopic(activeSubject.id, chapter.id, topic.id, t => ({ ...t, title: val }))} 
                              className={`flex-1 text-base font-bold ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`} 
                            />
                            {topic.completed && (
                              <button 
                                onClick={() => setTopicScore(activeSubject.id, chapter.id, topic.id)}
                                className={`flex items-center gap-2 text-[11px] font-black px-5 py-2.5 rounded-xl transition-all ${topic.score ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-600'}`}
                                style={topic.score ? { backgroundColor: settings.primaryColor } : {}}
                              >
                                <Star size={14} fill={topic.score ? 'white' : 'none'} /> {topic.score ? `${topic.score}%` : (isBN ? 'স্কোর' : 'SCORE')}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800 text-center p-12">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                 <GraduationCap size={48} className="text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 mb-2">
                {isBN ? 'প্রোফাইল সিলেক্ট করে সিঙ্ক করুন' : 'Select a profile and start tracking'}
              </h3>
              <p className="text-sm text-slate-300 max-w-sm leading-relaxed mb-10">
                {isBN ? 'আপনার বিভাগের জন্য নির্দিষ্ট এনসিটিবি সিলেবাস পেতে সিঙ্ক বাটনে ক্লিক করুন।' : 'Use the Sync button to fetch official NCTB chapters and topics for your academic profile.'}
              </p>
              <button 
                onClick={handleSyncInitiate} 
                className="flex items-center gap-3 px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] font-black text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm group"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> {isBN ? 'সিঙ্ক শুরু' : 'Begin Syncing'}
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Magic Sync Overlay */}
      <AnimatePresence>
        {isSyncing && (
          <div className="fixed inset-0 z-[2500] flex items-center justify-center p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[4rem] overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
              
              <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
                {syncStep < 3 ? (
                  <div className="space-y-12">
                     <div className="relative mx-auto w-40 h-40">
                        <div className="absolute inset-0 border-8 border-indigo-500/20 rounded-[3rem] animate-pulse" />
                        <div className="absolute inset-0 border-t-8 border-indigo-500 rounded-[3rem] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles size={48} className="text-indigo-600 animate-bounce" />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black dark:text-white">
                          {syncStep === 1 ? (isBN ? 'এনসিটিবি ডেটাবেস খোঁজা হচ্ছে...' : 'Searching NCTB Database...') : (isBN ? 'সিলেবাস ম্যাপিং চলছে...' : 'Mapping Curriculum...')}
                        </h3>
                        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                          Scholar AI is grounding the current {settings.examLevel} {selectedGroup} curriculum. This process ensures all topics match the latest board standards.
                        </p>
                     </div>
                     <div className="w-full max-w-sm h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-auto">
                        <motion.div initial={{ width: '0%' }} animate={{ width: syncStep === 1 ? '50%' : '90%' }} className="h-full bg-indigo-600" style={{ backgroundColor: settings.primaryColor }} />
                     </div>
                  </div>
                ) : (
                  <div className="w-full space-y-10 animate-in fade-in duration-500">
                     <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-full w-fit mx-auto mb-4">
                        <CheckCircle2 size={64} className="text-emerald-500" />
                     </div>
                     <h3 className="text-4xl font-black dark:text-white">{isBN ? 'সিলেবাস পাওয়া গেছে!' : 'Curriculum Found!'}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[300px] overflow-y-auto px-4 no-scrollbar">
                        {syncData?.map((s, idx) => (
                          <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl text-left border border-slate-100 dark:border-slate-700">
                             <h4 className="font-black text-slate-700 dark:text-white mb-1">{s.subject}</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.chapters.length} Chapters Identified</p>
                          </div>
                        ))}
                     </div>
                     <div className="flex flex-col md:flex-row gap-4 pt-6">
                        <button 
                          onClick={() => applySync('append')}
                          className="flex-1 py-5 rounded-[2rem] bg-slate-100 dark:bg-slate-800 text-slate-600 font-black text-lg transition-all hover:bg-slate-200"
                        >
                          {isBN ? 'বর্তমানে যোগ করুন' : 'Merge with Existing'}
                        </button>
                        <button 
                          onClick={() => applySync('replace')}
                          className="flex-[2] py-5 rounded-[2rem] text-white font-black text-lg shadow-2xl transition-all hover:brightness-110"
                          style={{ backgroundColor: settings.primaryColor }}
                        >
                          {isBN ? 'সব মুছে নতুন শুরু করুন' : 'Replace & Start Fresh'}
                        </button>
                     </div>
                     <button onClick={() => { setIsSyncing(false); setSyncStep(0); }} className="text-slate-400 text-xs font-black uppercase tracking-widest mt-4">Cancel Sync</button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyllabusTracker;
