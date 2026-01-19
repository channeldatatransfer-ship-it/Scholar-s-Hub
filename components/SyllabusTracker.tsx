import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Syllabus, AppSettings } from '../types';
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
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(syllabuses[0]?.id || null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);

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

  const syncOfficialSyllabus = async () => {
    const confirmMsg = isBN 
      ? "আপনি কি অফিসিয়াল এনসিটিবি সিলেবাস (বিজ্ঞান বিভাগ) সিঙ্ক করতে চান?" 
      : "Do you want to sync the official NCTB Science Syllabus?";
    
    if (confirm(confirmMsg)) {
      setIsSyncing(true);
      try {
        let data = await fetchSyllabusForLevel(settings.examLevel);
        
        // Comprehensive Fallback for HSC Science if API fails or search is limited
        if (!data && settings.examLevel === 'HSC') {
           data = [
             { 
               subject: "Physics 1st Paper", 
               chapters: [
                 { title: "Physical World and Measurement", topics: ["Measurement", "Dimensions", "Error Analysis"] },
                 { title: "Vector", topics: ["Scalers and Vectors", "Vector Addition", "Dot Product", "Cross Product", "Calculus in Vector"] },
                 { title: "Dynamics", topics: ["Newton's Laws", "Friction", "Centripetal Force", "Torque"] },
                 { title: "Work, Energy and Power", topics: ["Work-Energy Theorem", "Potential Energy", "Conservation of Energy"] },
                 { title: "Gravitation", topics: ["Kepler's Laws", "Newton's Law of Gravitation", "Escape Velocity", "Satellite Motion"] }
               ]
             },
             { 
               subject: "Chemistry 1st Paper", 
               chapters: [
                 { title: "Laboratory Safety", topics: ["Safe Use of Apparatus", "Chemical Hazards", "First Aid"] },
                 { title: "Qualitative Chemistry", topics: ["Atomic Structure", "Quantum Numbers", "Electronic Configuration", "Solubility Product"] },
                 { title: "Periodic Properties", topics: ["Ionization Energy", "Electronegativity", "Atomic Radius", "Chemical Bonds"] }
               ]
             },
             {
               subject: "ICT",
               chapters: [
                 { title: "Information and Communication Technology", topics: ["Virtual Reality", "Artificial Intelligence", "Robotics", "Bio-metrics"] },
                 { title: "Communication Systems and Networking", topics: ["Data Communication", "Network Topologies", "Internet", "Cloud Computing"] },
                 { title: "Web Design and HTML", topics: ["Hyperlink", "Tables", "Forms", "CSS Basics"] },
                 { title: "Programming Language", topics: ["Algorithm", "Flowchart", "C Programming Basics", "Functions"] }
               ]
             }
           ];
        }

        if (data && Array.isArray(data)) {
          const colors = ['indigo', 'emerald', 'rose', 'amber', 'purple', 'blue', 'cyan', 'teal'];
          const newSyllabuses: Syllabus[] = data.map((item: any, idx: number) => ({
            id: `sync-${idx}-${Date.now()}`,
            subject: item.subject,
            color: colors[idx % colors.length],
            chapters: item.chapters.map((ch: any, cIdx: number) => ({
              id: `ch-${idx}-${cIdx}-${Date.now()}`,
              title: ch.title,
              topics: ch.topics.map((tp: string, tIdx: number) => ({
                id: `tp-${idx}-${cIdx}-${tIdx}-${Date.now()}`,
                title: tp,
                completed: false
              }))
            }))
          }));
          setSyllabuses(newSyllabuses);
          if (newSyllabuses.length > 0) setActiveSubjectId(newSyllabuses[0].id);
        } else {
          alert("Couldn't retrieve syllabus. Try again.");
        }
      } catch (err) {
        console.error(err);
        alert("Sync error.");
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const colors = ['indigo', 'emerald', 'rose', 'amber', 'purple', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newSyllabus: Syllabus = { id: Date.now().toString(), subject: newSubjectName, color: randomColor, chapters: [] };
    setSyllabuses([...syllabuses, newSyllabus]);
    setNewSubjectName('');
    setActiveSubjectId(newSyllabus.id);
  };

  const deleteSubject = (id: string) => {
    if (confirm("Delete subject?")) {
      const filtered = syllabuses.filter(s => s.id !== id);
      setSyllabuses(filtered);
      if (activeSubjectId === id) setActiveSubjectId(filtered[0]?.id || null);
    }
  };

  const renameSubject = (id: string, val: string) => setSyllabuses(prev => prev.map(s => s.id === id ? { ...s, subject: val } : s));
  const renameChapter = (sId: string, cId: string, val: string) => setSyllabuses(prev => prev.map(s => s.id === sId ? { ...s, chapters: s.chapters.map(c => c.id === cId ? { ...c, title: val } : c) } : s));
  const renameTopic = (sId: string, cId: string, tId: string, val: string) => setSyllabuses(prev => prev.map(s => s.id === sId ? { ...s, chapters: s.chapters.map(c => c.id === cId ? { ...c, topics: c.topics.map(t => t.id === tId ? { ...t, title: val } : t) } : c) } : s));

  const addChapter = (sId: string) => {
    const title = prompt("Chapter Name:");
    if (!title) return;
    setSyllabuses(prev => prev.map(s => s.id === sId ? { ...s, chapters: [...s.chapters, { id: Date.now().toString(), title, topics: [] }] } : s));
  };

  const addTopic = (sId: string, cId: string) => {
    const title = prompt("Topic Name:");
    if (!title) return;
    setSyllabuses(prev => prev.map(s => s.id === sId ? { ...s, chapters: s.chapters.map(c => c.id === cId ? { ...c, topics: [...c.topics, { id: Date.now().toString(), title, completed: false }] } : c) } : s));
  };

  const toggleTopic = (sId: string, cId: string, tId: string) => {
    setSyllabuses(prev => prev.map(s => s.id === sId ? { ...s, chapters: s.chapters.map(c => c.id === cId ? { ...c, topics: c.topics.map(t => t.id === tId ? { ...t, completed: !t.completed } : t) } : c) } : s));
  };

  const setTopicScore = (sId: string, cId: string, tId: string) => {
    const score = prompt("Score (0-100):");
    if (score === null) return;
    const num = parseInt(score);
    if (!isNaN(num)) setSyllabuses(prev => prev.map(s => s.id === sId ? { ...s, chapters: s.chapters.map(c => c.id === cId ? { ...c, topics: c.topics.map(t => t.id === tId ? { ...t, score: num } : t) } : c) } : s));
  };

  const toggleChapterExpand = (id: string) => {
    const next = new Set(expandedChapters);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedChapters(next);
  };

  const activeSubject = syllabuses.find(s => s.id === activeSubjectId);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8" style={{ color: settings.primaryColor }} /> 
            {isBN ? 'সিলেবাস ট্র্যাকার' : 'Syllabus Tracker'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">{isBN ? 'অফিসিয়াল এনসিটিবি সিলেবাস অনুযায়ী পড়াশোনা করুন।' : 'Study according to official NCTB syllabus.'}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={syncOfficialSyllabus}
            disabled={isSyncing}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${isSyncing ? 'animate-pulse opacity-70' : ''}`}
            style={{ backgroundColor: settings.primaryColor }}
          >
            {isSyncing ? <RefreshCw className="animate-spin" /> : <Sparkles />}
            {isBN ? 'এনসিটিবি সিঙ্ক' : 'NCTB Sync'}
          </button>
          <input 
            type="text" placeholder={isBN ? "নতুন বিষয়..." : "New Subject..."}
            className="bg-white dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
          />
          <button onClick={addSubject} className="text-white p-3 rounded-2xl shadow-lg" style={{ backgroundColor: settings.primaryColor }}><Plus /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">{isBN ? 'বিষয়সমূহ' : 'Subjects'}</h2>
          {syllabuses.map((s) => {
            const prog = getSubjectProgress(s);
            const isActive = activeSubjectId === s.id;
            return (
              <div 
                key={s.id} onClick={() => setActiveSubjectId(s.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group ${isActive ? 'bg-white dark:bg-slate-800 shadow-xl' : 'bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'}`}
                style={isActive ? { borderColor: settings.primaryColor } : {}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <BookOpen size={20} className="text-slate-400" style={isActive ? { color: settings.primaryColor } : {}} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteSubject(s.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
                </div>
                <EditableLabel value={s.subject} onSave={(val) => renameSubject(s.id, val)} className="text-sm font-bold dark:text-white mb-2" />
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-700" style={{ width: `${prog}%`, backgroundColor: settings.primaryColor }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          {activeSubject ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black dark:text-white">{activeSubject.subject} {isBN ? 'রোডম্যাপ' : 'Roadmap'}</h2>
                  <p className="text-sm text-slate-400">{activeSubject.chapters.length} {isBN ? 'অধ্যায়' : 'Chapters'}</p>
                </div>
                <button onClick={() => addChapter(activeSubject.id)} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold" style={{ backgroundColor: settings.primaryColor }}><Plus size={18} /> {isBN ? 'অধ্যায় যোগ করুন' : 'Add Chapter'}</button>
              </div>

              {activeSubject.chapters.map((chapter) => {
                const isExpanded = expandedChapters.has(chapter.id);
                return (
                  <div key={chapter.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm group/chapter">
                    <div onClick={() => toggleChapterExpand(chapter.id)} className="p-6 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900">{isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</div>
                        <EditableLabel value={chapter.title} onSave={(val) => renameChapter(activeSubject.id, chapter.id, val)} className="font-bold text-lg dark:text-white" />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); addTopic(activeSubject.id, chapter.id); }} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold hover:bg-slate-200 transition-colors">+ {isBN ? 'টপিক' : 'Topic'}</button>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 space-y-2 border-t border-slate-50 dark:border-slate-700">
                        {chapter.topics.map((topic) => (
                          <div key={topic.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20">
                            <button onClick={() => toggleTopic(activeSubject.id, chapter.id, topic.id)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${topic.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                              {topic.completed && <CheckCircle2 size={14} />}
                            </button>
                            <EditableLabel 
                              value={topic.title} 
                              onSave={(val) => renameTopic(activeSubject.id, chapter.id, topic.id, val)} 
                              className={`flex-1 text-sm font-medium ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`} 
                            />
                            {topic.completed && (
                              <button 
                                onClick={() => setTopicScore(activeSubject.id, chapter.id, topic.id)}
                                className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg transition-all ${topic.score ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}
                                style={topic.score ? { backgroundColor: settings.primaryColor } : {}}
                              >
                                <Star size={10} fill={topic.score ? 'white' : 'none'} /> {topic.score ? `${topic.score}%` : (isBN ? 'স্কোর' : 'SCORE')}
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
            <div className="h-[400px] flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
              <ClipboardCheck size={48} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">{isBN ? 'শুরু করতে একটি বিষয় নির্বাচন করুন।' : 'Select a subject to begin'}</h3>
              <button onClick={syncOfficialSyllabus} className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600" style={{ color: settings.primaryColor }}>{isBN ? 'অথবা অফিসিয়াল সিলেবাস সিঙ্ক করুন' : 'Or Sync Official Syllabus'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusTracker;