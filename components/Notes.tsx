
import React, { useState } from 'react';
import { Search, Plus, Trash2, Volume2, Wand2, FileText, ChevronRight } from 'lucide-react';
import { AppSettings } from '../types';
import { simplifyContent } from '../services/geminiService';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
}

const Notes: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('scholars_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Calculus Derivatives', content: 'Power rule: d/dx(x^n) = nx^(n-1). Chain rule: f(g(x))\' = f\'(g(x))g\'(x).', date: 'May 20, 2024' },
      { id: '2', title: 'Cell Biology', content: 'Mitochondria is the powerhouse of the cell. ATP is produced through cellular respiration.', date: 'May 21, 2024' },
    ];
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('scholars_notes', JSON.stringify(newNotes));
  };

  const createNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
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
    if (activeNoteId === id) setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
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

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar List */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-50 dark:border-slate-700">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search notes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-xl pl-10 text-sm py-2.5 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
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
              <p className="text-[10px] text-slate-300 dark:text-slate-500 mt-2 font-bold uppercase tracking-widest">{note.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden shadow-sm">
        {activeNote ? (
          <>
            <div className="px-8 py-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10">
              <input 
                type="text" 
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                className="text-xl font-bold bg-transparent border-none p-0 focus:ring-0 w-1/2 dark:text-white"
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleTts}
                  className="p-2.5 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors tooltip"
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
