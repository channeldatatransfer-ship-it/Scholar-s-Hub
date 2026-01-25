
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  File as FileIcon, 
  Search, 
  Upload, 
  Grid, 
  List, 
  Cloud, 
  Eye, 
  X, 
  FileText, 
  Trash2, 
  AlertTriangle, 
  BookMarked,
  Download
} from 'lucide-react';
import { AppSettings } from '../types';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'folder' | 'nctb';
  modified: string;
  url?: string;
}

const ResourceLibrary: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'local' | 'nctb' | 'drive'>('local');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localFiles, setLocalFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('scholars_local_files');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'SSC_Physics_Solution.pdf', size: '2.4 MB', type: 'pdf', modified: '2 days ago' },
      { id: '2', name: 'Chemistry_Practical_Note.pdf', size: '1.1 MB', type: 'pdf', modified: '5 days ago' },
    ];
  });

  const nctbFiles: FileItem[] = [
    { id: 'n1', name: 'Physics (Class 9-10)', size: '12 MB', type: 'nctb', modified: 'Official', url: 'https://nctb.portal.gov.bd/sites/default/files/files/nctb.portal.gov.bd/ebook/01871212_9875_40f3_8182_7f168a2d348a/Physics_9-10_English.pdf' },
    { id: 'n2', name: 'Chemistry (Class 9-10)', size: '10 MB', type: 'nctb', modified: 'Official', url: 'https://nctb.portal.gov.bd/sites/default/files/files/nctb.portal.gov.bd/ebook/01871212_9875_40f3_8182_7f168a2d348a/Chemistry_9-10_English.pdf' },
    { id: 'n3', name: 'Higher Math (Class 9-10)', size: '15 MB', type: 'nctb', modified: 'Official', url: 'https://nctb.portal.gov.bd/sites/default/files/files/nctb.portal.gov.bd/ebook/01871212_9875_40f3_8182_7f168a2d348a/Higher_Math_9-10_English.pdf' },
  ];

  const driveFiles: FileItem[] = [
    { id: 'd1', name: 'Lecture_Notes_Unit1.pdf', size: '4.5 MB', type: 'pdf', modified: 'Yesterday' },
  ];

  useEffect(() => {
    localStorage.setItem('scholars_local_files', JSON.stringify(localFiles));
  }, [localFiles]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert(settings.language === 'BN' ? "শুধুমাত্র PDF ফাইল আপলোড করুন।" : "Please upload PDF files only.");
        return;
      }
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'pdf',
        modified: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        url: URL.createObjectURL(file)
      };
      setLocalFiles(prev => [...prev, newFile]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setLocalFiles(prev => prev.filter(f => f.id !== fileToDelete.id));
      setFileToDelete(null);
    }
  };

  const getFiles = () => {
    if (activeTab === 'local') return localFiles;
    if (activeTab === 'nctb') return nctbFiles;
    return driveFiles;
  };

  const openPreview = (file: FileItem) => {
    if (file.type === 'folder') return;
    setPreviewUrl(file.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black dark:text-white tracking-tight">
            {settings.language === 'BN' ? 'রিসোর্স লাইব্রেরি' : 'Resource Library'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Central hub for textbooks and notes.</p>
        </div>
        <div className="flex gap-3 bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
           <button onClick={() => setActiveTab('local')} className={`px-6 py-3 rounded-[2rem] text-sm font-black flex items-center gap-3 transition-all whitespace-nowrap ${activeTab === 'local' ? 'text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`} style={activeTab === 'local' ? { backgroundColor: settings.primaryColor } : {}}>
             <FileIcon className="w-5 h-5" /> Local Vault
           </button>
           <button onClick={() => setActiveTab('nctb')} className={`px-6 py-3 rounded-[2rem] text-sm font-black flex items-center gap-3 transition-all whitespace-nowrap ${activeTab === 'nctb' ? 'text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`} style={activeTab === 'nctb' ? { backgroundColor: settings.primaryColor } : {}}>
             <BookMarked className="w-5 h-5" /> NCTB Textbooks
           </button>
           <button onClick={() => setActiveTab('drive')} className={`px-6 py-3 rounded-[2rem] text-sm font-black flex items-center gap-3 transition-all whitespace-nowrap ${activeTab === 'drive' ? 'text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`} style={activeTab === 'drive' ? { backgroundColor: settings.primaryColor } : {}}>
             <Cloud className="w-5 h-5" /> Cloud Drive
           </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder={settings.language === 'BN' ? 'রিসোর্স খুঁজুন...' : 'Search resources...'} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl pl-14 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white" />
           </div>
           <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                 <button onClick={() => setView('grid')} className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400'}`} style={view === 'grid' ? { color: settings.primaryColor } : {}}><Grid className="w-5 h-5" /></button>
                 <button onClick={() => setView('list')} className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400'}`} style={view === 'list' ? { color: settings.primaryColor } : {}}><List className="w-5 h-5" /></button>
              </div>
              {activeTab === 'local' && (
                <>
                  <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                  <button onClick={handleUploadClick} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 shadow-xl transition-all active:scale-95" style={{ backgroundColor: settings.primaryColor }}><Upload className="w-5 h-5" /> {settings.language === 'BN' ? 'ফাইল আপলোড' : 'Upload File'}</button>
                </>
              )}
           </div>
        </div>

        <div className="flex-1 p-8">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {getFiles().map(file => (
                <div key={file.id} onClick={() => openPreview(file)} className="group relative flex flex-col items-center text-center p-8 rounded-[2.5rem] border border-transparent hover:border-slate-50 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer overflow-hidden">
                  <div className="mb-6 relative">
                     {file.type === 'nctb' ? (
                       <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform"><BookMarked className="w-10 h-10 text-emerald-600" /></div>
                     ) : (
                       <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform"><FileText className="w-10 h-10 text-slate-300" /></div>
                     )}
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <div className="bg-indigo-600 p-3 rounded-full text-white shadow-2xl transform hover:scale-110 transition-transform" style={{ backgroundColor: settings.primaryColor }} title="Preview"><Eye className="w-5 h-5" /></div>
                        {activeTab === 'local' && (
                          <button onClick={(e) => { e.stopPropagation(); setFileToDelete(file); }} className="bg-rose-500 p-3 rounded-full text-white shadow-2xl transform hover:scale-110 transition-transform" title="Delete"><Trash2 className="w-5 h-5" /></button>
                        )}
                      </div>
                  </div>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-1 mb-1 tracking-tight">{file.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{file.size} • {file.modified}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {fileToDelete && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
            <motion.div {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setFileToDelete(null)} />
            <motion.div {...({ initial: { opacity: 0, scale: 0.9, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.9, y: 20 } } as any)} className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6"><AlertTriangle className="w-10 h-10 text-rose-500" /></div>
                <h3 className="text-2xl font-black dark:text-white mb-2">{settings.language === 'BN' ? 'রিসোর্স মুছে ফেলবেন?' : 'Delete Resource?'}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{settings.language === 'BN' ? `আপনি কি নিশ্চিত যে আপনি "${fileToDelete.name}" মুছতে চান? এটি পুনরুদ্ধার করা যাবে না।` : `Are you sure you want to remove "${fileToDelete.name}"? This action cannot be undone.`}</p>
                <div className="flex gap-4 w-full">
                  <button onClick={() => setFileToDelete(null)} className="flex-1 py-4 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">{settings.language === 'BN' ? 'বাতিল' : 'Cancel'}</button>
                  <button onClick={confirmDelete} className="flex-1 py-4 font-bold text-white bg-rose-500 rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95">{settings.language === 'BN' ? 'মুছে ফেলুন' : 'Delete File'}</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewUrl && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10">
            <motion.div {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setPreviewUrl(null)} />
            <motion.div {...({ initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } } as any)} className="relative bg-white dark:bg-slate-900 w-full h-full rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl" style={{ color: settings.primaryColor }}><FileText className="w-6 h-6" /></div>
                      <h3 className="font-black text-xl dark:text-white">Document View</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={previewUrl} download className="flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl font-bold transition-all hover:bg-emerald-100"><Download className="w-5 h-5" /> {settings.language === 'BN' ? 'ডাউনলোড' : 'Download'}</a>
                    <button onClick={() => setPreviewUrl(null)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-500 hover:text-rose-500 transition-all">{settings.language === 'BN' ? 'বন্ধ করুন' : 'Close'} <X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-950">
                  <iframe src={previewUrl} className="w-full h-full border-none" title="PDF Preview" />
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceLibrary;
