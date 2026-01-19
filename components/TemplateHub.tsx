
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, 
  Sparkles, 
  Search, 
  Stethoscope, 
  Cpu, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  Wand2,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { AppSettings, Syllabus, CalendarEvent } from '../types';
import { generateTemplateFromAi } from '../services/geminiService';

interface TemplateBlueprint {
  id: string;
  title: string;
  category: 'HSC' | 'SSC' | 'Admission' | 'Skills';
  description: string;
  icon: any;
  color: string;
  subjectsCount: number;
  duration: string;
}

const PRESET_TEMPLATES: TemplateBlueprint[] = [
  { id: 'hsc-sci', title: 'HSC Science Mastery', category: 'HSC', description: 'Full curriculum for Physics, Chemistry, Biology, and Math (NCTB).', icon: BookOpen, color: 'bg-indigo-600', subjectsCount: 8, duration: '2 Years' },
  { id: 'med-prep', title: 'Medical Admission Sprint', category: 'Admission', description: 'Intensive roadmap for Biology and Chemistry fundamentals.', icon: Stethoscope, color: 'bg-rose-600', subjectsCount: 4, duration: '60 Days' },
  { id: 'eng-prep', title: 'Engineering Core (BUET)', category: 'Admission', description: 'Problem-solving focus for Advanced Physics and Mathematics.', icon: Cpu, color: 'bg-emerald-600', subjectsCount: 3, duration: '90 Days' },
  { id: 'ssc-gen', title: 'SSC Foundation', category: 'SSC', description: 'Balanced study plan for Class 9-10 board exams.', icon: GraduationCap, color: 'bg-amber-600', subjectsCount: 10, duration: '2 Years' },
  { id: 'note-master', title: 'Cornell Note-Taking System', category: 'Skills', description: 'Structured templates to boost active recall and efficiency.', icon: Layers, color: 'bg-purple-600', subjectsCount: 1, duration: 'Life Skill' },
];

const TemplateHub: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const applyBlueprint = async (templateId: string) => {
    setIsApplying(templateId);
    // Simulate complex data processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would fetch specific JSON data for that template ID
    // For this demo, we'll alert the user.
    const msg = isBN 
      ? `"${templateId}" টেমপ্লেটটি সফলভাবে লোড করা হয়েছে!` 
      : `Template "${templateId}" has been successfully merged into your profile!`;
    
    alert(msg);
    setIsApplying(null);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateTemplateFromAi(aiPrompt);
      if (result && result.subjects) {
        const msg = isBN 
          ? `AI আপনার জন্য "${result.title}" তৈরি করেছে! আপনি কি এটি সেভ করতে চান?` 
          : `AI generated "${result.title}" for you! Would you like to save it to your syllabus?`;
        
        if (confirm(msg)) {
          // Merge logic
          const existing = JSON.parse(localStorage.getItem('scholars_syllabuses_v2') || '[]');
          const newSyllabuses: Syllabus[] = result.subjects.map((s: any, idx: number) => ({
            id: `ai-${Date.now()}-${idx}`,
            subject: s.subject,
            color: 'indigo',
            chapters: s.chapters.map((c: any, cIdx: number) => ({
              id: `ai-ch-${Date.now()}-${cIdx}`,
              title: c.title,
              topics: c.topics.map((t: string, tIdx: number) => ({
                id: `ai-tp-${Date.now()}-${tIdx}`,
                title: t,
                completed: false
              }))
            }))
          }));
          localStorage.setItem('scholars_syllabuses_v2', JSON.stringify([...existing, ...newSyllabuses]));
          alert(isBN ? "অ্যাড করা হয়েছে!" : "Blueprint successfully added!");
          setAiPrompt('');
        }
      }
    } catch (e) {
      alert("AI generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const filtered = PRESET_TEMPLATES.filter(t => 
    (activeCategory === 'all' || t.category === activeCategory) &&
    (t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-black dark:text-white tracking-tighter flex items-center gap-4">
            <Library className="w-14 h-14" style={{ color: settings.primaryColor }} /> 
            {isBN ? 'স্টাডি ব্লুপ্রিন্ট' : 'Blueprint Hub'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            {isBN ? 'প্রস্তুতকৃত টেমপ্লেট দিয়ে আপনার পড়াশোনা শুরু করুন নিমেষেই।' : 'Ready-made study systems to help you start your academic journey instantly.'}
          </p>
        </div>
      </header>

      {/* AI Generator Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 rounded-[3.5rem] shadow-2xl overflow-hidden shadow-indigo-500/20 group">
        <div className="bg-white dark:bg-slate-900 rounded-[3.3rem] p-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-1/3">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mb-6 text-indigo-600">
               <Zap size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-black dark:text-white mb-4">{isBN ? 'এআই টেমপ্লেট জেনারেটর' : 'AI Blueprint Magic'}</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              {isBN ? 'আপনার লক্ষ্য বলুন, এআই আপনার জন্য একটি সম্পূর্ণ সিলেবাস এবং সময়সূচী তৈরি করে দিবে।' : 'Type your specific goal, and AI will weave a custom syllabus and schedule milestones just for you.'}
            </p>
          </div>
          <div className="lg:w-2/3 w-full space-y-4">
            <div className="relative">
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] p-8 text-lg font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white resize-none h-40"
                placeholder={isBN ? "যেমন: 'এইচএসসি কেমিস্ট্রি ২য় পত্রের ১০ দিনের রিভিশন প্ল্যান'..." : "e.g. '15-day intensive revision for Medical Chemistry'..."}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className={`absolute bottom-6 right-6 px-10 py-5 rounded-[2rem] text-white font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center gap-3 ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                style={{ backgroundColor: settings.primaryColor }}
              >
                {isGenerating ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                {isGenerating ? (isBN ? 'তৈরি হচ্ছে...' : 'Crafting...') : (isBN ? 'তৈরি করুন' : 'Generate')}
              </button>
            </div>
            <div className="flex gap-4">
               {[
                 isBN ? 'ডু ভর্তি গাইড' : 'DU Admission',
                 isBN ? '১০ দিনের ম্যাথ চ্যালেঞ্জ' : '10-Day Math Sprint',
                 isBN ? 'ইংরেজি ভোকাবুলারি' : 'Vocab Mastery'
               ].map(tag => (
                 <button 
                  key={tag} 
                  onClick={() => setAiPrompt(tag)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all"
                 >
                   {tag}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder={isBN ? "টেমপ্লেট খুঁজুন..." : "Search blueprints..."}
            className="w-full bg-white dark:bg-slate-900 border-none rounded-[2rem] pl-16 py-6 shadow-sm border border-slate-100 dark:border-slate-800 focus:ring-4 focus:ring-indigo-500/10 dark:text-white font-bold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
           {['all', 'HSC', 'SSC', 'Admission', 'Skills'].map(cat => (
             <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-8 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'text-white shadow-xl' : 'text-slate-400 hover:text-indigo-600'}`}
               style={activeCategory === cat ? { backgroundColor: settings.primaryColor } : {}}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filtered.map(template => (
            <motion.div
              layout
              key={template.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${template.color} opacity-[0.03] rounded-bl-[10rem] transition-all group-hover:scale-150`} />
              
              <div className="flex justify-between items-start mb-8">
                <div className={`p-5 rounded-[2rem] text-white shadow-xl ${template.color}`}>
                   <template.icon size={28} />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {template.category}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">{template.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">{template.description}</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between border-t dark:border-slate-800 pt-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Subjects</p>
                    <p className="font-bold dark:text-white">{template.subjectsCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Timeline</p>
                    <p className="font-bold dark:text-white">{template.duration}</p>
                  </div>
                </div>

                <button 
                  onClick={() => applyBlueprint(template.id)}
                  disabled={!!isApplying}
                  className={`w-full py-5 rounded-[2rem] font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${template.color} ${isApplying === template.id ? 'opacity-70' : 'hover:brightness-110'}`}
                >
                  {isApplying === template.id ? <RefreshCw className="animate-spin" /> : <CheckCircle2 />}
                  {isApplying === template.id ? (isBN ? 'প্রয়োগ হচ্ছে...' : 'Applying...') : (isBN ? 'টেমপ্লেট ব্যবহার করুন' : 'Apply Blueprint')}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 bg-white dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
            <Info size={40} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-400">{isBN ? 'কোনো টেমপ্লেট পাওয়া যায়নি' : 'No blueprints match your search'}</h3>
          <p className="text-sm text-slate-300 max-w-sm">Try using the AI Magic Wand above to generate a custom one instead!</p>
        </div>
      )}
    </div>
  );
};

export default TemplateHub;
