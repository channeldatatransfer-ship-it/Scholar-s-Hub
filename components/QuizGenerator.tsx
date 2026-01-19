
import React, { useState } from 'react';
import { BrainCircuit, Upload, Sparkles, AlertCircle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { generateQuizFromContent } from '../services/geminiService';
import { AppSettings } from '../types';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizGenerator: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!content.trim() || !settings.geminiKey) return;
    setLoading(true);
    try {
      const data = await generateQuizFromContent(settings.geminiKey, content);
      setQuiz(data);
      setCurrentIdx(0);
      setScore(0);
      setShowResult(false);
    } catch (err) {
      alert("Error generating quiz. Check your API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === quiz![currentIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < quiz!.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-8 dark:text-white flex items-center gap-3">
        <BrainCircuit className="text-indigo-600 w-8 h-8" /> Quiz Generator
      </h1>

      {!quiz ? (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          {!settings.geminiKey && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">Add your Gemini API Key in Settings to use this feature.</p>
            </div>
          )}
          <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Paste Course Material / Syllabus</label>
          <textarea 
            className="w-full h-64 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-6 focus:ring-2 focus:ring-indigo-500/20 mb-6 dark:text-white"
            placeholder="Paste text here to generate a custom quiz..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex items-center gap-4">
             <button 
              onClick={handleGenerate}
              disabled={loading || !content.trim() || !settings.geminiKey}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
             >
               {loading ? <Sparkles className="animate-spin" /> : <Sparkles />}
               {loading ? 'Generating...' : 'Generate AI Quiz'}
             </button>
             <button className="p-4 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-indigo-600 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all">
                <Upload />
             </button>
          </div>
        </div>
      ) : showResult ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xl text-center">
          <div className="mb-6 inline-flex p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
            <CheckCircle2 className="w-16 h-16 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2 dark:text-white">Quiz Completed!</h2>
          <p className="text-slate-500 mb-8">You scored {score} out of {quiz.length}</p>
          <div className="text-5xl font-black text-indigo-600 mb-10">{Math.round((score/quiz.length)*100)}%</div>
          <button 
            onClick={() => setQuiz(null)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-95"
          >
            Generate New Quiz
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentIdx + 1} of {quiz.length}</span>
            <div className="w-32 bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
               <div className="bg-indigo-600 h-full transition-all" style={{width: `${((currentIdx+1)/quiz.length)*100}%`}}></div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-8 dark:text-white leading-relaxed">{quiz[currentIdx].question}</h3>
          
          <div className="space-y-4 mb-8">
            {quiz[currentIdx].options.map((option, i) => {
              const isCorrect = i === quiz[currentIdx].correctAnswer;
              const isSelected = selectedAnswer === i;
              let appearance = 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30';
              if (selectedAnswer !== null) {
                if (isCorrect) appearance = 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-500';
                else if (isSelected) appearance = 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-500';
                else appearance = 'opacity-50 bg-slate-50 dark:bg-slate-900 text-slate-400';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className={`w-full text-left p-6 rounded-2xl border-2 border-transparent transition-all flex items-center justify-between font-medium ${appearance}`}
                >
                  <span>{option}</span>
                  {selectedAnswer !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                </button>
              );
            })}
          </div>

          <button 
            disabled={selectedAnswer === null}
            onClick={nextQuestion}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            {currentIdx + 1 === quiz.length ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
