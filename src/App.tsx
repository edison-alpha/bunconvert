import React, { useState } from 'react';
import { Plus, Bell, ChevronDown, Zap, X, File, Image as ImageIcon, Video, Music, Archive, RefreshCw, MoreHorizontal, CheckCircle2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import brandLogo from './assets/img/brand.png';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  targetFormat: string;
  compression: string;
  progress: number;
  status: 'idle' | 'converting' | 'done' | 'error';
  file: File;
}

interface HistoryItem {
  id: string;
  name: string;
  originalSize: number;
  originalType: string;
  targetFormat: string;
  compression: string;
  date: Date;
  blob: Blob;
}

const getTargetFormats = (fileType: string) => {
  if (fileType.startsWith('image/')) return ['JPG', 'PNG', 'WEBP', 'GIF', 'PDF'];
  if (fileType.startsWith('video/')) return ['MP4', 'WEBM', 'MOV', 'GIF'];
  if (fileType.startsWith('audio/')) return ['MP3', 'WAV', 'OGG', 'M4A'];
  if (fileType.includes('pdf')) return ['DOCX', 'TXT', 'IMAGES'];
  return ['ZIP', 'PDF', 'TXT'];
};

const FileIcon = ({ type }: { type: string }) => {
  if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
  if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
  if (type.startsWith('audio/')) return <Music className="w-4 h-4" />;
  if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return <Archive className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
};

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'convert' | 'history'>('convert');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const processFiles = (fileList: FileList | File[]) => {
    if (done) setDone(false);
    const newFiles: FileItem[] = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      targetFormat: getTargetFormats(file.type || '')[0],
      compression: 'original',
      progress: 0,
      status: 'idle',
      file: file
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateCompression = (id: string, comp: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, compression: comp } : f));
  };

  const updateTargetFormat = (id: string, format: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, targetFormat: format } : f));
  };

  const getCompressionRatio = (compression: string) => {
    if (compression === 'medium') return 0.7;
    if (compression === 'small') return 0.5;
    if (compression === 'tiny') return 0.3;
    return 1;
  };

  const processDownload = async (item: FileItem) => {
    const isImage = item.type.startsWith('image/');
    const targetLower = item.targetFormat.toLowerCase();
    const isTargetImage = ['jpg', 'png', 'webp', 'jpeg'].includes(targetLower);
    
    let finalBlob: Blob = item.file;
    let finalFormat = targetLower === 'jpg' ? 'jpeg' : targetLower;
    let mimeType = isTargetImage ? `image/${finalFormat}` : item.type;

    if (isImage && isTargetImage && typeof window !== 'undefined') {
      try {
        const bmp = await createImageBitmap(item.file);
        const canvas = document.createElement('canvas');
        const ratio = getCompressionRatio(item.compression);
        canvas.width = bmp.width * ratio;
        canvas.height = bmp.height * ratio;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (finalFormat === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
          const quality = ratio === 1 ? 0.92 : 0.8;
          const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mimeType, quality));
          if (blob) finalBlob = blob;
        }
      } catch (err) {
        console.error("Image conversion failed, returning original", err);
      }
    }

    const nameWithoutExt = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;
    const newName = `${nameWithoutExt}.${targetLower}`;
    
    setHistory(prev => [{
      id: Math.random().toString(36).substring(7),
      name: newName,
      originalSize: item.size,
      originalType: item.type,
      targetFormat: targetLower,
      compression: item.compression,
      date: new Date(),
      blob: finalBlob
    }, ...prev]);

    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const downloadHistoryItem = (item: HistoryItem) => {
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleAction = () => {
    if (done) {
      files.forEach(f => processDownload(f));
      return;
    }

    setConverting(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setFiles(prev => prev.map(f => ({ ...f, progress })));
      if (progress >= 100) {
        clearInterval(interval);
        setConverting(false);
        setDone(true);
        setFiles(prev => prev.map(f => ({ ...f, status: 'done', progress: 100 })));
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#E2ECFA] flex flex-col font-sans w-full overflow-hidden relative">
      {/* Top Navbar */}
      <header className="absolute w-full top-0 left-0 p-6 flex justify-between items-center z-50 pointer-events-none">
        {/* Left Logo / Brand */}
        <div className="pointer-events-auto pt-1 sm:pl-2">
          <div className="flex items-center space-x-3">
            <img src={brandLogo} alt="BUNCONVERT" className="h-10 w-10 object-cover rounded-full" />
            <span className="font-bold text-[20px] text-gray-900 tracking-tight">BUNCONVERT</span>
          </div>
        </div>
        
        {/* Right Nav Links */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="hidden lg:flex bg-white rounded-full px-6 py-3 items-center space-x-6 text-[13px] font-bold shadow-sm text-gray-800 border border-gray-100">
             <button className="flex items-center hover:text-gray-500 transition-colors">Features <ChevronDown className="w-3 h-3 ml-1.5 stroke-[3] opacity-60"/></button>
             <button className="hover:text-gray-500 transition-colors">Pricing</button>
             <button className="flex items-center hover:text-gray-500 transition-colors">Use cases <ChevronDown className="w-3 h-3 ml-1.5 stroke-[3] opacity-60"/></button>
             <button className="flex items-center hover:text-gray-500 transition-colors">Resources <ChevronDown className="w-3 h-3 ml-1.5 stroke-[3] opacity-60"/></button>
             <button className="hover:text-gray-500 transition-colors">What's new</button>
             <button className="hover:text-gray-500 transition-colors">Sign</button>
          </div>
          <button className="hidden sm:block bg-white rounded-full px-6 py-3 items-center text-[13px] font-bold shadow-sm hover:bg-gray-50 transition-colors text-gray-800 border border-gray-100">
             Log in
          </button>
          <button className="bg-[#1C1D1F] text-white rounded-full px-6 py-3 items-center text-[13px] font-bold shadow-sm cursor-pointer hover:bg-black transition-colors">
             Sign up
          </button>
          <button className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-sm relative cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100">
             <Bell className="w-5 h-5 text-gray-700" strokeWidth={2.5} />
             <span className="absolute top-0 right-0 bg-[#3A63F5] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center translate-x-1.5 -translate-y-1.5 border-2 border-white">3</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full relative z-10 pt-[100px] lg:pt-0 h-screen">
        
        {/* Center Area - The Converter Panel */}
        <div className="w-full h-full flex items-center justify-center px-4 sm:px-8 pb-12 lg:pb-0 pt-32">
          
          <div className="relative w-full max-w-[340px] shrink-0 flex flex-col">
            {/* Title above card */}
            <div className="mb-6 text-center">
              <h1 className="font-serif text-[36px] tracking-tighter text-gray-900 leading-[0.9]">BUNCONVERT</h1>
              <p className="text-[#3A63F5] text-[13px] mt-2 font-bold tracking-wider uppercase">by NGDKLabs</p>
            </div>
            {/* Background tab to mimic layering */}
            <div className="mx-4 h-10 flex rounded-t-2xl border border-[#dce5f3] border-b-0 -mb-4 z-0 overflow-hidden text-[10px] font-bold uppercase tracking-[0.1em]">
               <button 
                 onClick={() => setActiveTab('convert')}
                 className={`flex-1 flex justify-center pt-2 transition-colors ${activeTab === 'convert' ? 'bg-[#E2EAF6] text-gray-500 cursor-default' : 'bg-white/50 text-gray-400 hover:bg-[#E2EAF6]/50'}`}
               >
                 Conversion
               </button>
               <button 
                 onClick={() => setActiveTab('history')}
                 className={`flex-1 flex justify-center pt-2 transition-colors ${activeTab === 'history' ? 'bg-[#E2EAF6] text-gray-500 cursor-default' : 'bg-white/50 text-gray-400 hover:bg-[#E2EAF6]/50'}`}
               >
                 History
               </button>
            </div>
            
            {/* Main Card */}
            <div 
              className={`bg-white rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col z-10 h-auto max-h-[70vh] transition-all duration-300 relative ${isDragging && activeTab === 'convert' ? 'ring-4 ring-blue-500 scale-[1.02]' : ''}`}
              onDragOver={activeTab === 'convert' ? handleDragOver : undefined}
              onDragLeave={activeTab === 'convert' ? handleDragLeave : undefined}
              onDrop={activeTab === 'convert' ? handleDrop : undefined}
            >
              {isDragging && activeTab === 'convert' && (
                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none rounded-3xl">
                  <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-3">
                     <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
                       <Plus className="w-6 h-6" strokeWidth={3} />
                     </div>
                     <span className="text-blue-600 font-bold text-lg">Drop files here to add</span>
                  </div>
                </div>
              )}
              {activeTab === 'convert' ? (
                <>
                  {/* Top Actions */}
                  <div className="p-4 flex pb-2 shrink-0">
                    <button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="w-full bg-[#F1F4FA] rounded-2xl py-4 flex flex-col items-center justify-center transition-colors hover:bg-[#E4EBF5] relative group"
                    >
                      <div className="w-[34px] h-[34px] rounded-full bg-[#3A63F5] text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-105 transition-transform">
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-bold text-gray-800">Add files</span>
                    </button>
                    
                    <input id="file-upload" type="file" multiple className="hidden" onChange={handleFiles} />
                  </div>

                  <div className="px-5 py-2.5 flex justify-between items-center bg-white border-b border-gray-100/60 shrink-0">
                    <span className="text-[12.5px] text-gray-500 font-medium tracking-tight">Convert up to 2GB free</span>
                    <button className="text-[12.5px] font-bold text-[#b54bba] flex items-center hover:text-[#953e9a] transition-colors">
                      <Zap className="w-3.5 h-3.5 mr-1" fill="currentColor" /> Increase limit
                    </button>
                  </div>

                  {/* Form / Scroll Area */}
                  <div className="px-5 divide-y divide-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    {done ? (
                      <div className="py-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 relative">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8" strokeWidth={2} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">You're done!</h3>
                        <p className="text-gray-500 text-[13px] px-2 font-medium leading-relaxed">
                          Your files have been successfully converted and are ready to be downloaded.
                        </p>
                      </div>
                    ) : files.length === 0 ? (
                      <>
                        <div className="py-4 flex flex-col">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Target format</label>
                          <input type="text" placeholder="e.g. PDF, MP4 (Global)" className="w-full text-[15px] outline-none placeholder-gray-300 text-gray-800 font-medium bg-transparent" />
                        </div>
                        <div className="py-4 flex flex-col">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Compression Level</label>
                          <select className="w-full text-[14px] sm:text-[15px] outline-none text-gray-800 font-medium bg-white border border-gray-200 rounded-xl px-3 py-2.5 sm:py-2 cursor-pointer hover:border-gray-300 transition-colors">
                            <option value="original">Original Size (100%)</option>
                            <option value="medium">Medium Size (70%)</option>
                            <option value="small">Small Size (50%)</option>
                            <option value="tiny">Tiny Size (30%)</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="py-2">
                        <AnimatePresence>
                          {files.map(file => (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              key={file.id} 
                              className="py-2.5 flex items-center space-x-3 overflow-hidden relative group"
                            >
                               <div className="w-10 h-10 rounded-xl bg-[#F4F7FC] text-blue-500 flex items-center justify-center shrink-0">
                                 <FileIcon type={file.type} />
                               </div>
                               <div className="flex-1 min-w-0 pr-2">
                                 <div className="text-[13.5px] font-semibold text-gray-800 truncate mb-0.5">{file.name}</div>
                                 <div className="flex items-center text-[11px] text-gray-400 font-medium space-x-1.5">
                                   <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                   {file.compression !== 'original' && (
                                     <span className="text-green-500 font-bold shrink-0">
                                       → {
                                         file.compression === 'medium' ? (file.size * 0.7 / 1024 / 1024).toFixed(1) :
                                         file.compression === 'small' ? (file.size * 0.5 / 1024 / 1024).toFixed(1) :
                                         (file.size * 0.3 / 1024 / 1024).toFixed(1)
                                       } MB
                                     </span>
                                   )}
                                   <span>•</span>
                                   <span className="truncate">{file.type.split('/')[1] || 'File'}</span>
                                 </div>
                               </div>
                               
                               {!converting && !done && (
                                 <div className="shrink-0 flex items-center space-x-1 sm:space-x-2">
                                   <select 
                                     className="text-[10px] sm:text-[11px] font-bold bg-white border border-gray-200 rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 outline-none text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
                                     value={file.compression}
                                     onChange={(e) => updateCompression(file.id, e.target.value)}
                                   >
                                     <option value="original">100%</option>
                                     <option value="medium">70%</option>
                                     <option value="small">50%</option>
                                     <option value="tiny">30%</option>
                                   </select>
                                   <select 
                                     className="text-[10px] sm:text-[11px] font-bold bg-white border border-gray-200 rounded-lg sm:rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 outline-none text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
                                     value={file.targetFormat}
                                     onChange={(e) => updateTargetFormat(file.id, e.target.value)}
                                   >
                                     {getTargetFormats(file.type).map(fmt => (
                                       <option key={fmt} value={fmt}>{fmt}</option>
                                     ))}
                                   </select>
                                   <button onClick={() => removeFile(file.id)} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                                     <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                                   </button>
                                 </div>
                               )}
                               
                               {/* Loading Overlay for this file item */}
                               {converting && (
                                 <div className="absolute bottom-0 left-12 right-0 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-blue-500 transition-all duration-300 ease-linear rounded-full"
                                     style={{ width: `${file.progress}%` }}
                                   />
                                 </div>
                               )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Footer Area */}
                  <div className="p-5 flex items-center justify-between border-t border-gray-50 bg-white shrink-0 shadow-[0_-4px_10px_rgb(0,0,0,0.02)]">
                    <button className="w-[42px] h-[42px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
                      <MoreHorizontal className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={handleAction}
                      disabled={converting || (!done && files.length === 0)}
                      className={`flex-1 ml-3 font-bold text-[15px] rounded-2xl py-3.5 transition-all outline-none flex items-center justify-center
                        ${done ? 'bg-[#1C1D1F] text-white hover:bg-black shadow-lg shadow-black/10' : 
                          files.length > 0 ? 'bg-[#3A63F5] text-white hover:bg-[#2B4ED6] shadow-lg shadow-blue-500/20' : 
                          'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {converting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" strokeWidth={2.5} />
                          Converting...
                        </>
                      ) : done ? (
                        <>
                          <Download className="w-4 h-4 mr-2" strokeWidth={2.5} />
                          Download all
                        </>
                      ) : (
                        'Convert'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                 <div className="flex flex-col h-full bg-white flex-1 animate-in fade-in duration-300">
                    <div className="p-5 border-b border-gray-50 shrink-0 bg-gray-50/50 flex justify-between items-center">
                       <h3 className="font-bold text-gray-800">Conversion History</h3>
                       <span className="text-[12px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{history.length} items</span>
                    </div>
                    <div className="px-5 divide-y divide-gray-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1 min-h-[300px]">
                      {history.length === 0 ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                           <Archive className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1.5} />
                           <h4 className="text-gray-600 font-bold mb-1">No conversions yet</h4>
                           <p className="text-gray-400 text-[13px] font-medium">Files you convert will appear here</p>
                        </div>
                      ) : (
                        <div className="py-2">
                           <AnimatePresence>
                             {history.map(item => (
                               <motion.div 
                                 initial={{ opacity: 0, height: 0 }} 
                                 animate={{ opacity: 1, height: 'auto' }} 
                                 key={item.id} 
                                 className="py-3.5 flex items-center justify-between group overflow-hidden"
                               >
                                  <div className="flex items-center space-x-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-xl bg-[#F4F7FC] text-blue-500 flex items-center justify-center shrink-0">
                                       <FileIcon type={item.originalType} />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                       <div className="text-[13.5px] font-semibold text-gray-800 truncate mb-0.5" title={item.name}>{item.name}</div>
                                       <div className="flex items-center text-[11px] text-gray-400 font-medium space-x-1.5">
                                          <span className="text-gray-500 font-bold uppercase tracking-tight">{item.originalType.split('/')[1] || 'FILE'}</span>
                                          <span className="text-gray-300">→</span>
                                          <span className="text-blue-500 font-bold uppercase tracking-tight">{item.targetFormat}</span>
                                          <span>•</span>
                                          <span>{item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                       </div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => downloadHistoryItem(item)}
                                    className="w-[34px] h-[34px] rounded-full bg-[#F4F7FC] text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors shrink-0 shadow-sm"
                                    title="Download again"
                                  >
                                    <Download className="w-4 h-4" strokeWidth={2.5} />
                                  </button>
                               </motion.div>
                             ))}
                           </AnimatePresence>
                        </div>
                      )}
                    </div>
                 </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
