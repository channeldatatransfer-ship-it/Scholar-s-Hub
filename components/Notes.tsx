
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Volume2, 
  Wand2, 
  FileText, 
  ChevronRight, 
  Tag, 
  X,
  Filter
} from 'lucide-react';
import { AppSettings } from '../types';
import { simplifyContent } from '../services/geminiService';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

const Notes: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('scholars_notes');
    // Ensure existing notes get an empty tags array if they don't have one
    const parsed: Note[] = saved ? JSON.parse(saved) : [
      { id: '1', title: 'Calculus Derivatives', content: 'Power rule: d/dx(x^n) = nx^(n-1). Chain rule: f(g(x))\' = f\'(g(x))g\'(x).', date: 'May 20, 2024', tags: ['math', 'calculus'] },
      { id: '2', title: 'Cell Biology', content: 'Mitochondria is the powerhouse of the cell. ATP is produced through cellular respiration.', date: 'May 21, 2024', tags: ['biology', 'science'] },
    ];
    return parsed.map(n => ({ ...n, tags: n.tags || [] }));
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach(n => n.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [notes]);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('scholars_notes', JSON.stringify(newNotes));
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      tags: [],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    saveNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) {
      const nextNote = notes.find(n => n.id !== id);
      setActiveNoteId(nextNote?.id || null);
    }
  };

  const addTag = (tag: string) => {
    if (!activeNote || !tag.trim()) return;
    const cleanTag = tag.trim().toLowerCase();
    if (!activeNote.tags.includes(cleanTag)) {
      updateNote(activeNote.id, { tags: [...activeNote.tags, cleanTag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { tags: activeNote.tags.filter(t => t !== tag) });
  };

  const handleTts = () => {
    if (activeNote?.content) {
      const utterance = new SpeechSynthesisUtterance(activeNote.content);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEli5 = async () => {
    if (!activeNote?.content) return;
    setIsAiLoading(true);
    try {
      const simplified = await simplifyContent(activeNote.content);
      updateNote(activeNote.id, { 
        content: activeNote.content + "\n\n--- Simplified (ELI5) ---\n" + simplified 
      });
    } catch (err) {
      console.error(err);
      alert("Error simplifying content. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || n.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar List */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-50 dark:border-slate-700 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 text-sm py-2.5 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Filter size={10} /> {settings.language === 'BN' ? 'ট্যাগ ফিল্টার' : 'Tag Filter'}
                </span>
                {selectedTag && (
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="text-[10px] text-rose-500 font-bold hover:underline"
                  >
                    {settings.language === 'BN' ? 'মুছুন' : 'Clear'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar p-1">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      selectedTag === tag 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-500 border-transparent hover:border-slate-200'
                    }`}
                    style={selectedTag === tag ? { backgroundColor: settings.primaryColor, borderColor: settings.primaryColor } : {}}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={createNote}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full text-left p-4 rounded-2xl transition-all group ${activeNoteId === note.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
              style={activeNoteId === note.id ? { backgroundColor: `${settings.primaryColor}1A` } : {}}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-bold text-sm line-clamp-1 ${activeNoteId === note.id ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}
                  style={activeNoteId === note.id ? { color: settings.primaryColor } : {}}
                >{note.title}</span>
                <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${activeNoteId === note.id ? 'translate-x-1' : ''}`} />
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{note.content || 'No content yet...'}</p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[9px] font-bold text-slate-300">#{tag}</span>
                ))}
                {note.tags?.length > 3 && <span className="text-[9px] font-bold text-slate-300">+{note.tags.length - 3}</span>}
              </div>

              <p className="text-[10px] text-slate-300 dark:text-slate-500 mt-2 font-bold uppercase tracking-widest">{note.date}</p>
            </button>
          ))}
          {filteredNotes.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              {settings.language === 'BN' ? 'কোনো নোট পাওয়া যায়নি' : 'No notes found'}
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden shadow-sm">
        {activeNote ? (
          <>
            <div className="px-8 py-4 border-b border-slate-50 dark:border-slate-700 space-y-4 bg-white dark:bg-slate-800 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <input 
                  type="text" 
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 w-1/2 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleTts}
                    className="p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleEli5}
                    disabled={isAiLoading}
                    className={`flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold text-sm transition-all hover:bg-indigo-100 ${isAiLoading ? 'animate-pulse cursor-not-allowed' : ''}`}
                    style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}1A` }}
                  >
                    <Wand2 className="w-4 h-4" /> {isAiLoading ? 'Thinking...' : 'ELI5'}
                  </button>
                  <button 
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tag Management */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 min-w-[120px]">
                  <Tag size={12} className="text-slate-400 shrink-0" />
                  <input 
                    type="text"
                    placeholder={settings.language === 'BN' ? 'ট্যাগ যোগ করুন...' : 'Add tag...'}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput)}
                    className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 w-full dark:text-white"
                  />
                </div>
                {activeNote.tags?.map(tag => (
                  <span 
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold border border-indigo-100 dark:border-indigo-800 group"
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              placeholder="Start writing your thoughts..."
              className="flex-1 p-8 text-lg bg-transparent border-none focus:ring-0 resize-none leading-relaxed dark:text-slate-200"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30 dark:bg-slate-900/30">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 mb-4">
               <FileText className="w-12 h-12 text-slate-200" />
            </div>
            <p className="font-medium">Select a note or create a new one to start writing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
