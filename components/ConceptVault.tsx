
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Plus, Search, Trash2, Brain, Filter, Hash, Book, 
  Lightbulb, X, Image as ImageIcon, Sparkles, RefreshCw, 
  Download, Maximize2, Map as MapIcon, ChevronRight, 
  LayoutGrid, Share2, Info, ArrowUpRight
} from 'lucide-react';
import { AppSettings, Concept, Syllabus } from '../types';
import { simplifyContent, generateConceptImage, identifyConceptRelationships } from '../services/geminiService';

const ConceptVault: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [activeTab, setActiveTab] = useState<'vault' | 'map'>('vault');
  const [concepts, setConcepts] = useState<Concept[]>(() => {
    const saved = localStorage.getItem('scholars_concepts');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: "Euler's Identity", content: "e^(iπ) + 1 = 0. Connects five fundamental mathematical constants.", category: 'formula', subjectId: 'Math' },
      { id: '2', title: "Photosynthesis", content: "6CO2 + 6H2O + light -> C6H12O6 + 6O2. Plants convert light energy into chemical energy.", category: 'definition', subjectId: 'Science' }
    ];
  });

  const [subjects, setSubjects] = useState<Syllabus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [isExplaining, setIsExplaining] = useState<string | null>(null);
  const [isIllustrating, setIsIllustrating] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [newConcept, setNewConcept] = useState<Partial<Concept>>({ category: 'formula', subjectId: 'General' });
  
  // Mapping state
  const [conceptMap, setConceptMap] = useState<any[]>([]);
  const [isMapping, setIsMapping] = useState(false);

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

  const handleAiIllustrate = async (concept: Concept) => {
    setIsIllustrating(concept.id);
    try {
      const imageUrl = await generateConceptImage(concept.title, concept.content);
      if (imageUrl) {
        const updated = concepts.map(c => 
          c.id === concept.id ? { ...c, imageUrl } : c
        );
        setConcepts(updated);
      }
    } catch (err) {
      alert("AI failed to generate visual. Try a different concept description.");
    } finally {
      setIsIllustrating(null);
    }
  };

  const handleGenerateMap = async () => {
    if (concepts.length < 2) {
      alert(isBN ? "মানচিত্র তৈরির জন্য কমপক্ষে ২ টি কনসেপ্ট প্রয়োজন।" : "At least 2 concepts are needed to generate a map.");
      return;
    }
    setIsMapping(true);
    try {
      const relationships = await identifyConceptRelationships(concepts);
      setConceptMap(relationships);
    } catch (e) {
      alert("Failed to build map.");
    } finally {
      setIsMapping(false);
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
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-5xl font-black dark:text-white tracking-tighter flex items-center gap-4">
             <Zap className="w-14 h-14" style={{ color: settings.primaryColor }} /> 
             {isBN ? 'কনসেপ্ট ভল্ট' : 'Concept Vault'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Your intelligent repository for core knowledge.</p>
        </div>
        
        <div className="flex gap-4 bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('vault')}
            className={`px-8 py-4 rounded-[2rem] text-sm font-black flex items-center gap-3 transition-all ${activeTab === 'vault' ? 'text-white shadow-xl' : 'text-slate-400'}`}
            style={activeTab === 'vault' ? { backgroundColor: settings.primaryColor } : {}}
          >
            <LayoutGrid size={18} /> Vault View
          </button>
          <button 
            onClick={() => { setActiveTab('map'); handleGenerateMap(); }}
            className={`px-8 py-4 rounded-[2rem] text-sm font-black flex items-center gap-3 transition-all ${activeTab === 'map' ? 'text-white shadow-xl' : 'text-slate-400'}`}
            style={activeTab === 'map' ? { backgroundColor: settings.primaryColor } : {}}
          >
            <MapIcon size={18} /> Relationship Map
          </button>
        </div>
      </header>

      {activeTab === 'vault' ? (
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row gap-6 items-center bg-white dark:bg-slate-900 p-6 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search the vault..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] pl-14 py-4 text-base font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-[2rem]">
               {['all', 'formula', 'definition', 'theorem'].map(cat => (
                 <button
                   key={cat}
                   onClick={() => setFilterCategory(cat)}
                   className={`px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat ? 'bg-white text-indigo-600 shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
                   style={filterCategory === cat ? { color: settings.primaryColor } : {}}
                 >
                   {cat}
                 </button>
               ))}
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="px-10 py-4 rounded-[2rem] text-white font-black shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              style={{ backgroundColor: settings.primaryColor }}
            >
              + Capture Concept
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filtered.map(concept => (
                <motion.div
                  layout
                  key={concept.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-slate-900 p-0 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] group transition-all relative overflow-hidden flex flex-col hover:-translate-y-2"
                >
                  <div className={`absolute top-0 right-0 w-48 h-48 bg-indigo-500 opacity-[0.03] rounded-bl-[15rem] transition-all group-hover:scale-125`} style={{ backgroundColor: settings.primaryColor }} />
                  
                  {concept.imageUrl && (
                    <div className="relative w-full aspect-square overflow-hidden group/image border-b dark:border-slate-800">
                      <img src={concept.imageUrl} alt={concept.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-4">
                         <button onClick={() => setLightboxImage(concept.imageUrl!)} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 shadow-2xl"><Maximize2 size={24} /></button>
                         <button onClick={() => handleAiIllustrate(concept)} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 shadow-2xl"><RefreshCw size={24} /></button>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-10 space-y-6 flex-1 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 shadow-sm transition-transform group-hover:scale-110" style={{ color: settings.primaryColor }}>
                        {getIcon(concept.category)}
                      </div>
                      <div className="flex gap-2 bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl">
                        <button 
                          onClick={() => handleAiExplain(concept)}
                          disabled={isExplaining === concept.id}
                          className={`p-3 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors ${isExplaining === concept.id ? 'animate-pulse' : ''}`}
                          title="AI Deep Explain"
                        >
                          <Brain size={20} />
                        </button>
                        <button 
                          onClick={() => setConcepts(concepts.filter(c => c.id !== concept.id))}
                          className="p-3 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                          title="Archive"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{concept.subjectId}</span>
                      <h3 className="text-2xl font-black dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{concept.title}</h3>
                    </div>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm whitespace-pre-wrap leading-relaxed line-clamp-4 group-hover:line-clamp-none transition-all duration-500">
                      {concept.content}
                    </p>
                  </div>

                  {!concept.imageUrl && (
                    <div className="px-10 pb-10">
                      <button 
                        onClick={() => handleAiIllustrate(concept)}
                        disabled={isIllustrating === concept.id}
                        className={`w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all ${isIllustrating === concept.id ? 'animate-pulse bg-indigo-50' : 'hover:bg-indigo-50'}`}
                      >
                        {isIllustrating === concept.id ? <RefreshCw className="animate-spin" size={16} /> : <ImageIcon size={16} />}
                        {isIllustrating === concept.id ? 'Drawing Blueprint...' : 'AI Visualization'}
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-[4rem] p-12 min-h-[600px] relative overflow-hidden shadow-2xl border border-white/5">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20" />
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           
           <div className="relative z-10 flex flex-col items-center justify-center h-full text-center py-20">
              {isMapping ? (
                <div className="flex flex-col items-center gap-10">
                   <div className="relative">
                      <div className="w-32 h-32 border-4 border-white/10 rounded-full animate-spin border-t-white" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <MapIcon size={32} className="text-white animate-pulse" />
                      </div>
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-3xl font-black text-white">Generating Knowledge Map</h3>
                     <p className="text-slate-400 max-w-sm">Scholar AI is analyzing your vault to find hidden connections and prerequisites.</p>
                   </div>
                </div>
              ) : conceptMap.length > 0 ? (
                <div className="w-full max-w-4xl space-y-12 text-left">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {conceptMap.map((map, idx) => (
                        <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all"
                        >
                           <div className="flex justify-between items-start mb-6">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${map.importance === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                {map.importance} priority
                              </span>
                              <ArrowUpRight size={20} className="text-white/20" />
                           </div>
                           <h4 className="text-2xl font-black text-white mb-4">{map.concept}</h4>
                           <div className="space-y-4">
                              {map.prerequisite && (
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                   <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                      <Zap size={12} />
                                   </div>
                                   <span>Prereq: <strong className="text-white">{map.prerequisite}</strong></span>
                                </div>
                              )}
                              {map.related && map.related.length > 0 && (
                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                   <div className="w-6 h-6 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                      <Share2 size={12} />
                                   </div>
                                   <span>Related: <strong className="text-white">{map.related.join(', ')}</strong></span>
                                </div>
                              )}
                           </div>
                        </motion.div>
                      ))}
                   </div>
                   <button onClick={handleGenerateMap} className="flex items-center gap-3 text-white/50 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mx-auto">
                      <RefreshCw size={14} /> Refresh Map Connections
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center text-white/20">
                     <MapIcon size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-white">No Map Generated</h3>
                  <p className="text-slate-500">Capture more concepts to see how they interconnect.</p>
                  <button 
                    onClick={handleGenerateMap}
                    className="px-10 py-5 bg-white text-indigo-950 font-black rounded-3xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    Generate First Map
                  </button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Adding Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl" onClick={() => setIsAdding(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.4)] border dark:border-slate-800">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black dark:text-white">Capture New Insight</h3>
                  <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-rose-500"><X /></button>
               </div>
               <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Concept Title</label>
                    <input 
                      autoFocus
                      className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 text-xl font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
                      placeholder="e.g. Thermodynamics Second Law"
                      value={newConcept.title || ''}
                      onChange={e => setNewConcept({...newConcept, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Category</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-bold dark:text-white appearance-none shadow-inner"
                        value={newConcept.category}
                        onChange={e => setNewConcept({...newConcept, category: e.target.value as any})}
                      >
                        <option value="formula">Formula</option>
                        <option value="definition">Definition</option>
                        <option value="theorem">Theorem</option>
                        <option value="other">Insight</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Linked Subject</label>
                      <select 
                        className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-bold dark:text-white appearance-none shadow-inner"
                        value={newConcept.subjectId}
                        onChange={e => setNewConcept({...newConcept, subjectId: e.target.value})}
                      >
                        <option value="General">General</option>
                        {subjects.map(s => <option key={s.id} value={s.subject}>{s.subject}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Core Content</label>
                    <textarea 
                      className="w-full h-40 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl p-6 font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10 resize-none shadow-inner"
                      placeholder="Enter the core principle, formula, or definition..."
                      value={newConcept.content || ''}
                      onChange={e => setNewConcept({...newConcept, content: e.target.value})}
                    />
                  </div>
                  <button 
                    onClick={handleAdd}
                    className="w-full py-6 rounded-[2.5rem] text-white font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Save to Vault
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-8 lg:p-20">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setLightboxImage(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-full max-h-full aspect-square shadow-[0_0_150px_rgba(0,0,0,0.5)] rounded-[4rem] overflow-hidden">
               <img src={lightboxImage} className="w-full h-full object-contain" />
               <button 
                 onClick={() => setLightboxImage(null)} 
                 className="absolute top-10 right-10 p-5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-3xl text-white transition-all shadow-2xl"
               >
                 <X size={32} />
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Visualizing Loader */}
      <AnimatePresence>
        {isIllustrating && (
          <div className="fixed inset-0 z-[2500] flex items-center justify-center p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" />
            <div className="relative text-center space-y-12">
               <div className="relative mx-auto w-40 h-40">
                  <div className="absolute inset-0 border-8 border-indigo-500/20 rounded-[3rem] animate-pulse" />
                  <div className="absolute inset-0 border-t-8 border-indigo-500 rounded-[3rem] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={48} className="text-white animate-bounce" />
                  </div>
               </div>
               <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white">Visualizing Concept</h3>
                  <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                    Scholar AI is translating your concept into a minimalist 3D diagram. This high-fidelity process takes a few seconds...
                  </p>
               </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConceptVault;
