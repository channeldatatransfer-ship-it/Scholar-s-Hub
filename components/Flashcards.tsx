
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  Zap
} from 'lucide-react';
import { AppSettings, Deck, Flashcard } from '../types';

type SRSRating = 'again' | 'hard' | 'good' | 'easy';

const Flashcards: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  
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

  const [view, setView] = useState<'decks' | 'study'>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [studySessionCards, setStudySessionCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  useEffect(() => {
    localStorage.setItem('scholars_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem('scholars_cards', JSON.stringify(cards));
  }, [cards]);

  const scheduleCard = (card: Flashcard, rating: SRSRating): Flashcard => {
    const qMap: Record<SRSRating, number> = { again: 0, hard: 3, good: 4, easy: 5 };
    const q = qMap[rating];
    
    let { interval, easeFactor, reps, lapses, state } = { ...card };

    if (q < 3) {
      interval = 1;
      reps = 0;
      lapses += 1;
      state = 'learning';
    } else {
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      reps += 1;
      state = 'review';
      easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;
    }

    if (rating === 'easy') interval = Math.round(interval * 1.3);
    const nextReview = Date.now() + (interval * 24 * 60 * 60 * 1000);

    return { ...card, interval, easeFactor, reps, lapses, nextReview, state };
  };

  const startStudy = (deckId?: string) => {
    const now = Date.now();
    const due = cards.filter(c => (!deckId || c.deckId === deckId) && c.nextReview <= now)
                     .sort((a, b) => a.nextReview - b.nextReview);

    if (due.length === 0) {
      alert(isBN ? "সব পড়া শেষ! আপনি বর্তমানে সব টপিকে দক্ষ।" : "No cards due! You've mastered all current topics.");
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
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIdx(prev => prev + 1);
      }, 300);
    } else {
      setView('decks');
      alert(isBN ? "অসাধারণ! আপনি আজকের সেশন শেষ করেছেন।" : "Great job! You finished today's session.");
    }
  };

  const currentCard = studySessionCards[currentIdx];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black dark:text-white tracking-tight flex items-center gap-4">
             <Layers className="w-12 h-12" style={{ color: settings.primaryColor }} /> 
             {isBN ? 'ফ্ল্যাশকার্ড' : 'Smart Flashcards'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Master complex concepts with spaced repetition.</p>
        </div>
        
        {view === 'decks' && (
           <div className="flex gap-4">
              <button 
                onClick={() => startStudy()}
                className="px-10 py-5 rounded-[2.5rem] bg-indigo-600 text-white font-black shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <Zap /> {isBN ? 'সবগুলো রিভিশন' : 'Study All Due'}
              </button>
           </div>
        )}
      </header>

      {view === 'decks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {decks.map(deck => {
            const dueCount = cards.filter(c => c.deckId === deck.id && c.nextReview <= Date.now()).length;
            const totalCount = cards.filter(c => c.deckId === deck.id).length;
            return (
              <motion.div
                key={deck.id}
                className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col cursor-pointer"
                onClick={() => startStudy(deck.id)}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-6 rounded-[2rem]" style={{ backgroundColor: `${settings.primaryColor}1A` }}>
                    <Brain size={32} style={{ color: settings.primaryColor }} />
                  </div>
                  {dueCount > 0 && (
                    <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                      {dueCount} Due
                    </span>
                  )}
                </div>
                <h3 className="text-3xl font-black dark:text-white mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{deck.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 line-clamp-2">{deck.description}</p>
                <div className="mt-auto flex items-center justify-between pt-6 border-t dark:border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{totalCount} Cards Total</span>
                  <ChevronRight className="text-slate-300 group-hover:translate-x-2 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {view === 'study' && (
        <div className="max-w-2xl mx-auto flex flex-col items-center py-10">
          <div className="w-full flex justify-between items-center mb-12">
            <button onClick={() => setView('decks')} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-colors">
              <X size={20} /> {isBN ? 'সেশন বন্ধ করুন' : 'Quit Session'}
            </button>
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{currentIdx + 1} / {studySessionCards.length}</span>
              <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300" 
                  style={{ width: `${((currentIdx + 1) / studySessionCards.length) * 100}%`, backgroundColor: settings.primaryColor }} 
                />
              </div>
            </div>
          </div>

          <motion.div
            {...({
              initial: false,
              animate: { rotateY: isFlipped ? 180 : 0 },
              transition: { type: 'spring', stiffness: 260, damping: 20 }
            } as any)}
            className="w-full h-80 relative preserve-3d cursor-pointer mb-12"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' } as any}
          >
            <div className={`absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl p-10 flex flex-col items-center justify-center text-center ${isFlipped ? 'opacity-0' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Question</span>
              <h2 className="text-2xl font-bold dark:text-white leading-relaxed">{currentCard?.front}</h2>
              <div className="mt-auto text-[10px] font-black text-slate-300 uppercase tracking-widest">Click to reveal answer</div>
            </div>

            <div className={`absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-indigo-600 shadow-2xl p-10 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] ${!isFlipped ? 'opacity-0' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden', borderColor: settings.primaryColor }}>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Answer</span>
              <h2 className="text-2xl font-bold dark:text-white leading-relaxed">{currentCard?.back}</h2>
            </div>
          </motion.div>

          <AnimatePresence>
            {isFlipped && (
              <motion.div
                {...({
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 }
                } as any)}
                className="grid grid-cols-4 gap-4 w-full"
              >
                {(['again', 'hard', 'good', 'easy'] as SRSRating[]).map((rating) => (
                  <button
                    key={rating}
                    onClick={(e) => { e.stopPropagation(); handleRating(rating); }}
                    className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group"
                  >
                    <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${
                      rating === 'again' ? 'bg-rose-50 text-rose-500' :
                      rating === 'hard' ? 'bg-orange-50 text-orange-500' :
                      rating === 'good' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'
                    }`}>
                      {rating === 'again' ? <RotateCcw size={20} /> :
                       rating === 'hard' ? <ThumbsDown size={20} /> :
                       rating === 'good' ? <Meh size={20} /> : <ThumbsUp size={20} />}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{rating}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
