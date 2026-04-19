import React, { useEffect, useState } from 'react';
import { Plus, Zap, X, File, Image as ImageIcon, Video, Music, Archive, RefreshCw, MoreHorizontal, CheckCircle2, Download, Bell, ChevronDown, History, Coffee, UserRound, ArrowLeftRight, Search, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import brandLogo from './assets/img/brand.png';
import ConversionBeamLoader from './components/ConversionBeamLoader';
import BuyMeCoffee from './components/BuyMeCoffee';

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
  thumbnail?: string;
}

type MobileMenuAction = 'convert' | 'history' | 'buycoffee' | 'profile';

const getTargetFormats = (fileType: string) => {
  if (fileType.startsWith('image/')) return ['JPG', 'PNG', 'WEBP', 'GIF', 'PDF'];
  if (fileType.startsWith('video/')) return ['MP4', 'WEBM', 'MOV', 'GIF'];
  if (fileType.startsWith('audio/')) return ['MP3', 'WAV', 'OGG', 'M4A'];
  if (fileType.includes('pdf')) return ['DOCX', 'TXT', 'IMAGES'];
  return ['ZIP', 'PDF', 'TXT'];
};

const desktopNavItems = [
  { label: 'Features', hasChevron: true },
  { label: 'Pricing', hasChevron: false },
  { label: 'Use cases', hasChevron: true },
  { label: 'Resources', hasChevron: true },
  { label: "What's new", hasChevron: false }
];

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
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('bunconvert-theme') === 'dark';
  });

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission !== 'default') {
      return Notification.permission;
    }

    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  };

  useEffect(() => {
    window.localStorage.setItem('bunconvert-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const nextTheme = isDarkMode ? 'theme-dark' : 'theme-light';
    const prevTheme = isDarkMode ? 'theme-light' : 'theme-dark';

    root.classList.remove(prevTheme);
    root.classList.add(nextTheme);
    body.classList.remove(prevTheme);
    body.classList.add(nextTheme);
  }, [isDarkMode]);

  useEffect(() => {
    let cancelled = false;
    let hideTimeout: number | undefined;
    const startedAt = Date.now();

    const finishLoading = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 1800 - elapsed);

      hideTimeout = window.setTimeout(() => {
        if (!cancelled) {
          setShowLoader(false);
        }
      }, remaining);
    };

    const loaderImage = new Image();
    loaderImage.onload = finishLoading;
    loaderImage.onerror = finishLoading;
    loaderImage.src = '/animate.webp';

    return () => {
      cancelled = true;

      if (hideTimeout !== undefined) {
        window.clearTimeout(hideTimeout);
      }
    };
  }, []);

  useEffect(() => {
    if (previewItem || converting) {
      setShowMobileProfile(false);
    }
  }, [previewItem, converting]);

  const showNotification = async () => {
    // Notifications are optional and only shown when permission is granted.
    if (!('Notification' in window)) {
      return;
    }

    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      return;
    }

    const notificationOptions: NotificationOptions = {
      body: 'Your files have been converted successfully!',
      icon: '/brand.png',
      badge: '/brand.png',
      tag: 'conversion-complete',
      requireInteraction: false,
    };

    try {
      const registration = 'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistration()
        : undefined;

      if (registration) {
        await registration.showNotification('BUNCONVERT', {
          ...notificationOptions,
        });
        return;
      }
    } catch (error) {
      console.error('Service worker notification failed, using fallback', error);
    }

    try {
      new Notification('BUNCONVERT', notificationOptions);
    } catch (error) {
      console.error('Fallback notification failed', error);
    }
  };

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
    let thumbnail: string | undefined;

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
          if (blob) {
            finalBlob = blob;
            // Create thumbnail
            const thumbCanvas = document.createElement('canvas');
            const maxThumbSize = 80;
            const scale = Math.min(maxThumbSize / bmp.width, maxThumbSize / bmp.height);
            thumbCanvas.width = bmp.width * scale;
            thumbCanvas.height = bmp.height * scale;
            const thumbCtx = thumbCanvas.getContext('2d');
            if (thumbCtx) {
              thumbCtx.drawImage(bmp, 0, 0, thumbCanvas.width, thumbCanvas.height);
              thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7);
            }
          }
        }
      } catch (err) {
        console.error("Image conversion failed, returning original", err);
      }
    }

    // Create thumbnail for original image if not converted
    if (isImage && !thumbnail) {
      try {
        const bmp = await createImageBitmap(item.file);
        const thumbCanvas = document.createElement('canvas');
        const maxThumbSize = 80;
        const scale = Math.min(maxThumbSize / bmp.width, maxThumbSize / bmp.height);
        thumbCanvas.width = bmp.width * scale;
        thumbCanvas.height = bmp.height * scale;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (thumbCtx) {
          thumbCtx.drawImage(bmp, 0, 0, thumbCanvas.width, thumbCanvas.height);
          thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.7);
        }
      } catch (err) {
        console.error("Thumbnail creation failed", err);
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
      blob: finalBlob,
      thumbnail
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

  const openBuyCoffee = () => {
    if (typeof window !== 'undefined') {
      window.open('https://buymeacoffee.com/uilayouts', '_blank', 'noopener,noreferrer');
    }
  };

  const handleMobileMenuAction = (action: MobileMenuAction) => {
    if (action === 'convert' || action === 'history') {
      setActiveTab(action);
      setShowMobileProfile(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'buycoffee') {
      setShowMobileProfile(false);
      openBuyCoffee();
    } else {
      setShowMobileProfile(true);
    }
  };

  const handleMobileSearch = () => {
    setActiveTab('history');
    setShowMobileProfile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAction = () => {
    if (!done) {
      // Trigger permission request from a user action to increase allow rate.
      void requestNotificationPermission();
    }

    if (done) {
      files.forEach(f => processDownload(f));
      return;
    }

    const conversionDuration = 30000;
    const tickDuration = 90;
    const startedAt = Date.now();

    setConverting(true);
    setFiles(prev => prev.map(f => ({ ...f, status: 'converting', progress: 0 })));

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const normalizedProgress = Math.min(elapsed / conversionDuration, 1);
      const easedProgress =
        normalizedProgress < 0.86
          ? Math.round((1 - Math.pow(1 - normalizedProgress / 0.86, 2.2)) * 94)
          : Math.round(94 + ((normalizedProgress - 0.86) / 0.14) * 6);

      setFiles(prev => prev.map(f => ({ ...f, status: 'converting', progress: Math.min(easedProgress, 100) })));

      if (normalizedProgress >= 1) {
        window.clearInterval(interval);
        setConverting(false);
        setDone(true);
        setFiles(prev => prev.map(f => ({ ...f, status: 'done', progress: 100 })));
        showNotification();
      }
    }, tickDuration);
  };

  const overallProgress = files.length > 0
    ? Math.round(files.reduce((total, file) => total + file.progress, 0) / files.length)
    : 0;

  const activeMobileMenuAction: MobileMenuAction = showMobileProfile ? 'profile' : activeTab;

  const mobileMenuItems = [
    {
      key: 'convert',
      label: 'Convert',
      icon: ArrowLeftRight,
    },
    {
      key: 'history',
      label: 'History',
      icon: History,
    },
    {
      key: 'buycoffee',
      label: 'Buy coffee',
      icon: Coffee,
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: UserRound,
    },
  ] as const;

  return (
    <div className={`app-shell ${isDarkMode ? 'theme-dark bg-[#0B1220]' : 'theme-light bg-[#E2ECFA]'} min-h-screen flex flex-col font-sans w-full overflow-hidden relative transition-colors duration-300`}>
      <AnimatePresence mode="wait">
        {showLoader && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25, ease: 'easeIn' } }}
              className="flex flex-col items-center justify-center gap-6 px-6"
            >
              <img
                src="/animate.webp"
                alt="Loading animation"
                className="w-[180px] sm:w-[220px] md:w-[260px] object-contain select-none pointer-events-none"
              />
              <motion.span
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                className="pl-[0.5em] text-[11px] font-semibold uppercase tracking-[0.5em] text-white/70 sm:text-xs"
              >
                Loading
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsDarkMode(prev => !prev)}
        className={`fixed right-4 top-5 z-[120] flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 sm:right-6 sm:top-6 ${
          isDarkMode
            ? 'border-slate-600/80 bg-slate-900/85 text-amber-300 shadow-[0_10px_24px_rgba(0,0,0,0.38)]'
            : 'border-white/80 bg-white/85 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.16)]'
        }`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDarkMode ? 'Light mode' : 'Dark mode'}
      >
        {isDarkMode ? <Sun className="h-[18px] w-[18px]" strokeWidth={2.35} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={2.35} />}
      </button>

      {/* Top Navbar */}
      <header className="fixed sm:absolute w-full top-4 sm:top-0 left-0 z-50 pointer-events-none">
        {/* Mobile Navbar - Centered with Login */}
        <div className="sm:hidden flex justify-center px-4 pointer-events-auto">
          <div className="mobile-top-pill flex items-center space-x-2 bg-white/80 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg border border-white/40">
            <img src={brandLogo} alt="BUNCONVERT" className="h-8 w-8 object-cover rounded-full" />
            <span className="brand-text font-bold text-[16px] text-gray-900 tracking-tight">BUNCONVERT</span>
            <div className="brand-divider w-px h-5 bg-gray-300 mx-1"></div>
            <button className="top-nav-login-btn bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white rounded-full px-4 py-1.5 font-bold text-[12px] hover:from-[#1E40AF] hover:to-[#1E3A8A] transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity">
              Login
            </button>
          </div>
        </div>
        
        {/* Desktop Navbar - Compact */}
        <div className="top-nav-compact hidden sm:flex lg:hidden items-center justify-between gap-3 px-12 pt-5 pointer-events-auto">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="BUNCONVERT" className="h-9 w-9 object-cover rounded-full shadow-[0_6px_18px_rgba(15,23,42,0.14)]" />
            <span className="brand-text font-bold text-[18px] text-gray-900 tracking-tight">BUNCONVERT</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="top-nav-signup-btn rounded-full bg-[#1A1A1A] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_12px_30px_rgba(15,23,42,0.22)]">
              Sign up
            </button>
            <button className="top-nav-icon-btn relative flex h-10 w-10 items-center justify-center rounded-full border border-[#d8dce6] bg-white/90 text-[#111827] shadow-[0_4px_18px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
              <Bell className="h-4 w-4" strokeWidth={2.2} />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3B5BFF] px-1 text-[9px] font-bold leading-none text-white">
                3
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Navbar - Full */}
        <div className="top-nav-full hidden lg:flex items-center justify-between gap-4 px-16 xl:px-24 pt-5 pointer-events-auto">
          <div className="flex shrink-0 items-center gap-3">
            <img src={brandLogo} alt="BUNCONVERT" className="h-10 w-10 object-cover rounded-full shadow-[0_6px_18px_rgba(15,23,42,0.14)]" />
            <span className="brand-text font-bold text-[18px] text-gray-900 tracking-tight">BUNCONVERT</span>
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-3 xl:gap-4">
            <nav className="top-nav-links flex items-center gap-1 rounded-full border border-[#d8dce6] bg-white/90 px-5 py-2.5 text-[#111827] shadow-[0_4px_18px_rgba(15,23,42,0.08)] backdrop-blur-xl xl:px-6 xl:py-3">
              {desktopNavItems.map(({ label, hasChevron }) => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors duration-200 hover:text-[#2563EB] xl:px-3"
                >
                  <span>{label}</span>
                  {hasChevron ? <ChevronDown className="h-4 w-4 text-[#6B7280]" strokeWidth={2.2} /> : null}
                </button>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <button className="top-nav-signup-btn rounded-full bg-[#1A1A1A] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_12px_30px_rgba(15,23,42,0.22)]">
                Sign up
              </button>
              <button className="top-nav-icon-btn relative flex h-11 w-11 items-center justify-center rounded-full border border-[#d8dce6] bg-white/90 text-[#111827] shadow-[0_4px_18px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                <Bell className="h-4 w-4" strokeWidth={2.2} />
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3B5BFF] px-1 text-[9px] font-bold leading-none text-white">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full relative z-10 h-screen">
        
        {/* Center Area - The Converter Panel */}
        <div className="w-full h-full flex items-center justify-center px-4 py-24 sm:px-8 sm:items-start sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 xl:pt-36">
          
          <div className="relative w-full max-w-[340px] shrink-0 flex flex-col">
            {/* Title above card */}
            <div className="mb-4 sm:mb-6 text-center">
              <h1 className="converter-title font-serif text-[28px] sm:text-[36px] tracking-tighter text-gray-900 leading-[0.9]">BUNCONVERT</h1>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-[11px] sm:text-[13px] mt-1.5 sm:mt-2 font-bold tracking-wider uppercase drop-shadow-sm">by NGDKLabs</p>
            </div>
            {/* Background tab to mimic layering */}
            <div className="converter-tabs mx-4 h-10 flex rounded-t-3xl border border-[#dce5f3] border-b-0 -mb-4 z-0 overflow-hidden text-[10px] font-bold uppercase tracking-[0.1em]">
               <button 
                  onClick={() => setActiveTab('convert')}
                 className={`converter-tab-button ${activeTab === 'convert' ? 'active' : ''} flex-1 flex justify-center pt-2 transition-colors ${activeTab === 'convert' ? 'bg-[#E2EAF6] text-gray-500 cursor-default' : 'bg-white/50 text-gray-400 hover:bg-[#E2EAF6]/50'}`}
               >
                  Conversion
               </button>
               <button 
                  onClick={() => setActiveTab('history')}
                 className={`converter-tab-button ${activeTab === 'history' ? 'active' : ''} flex-1 flex justify-center pt-2 transition-colors ${activeTab === 'history' ? 'bg-[#E2EAF6] text-gray-500 cursor-default' : 'bg-white/50 text-gray-400 hover:bg-[#E2EAF6]/50'}`}
               >
                  History
               </button>
            </div>
            
            {/* Main Card */}
            <div 
              className={`converter-card bg-white rounded-[32px] shadow-[0_12px_40px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col z-10 h-auto max-h-[65vh] sm:max-h-[70vh] transition-all duration-300 relative ${isDragging && activeTab === 'convert' ? 'ring-4 ring-blue-500 scale-[1.02]' : ''}`}
              onDragOver={activeTab === 'convert' ? handleDragOver : undefined}
              onDragLeave={activeTab === 'convert' ? handleDragLeave : undefined}
              onDrop={activeTab === 'convert' ? handleDrop : undefined}
            >
              {isDragging && activeTab === 'convert' && (
                <div className="drop-overlay absolute inset-0 bg-blue-800/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none rounded-[32px]">
                  <div className="drop-overlay-card bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-3">
                     <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center">
                       <Plus className="w-6 h-6" strokeWidth={3} />
                     </div>
                     <span className="drop-overlay-text text-blue-600 font-bold text-lg">Drop files here to add</span>
                  </div>
                </div>
              )}
              {activeTab === 'convert' ? (
                <>
                  {/* Top Actions */}
                  <div className="p-4 flex pb-2 shrink-0">
                    <button 
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="add-files-btn w-full bg-[#F1F4FA] rounded-3xl py-4 flex flex-col items-center justify-center transition-colors hover:bg-[#E4EBF5] relative group"
                    >
                      <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white flex items-center justify-center mb-2 shadow-lg shadow-blue-500/40 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-blue-600/50 transition-all relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:to-transparent before:opacity-60">
                        <Plus className="w-5 h-5 relative z-10" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-bold text-gray-800">Add files</span>
                    </button>
                    
                    <input id="file-upload" type="file" multiple className="hidden" onChange={handleFiles} />
                  </div>

                  <div className="px-5 py-2.5 flex justify-between items-center bg-white border-b border-gray-100/60 shrink-0">
                    <span className="text-[12.5px] text-gray-500 font-medium tracking-tight">Convert up to 2GB free</span>
                    <button className="increase-limit-btn text-[12.5px] font-bold text-[#b54bba] flex items-center hover:text-[#953e9a] transition-colors">
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
                          <select className="w-full text-[14px] sm:text-[15px] outline-none text-gray-800 font-medium bg-white border border-gray-200 rounded-2xl px-3 py-2.5 sm:py-2 cursor-pointer hover:border-gray-300 transition-colors">
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
                               <div className="w-10 h-10 rounded-2xl bg-[#F4F7FC] text-[#1E40AF] flex items-center justify-center shrink-0">
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
                                     className="text-[10px] sm:text-[11px] font-bold bg-white border border-gray-200 rounded-xl sm:rounded-2xl px-1.5 sm:px-2 py-1 sm:py-1.5 outline-none text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
                                     value={file.compression}
                                     onChange={(e) => updateCompression(file.id, e.target.value)}
                                   >
                                     <option value="original">100%</option>
                                     <option value="medium">70%</option>
                                     <option value="small">50%</option>
                                     <option value="tiny">30%</option>
                                   </select>
                                   <select 
                                     className="text-[10px] sm:text-[11px] font-bold bg-white border border-gray-200 rounded-xl sm:rounded-2xl px-1.5 sm:px-2 py-1 sm:py-1.5 outline-none text-gray-700 cursor-pointer hover:border-gray-300 transition-colors"
                                     value={file.targetFormat}
                                     onChange={(e) => updateTargetFormat(file.id, e.target.value)}
                                   >
                                     {getTargetFormats(file.type).map(fmt => (
                                       <option key={fmt} value={fmt}>{fmt}</option>
                                     ))}
                                   </select>
                                   <button onClick={() => removeFile(file.id)} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors">
                                     <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                                   </button>
                                 </div>
                               )}
                               
                               {/* Loading Overlay for this file item */}
                               {converting && (
                                 <div className="absolute bottom-0 left-12 right-0 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                                   <div 
                                     className="h-full bg-gradient-to-r from-[#2563EB] to-[#1E40AF] transition-all duration-300 ease-linear rounded-full shadow-sm shadow-blue-400/50"
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
                    <button className="more-action-btn w-[42px] h-[42px] rounded-2xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
                      <MoreHorizontal className="w-5 h-5 text-gray-800" strokeWidth={2.5} />
                    </button>
                    <button 
                      onClick={handleAction}
                      disabled={converting || (!done && files.length === 0)}
                      className={`convert-main-btn flex-1 ml-3 font-bold text-[15px] rounded-full py-3.5 transition-all outline-none flex items-center justify-center relative overflow-hidden
                        ${done ? 'bg-[#1C1D1F] text-white hover:bg-black shadow-lg shadow-black/10' : 
                          files.length > 0 ? 'bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white hover:from-[#1E40AF] hover:to-[#1E3A8A] shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-600/50 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-60' : 
                          'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {converting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin mr-2 relative z-10" strokeWidth={2.5} />
                          <span className="relative z-10">Converting...</span>
                        </>
                      ) : done ? (
                        <>
                          <Download className="w-4 h-4 mr-2" strokeWidth={2.5} />
                          Download all
                        </>
                      ) : (
                        <span className="relative z-10">Convert</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                 <div className="flex flex-col h-full bg-white flex-1 animate-in fade-in duration-300">
                    <div className="p-5 border-b border-gray-50 shrink-0 bg-gray-50/50 flex justify-between items-center">
                       <h3 className="font-bold text-gray-800">Conversion History</h3>
                       <span className="history-count-badge text-[12px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{history.length} items</span>
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
                                    <div 
                                      className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-[#1E40AF] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 hover:shadow-lg hover:shadow-blue-300/30 transition-all relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent"
                                      onClick={() => item.thumbnail && setPreviewItem(item)}
                                    >
                                       {item.thumbnail ? (
                                         <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover relative z-10" />
                                       ) : (
                                         <div className="relative z-10">
                                           <FileIcon type={item.originalType} />
                                         </div>
                                       )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                       <div className="text-[13.5px] font-semibold text-gray-800 truncate mb-0.5" title={item.name}>{item.name}</div>
                                       <div className="flex items-center text-[11px] text-gray-400 font-medium space-x-1.5">
                                          <span className="text-gray-500 font-bold uppercase tracking-tight">{item.originalType.split('/')[1] || 'FILE'}</span>
                                          <span className="text-gray-300">→</span>
                                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#1E40AF] font-bold uppercase tracking-tight drop-shadow-sm">{item.targetFormat}</span>
                                          <span>•</span>
                                          <span>{item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                       </div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => downloadHistoryItem(item)}
                                    className="history-download-btn w-[34px] h-[34px] rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 text-[#1E40AF] flex items-center justify-center hover:from-[#2563EB] hover:to-[#1E40AF] hover:text-white transition-all shrink-0 shadow-md hover:shadow-lg hover:shadow-blue-400/40 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-100 hover:before:opacity-0 before:transition-opacity"
                                    title="Download again"
                                  >
                                    <Download className="w-4 h-4 relative z-10" strokeWidth={2.5} />
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

      <div className="fixed inset-x-0 bottom-6 z-[82] flex justify-center px-3 sm:hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
          className="flex w-full max-w-[382px] items-end gap-2"
        >
          <div className="mobile-dock relative flex h-[74px] flex-1 items-end justify-between overflow-visible rounded-full border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.64)_48%,rgba(245,247,251,0.82)_100%)] px-[8px] pb-[7px] pt-[8px] shadow-[0_18px_38px_rgba(15,23,42,0.16),0_8px_18px_rgba(255,255,255,0.42)_inset] backdrop-blur-[28px]">
            <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/70" />
            <span className="pointer-events-none absolute left-7 right-7 top-[5px] h-[16px] rounded-full bg-white/65 blur-md" />
            <span className="pointer-events-none absolute inset-x-10 bottom-[3px] h-[14px] rounded-full bg-slate-300/20 blur-lg" />

            {mobileMenuItems.map(({ key, label, icon: Icon }) => {
              const isActive = activeMobileMenuAction === key;
              const showHistoryBadge = key === 'history' && history.length > 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMobileMenuAction(key)}
                  className="relative z-10 flex h-full min-w-0 flex-1 items-end justify-center overflow-hidden rounded-full text-center"
                >
                  <motion.div
                    animate={{ y: 0, scale: isActive ? 1 : 0.96 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className={`relative flex h-full w-full flex-col items-center justify-center gap-[3px] overflow-hidden rounded-full p-[6px] ${
                      isActive
                        ? 'border border-[#b8dcff] bg-[linear-gradient(180deg,#eef7ff_0%,#dbeeff_60%,#cbe6ff_100%)] text-[#1d4ed8] shadow-[0_12px_22px_rgba(59,130,246,0.26),0_2px_0_rgba(255,255,255,0.78)_inset]'
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {isActive ? (
                      <span className="pointer-events-none absolute inset-[3px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(219,234,254,0.12)_80%)]" />
                    ) : null}

                    <span className="relative z-10 flex items-center justify-center">
                      <Icon className={`${isActive ? 'h-[22px] w-[22px] text-[#2563EB]' : 'h-[20px] w-[20px]'}`} strokeWidth={2.35} />

                      {showHistoryBadge ? (
                        <span className="absolute -right-[8px] -top-[6px] flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-[#ef4444] px-1 text-[9px] font-bold leading-none text-white shadow-[0_6px_14px_rgba(239,68,68,0.3)]">
                          {Math.min(history.length, 99)}
                        </span>
                      ) : null}
                    </span>

                    <span className={`relative z-10 text-[9px] font-semibold leading-none tracking-tight ${isActive ? 'text-[#2563EB]' : 'text-[#6B7280]'}`}>
                      {label}
                    </span>
                  </motion.div>
                </button>
              );
            })}
          </div>

          <motion.button
            type="button"
            onClick={handleMobileSearch}
            whileTap={{ scale: 0.95 }}
            className="mobile-search-btn relative z-10 mb-[10px] flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(247,248,251,0.96)_100%)] text-[#4B5563] shadow-[0_12px_26px_rgba(15,23,42,0.2),0_5px_12px_rgba(255,255,255,0.42)_inset]"
            aria-label="Search"
            title="Search"
          >
            <Search className="h-[22px] w-[22px]" strokeWidth={2.25} />
          </motion.button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showMobileProfile && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-profile-overlay fixed inset-0 z-[85] bg-slate-950/20 backdrop-blur-sm sm:hidden"
              onClick={() => setShowMobileProfile(false)}
              aria-label="Close profile panel"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="fixed inset-x-0 bottom-0 z-[90] px-3 pb-3 sm:hidden"
            >
              <div className="mobile-profile-sheet overflow-hidden rounded-[32px] border border-white/60 bg-white/55 shadow-[0_-16px_44px_rgba(15,23,42,0.22)] backdrop-blur-3xl">
                <div className="flex justify-center pt-3">
                  <div className="h-1.5 w-14 rounded-full bg-slate-300/80" />
                </div>

                <div className="mobile-profile-content px-5 pb-5 pt-4">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#2563EB] to-[#1E40AF] p-1.5 shadow-[0_12px_24px_rgba(37,99,235,0.35)]">
                      <img src={brandLogo} alt="BUNCONVERT" className="h-full w-full rounded-[18px] object-cover" />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2563EB]">Profile</p>
                      <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">Guest converter</h3>
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                        Quick access to your recent activity, converter tab, and support links.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowMobileProfile(false)}
                      className="mobile-profile-close-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                      aria-label="Close profile"
                    >
                      <X className="h-4.5 w-4.5" strokeWidth={2.5} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="mobile-profile-stat-card rounded-[24px] bg-[#eff6ff]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">History</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-[#1E40AF]">{history.length}</p>
                      <p className="mt-1 text-[12px] font-medium text-slate-500">Saved conversions</p>
                    </div>

                    <div className="mobile-profile-stat-card rounded-[24px] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Queue</p>
                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{files.length}</p>
                      <p className="mt-1 text-[12px] font-medium text-slate-500">Files ready to convert</p>
                    </div>
                  </div>

                  <div className="mobile-profile-current-view mt-4 rounded-[28px] bg-[#f8fbff]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Current view</p>
                        <p className="mt-1 text-[14px] font-semibold capitalize text-slate-900">{activeTab}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('history');
                          setShowMobileProfile(false);
                        }}
                        className="mobile-profile-secondary-btn flex-1 rounded-full bg-white px-4 py-3 text-[13px] font-semibold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                      >
                        Open history
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openBuyCoffee();
                          setShowMobileProfile(false);
                        }}
                        className="mobile-profile-primary-btn flex-1 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.35)]"
                      >
                        Buy coffee
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {converting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="conversion-overlay fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/12 px-4 backdrop-blur-md"
            >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-[680px]"
            >
              <div className="px-2 py-4 sm:px-4 sm:py-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#2563EB]">BUNCONVERT</span>
                    <h3 className="conversion-modal-title mt-2 text-xl font-bold text-[#0F172A] sm:text-2xl">Processing your conversion</h3>
                    <p className="conversion-modal-desc mt-1 text-[13px] font-medium text-slate-500 sm:text-[14px]">
                      {files.length === 1
                        ? '1 file is being converted. This modal will close automatically when the process finishes.'
                        : `${files.length} files are being converted. This modal will close automatically when the process finishes.`}
                    </p>
                  </div>

                  <div className="shrink-0 pt-1 text-[14px] font-bold text-[#1E40AF] sm:text-[15px]">
                    {overallProgress}%
                  </div>
                </div>

                <ConversionBeamLoader progress={overallProgress} fileCount={files.length} fileNames={files.map(file => file.name)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="preview-modal bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Preview Header */}
              <div className="preview-modal-header p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="preview-modal-title font-bold text-gray-900 text-lg truncate">{previewItem.name}</h3>
                  <div className="preview-modal-meta flex items-center text-[12px] text-gray-500 font-medium space-x-2 mt-1">
                    <span className="uppercase font-bold">{previewItem.targetFormat}</span>
                    <span>•</span>
                    <span>{previewItem.date.toLocaleString()}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="preview-modal-close w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
                </button>
              </div>

              {/* Preview Content */}
              <div className="preview-modal-content flex-1 overflow-auto p-4 sm:p-6 bg-gray-50 flex items-center justify-center">
                {previewItem.thumbnail ? (
                  <img 
                    src={URL.createObjectURL(previewItem.blob)} 
                    alt={previewItem.name}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-lg"
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileIcon type={previewItem.originalType} />
                    <p className="preview-modal-empty-text text-gray-500 mt-4 font-medium">Preview not available</p>
                  </div>
                )}
              </div>

              {/* Preview Footer */}
              <div className="preview-modal-footer p-4 sm:p-6 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="preview-modal-size text-[13px] text-gray-600 font-medium">
                  <span className="preview-modal-size-label text-gray-400">Original:</span> {(previewItem.originalSize / 1024 / 1024).toFixed(2)} MB
                </div>
                <button 
                  onClick={() => {
                    downloadHistoryItem(previewItem);
                    setPreviewItem(null);
                  }}
                  className="preview-download-btn bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white px-6 py-3 rounded-full font-bold text-[14px] hover:from-[#1E40AF] hover:to-[#1E3A8A] transition-all flex items-center space-x-2 shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-600/50 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-60"
                >
                  <Download className="w-4 h-4 relative z-10" strokeWidth={2.5} />
                  <span className="relative z-10">Download</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Me Coffee - Desktop Only */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-40">
        <BuyMeCoffee />
      </div>
    </div>
  );
}
