
import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  File, 
  Search, 
  Upload, 
  Grid, 
  List, 
  Cloud, 
  ExternalLink, 
  MoreVertical,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'folder';
  modified: string;
  url?: string;
}

const ResourceLibrary: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'local' | 'drive'>('local');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
      // Reset input so the same file can be uploaded again if deleted
      e.target.value = '';
    }
  };

  const deleteFile = (id: string) => {
    setLocalFiles(prev => prev.filter(f => f.id !== id));
  };

  const files = activeTab === 'local' ? localFiles : driveFiles;

  const openPreview = (file: FileItem) => {
    if (file.type === 'folder') return;
    // Use the file's blob URL if it exists (for newly uploaded), 
    // otherwise use the dummy PDF for persistent session simulation
    setPreviewUrl(file.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Resource Library</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your study materials and cloud syncs.</p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
           <button 
            onClick={() => setActiveTab('local')}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'local' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
           >
             <File className="w-4 h-4" /> Local Files
           </button>
           <button 
            onClick={() => setActiveTab('drive')}
            className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'drive' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
           >
             <Cloud className="w-4 h-4" /> Google Drive
           </button>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search files..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 dark:text-white"
              />
           </div>
           <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                 <button 
                  onClick={() => setView('grid')}
                  className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                 >
                   <Grid className="w-5 h-5" />
                 </button>
                 <button 
                  onClick={() => setView('list')}
                  className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                 >
                   <List className="w-5 h-5" />
                 </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="application/pdf" 
                onChange={handleFileUpload}
              />
              <button 
                onClick={handleUploadClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Upload className="w-5 h-5" /> Upload PDF
              </button>
           </div>
        </div>

        <div className="p-6">
           {view === 'grid' ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {files.map(file => (
                  <div key={file.id} className="group relative flex flex-col items-center text-center p-6 rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all">
                    <div className="mb-4 relative">
                       {file.type === 'folder' ? (
                         <Folder className="w-16 h-16 text-indigo-400 fill-indigo-50" />
                       ) : (
                         <File className="w-16 h-16 text-slate-300" />
                       )}
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => openPreview(file)}
                           className="bg-indigo-600 p-2 rounded-full text-white shadow-lg"
                          >
                           <Eye className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1 mb-1">{file.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{file.size} • {file.modified}</p>
                    <button className="absolute top-4 right-4 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-slate-400 font-medium">No files found in this section.</p>
                  </div>
                )}
             </div>
           ) : (
             <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <th className="pb-4 px-4 font-bold">Name</th>
                      <th className="pb-4 px-4 font-bold">Size</th>
                      <th className="pb-4 px-4 font-bold">Modified</th>
                      <th className="pb-4 px-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {files.map(file => (
                      <tr key={file.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {file.type === 'folder' ? <Folder className="w-5 h-5 text-indigo-400" /> : <File className="w-5 h-5 text-slate-400" />}
                            <span className="font-medium text-slate-700 dark:text-slate-200">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-400">{file.size}</td>
                        <td className="py-4 px-4 text-sm text-slate-400">{file.modified}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                                onClick={() => openPreview(file)}
                                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                             <button className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
                             {activeTab === 'local' && (
                               <button 
                                onClick={() => deleteFile(file.id)}
                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg text-rose-400"
                               >
                                 <MoreVertical className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               {files.length === 0 && (
                 <div className="py-20 text-center">
                   <p className="text-slate-400 font-medium">No files found in this section.</p>
                 </div>
               )}
             </div>
           )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-800 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                 <h3 className="font-bold text-lg dark:text-white">Document Preview</h3>
                 <button 
                  onClick={() => setPreviewUrl(null)}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                 >
                   <ChevronRight className="rotate-90" />
                 </button>
              </div>
              <iframe 
                src={previewUrl} 
                className="flex-1 w-full border-none"
                title="PDF Preview"
              />
           </div>
        </div>
      )}
    </div>
  );
};

export default ResourceLibrary;
