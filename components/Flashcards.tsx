
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layers, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Meh, 
  Plus, 
  Brain, 
  Trash2, 
  ChevronLeft, 
  X,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { AppSettings, Deck, Flashcard } from '../types';

type SRSRating = 'again' | 'hard' | 'good' | 'easy';

const Flashcards: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  // --- PERSISTENT STATE ---
  const [decks, setDecks] = useState<Deck[]>(() => {
    const saved = localStorage.getItem('scholars_decks');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'General Science', description: 'Foundational concepts in biology and physics' }
    ];
  });

  const [cards, setCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('scholars_cards');
    return saved ? JSON.parse(saved) : [
      { id: '1', deckId: '1', front: 'What organelle is the powerhouse of the cell?', back: 'Mitochondria', nextReview: Date.now(), interval: 0, easeFactor: 2.5, reps: 0, lapses: 0, state: 'new' },
      { id: '2', deckId: '1', front: 'What is the speed of light in a vacuum?', back: '299,792,458 m/s', nextReview: Date.now(), interval: 0, easeFactor: 2.5, reps: 0, lapses: 0, state: 'new' }
    ];
  });

  // --- UI STATE ---
  const [view, setView] = useState<'decks' | 'deck_detail' | 'study' | 'create_deck'>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [studySessionCards, setStudySessionCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Modals
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });
  const [newDeck, setNewDeck] = useState({ name: '', description: '' });

  // --- SYNC ---
  useEffect(() => {
    localStorage.setItem('scholars_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('scholars_cards', JSON.stringify(cards));
  }, [cards]);

  // --- SRS LOGIC (SM-2 Algorithm) ---
  const scheduleCard = (card: Flashcard, rating: SRSRating): Flashcard => {
    const qMap: Record<SRSRating, number> = { again: 0, hard: 3, good: 4, easy: 5 };
    const q = qMap[rating];
    
    let { interval, easeFactor, reps, lapses, state } = { ...card };

    // SM-2 Implementation
    if (q < 3) {
      // Forgot: Reset interval to 1 day and increase lapses
      interval = 1;
      reps = 0;
      lapses += 1;
      state = 'learning';
    } else {
      // Correct
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      reps += 1;
      state = 'review';
      
      // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
      easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;
    }

    // Special bonus for 'Easy'
    if (rating === 'easy') interval = Math.round(interval * 1.3);

    const nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);

    return { ...card, interval, easeFactor, reps, lapses, nextReview, state };
  };

  // --- ACTIONS ---
  const startStudy = (deckId?: string) => {
    const now = Date.now();
    const due = cards.filter(c => (!deckId || c.deckId === deckId) && c.nextReview <= now)
                     .sort((a, b) => a.nextReview - b.nextReview);

    if (due.length === 0) {
      alert("No cards due! You've mastered all current topics.");
      return;
    }

    setStudySessionCards(due);
    setCurrentIdx(0);
    setIsFlipped(false);
    setView('study');
  };

  const handleRating = (rating: SRSRating) => {
    const currentCard = studySessionCards[currentIdx];
    const updated = scheduleCard(currentCard, rating);
    
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c));

    if (currentIdx + 1 < studySessionCards.length) {
      setCurrentIdx(currentIdx + 1);
      setIsFlipped(false);
    } else {
      setView('decks');
      alert("Session Complete! Your progress has been updated.");
    }
  };

  const handleCreateCard = () => {
    if (!newCard.front || !newCard.back || !selectedDeckId) return;
    const card: Flashcard = {
      id: Date.now().toString(),
      deckId: selectedDeckId,
      front: newCard.front,
      back: newCard.back,
      nextReview: Date.now(),
      interval: 0,
      easeFactor: 2.5,
      reps: 0,
      lapses: 0,
      state: 'new'
    };
    setCards([...cards, card]);
    setNewCard({ front: '', back: '' });
    setShowAddCard(false);
  };

  const getDeckStats = useMemo(() => (deckId: string) => {
    const deckCards = cards.filter(c => c.deckId === deckId);
    const due = deckCards.filter(c => c.nextReview <= Date.now()).length;
    const learning = deckCards.filter(c => c.state === 'learning').length;
    const mastered = deckCards.filter(c => c.state === 'review' && c.interval > 30).length;
    return { total: deckCards.length, due, learning, mastered };
  }, [cards]);

  const selectedDeck = decks.find(d => d.id === selectedDeckId);
  const deckCards = cards.filter(c => c.deckId === selectedDeckId);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 animate-in fade-in duration-500">
      
      {/* --- DECKS OVERVIEW --- */}
      {view === 'decks' && (
        <>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-black dark:text-white flex items-center gap-3">
                <Layers className="w-10 h-10" style={{ color: settings.primaryColor }} /> 
                Scholar Decks
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
                Leverage standard SM-2 algorithms to maximize retention and minimize study time.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('create_deck')}
                className="px-6 py-3 rounded-2xl font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> New Subject
              </button>
              <button 
                onClick={() => startStudy()}
                className="px-8 py-4 rounded-[2rem] font-bold text-white shadow-xl shadow-indigo-500/20 flex items-center gap-3 transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <Brain className="w-6 h-6" /> Review All Due
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {decks.map(deck => {
              const stats = getDeckStats(deck.id);
              return (
                <div 
                  key={deck.id}
                  onClick={() => { setSelectedDeckId(deck.id); setView('deck_detail'); }}
                  className="group bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all cursor-pointer flex flex-col relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-3xl" style={{ backgroundColor: `${settings.primaryColor}1A` }}>
                      <RotateCcw className="w-8 h-8" style={{ color: settings.primaryColor }} />
                    </div>
                    {stats.due > 0 && (
                      <div className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-xs font-black tracking-widest flex items-center gap-1.5">
                        <Clock size={12} /> {stats.due} DUE
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black mb-2 dark:text-white group-hover:text-indigo-600 transition-colors">{deck.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-8">{deck.description}</p>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase">
                      <span>Progress</span>
                      <span>{stats.mastered} Mastered</span>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <div className="h-full bg-indigo-500" style={{ width: `${(stats.mastered / (stats.total || 1)) * 100}%`, backgroundColor: settings.primaryColor }} />
                      <div className="h-full bg-emerald-400" style={{ width: `${(stats.learning / (stats.total || 1)) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700" />)}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startStudy(deck.id); }}
                        disabled={stats.due === 0}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${stats.due > 0 ? 'text-white shadow-lg' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'}`}
                        style={stats.due > 0 ? { backgroundColor: settings.primaryColor } : {}}
                      >
                        Practice Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            <button 
              onClick={() => setView('create_deck')}
              className="group flex flex-col items-center justify-center p-12 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-slate-300 hover:border-indigo-400 hover:text-indigo-500 transition-all"
            >
              <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <PlusCircle size={48} />
              </div>
              <span className="text-xl font-black">Create New Deck</span>
            </button>
          </div>
        </>
      )}

      {/* --- DECK DETAIL --- */}
      {view === 'deck_detail' && selectedDeck && (
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setView('decks')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold mb-10 transition-colors">
            <ChevronLeft size={20} /> Back to Library
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                 <h1 className="text-4xl font-black dark:text-white">{selectedDeck.name}</h1>
                 <button onClick={() => { if(confirm("Delete this deck?")) { setDecks(decks.filter(d => d.id !== selectedDeckId)); setCards(cards.filter(c => c.deckId !== selectedDeckId)); setView('decks'); }}} className="text-slate-300 hover:text-rose-500 transition-colors">
                   <Trash2 size={20} />
                 </button>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">{selectedDeck.description}</p>
            </div>
            <div className="flex gap-3 shrink-0">
               <button 
                onClick={() => setShowAddCard(true)}
                className="px-8 py-4 rounded-3xl font-bold bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2 dark:text-white"
               >
                 <Plus size={20} /> Add Cards
               </button>
               <button 
                onClick={() => startStudy(selectedDeckId!)}
                className="px-10 py-4 rounded-3xl font-bold text-white shadow-xl flex items-center gap-3 transition-all hover:brightness-110"
                style={{ backgroundColor: settings.primaryColor }}
               >
                 <Brain size={22} /> Study Now
               </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
             {[
               { label: 'Total Cards', value: deckCards.length, icon: Layers, color: 'text-indigo-500' },
               { label: 'Average Ease', value: (deckCards.reduce((acc, c) => acc + c.easeFactor, 0) / (deckCards.length || 1)).toFixed(2), icon: TrendingUp, color: 'text-emerald-500' },
               { label: 'Next Session', value: deckCards.length ? new Date(Math.min(...deckCards.map(c => c.nextReview))).toLocaleDateString() : 'N/A', icon: Clock, color: 'text-amber-500' }
             ].map((stat, i) => (
               <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-50 dark:border-slate-700 shadow-sm">
                  <div className={`p-3 w-fit rounded-2xl bg-slate-50 dark:bg-slate-900 mb-4 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-2xl font-black dark:text-white">{stat.value}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
               </div>
             ))}
          </div>

          <div className="space-y-4">
             {deckCards.map(card => (
               <div key={card.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-50 dark:border-slate-700 hover:shadow-md transition-all flex items-center gap-6 group">
                  <div className="flex-1">
                     <p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Front</p>
                     <p className="font-bold text-slate-700 dark:text-slate-200">{card.front}</p>
                  </div>
                  <div className="flex-1 border-l pl-6 dark:border-slate-700">
                     <p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Back</p>
                     <p className="text-slate-500 dark:text-slate-400 italic">{card.back}</p>
                  </div>
                  <div className="text-right flex items-center gap-6">
                     <div className="hidden sm:block">
                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1 tracking-widest">Interval</p>
                        <p className="text-xs font-bold text-slate-500">{card.interval}d</p>
                     </div>
                     <button onClick={() => setCards(cards.filter(c => c.id !== card.id))} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                       <X size={20} />
                     </button>
                  </div>
               </div>
             ))}
             {deckCards.length === 0 && (
               <div className="text-center py-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                  <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-xl font-bold text-slate-400">Empty Deck. Start by adding some cards!</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- STUDY SESSION --- */}
      {view === 'study' && studySessionCards.length > 0 && (
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-12">
             <div className="flex items-center gap-4">
                <button onClick={() => setView('decks')} className="p-4 bg-white dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-500 shadow-sm border border-slate-100 dark:border-slate-700 transition-all">
                   <ChevronLeft />
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Studying</span>
                  <span className="text-xl font-black dark:text-white">{selectedDeck?.name || 'All Cards'}</span>
                </div>
             </div>
             <div className="text-right">
                <span className="text-sm font-black text-slate-400 tracking-[0.2em]">{currentIdx + 1} / {studySessionCards.length}</span>
                <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
                   <div 
                    className="h-full transition-all duration-500" 
                    style={{ width: `${((currentIdx + 1) / studySessionCards.length) * 100}%`, backgroundColor: settings.primaryColor }}
                   />
                </div>
             </div>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full aspect-[16/10] max-h-[500px] cursor-pointer preserve-3d transition-transform duration-700 select-none"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'none'
            }}
          >
            {/* FRONT */}
            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
               <span className="text-xs font-black text-slate-300 uppercase tracking-[0.4em] mb-12">Question</span>
               <h2 className="text-3xl md:text-5xl font-black dark:text-white leading-tight">{studySessionCards[currentIdx].front}</h2>
               <div className="mt-12 opacity-30 animate-pulse">
                  <RotateCcw size={40} style={{ color: settings.primaryColor }} />
               </div>
               <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-widest">Tap to Reveal Answer</p>
            </div>
            
            {/* BACK */}
            <div className="absolute inset-0 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center p-12 text-center backface-hidden" 
              style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)',
                backgroundColor: settings.primaryColor
              }}
            >
               <span className="text-xs font-black text-white/40 uppercase tracking-[0.4em] mb-12">Answer</span>
               <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">{studySessionCards[currentIdx].back}</h2>
               <div className="mt-12 h-10"></div>
               <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Rate Your Recall Strength</p>
            </div>
          </div>

          {/* RATING BUTTONS */}
          <div className={`mt-12 w-full max-w-2xl grid grid-cols-4 gap-4 transition-all duration-700 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
             {[
               { id: 'again', label: 'Again', desc: '< 10m', color: 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white', icon: RotateCcw },
               { id: 'hard', label: 'Hard', desc: '1d', color: 'bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-500 hover:text-white', icon: ThumbsDown },
               { id: 'good', label: 'Good', desc: '2d', color: 'bg-indigo-50 text-indigo-500 border-indigo-100 hover:bg-indigo-500 hover:text-white', icon: Meh },
               { id: 'easy', label: 'Easy', desc: '4d', color: 'bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-emerald-500 hover:text-white', icon: ThumbsUp }
             ].map(r => (
               <button 
                key={r.id}
                onClick={(e) => { e.stopPropagation(); handleRating(r.id as SRSRating); }}
                className={`group p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 shadow-sm active:scale-95 ${r.color}`}
               >
                 <r.icon size={28} className="transition-transform group-hover:scale-110" />
                 <span className="font-black uppercase text-xs tracking-widest">{r.label}</span>
                 <span className="text-[10px] font-bold opacity-60">{r.desc}</span>
               </button>
             ))}
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      {view === 'create_deck' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-slate-700">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black dark:text-white">Create Deck</h2>
              <button onClick={() => setView('decks')} className="p-3 text-slate-300 hover:text-rose-500"><X size={32} /></button>
           </div>
           <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Deck Title</label>
                <input autoFocus type="text" value={newDeck.name} onChange={e => setNewDeck({...newDeck, name: e.target.value})} placeholder="e.g., Organic Chemistry II" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-6 text-xl font-black dark:text-white focus:ring-4 focus:ring-indigo-500/10" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Description</label>
                <textarea value={newDeck.description} onChange={e => setNewDeck({...newDeck, description: e.target.value})} placeholder="Mastering the basics of carbon-based reactions..." className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-6 h-32 text-lg font-bold dark:text-white focus:ring-4 focus:ring-indigo-500/10 resize-none" />
              </div>
              <button onClick={() => { setDecks([...decks, {id: Date.now().toString(), ...newDeck}]); setView('decks'); setNewDeck({name:'', description:''}); }} disabled={!newDeck.name} className="w-full py-6 rounded-3xl text-white font-black text-xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50" style={{ backgroundColor: settings.primaryColor }}>
                Confirm Deck
              </button>
           </div>
        </div>
      )}

      {showAddCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-lg" onClick={() => setShowAddCard(false)}></div>
           <div className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black dark:text-white">New Flashcard</h3>
                <button onClick={() => setShowAddCard(false)} className="text-slate-300 hover:text-rose-500"><X size={28} /></button>
              </div>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Front / Question</label>
                  <input autoFocus type="text" value={newCard.front} onChange={e => setNewCard({...newCard, front: e.target.value})} placeholder="The concept you want to memorize..." className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-5 text-lg font-bold dark:text-white focus:ring-4" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-widest">Back / Answer</label>
                  <textarea value={newCard.back} onChange={e => setNewCard({...newCard, back: e.target.value})} placeholder="The definition or explanation..." className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-5 h-32 text-lg font-bold dark:text-white focus:ring-4 resize-none" />
                </div>
                <div className="flex gap-4 pt-4">
                   <button onClick={() => setShowAddCard(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 py-5 rounded-2xl font-bold transition-all">Cancel</button>
                   <button onClick={handleCreateCard} disabled={!newCard.front || !newCard.back} className="flex-[2] text-white py-5 rounded-2xl font-black text-lg shadow-xl transition-all disabled:opacity-50" style={{ backgroundColor: settings.primaryColor }}>Save Flashcard</button>
                </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default Flashcards;
