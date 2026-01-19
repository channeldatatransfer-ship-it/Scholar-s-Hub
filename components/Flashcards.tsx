
import React, { useState } from 'react';
import { Layers, RotateCcw, ThumbsUp, ThumbsDown, Meh, Plus, Search, Brain } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  ease: 'easy' | 'good' | 'hard' | null;
}

const Flashcards: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([
    { id: '1', front: 'What is the powerhouse of the cell?', back: 'Mitochondria', ease: null },
    { id: '2', front: 'Define 2nd Law of Thermodynamics', back: 'The entropy of any isolated system always increases.', ease: null },
    { id: '3', front: 'Who wrote "Principia Mathematica"?', back: 'Isaac Newton', ease: null },
  ]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);

  const handleRate = (ease: 'easy' | 'good' | 'hard') => {
    if (currentIdx + 1 < cards.length) {
      setCurrentIdx(currentIdx + 1);
      setIsFlipped(false);
    } else {
      setIsStudyMode(false);
      alert("Study session finished! Good job.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
             <Layers className="text-indigo-600" /> Mastery Decks
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Master concepts using Spaced Repetition.</p>
        </div>
        {!isStudyMode && (
          <button 
            onClick={() => {
              setCurrentIdx(0);
              setIsStudyMode(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Brain className="w-5 h-5" /> Start Daily Study
          </button>
        )}
      </header>

      {!isStudyMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm group hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                 <RotateCcw className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">12 Cards</span>
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Biology Basics</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Foundational concepts in cellular biology and anatomy.</p>
            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-600 h-full w-1/3"></div>
            </div>
          </div>
          
          <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all">
            <Plus className="w-10 h-10 mb-2" />
            <span className="font-bold">Create New Deck</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-8 w-full flex justify-between items-center text-sm font-bold text-slate-400">
             <span>Card {currentIdx + 1} of {cards.length}</span>
             <button onClick={() => setIsStudyMode(false)} className="hover:text-rose-500">Exit Study</button>
          </div>

          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer preserve-3d transition-transform duration-700"
            style={{ 
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'none'
            }}
          >
            {/* Front */}
            <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
               <h2 className="text-3xl font-bold dark:text-white leading-tight">{cards[currentIdx].front}</h2>
               <p className="absolute bottom-8 text-xs font-bold text-slate-300 uppercase tracking-widest">Click to reveal answer</p>
            </div>
            {/* Back */}
            <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-12 text-center backface-hidden" 
              style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' 
              }}
            >
               <h2 className="text-3xl font-bold text-white leading-tight">{cards[currentIdx].back}</h2>
               <p className="absolute bottom-8 text-xs font-bold text-white/50 uppercase tracking-widest">Answer revealed</p>
            </div>
          </div>

          <div className={`flex gap-6 mt-12 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <button 
              onClick={(e) => { e.stopPropagation(); handleRate('hard'); }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="p-5 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-3xl border border-rose-100 dark:border-rose-800 transition-all hover:scale-110 active:scale-95">
                <ThumbsDown className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-rose-500">Hard</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleRate('good'); }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="p-5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-3xl border border-indigo-100 dark:border-indigo-800 transition-all hover:scale-110 active:scale-95">
                <Meh className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-500">Good</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); handleRate('easy'); }}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="p-5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-3xl border border-emerald-100 dark:border-emerald-800 transition-all hover:scale-110 active:scale-95">
                <ThumbsUp className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-500">Easy</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
