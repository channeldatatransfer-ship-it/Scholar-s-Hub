
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Terminal, 
  Play, 
  Pause,
  RefreshCw, 
  Globe, 
  Cpu, 
  Copy, 
  Trash2, 
  Sparkles,
  Maximize2,
  Info,
  Columns,
  Eye,
  Bug,
  AlertCircle,
  Zap,
  XCircle,
  Clock
} from 'lucide-react';
import { AppSettings } from '../types';
import { executeCCode } from '../services/geminiService';

interface LogEntry {
  type: 'log' | 'error' | 'system' | 'c-out';
  content: string;
  timestamp: string;
}

const ICT_PRESETS = {
  html: [
    { title: 'Board Table', code: '<html>\n<head>\n  <style>\n    table { width: 100%; border-collapse: collapse; }\n    th, td { border: 2px solid #333; padding: 10px; text-align: center; }\n  </style>\n</head>\n<body>\n  <table>\n    <tr>\n      <th colspan="2">Exam Schedule</th>\n    </tr>\n    <tr>\n      <td>ICT</td>\n      <td>10:00 AM</td>\n    </tr>\n  </table>\n  <script>\n    console.log("Table structure rendered successfully.");\n  </script>\n</body>\n</html>' },
    { title: 'JS Alert', code: '<html>\n<body>\n  <h2>JS Logic</h2>\n  <button onclick="calculate()">Test Logic</button>\n  \n  <script>\n    function calculate() {\n      const name = "Scholar";\n      console.log("Starting calculation for:", name);\n      const result = 5 * 10;\n      console.log("Result is:", result);\n      alert("Program Executed! Check Console for logs.");\n    }\n  </script>\n</body>\n</html>' }
  ],
  c: [
    { title: 'Sum of Series', code: '#include <stdio.h>\nint main() {\n  int n = 10, sum = 0;\n  for(int i=1; i<=n; i++) sum += i;\n  printf("Sum of first %d natural numbers is: %d", n, sum);\n  return 0;\n}' },
    { title: 'Prime Check', code: '#include <stdio.h>\nint main() {\n  int n = 17, flag = 0;\n  for(int i=2; i<=n/2; ++i) {\n    if(n%i == 0) { flag=1; break; }\n  }\n  if (flag == 0) printf("%d is a Prime number.", n);\n  else printf("%d is not a Prime number.", n);\n  return 0;\n}' }
  ]
};

const CodeRunner: React.FC<{ settings: AppSettings }> = ({ settings }) => {
  const isBN = settings.language === 'BN';
  const [mode, setMode] = useState<'html' | 'c'>('html');
  const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split');
  const [htmlOutputView, setHtmlOutputView] = useState<'browser' | 'console'>('browser');
  const [code, setCode] = useState(ICT_PRESETS.html[0].code);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [debugBorders, setDebugBorders] = useState(false);
  const [autoRun, setAutoRun] = useState(true);
  const [manualTrigger, setManualTrigger] = useState(0);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], content: string) => {
    const entry: LogEntry = {
      type,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLogs(prev => [...prev, entry]);
  };

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Function to perform the HTML update
  const updateHtmlPreview = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      const consoleProxyScript = `
        <script>
          (function() {
            const oldLog = console.log;
            const oldError = console.error;
            const oldWarn = console.warn;
            
            console.log = function(...args) {
              window.parent.postMessage({ type: 'log', content: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
              oldLog.apply(console, args);
            };
            console.error = function(...args) {
              window.parent.postMessage({ type: 'error', content: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
              oldError.apply(console, args);
            };
            console.warn = function(...args) {
              window.parent.postMessage({ type: 'log', content: '[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
              oldWarn.apply(console, args);
            };
            window.onerror = function(msg, url, line) {
              window.parent.postMessage({ type: 'error', content: 'Uncaught Error: ' + msg + ' (Line ' + line + ')' }, '*');
            };
          })();
        </script>
      `;
      
      const debugStyle = debugBorders ? `
        <style>
          * { outline: 1px dashed rgba(255,0,0,0.3) !important; }
          table, th, td { outline: 2px solid #6366f1 !important; }
        </style>
      ` : '';

      doc.open();
      doc.write(consoleProxyScript + debugStyle + code);
      doc.close();
    }
  };

  // Live HTML Preview Logic
  useEffect(() => {
    if (mode === 'html') {
      if (autoRun) {
        setIsSyncing(true);
        const timeout = setTimeout(() => {
          updateHtmlPreview();
          setIsSyncing(false);
        }, 400);
        return () => clearTimeout(timeout);
      }
    }
  }, [code, mode, debugBorders, autoRun, manualTrigger]);

  // Handle Messages from Iframe (Logs/Errors)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'log') {
        addLog('log', event.data.content);
      } else if (event.data.type === 'error') {
        addLog('error', event.data.content);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRunHtml = () => {
    if (mode !== 'html') return;
    setManualTrigger(prev => prev + 1);
    addLog('system', 'Re-running code manually...');
    updateHtmlPreview();
  };

  const handleRunC = async () => {
    if (mode !== 'c' || isRunning) return;
    setIsRunning(true);
    addLog('system', 'Compiling C source code...');
    try {
      const result = await executeCCode(code);
      addLog('c-out', result);
    } catch (e) {
      addLog('error', 'Execution Error: Backend simulator unavailable.');
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => setLogs([]);

  const jsLogsCount = logs.filter(l => l.type === 'log' || l.type === 'error').length;

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-4 animate-in fade-in duration-500 pb-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg" style={{ backgroundColor: settings.primaryColor }}>
            <Code2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black dark:text-white leading-none mb-1">
              {isBN ? 'আইসিটি কোড ল্যাব' : 'ICT Code Lab'}
            </h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Board Standard IDE</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <button 
              onClick={() => { setMode('html'); setCode(ICT_PRESETS.html[0].code); clearLogs(); setHtmlOutputView('browser'); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'html' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
              style={mode === 'html' ? { backgroundColor: settings.primaryColor } : {}}
            >
              <Globe size={14} /> HTML/JS
            </button>
            <button 
              onClick={() => { setMode('c'); setCode(ICT_PRESETS.c[0].code); clearLogs(); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === 'c' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
              style={mode === 'c' ? { backgroundColor: settings.primaryColor } : {}}
            >
              <Cpu size={14} /> C Programming
            </button>
          </div>

          <div className="hidden lg:flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
             <button onClick={() => setLayout('split')} className={`p-2 rounded-lg ${layout === 'split' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400'}`}><Columns size={16} /></button>
             <button onClick={() => setLayout('editor')} className={`p-2 rounded-lg ${layout === 'editor' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400'}`}><Maximize2 size={16} /></button>
             <button onClick={() => setLayout('preview')} className={`p-2 rounded-lg ${layout === 'preview' ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600' : 'text-slate-400'}`}><Eye size={16} /></button>
          </div>
        </div>
      </header>

      <div className={`flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden ${layout === 'preview' ? 'flex-row-reverse' : ''}`}>
        
        {/* EDITOR AREA */}
        <div className={`flex flex-col bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden transition-all duration-500 ${layout === 'editor' ? 'flex-1' : layout === 'preview' ? 'w-0 opacity-0' : 'flex-1'}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5">source.txt</span>
                {/* Fix: Cast motion props to any to avoid type errors in the environment */}
                {isSyncing && <motion.div {...({ animate: { opacity: [0, 1, 0] }, transition: { repeat: Infinity, duration: 1 } } as any)} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest"><RefreshCw size={10} className="animate-spin" /> Live Syncing</motion.div>}
             </div>
             <div className="flex items-center gap-1">
                <button onClick={() => setCode('')} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                <button onClick={() => { navigator.clipboard.writeText(code); setIsCopied(true); setTimeout(()=>setIsCopied(false), 2000); }} className="p-2 text-slate-400 hover:text-white transition-colors">{isCopied ? <Sparkles size={16} className="text-emerald-400" /> : <Copy size={16} />}</button>
             </div>
          </div>
          
          <div className="flex-1 relative">
            <textarea 
              spellCheck={false}
              className="absolute inset-0 w-full h-full bg-transparent p-8 font-mono text-indigo-100/90 resize-none focus:ring-0 border-none leading-relaxed text-sm selection:bg-indigo-500/30"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={mode === 'html' ? 'Write HTML/CSS/JS here...' : 'Write C code here...'}
            />
            <div className="absolute right-6 bottom-6 flex flex-col gap-2">
              {ICT_PRESETS[mode].map((p, i) => (
                <button key={i} onClick={() => setCode(p.code)} className="px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all shadow-xl">
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 border-t border-white/5 flex gap-3">
            {mode === 'html' && (
              <button 
                onClick={() => setAutoRun(!autoRun)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${autoRun ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800 text-slate-400 border border-white/5'}`}
              >
                {autoRun ? <RefreshCw size={14} className="animate-spin" /> : <Pause size={14} />}
                {autoRun ? 'Auto: ON' : 'Auto: OFF'}
              </button>
            )}
            <button 
              onClick={mode === 'html' ? handleRunHtml : handleRunC}
              disabled={isRunning || !code.trim()}
              className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center gap-3 shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
              style={{ backgroundColor: settings.primaryColor }}
            >
              {isRunning ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} fill="white" />}
              {isRunning ? (mode === 'c' ? 'Virtualizing Execution...' : 'Rendering...') : (mode === 'c' ? 'Run C Program' : 'Run Code')}
            </button>
          </div>
        </div>

        {/* PREVIEW/OUTPUT AREA */}
        <div className={`flex flex-col gap-4 transition-all duration-500 ${layout === 'editor' ? 'w-0 opacity-0' : 'flex-1'}`}>
          
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
             <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   {mode === 'html' ? (
                     <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                          onClick={() => setHtmlOutputView('browser')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${htmlOutputView === 'browser' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <Eye size={12} /> Browser
                        </button>
                        <button 
                          onClick={() => setHtmlOutputView('console')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${htmlOutputView === 'console' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          <Terminal size={12} /> Console {jsLogsCount > 0 && `(${jsLogsCount})`}
                        </button>
                     </div>
                   ) : (
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                         <Terminal size={14} />
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         Standard Output
                       </span>
                    </div>
                   )}
                </div>
                {mode === 'html' && htmlOutputView === 'browser' && (
                  <button 
                    onClick={() => setDebugBorders(!debugBorders)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${debugBorders ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                  >
                    <Bug size={12} /> Table Borders
                  </button>
                )}
                {htmlOutputView === 'console' && (
                  <button onClick={clearLogs} className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest">
                    Clear Console
                  </button>
                )}
             </div>
             
             <div className="flex-1 overflow-hidden relative bg-slate-50 dark:bg-slate-950">
                {mode === 'html' && htmlOutputView === 'browser' ? (
                  <iframe 
                    ref={iframeRef}
                    title="Live Preview"
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <div className="flex flex-col h-full bg-slate-950 font-mono text-xs overflow-hidden">
                    <div className="flex-1 p-6 overflow-y-auto scrollbar-hide space-y-1.5">
                       {logs.length > 0 ? (
                         logs.map((log, i) => (
                           <div key={i} className="flex gap-3 group">
                              <span className="text-slate-600 shrink-0 select-none opacity-50 group-hover:opacity-100"><Clock size={10} className="inline mr-1"/>{log.timestamp}</span>
                              <div className={`break-all ${
                                log.type === 'error' ? 'text-rose-400' : 
                                log.type === 'system' ? 'text-indigo-400 italic' : 
                                log.type === 'c-out' ? 'text-emerald-400' :
                                'text-slate-300'
                              }`}>
                                {log.type === 'error' && <XCircle size={10} className="inline mr-1" />}
                                {log.content}
                              </div>
                           </div>
                         ))
                       ) : (
                         <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-20 space-y-4">
                            <Terminal size={48} />
                            <p className="font-bold tracking-widest">DEV_CONSOLE_EMPTY</p>
                         </div>
                       )}
                       <div ref={consoleEndRef} />
                    </div>
                  </div>
                )}
             </div>
          </div>

          <div className="h-28 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-4 overflow-hidden flex flex-col">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <AlertCircle size={10} /> {isBN ? 'লজিক ইনসাইট' : 'Logic Insights'}
                </span>
                <span className="text-[8px] font-black text-slate-300 uppercase">{mode.toUpperCase()} MODE ACTIVE</span>
             </div>
             <div className="flex-1 overflow-y-auto text-[10px] font-medium text-slate-500 leading-relaxed pr-2">
                {mode === 'html' 
                  ? 'Note: Javascript errors are captured in the integrated console. Check the Console tab for debugging alerts and object logs.' 
                  : 'C Program is simulated. Standard library functions like printf and basic loops are supported for HSC curriculum practice.'}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRunner;
