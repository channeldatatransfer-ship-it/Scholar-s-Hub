
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
  MoreVertical,
  Check
} from 'lucide-react';
import { Syllabus, Chapter, Topic, AppSettings } from '../types';

// Helper component for inline editing
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
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(() => {
    const saved = localStorage.getItem('scholars_syllabuses_v2');
    if (saved) return JSON.parse(saved);
    
    // Default data structure v2
    return [
      { 
        id: '1', 
        subject: 'Physics', 
        color: 'indigo',
        chapters: [
          { 
            id: 'c1', 
            title: 'Thermodynamics', 
            topics: [
              { id: 't1', title: 'Laws of Thermo', completed: true },
              { id: 't2', title: 'Entropy', completed: false }
            ]
          },
          { 
            id: 'c2', 
            title: 'Optics', 
            topics: [
              { id: 't3', title: 'Refraction', completed: false }
            ]
          }
        ]
      }
    ];
  });

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(syllabuses[0]?.id || null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['c1']));

  useEffect(() => {
    localStorage.setItem('scholars_syllabuses_v2', JSON.stringify(syllabuses));
    window.dispatchEvent(new Event('syllabusUpdate'));
  }, [syllabuses]);

  // Calculations
  const getSubjectProgress = (syllabus: Syllabus) => {
    const allTopics = syllabus.chapters.flatMap(c => c.topics);
    if (allTopics.length === 0) return 0;
    const completed = allTopics.filter(t => t.completed).length;
    return Math.round((completed / allTopics.length) * 100);
  };

  const getChapterProgress = (chapter: Chapter) => {
    if (chapter.topics.length === 0) return 0;
    const completed = chapter.topics.filter(t => t.completed).length;
    return Math.round((completed / chapter.topics.length) * 100);
  };

  // Actions: Subject
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
    setSyllabuses([...syllabuses, newSyllabus]);
    setNewSubjectName('');
    setActiveSubjectId(newSyllabus.id);
  };

  const renameSubject = (id: string, newTitle: string) => {
    setSyllabuses(prev => prev.map(s => s.id === id ? { ...s, subject: newTitle } : s));
  };

  const deleteSubject = (id: string) => {
    if (confirm("Delete entire subject and all content?")) {
      const filtered = syllabuses.filter(s => s.id !== id);
      setSyllabuses(filtered);
      if (activeSubjectId === id) setActiveSubjectId(filtered[0]?.id || null);
    }
  };

  // Actions: Chapter
  const addChapter = (subjectId: string) => {
    const title = prompt("Enter Chapter Name:");
    if (!title) return;
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        const newChapter: Chapter = { id: Date.now().toString(), title, topics: [] };
        return { ...s, chapters: [...s.chapters, newChapter] };
      }
      return s;
    }));
  };

  const renameChapter = (subjectId: string, chapterId: string, newTitle: string) => {
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          chapters: s.chapters.map(c => c.id === chapterId ? { ...c, title: newTitle } : c)
        };
      }
      return s;
    }));
  };

  const deleteChapter = (subjectId: string, chapterId: string) => {
    if (confirm("Delete this chapter?")) {
      setSyllabuses(prev => prev.map(s => {
        if (s.id === subjectId) {
          return { ...s, chapters: s.chapters.filter(c => c.id !== chapterId) };
        }
        return s;
      }));
    }
  };

  // Actions: Topic
  const addTopic = (subjectId: string, chapterId: string) => {
    const title = prompt("Enter Topic Name:");
    if (!title) return;
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id === chapterId) {
              const newTopic: Topic = { id: Date.now().toString(), title, completed: false };
              return { ...c, topics: [...c.topics, newTopic] };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const renameTopic = (subjectId: string, chapterId: string, topicId: string, newTitle: string) => {
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id === chapterId) {
              return {
                ...c,
                topics: c.topics.map(t => t.id === topicId ? { ...t, title: newTitle } : t)
              };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const toggleTopic = (subjectId: string, chapterId: string, topicId: string) => {
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id === chapterId) {
              return {
                ...c,
                topics: c.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
              };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const deleteTopic = (subjectId: string, chapterId: string, topicId: string) => {
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          chapters: s.chapters.map(c => {
            if (c.id === chapterId) {
              return { ...c, topics: c.topics.filter(t => t.id !== topicId) };
            }
            return c;
          })
        };
      }
      return s;
    }));
  };

  const toggleChapterExpand = (id: string) => {
    const next = new Set(expandedChapters);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedChapters(next);
  };

  const activeSubject = syllabuses.find(s => s.id === activeSubjectId);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8" style={{ color: settings.primaryColor }} /> Syllabus Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Master your curriculum hierarchy: Subjects → Chapters → Topics.</p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="New Subject..."
            className="bg-white dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 shadow-sm dark:text-white"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSubject()}
          />
          <button 
            onClick={addSubject}
            className="text-white p-3 rounded-2xl shadow-lg transition-all active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Subjects List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Subjects</h2>
          {syllabuses.map((s) => {
            const prog = getSubjectProgress(s);
            const isActive = activeSubjectId === s.id;
            return (
              <div 
                key={s.id}
                onClick={() => setActiveSubjectId(s.id)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer group relative ${isActive ? 'bg-white dark:bg-slate-800 shadow-xl ring-2 ring-indigo-500/10' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-md'}`}
                style={isActive ? { borderColor: settings.primaryColor } : {}}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <BookOpen size={20} className="text-slate-400" style={isActive ? { color: settings.primaryColor } : {}} />
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteSubject(s.id); }} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
                <EditableLabel 
                  value={s.subject} 
                  onSave={(val) => renameSubject(s.id, val)}
                  className="text-sm font-bold dark:text-white mb-2"
                />
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-700" style={{ width: `${prog}%`, backgroundColor: settings.primaryColor }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Chapters & Topics */}
        <div className="lg:col-span-3">
          {activeSubject ? (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{activeSubject.subject} Roadmap</h2>
                  <p className="text-sm text-slate-400">{activeSubject.chapters.length} Chapters • {activeSubject.chapters.flatMap(c => c.topics).length} Topics</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-3xl font-black" style={{ color: settings.primaryColor }}>{getSubjectProgress(activeSubject)}%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery</p>
                  </div>
                  <button 
                    onClick={() => addChapter(activeSubject.id)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-lg"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <Plus size={18} /> Add Chapter
                  </button>
                </div>
              </div>

              {activeSubject.chapters.map((chapter) => {
                const isExpanded = expandedChapters.has(chapter.id);
                const prog = getChapterProgress(chapter);
                return (
                  <div key={chapter.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden group/chapter">
                    <div 
                      onClick={() => toggleChapterExpand(chapter.id)}
                      className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900">
                          {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                        </div>
                        <div className="flex-1">
                          <EditableLabel 
                            value={chapter.title}
                            onSave={(val) => renameChapter(activeSubject.id, chapter.id, val)}
                            className="font-bold text-lg dark:text-white"
                          />
                          <div className="flex items-center gap-4 mt-1">
                            <div className="w-32 bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full transition-all duration-700" style={{ width: `${prog}%`, backgroundColor: settings.primaryColor }} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{prog}% Done</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addTopic(activeSubject.id, chapter.id); }}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          + Topic
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteChapter(activeSubject.id, chapter.id); }} className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover/chapter:opacity-100 transition-opacity">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 space-y-2 border-t border-slate-50 dark:border-slate-700 animate-in slide-in-from-top-2 duration-300">
                        {chapter.topics.map((topic) => (
                          <div key={topic.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-slate-600 transition-all group/topic bg-slate-50/30 dark:bg-slate-900/20">
                            <button 
                              onClick={() => toggleTopic(activeSubject.id, chapter.id, topic.id)}
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${topic.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}
                            >
                              {topic.completed && <CheckCircle2 size={14} />}
                            </button>
                            <EditableLabel 
                              value={topic.title}
                              onSave={(val) => renameTopic(activeSubject.id, chapter.id, topic.id, val)}
                              className={`flex-1 text-sm font-medium ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}
                            />
                            <button onClick={() => deleteTopic(activeSubject.id, chapter.id, topic.id)} className="opacity-0 group-hover/topic:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-opacity">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {chapter.topics.length === 0 && (
                          <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No Topics added to this chapter</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {activeSubject.chapters.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <BookOpen size={40} className="text-slate-200" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Subject is Empty</h3>
                  <p className="text-slate-400 max-w-xs mb-8">Add your first chapter to start building your roadmap for {activeSubject.subject}.</p>
                  <button 
                    onClick={() => addChapter(activeSubject.id)}
                    className="px-8 py-3 rounded-2xl text-white font-bold transition-all active:scale-95 shadow-lg"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Add Your First Chapter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
              <ClipboardCheck size={48} className="text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">Select a subject to begin</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusTracker;
