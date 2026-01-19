
import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  MoreVertical,
  ChevronDown,
  LayoutGrid,
  List
} from 'lucide-react';
import { Syllabus, Topic } from '../types';

const SyllabusTracker: React.FC = () => {
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>(() => {
    const saved = localStorage.getItem('scholars_syllabuses');
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        subject: 'Physics', 
        color: 'indigo',
        topics: [
          { id: 'p1', title: 'Thermodynamics', completed: true },
          { id: 'p2', title: 'Electromagnetism', completed: false },
          { id: 'p3', title: 'Quantum Mechanics', completed: false }
        ]
      },
      { 
        id: '2', 
        subject: 'Biology', 
        color: 'emerald',
        topics: [
          { id: 'b1', title: 'Genetics', completed: true },
          { id: 'b2', title: 'Ecology', completed: true },
          { id: 'b3', title: 'Cell Structure', completed: false }
        ]
      }
    ];
  });

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');

  useEffect(() => {
    localStorage.setItem('scholars_syllabuses', JSON.stringify(syllabuses));
    // Trigger update for sidebar progress bar
    window.dispatchEvent(new Event('syllabusUpdate'));
  }, [syllabuses]);

  const addSubject = () => {
    if (!newSubjectName.trim()) return;
    const colors = ['indigo', 'emerald', 'rose', 'amber', 'purple', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newSyllabus: Syllabus = {
      id: Date.now().toString(),
      subject: newSubjectName,
      color: randomColor,
      topics: []
    };
    
    setSyllabuses([...syllabuses, newSyllabus]);
    setNewSubjectName('');
  };

  const addTopic = (subjectId: string) => {
    if (!newTopicName.trim()) return;
    
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: [...s.topics, { id: Date.now().toString(), title: newTopicName, completed: false }]
        };
      }
      return s;
    }));
    setNewTopicName('');
  };

  const toggleTopic = (subjectId: string, topicId: string) => {
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: s.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t)
        };
      }
      return s;
    }));
  };

  const deleteSubject = (id: string) => {
    if (confirm("Delete this subject and all its progress?")) {
      setSyllabuses(prev => prev.filter(s => s.id !== id));
      if (activeSubjectId === id) setActiveSubjectId(null);
    }
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    setSyllabuses(prev => prev.map(s => {
      if (s.id === subjectId) {
        return { ...s, topics: s.topics.filter(t => t.id !== topicId) };
      }
      return s;
    }));
  };

  const getProgress = (syllabus: Syllabus) => {
    if (syllabus.topics.length === 0) return 0;
    const completed = syllabus.topics.filter(t => t.completed).length;
    return Math.round((completed / syllabus.topics.length) * 100);
  };

  const activeSubject = syllabuses.find(s => s.id === activeSubjectId);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
            <ClipboardCheck className="text-indigo-600 w-8 h-8" /> Syllabus Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Break down your curriculum into manageable topics.</p>
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
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Grid */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Your Subjects</h2>
          {syllabuses.map((syllabus) => {
            const progress = getProgress(syllabus);
            const isActive = activeSubjectId === syllabus.id;
            
            return (
              <div 
                key={syllabus.id}
                onClick={() => setActiveSubjectId(syllabus.id)}
                className={`
                  p-6 rounded-3xl border transition-all cursor-pointer group relative
                  ${isActive 
                    ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-indigo-100 dark:shadow-none shadow-xl ring-2 ring-indigo-500/10' 
                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-md'}
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-${syllabus.color}-50 dark:bg-${syllabus.color}-900/30`}>
                    <BookOpen className={`w-6 h-6 text-${syllabus.color}-600`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-400">{progress}%</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSubject(syllabus.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{syllabus.subject}</h3>
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${syllabus.color}-500 transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          {syllabuses.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
               <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-medium">Add your first subject to start tracking.</p>
            </div>
          )}
        </div>

        {/* Detailed Topic View */}
        <div className="lg:col-span-2">
          {activeSubject ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-8 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white">{activeSubject.subject} Roadmap</h2>
                  <p className="text-sm text-slate-400">{activeSubject.topics.length} topics listed</p>
                </div>
                <div className="text-right">
                   <p className="text-3xl font-black text-indigo-600">{getProgress(activeSubject)}%</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completion</p>
                </div>
              </div>

              <div className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  placeholder="Add a topic (e.g., Circular Motion)..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTopic(activeSubject.id)}
                />
                <button 
                  onClick={() => addTopic(activeSubject.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" /> Add
                </button>
              </div>

              <div className="space-y-3">
                {activeSubject.topics.map((topic) => (
                  <div 
                    key={topic.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group"
                  >
                    <button 
                      onClick={() => toggleTopic(activeSubject.id, topic.id)}
                      className={`
                        w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                        ${topic.completed 
                          ? 'bg-emerald-500 border-emerald-500 text-white' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'}
                      `}
                    >
                      {topic.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <span className={`flex-1 font-medium transition-all ${topic.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {topic.title}
                    </span>
                    <button 
                      onClick={() => deleteTopic(activeSubject.id, topic.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {activeSubject.topics.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 font-medium italic">No topics added yet. Map out your syllabus!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
               <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-6">
                 <ClipboardCheck className="w-10 h-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Select a Subject</h3>
               <p className="text-slate-400 max-w-xs">Pick a subject from the list to manage topics and track your learning progress.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyllabusTracker;
