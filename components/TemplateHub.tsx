
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
  Info,
  X,
  Target,
  Clock,
  ChevronRight,
  Star,
  ShieldCheck
} from 'lucide-react';
import { AppSettings, Syllabus } from '../types';
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
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Intensive';
  isOfficial?: boolean;
  contentPreview?: { subject: string; chapters: string[] }[];
  fullData?: any[]; // Full syllabus data to be injected
}

const HSC_2027_SCIENCE_DATA = [
  {
    subject: "বাংলা (১ম ও ২য় পত্র)",
    chapters: [
      { title: "সাহিত্য (গদ্য)", topics: ["অপরিচিতা", "বিলাসী", "গৃহ", "আহ্বান", "মহাজাগতিক কিউরেটর", "নেকলেস", "মানব-কল্যাণ", "মাসি-পিসি", "বায়ান্নর দিনগুলি", "রেইনকোট"] },
      { title: "সাহিত্য (কবিতা)", topics: ["বিভীষণের প্রতি মেঘনাদ", "সোনার তরী", "বিদ্রোহী", "প্রতিদান", "সুচেতনা", "তাহারেই পড়ে মনে", "আঠারো বছর বয়স"] },
      { title: "ব্যাকরণ ও নির্মিতি", topics: ["উচ্চারণের নিয়ম", "বানানের নিয়ম", "ব্যাকরণিক শব্দশ্রেণি", "শব্দ গঠন", "বাক্যতত্ত্ব"] }
    ]
  },
  {
    subject: "ইংরেজি (১ম ও ২য় পত্র)",
    chapters: [
      { title: "Textbook Units", topics: ["Institutions Making History", "Dreams", "Lifestyle", "Adolescence", "Human Rights"] },
      { title: "Grammar & Composition", topics: ["Prepositions", "Right Form of Verbs", "Narration", "Modifiers", "Sentence Connectors"] }
    ]
  },
  {
    subject: "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
    chapters: [
      { title: "অধ্যায় ১-৩", topics: ["বিশ্ব ও বাংলাদেশ প্রেক্ষিত", "কমিউনিকেশন সিস্টেমস", "সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস"] },
      { title: "অধ্যায় ৪-৬", topics: ["ওয়েব ডিজাইন ও HTML", "C Programming", "ডেটাবেজ ম্যানেজমেন্ট"] }
    ]
  },
  {
    subject: "পদার্থবিজ্ঞান (১ম ও ২য় পত্র)",
    chapters: [
      { title: "১ম পত্র", topics: ["ভেক্টর", "গতিবিদ্যা", "নিউটনীয় বলবিদ্যা", "কাজ, শক্তি ও ক্ষমতা", "মহাকর্ষ ও অভিকর্ষ", "পর্যাবৃত্ত গতি"] },
      { title: "২য় পত্র", topics: ["তাপগতিবিদ্যা", "স্থির তড়িৎ", "চল তড়িৎ", "জ্যামিতিক আলোকবিজ্ঞান", "আধুনিক পদার্থবিজ্ঞান", "সেমিকন্ডাক্টর"] }
    ]
  },
  {
    subject: "রসায়ন (১ম ও ২য় পত্র)",
    chapters: [
      { title: "১ম পত্র", topics: ["ল্যাবরেটরির নিরাপদ ব্যবহার", "গুণগত রসায়ন", "মৌলের পর্যায়বৃত্ত ধর্ম", "রাসায়নিক পরিবর্তন"] },
      { title: "২য় পত্র", topics: ["পরিবেশ রসায়ন", "জৈব রসায়ন", "পরিমাণগত রসায়ন", "তড়িৎ রসায়ন"] }
    ]
  },
  {
    subject: "উচ্চতর গণিত (১ম ও ২য় পত্র)",
    chapters: [
      { title: "১ম পত্র", topics: ["ম্যাট্রিক্স ও নির্ণায়ক", "সরলরেখা", "বৃত্ত", "বিন্যাস ও সমাবেশ", "ত্রিকোণমিতি", "অন্তরীকরণ", "যোগজীকরণ"] },
      { title: "২য় পত্র", topics: ["জটিল সংখ্যা", "বহুপদী", "কণিক", "বিপরীত ত্রিকোণমিতিক ফাংশন", "স্থিতিবিদ্যা", "গতিবিদ্যা", "সম্ভাবনা"] }
    ]
  },
  {
    subject: "জীববিজ্ঞান (১ম ও ২য় পত্র)",
    chapters: [
      { title: "উদ্ভিদবিজ্ঞান", topics: ["কোষ ও এর গঠন", "কোষ বিভাজন", "অনুজীব", "শৈবাল ও ছত্রাক", "টিস্যু ও টিস্যুতন্ত্র", "উদ্ভিদ শরীরতত্ত্ব"] },
      { title: "প্রাণিবিজ্ঞান", topics: ["প্রাণীর বিভিন্নতা", "পরিপাক ও শোষণ", "রক্ত ও সঞ্চালন", "শ্বসন", "চলন", "জিনতত্ত্ব ও বিবর্তন"] }
    ]
  }
];

const PRESET_TEMPLATES: TemplateBlueprint[] = [
  { 
    id: 'hsc-2027-official', 
    title: 'HSC 2027 Science (Official)', 
    category: 'HSC', 
    description: 'এইচএসসি ২০২৭ (বিজ্ঞান বিভাগ) এর জন্য পূর্ণাঙ্গ এনসিটিবি সিলেবাস। এতে বাংলা, ইংরেজি, আইসিটি, পদার্থ, রসায়ন, উচ্চতর গণিত এবং জীববিজ্ঞান অন্তর্ভুক্ত।', 
    icon: GraduationCap, 
    color: 'bg-indigo-700', 
    subjectsCount: 13, 
    duration: '২ বছর',
    difficulty: 'Hard',
    isOfficial: true,
    contentPreview: [
      { subject: 'পদার্থবিজ্ঞান', chapters: ['ভেক্টর', 'গতিবিদ্যা', 'তাপগতিবিদ্যা'] },
      { subject: 'রসায়ন', chapters: ['গুণগত রসায়ন', 'জৈব রসায়ন'] },
      { subject: 'উচ্চতর গণিত', chapters: ['ক্যালকুলাস', 'কণিক', 'ম্যাট্রিক্স'] }
    ],
    fullData: HSC_2027_SCIENCE_DATA
  },
  { 
    id: 'med-prep', 
    title: 'মেডিকেল অ্যাডমিশন স্প্রিন্ট', 
    category: 'Admission', 
    description: 'মেডিকেল প্রত্যাশীদের জন্য ৬০ দিনের নিবিড় রোডম্যাপ। জীববিজ্ঞান, রসায়ন এবং সাধারণ জ্ঞানের ওপর বিশেষ গুরুত্ব।', 
    icon: Stethoscope, 
    color: 'bg-rose-600', 
    subjectsCount: 4, 
    duration: '৬০ দিন',
    difficulty: 'Intensive',
    contentPreview: [
      { subject: 'জীববিজ্ঞান', chapters: ['কোষ রসায়ন', 'মানব শারীরতত্ত্ব'] }
    ]
  },
  { 
    id: 'eng-prep', 
    title: 'ইঞ্জিনিয়ারিং কোর (BUET)', 
    category: 'Admission', 
    description: 'বুয়েট এবং অন্যান্য ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার জন্য অ্যাডভান্সড প্রবলেম সলভিং ফ্রেমওয়ার্ক।', 
    icon: Cpu, 
    color: 'bg-emerald-600', 
    subjectsCount: 3, 
    duration: '৯০ দিন',
    difficulty: 'Intensive'
  }
];

const TemplateHub: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateBlueprint | null>(null);
  const [applyStep, setApplyStep] = useState(0);

  const applyBlueprint = async (template: TemplateBlueprint) => {
    setIsApplying(template.id);
    setApplyStep(1); // Analyzing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Process Data
    const existing = JSON.parse(localStorage.getItem('scholars_syllabuses_v2') || '[]');
    let newSyllabuses: Syllabus[] = [];

    if (template.fullData) {
      newSyllabuses = template.fullData.map((s, idx) => ({
        id: `blueprint-${Date.now()}-${idx}`,
        subject: s.subject,
        color: 'indigo',
        chapters: s.chapters.map((c: any, cIdx: number) => ({
          id: `bp-ch-${Date.now()}-${cIdx}`,
          title: c.title,
          topics: c.topics.map((t: string, tIdx: number) => ({
            id: `bp-tp-${Date.now()}-${tIdx}`,
            title: t,
            completed: false
          }))
        }))
      }));
    }

    setApplyStep(2); // Injecting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('scholars_syllabuses_v2', JSON.stringify([...existing, ...newSyllabuses]));
    window.dispatchEvent(new Event('syllabusUpdate'));

    setApplyStep(3); // Finalizing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    alert(isBN ? `"${template.title}" সফলভাবে যুক্ত করা হয়েছে!` : `Template "${template.title}" applied!`);
    
    setIsApplying(null);
    setSelectedTemplate(null);
    setApplyStep(0);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateTemplateFromAi(aiPrompt);
      if (result && result.subjects) {
        const msg = isBN 
          ? `AI আপনার জন্য "${result.title}" তৈরি করেছে! এটি আপনার সিলেবাসে যুক্ত করতে চান?` 
          : `AI designed "${result.title}"! Add it?`;
        
        if (confirm(msg)) {
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
          window.dispatchEvent(new Event('syllabusUpdate'));
          alert(isBN ? "সফলভাবে যুক্ত হয়েছে!" : "Success!");
          setAiPrompt('');
        }
      }
    } catch (e) {
      alert("AI failed. Try again.");
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
            {isBN ? 'ব্লুপ্রিন্ট হাব' : 'Blueprint Hub'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            {isBN ? 'সেরা ছাত্র-ছাত্রীদের স্টাডি সিস্টেম এখন আপনার হাতের নাগালে।' : 'Download study systems instantly.'}
          </p>
        </div>
      </header>

      {/* Magical AI Generator */}
      <section className="relative p-1 rounded-[4rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/20 overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative bg-white dark:bg-slate-900 rounded-[3.8rem] p-12 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/3">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/50 rounded-[2.5rem] flex items-center justify-center mb-8 text-indigo-600 shadow-inner">
               <Zap size={48} className="animate-pulse" />
            </div>
            <h2 className="text-4xl font-black dark:text-white mb-6 leading-tight">
              {isBN ? 'এআই ম্যাজিক ব্লুপ্রিন্ট' : 'AI Magic Blueprint'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              {isBN ? 'আপনার লক্ষ্য বলুন, এআই আপনার জন্য একটি কাস্টম স্টাডি সিস্টেম তৈরি করে দিবে।' : 'Describe your goal, AI handles the rest.'}
            </p>
          </div>
          <div className="lg:w-2/3 w-full space-y-6">
            <div className="relative">
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-[2.5rem] p-10 text-xl font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white resize-none h-48 shadow-inner"
                placeholder={isBN ? "যেমন: 'অর্গানিক কেমিস্ট্রির জন্য ৩০ দিনের মাস্টার প্ল্যান'..." : "e.g. '30-day Organic Chemistry plan'..."}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <button 
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiPrompt.trim()}
                className={`absolute bottom-8 right-8 px-12 py-6 rounded-[2.2rem] text-white font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center gap-4 ${isGenerating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105 hover:shadow-indigo-500/40'}`}
                style={{ backgroundColor: settings.primaryColor }}
              >
                {isGenerating ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                {isGenerating ? (isBN ? 'ম্যাজিক চলছে...' : 'Brewing...') : (isBN ? 'জেনারেট করুন' : 'Generate')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence>
          {filtered.map(template => (
            <motion.div
              layout
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setSelectedTemplate(template)}
              className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden cursor-pointer active:scale-[0.98]"
            >
              {template.isOfficial && (
                <div className="absolute top-8 left-8 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 z-10 shadow-lg">
                  <ShieldCheck size={12} /> Official
                </div>
              )}
              <h3 className="text-3xl font-black dark:text-white mb-4 leading-tight">{template.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-8">{template.description}</p>
              <div className="mt-auto flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest" style={{ color: settings.primaryColor }}>
                {isBN ? 'বিস্তারিত দেখুন' : 'View Details'} <ArrowRight size={16} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedTemplate && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => !isApplying && setSelectedTemplate(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-[4rem] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-10 border-b dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-4xl font-black dark:text-white">{selectedTemplate.title}</h2>
                <button onClick={() => setSelectedTemplate(null)} className="p-3 bg-slate-100 rounded-2xl"><X /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <p className="text-xl text-slate-500 leading-relaxed">{selectedTemplate.description}</p>
                {selectedTemplate.contentPreview && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Syllabus Highlights</h3>
                    {selectedTemplate.contentPreview.map((item, i) => (
                      <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                        <h4 className="font-black text-lg mb-2">{item.subject}</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.chapters.map((ch, idx) => <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-xs font-bold">{ch}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  onClick={() => applyBlueprint(selectedTemplate)}
                  disabled={!!isApplying}
                  className="w-full py-6 rounded-[2rem] font-black text-white text-xl shadow-2xl transition-all"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  {isApplying ? (isBN ? 'প্রক্রিয়াধীন...' : 'Applying...') : (isBN ? 'সিস্টেমটি প্রয়োগ করুন' : 'Apply Blueprint')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateHub;
