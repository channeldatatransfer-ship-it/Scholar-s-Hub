
import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  File as FileIcon, 
  Search, 
  Upload, 
  Grid, 
  List, 
  Cloud, 
  ExternalLink, 
  MoreVertical,
  Download,
  Eye,
  RefreshCw,
  X,
  FileText,
  // Fixed: Added Trash2 to the list of imports from lucide-react
  Trash2
} from 'lucide-react';
import { AppSettings } from '../types';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'folder';
  modified: string;
  url?: string;
}

const ResourceLibrary: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'local' | 'drive'>('local');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localFiles, setLocalFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('scholars_local_files');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Syllabus_Physics.pdf', size: '2.4 MB', type: 'pdf', modified: '2 days ago' },
      { id: '2', name: 'Calculus_Worksheet_1.pdf', size: '1.1 MB', type: 'pdf', modified: '5 days ago' },
      { id: '3', name: 'Past_Papers_2023', size: '-', type: 'folder', modified: '1 week ago' },
    ];
  });

  const driveFiles: FileItem[] = [
    { id: 'd1', name: 'Lecture_Notes_Unit1.pdf', size: '4.5 MB', type: 'pdf', modified: 'Yesterday' },
    { id: 'd2', name: 'Project_Assets', size: '-', type: 'folder', modified: '3 days ago' },
  ];

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewUrl(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
        alert("Please upload PDF files only.");
        return;
      }

      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: 'pdf',
        modified: 'Just now',
        url: URL.createObjectURL(file)
      };

      setLocalFiles(prev => [...prev, newFile]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Remove this file from your local library?")) {
      setLocalFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  const syncDrive = () => {
    if (!settings.gdriveKey || !settings.gdriveClientId) {
      alert("Please configure your Google Drive API Key and Client ID in Settings first.");
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("Successfully synced with Google Drive! (Mock)");
    }, 2000);
  };

  const files = activeTab === 'local' ? localFiles : driveFiles;

  const openPreview = (file: FileItem) => {
    if (file.type === 'folder') return;
    setPreviewUrl(file.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black dark:text-white tracking-tight">Resource Library</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Central hub for all your academic materials.</p>
        </div>
        <div className="flex gap-3 bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
           <button 
            onClick={() => setActiveTab('local')}
            className={`px-8 py-3 rounded-[2rem] text-sm font-black flex items-center gap-3 transition-all ${activeTab === 'local' ? 'text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            style={activeTab === 'local' ? { backgroundColor: settings.primaryColor } : {}}
           >
             <FileIcon className="w-5 h-5" /> Local Vault
           </button>
           <button 
            onClick={() => setActiveTab('drive')}
            className={`px-8 py-3 rounded-[2rem] text-sm font-black flex items-center gap-3 transition-all ${activeTab === 'drive' ? 'text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            style={activeTab === 'drive' ? { backgroundColor: settings.primaryColor } : {}}
           >
             <Cloud className="w-5 h-5" /> Google Cloud
           </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find a resource..." 
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl pl-14 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 dark:text-white"
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                 <button 
                  onClick={() => setView('grid')}
                  className={`p-3 rounded-xl transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400'}`}
                  style={view === 'grid' ? { color: settings.primaryColor } : {}}
                 >
                   <Grid className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={() => setView('list')}
                  className={`p-3 rounded-xl transition-all ${view === 'list' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md' : 'text-slate-400'}`}
                  style={view === 'list' ? { color: settings.primaryColor } : {}}
                 >
                   <List className="w-5 h-5" />
                 </button>
              </div>

              {activeTab === 'local' ? (
                <>
                  <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={handleFileUpload} />
                  <button 
                    onClick={handleUploadClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 shadow-xl transition-all active:scale-95"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <Upload className="w-5 h-5" /> Upload File
                  </button>
                </>
              ) : (
                <button 
                  onClick={syncDrive}
                  disabled={isSyncing}
                  className={`bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-8 py-4 rounded-[2rem] font-black flex items-center gap-3 transition-all active:scale-95 ${isSyncing ? 'animate-pulse' : ''}`}
                  style={{ color: settings.primaryColor, backgroundColor: `${settings.primaryColor}1A` }}
                >
                  <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} /> 
                  {isSyncing ? 'Syncing...' : 'Fetch Drive Contents'}
                </button>
              )}
           </div>
        </div>

        <div className="flex-1 p-8">
           {view === 'grid' ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {files.map(file => (
                  <div 
                    key={file.id} 
                    onClick={() => openPreview(file)}
                    className="group relative flex flex-col items-center text-center p-8 rounded-[2.5rem] border border-transparent hover:border-slate-50 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="mb-6 relative">
                       {file.type === 'folder' ? (
                         <Folder className="w-20 h-20 fill-current opacity-20" style={{ color: settings.primaryColor }} />
                       ) : (
                         <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                           <FileText className="w-10 h-10 text-slate-300" />
                         </div>
                       )}
                       {file.type !== 'folder' && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-indigo-600 p-3 rounded-full text-white shadow-2xl transform hover:scale-110 transition-transform" style={{ backgroundColor: settings.primaryColor }}>
                            <Eye className="w-5 h-5" />
                          </div>
                        </div>
                       )}
                    </div>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200 line-clamp-1 mb-1 tracking-tight">{file.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{file.size} • {file.modified}</p>
                    {activeTab === 'local' && (
                      <button 
                        onClick={(e) => deleteFile(e, file.id)}
                        className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="col-span-full py-32 text-center flex flex-col items-center">
                    <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-full mb-6">
                       <FileIcon className="w-16 h-16 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400">Your {activeTab} vault is empty.</h3>
                    <p className="text-slate-400 text-sm mt-2">Start by uploading some course materials.</p>
                  </div>
                )}
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800">
                      <th className="pb-6 px-6">Name</th>
                      <th className="pb-6 px-6">Size</th>
                      <th className="pb-6 px-6">Modified</th>
                      <th className="pb-6 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {files.map(file => (
                      <tr 
                        key={file.id} 
                        onClick={() => openPreview(file)}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                      >
                        <td className="py-6 px-6">
                          <div className="flex items-center gap-4">
                            {file.type === 'folder' ? <Folder className="w-6 h-6" style={{ color: settings.primaryColor }} /> : <FileText className="w-6 h-6 text-slate-300" />}
                            <span className="font-bold text-slate-700 dark:text-slate-200">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-6 px-6 text-sm font-bold text-slate-400">{file.size}</td>
                        <td className="py-6 px-6 text-sm font-bold text-slate-400">{file.modified}</td>
                        <td className="py-6 px-6">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all" style={{ color: settings.primaryColor }}>
                                <Eye className="w-4 h-4" />
                             </button>
                             <button className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-400 hover:text-indigo-600 transition-all">
                                <Download className="w-4 h-4" />
                             </button>
                             {activeTab === 'local' && (
                               <button onClick={(e) => deleteFile(e, file.id)} className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-rose-400 hover:text-rose-600 transition-all">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           )}
        </div>
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10">
           <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setPreviewUrl(null)} />
           <div className="relative bg-white dark:bg-slate-900 w-full h-full rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl" style={{ color: settings.primaryColor }}>
                       <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-xl dark:text-white">Document View</h3>
                 </div>
                 <button onClick={() => setPreviewUrl(null)} className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold text-slate-500 hover:text-rose-500 transition-all">
                   Close <X className="w-5 h-5" />
                 </button>
              </div>
              <div className="flex-1 bg-slate-50 dark:bg-slate-950">
                <iframe src={previewUrl} className="w-full h-full border-none" title="PDF Preview" />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;
