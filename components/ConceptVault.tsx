
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, Search, Trash2, Brain, Filter, Hash, Book, Lightbulb, X } from 'lucide-react';
import { AppSettings, Concept, Syllabus } from '../types';
import { simplifyContent } from '../services/geminiService';

const ConceptVault: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [concepts, setConcepts] = useState<Concept[]>(() => {
    const saved = localStorage.getItem('scholars_concepts');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: "Euler's Identity", content: "e^(iπ) + 1 = 0. Connects five fundamental mathematical constants.", category: 'formula', subjectId: 'Math' },
      { id: '2', title: "Photosynthesis", content: "6CO2 + 6H2O + light -> C6H12O6 + 6O2", category: 'definition', subjectId: 'Science' }
    ];
  });

  const [subjects, setSubjects] = useState<Syllabus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isExplaining, setIsExplaining] = useState<string | null>(null);
  const [newConcept, setNewConcept] = useState<Partial<Concept>>({ category: 'formula', subjectId: 'General' });

  useEffect(() => {
    localStorage.setItem('scholars_concepts', JSON.stringify(concepts));
    const savedSyllabus = localStorage.getItem('scholars_syllabuses_v2');
    if (savedSyllabus) setSubjects(JSON.parse(savedSyllabus));
  }, [concepts]);

  const handleAdd = () => {
    if (!newConcept.title || !newConcept.content) return;
    const concept: Concept = {
      id: Date.now().toString(),
      title: newConcept.title,
      content: newConcept.content,
      category: newConcept.category as any,
      subjectId: newConcept.subjectId || 'General'
    };
    setConcepts([concept, ...concepts]);
    setIsAdding(false);
    setNewConcept({ category: 'formula', subjectId: 'General' });
  };

  const handleAiExplain = async (concept: Concept) => {
    setIsExplaining(concept.id);
    try {
      const explanation = await simplifyContent(concept.content);
      const updated = concepts.map(c => 
        c.id === concept.id 
          ? { ...c, content: c.content + "\n\n--- AI Breakdown ---\n" + explanation } 
          : c
      );
      setConcepts(updated);
    } catch (err) {
      alert("AI failed to process this concept.");
    } finally {
      setIsExplaining(null);
    }
  };

  const filtered = concepts.filter(c => 
    (c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === 'all' || c.category === filterCategory)
  );

  const getIcon = (cat: string) => {
    switch(cat) {
      case 'formula': return <Hash className="w-5 h-5" />;
      case 'definition': return <Book className="w-5 h-5" />;
      case 'theorem': return <Lightbulb className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black dark:text-white tracking-tight flex items-center gap-3">
             <Zap className="w-10 h-10" style={{ color: settings.primaryColor }} /> Concept Vault
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your persistent knowledge base for core principles.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 text-white px-8 py-4 rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95 dynamic-primary-glow font-bold"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <Plus className="w-5 h-5" />
          Capture New Concept
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search the vault..."
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl pl-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           {['all', 'formula', 'definition', 'theorem'].map(cat => (
             <button
               key={cat}
               onClick={() => setFilterCategory(cat)}
               className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600'}`}
               style={filterCategory === cat ? { backgroundColor: settings.primaryColor } : {}}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map(concept => (
            <motion.div
              layout
              key={concept.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-indigo-600" style={{ color: settings.primaryColor }}>
                  {getIcon(concept.category)}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAiExplain(concept)}
                    disabled={isExplaining === concept.id}
                    className={`p-2 rounded-xl text-slate-300 hover:text-indigo-500 transition-colors ${isExplaining === concept.id ? 'animate-pulse' : ''}`}
                  >
                    <Brain size={18} />
                  </button>
                  <button 
                    onClick={() => setConcepts(concepts.filter(c => c.id !== concept.id))}
                    className="p-2 rounded-xl text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{concept.subjectId}</span>
              <h3 className="text-xl font-black dark:text-white mb-4">{concept.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">{concept.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-200">
               <Filter size={48} />
            </div>
            <p className="text-slate-400 font-bold">No concepts found in your vault matching these criteria.</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black dark:text-white">Capture Concept</h3>
                <button onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-rose-500"><X /></button>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Title</label>
                  <input 
                    autoFocus
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="e.g. Newton's Second Law"
                    value={newConcept.title || ''}
                    onChange={e => setNewConcept({...newConcept, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold dark:text-white"
                      value={newConcept.category}
                      onChange={e => setNewConcept({...newConcept, category: e.target.value as any})}
                    >
                      <option value="formula">Formula</option>
                      <option value="definition">Definition</option>
                      <option value="theorem">Theorem</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                    <select 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold dark:text-white"
                      value={newConcept.subjectId}
                      onChange={e => setNewConcept({...newConcept, subjectId: e.target.value})}
                    >
                      <option value="General">General</option>
                      {subjects.map(s => <option key={s.id} value={s.subject}>{s.subject}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description / Body</label>
                  <textarea 
                    className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10 resize-none"
                    placeholder="Enter the core principle or formula..."
                    value={newConcept.content || ''}
                    onChange={e => setNewConcept({...newConcept, content: e.target.value})}
                  />
                </div>
                <button 
                  onClick={handleAdd}
                  className="w-full py-5 rounded-[2rem] text-white font-black text-lg shadow-xl shadow-indigo-500/20"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  Save to Vault
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptVault;
