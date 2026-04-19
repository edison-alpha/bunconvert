import React, { useEffect, useState } from 'react';
import { Plus, Upload, Zap, X, File, Image as ImageIcon, Video, Music, Archive, RefreshCw, MoreHorizontal, CheckCircle2, Download, Bell, ChevronDown, History, Coffee, UserRound, ArrowLeftRight, Search, Moon, Sun, Wallet, Copy, Check, Smartphone, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import brandLogo from './assets/img/brand.png';
import ConversionBeamLoader from './components/ConversionBeamLoader';
import ImageMouseTrail from './components/ui/mousetrail';

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

const EthLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 784 1277" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M392 0L383.25 29.7667V873.933L392 882.667L784 674.667L392 0Z" fill="currentColor" fillOpacity="0.6"/>
    <path d="M392 0L0 674.667L392 882.667V472.133V0Z" fill="currentColor"/>
    <path d="M392 957.067L387.5 962.4V1263.27L392 1277L784 749.067L392 957.067Z" fill="currentColor" fillOpacity="0.6"/>
    <path d="M392 1277V957.067L0 749.067L392 1277Z" fill="currentColor"/>
    <path d="M392 882.667L784 674.667L392 472.133V882.667Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M0 674.667L392 882.667V472.133L0 674.667Z" fill="currentColor" fillOpacity="0.6"/>
  </svg>
);

const QrisLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="5" y="5" width="4" height="4" fill="currentColor"/>
    <rect x="15" y="5" width="4" height="4" fill="currentColor"/>
    <rect x="5" y="15" width="4" height="4" fill="currentColor"/>
    <path d="M13 13H15V15H13V13Z" fill="currentColor"/>
    <path d="M17 13H19V15H17V13Z" fill="currentColor"/>
    <path d="M15 15H17V17H15V15Z" fill="currentColor"/>
    <path d="M13 17H15V19H13V17Z" fill="currentColor"/>
    <path d="M17 17H19V19H17V17Z" fill="currentColor"/>
    <path d="M19 19H21V21H19V19Z" fill="currentColor"/>
  </svg>
);

const GoogleLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const SUPPORT_PAYMENTS = {
  evmAddress: '0x2A9f6B8dE6A4f2c3dA1E6F9a4B1C2D3E4F5A6B7C',
};

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'convert' | 'history' | 'buycoffee'>('convert');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyViewMode, setHistoryViewMode] = useState<'recent' | 'all'>('recent');
  const [mobileMenuBaseAction, setMobileMenuBaseAction] = useState<'convert' | 'history' | 'buycoffee'>('convert');
  const [copiedPaymentField, setCopiedPaymentField] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);
  const [showLoader, setShowLoader] = useState(true);
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [username, setUsername] = useState(() => {
    if (typeof window === 'undefined') return 'Guest converter';
    return window.localStorage.getItem('bunconvert-username') || 'Guest converter';
  });
  const [avatarUrl, setAvatarUrl] = useState(() => {
    if (typeof window === 'undefined') return brandLogo;
    return window.localStorage.getItem('bunconvert-avatar') || brandLogo;
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('bunconvert-theme') === 'dark';
  });
  const [showSearchForm, setShowSearchForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    window.localStorage.setItem('bunconvert-username', username);
  }, [username]);

  useEffect(() => {
    window.localStorage.setItem('bunconvert-avatar', avatarUrl);
  }, [avatarUrl]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const nextTheme = isDarkMode ? 'theme-dark' : 'theme-light';
    const prevTheme = isDarkMode ? 'theme-light' : 'theme-dark';
    const nextThemeColor = isDarkMode ? '#0B1220' : '#E2ECFA';

    root.classList.remove(prevTheme);
    root.classList.add(nextTheme);
    body.classList.remove(prevTheme);
    body.classList.add(nextTheme);

    root.style.backgroundColor = nextThemeColor;
    body.style.backgroundColor = nextThemeColor;

    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = nextThemeColor;
    }
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

  const openBuyCoffeePage = () => {
    setMobileMenuBaseAction('buycoffee');
    setActiveTab('buycoffee');
    setShowMobileProfile(false);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const copyPaymentValue = async (field: string, value: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = value;
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        document.body.appendChild(tempInput);
        tempInput.focus();
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      setCopiedPaymentField(field);
      window.setTimeout(() => {
        setCopiedPaymentField(prev => (prev === field ? null : prev));
      }, 1600);
    } catch (error) {
      console.error('Failed to copy payment value', error);
    }
  };

  const handleMobileMenuAction = (action: MobileMenuAction) => {
    if (action === 'convert') {
      setMobileMenuBaseAction('convert');
      setActiveTab('convert');
      setHistoryViewMode('recent');
      setShowMobileProfile(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'history') {
      setMobileMenuBaseAction('history');
      setActiveTab('history');
      setHistoryViewMode('all');
      setShowMobileProfile(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'buycoffee') {
      openBuyCoffeePage();
    } else {
      setShowMobileProfile(true);
    }
  };

  const handleMobileSearch = () => {
    setShowSearchForm(true);
  };

  const handleCloseSearch = () => {
    setShowSearchForm(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter history based on search query
    if (searchQuery.trim()) {
      setMobileMenuBaseAction('history');
      setActiveTab('history');
      setHistoryViewMode('all');
      setShowMobileProfile(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
          setAvatarUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setUsername(tempUsername);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setTempUsername(username);
    setIsEditingProfile(false);
  };

  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth integration
    console.log('Google login clicked');
    // In production, this would redirect to Google OAuth
    // window.location.href = 'YOUR_GOOGLE_OAUTH_URL';
    setShowLoginModal(false);
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

  const RECENT_HISTORY_LIMIT = 5;
  const HISTORY_ITEMS_PER_PAGE = 6;
  const historyTotalPages = Math.max(1, Math.ceil(history.length / HISTORY_ITEMS_PER_PAGE));
  const historyStartIndex = (historyPage - 1) * HISTORY_ITEMS_PER_PAGE;
  const recentHistory = history.slice(0, RECENT_HISTORY_LIMIT);
  const paginatedHistory = history.slice(historyStartIndex, historyStartIndex + HISTORY_ITEMS_PER_PAGE);
  const historyRangeStart = history.length === 0 ? 0 : historyStartIndex + 1;
  const historyRangeEnd = Math.min(history.length, historyStartIndex + HISTORY_ITEMS_PER_PAGE);

  const maxVisibleHistoryPages = 5;
  const firstVisibleHistoryPage = Math.max(
    1,
    Math.min(historyPage - 2, historyTotalPages - maxVisibleHistoryPages + 1)
  );
  const lastVisibleHistoryPage = Math.min(
    historyTotalPages,
    firstVisibleHistoryPage + maxVisibleHistoryPages - 1
  );
  const visibleHistoryPages = Array.from(
    { length: Math.max(0, lastVisibleHistoryPage - firstVisibleHistoryPage + 1) },
    (_, i) => firstVisibleHistoryPage + i
  );

  useEffect(() => {
    if (historyPage > historyTotalPages) {
      setHistoryPage(historyTotalPages);
    }
  }, [historyPage, historyTotalPages]);

  useEffect(() => {
    if (activeTab === 'history' && historyViewMode === 'all') {
      setHistoryPage(1);
    }
  }, [activeTab, historyViewMode]);

  const overallProgress = files.length > 0
    ? Math.round(files.reduce((total, file) => total + file.progress, 0) / files.length)
    : 0;

  const isHistoryTab = activeTab === 'history';
  const isBuyCoffeeTab = activeTab === 'buycoffee';
  const isHistoryFullPage = isHistoryTab && historyViewMode === 'all';
  const isWidePage = true; // All pages use same width now
  const displayedHistoryItems = isHistoryFullPage ? paginatedHistory : recentHistory;
  const activeMobileMenuAction: MobileMenuAction = showMobileProfile ? 'profile' : mobileMenuBaseAction;

  // Mouse trail images
  const mouseTrailImages = [
    'https://images.unsplash.com/photo-1709949908058-a08659bfa922?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1548192746-dd526f154ed9?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1693581176773-a5f2362209e6?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1584043204475-8cc101d6c77a?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1706049379414-437ec3a54e93?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1709949908219-fd9046282019?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1508873881324-c92a3fc536ba?q=80&w=1200&auto=format',
    'https://images.unsplash.com/photo-1462989856370-729a9c1e2c91?q=80&w=1200&auto=format',
  ];

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
    <>
      <ImageMouseTrail
        items={mouseTrailImages}
        maxNumberOfImages={7}
        distance={30}
        imgClass='w-32 h-40 sm:w-40 sm:h-48'
        className='fixed inset-0 pointer-events-none z-[5]'
      >
        <></>
      </ImageMouseTrail>
      <div className={`app-shell ${isDarkMode ? 'theme-dark' : 'theme-light'} min-h-screen flex flex-col font-sans w-full overflow-hidden relative transition-colors duration-300`}>
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
          <div className={`mobile-top-pill flex items-center space-x-2 backdrop-blur-xl rounded-full px-3 py-2 shadow-lg ${
            isDarkMode 
              ? 'bg-slate-800/80 border border-slate-700/60' 
              : 'bg-white/80 border border-white/40'
          }`}>
            <img src={brandLogo} alt="BUNCONVERT" className="h-8 w-8 object-cover rounded-full" />
            <span className={`brand-text font-bold text-[16px] tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>BUNCONVERT</span>
            <div className={`brand-divider w-px h-5 mx-1 ${isDarkMode ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
            <button 
              onClick={() => setShowLoginModal(true)}
              className="top-nav-login-btn bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white rounded-full px-4 py-1.5 font-bold text-[12px] hover:from-[#1E40AF] hover:to-[#1E3A8A] transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            >
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
            <button 
              onClick={() => setShowLoginModal(true)}
              className="top-nav-signup-btn rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#1E40AF] hover:to-[#1E3A8A] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)]"
            >
              Login
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
              <button 
                onClick={() => setShowLoginModal(true)}
                className="top-nav-signup-btn rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#1E40AF] hover:to-[#1E3A8A] hover:shadow-[0_12px_30px_rgba(37,99,235,0.35)]"
              >
                Login
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
        <div
          className="w-full h-full flex justify-center items-center px-4 sm:px-8 py-24 sm:py-28 lg:py-32"
        >
          
          <div className={`relative w-full shrink-0 flex flex-col ${isWidePage ? 'max-w-[420px]' : 'max-w-[340px]'}`}>
            {/* Title above card */}
            <div className="mb-4 sm:mb-6 text-center">
              <h1 className="converter-title font-serif text-[28px] sm:text-[36px] tracking-tighter text-gray-900 leading-[0.9]">BUNCONVERT</h1>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-[11px] sm:text-[13px] mt-1.5 sm:mt-2 font-bold tracking-wider uppercase drop-shadow-sm">by NGDKLabs</p>
            </div>

            {/* Background tab to mimic layering - only show for convert and history */}
            {!isBuyCoffeeTab && (
              <div className={`converter-tabs mx-4 h-10 flex rounded-t-3xl border border-[#dce5f3] border-b-0 z-0 overflow-hidden text-[10px] font-bold uppercase tracking-[0.1em] -mb-2`}>
                <button 
                  onClick={() => {
                    setMobileMenuBaseAction('convert');
                    setActiveTab('convert');
                    setHistoryViewMode('recent');
                  }}
                  className={`converter-tab-button ${activeTab === 'convert' ? 'active' : ''} flex-1 flex justify-center pt-2 transition-colors ${activeTab === 'convert' ? 'bg-[#E2EAF6] text-gray-500 cursor-default' : 'bg-white/50 text-gray-400 hover:bg-[#E2EAF6]/50'}`}
                >
                  Conversion
                </button>
                <button 
                  onClick={() => {
                    setActiveTab('history');
                    setHistoryViewMode('recent');
                  }}
                  className={`converter-tab-button ${activeTab === 'history' ? 'active' : ''} flex-1 flex justify-center pt-2 transition-colors ${activeTab === 'history' ? 'bg-[#E2EAF6] text-gray-500 cursor-default' : 'bg-white/50 text-gray-400 hover:bg-[#E2EAF6]/50'}`}
                >
                  History
                </button>
              </div>
            )}

            
            {/* Main Card */}
            <div 
              className={`converter-card bg-white rounded-[32px] shadow-[0_12px_40px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col z-10 transition-all duration-300 relative ${
                isWidePage
                  ? 'h-auto'
                  : 'h-auto max-h-[65vh] sm:max-h-[70vh]'
              } ${isDragging && activeTab === 'convert' ? 'ring-4 ring-4 ring-blue-500 scale-[1.02]' : ''}`}
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
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className={`add-files-btn group relative flex w-full flex-col items-center justify-center rounded-[26px] border-2 border-dashed px-4 py-4 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 sm:py-5 ${
                        isDarkMode
                          ? 'border-slate-500/80 bg-slate-900/60 hover:border-blue-300/75 hover:bg-slate-800/80 active:border-blue-200 active:bg-slate-800/95'
                          : 'border-slate-300 bg-[#F8FAFD] hover:border-blue-400 hover:bg-[#EEF4FF] active:border-blue-600 active:bg-[#E3ECFD]'
                      }`}
                    >
                      <div
                        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 ${
                          isDarkMode
                            ? 'border-slate-400/70 bg-slate-800/70 text-slate-100 group-hover:border-blue-300 group-hover:text-blue-200'
                            : 'border-slate-300 bg-white text-slate-700 group-hover:border-blue-400 group-hover:text-blue-600'
                        }`}
                      >
                        <Upload className="h-5 w-5" strokeWidth={2.2} />
                      </div>
                      <p className={`text-[13px] font-semibold leading-tight sm:text-[14px] ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        <span className={isDarkMode ? 'text-blue-200' : 'text-blue-700'}>Click to upload</span>
                        <span className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}> • drag and drop</span>
                      </p>
                      <span className={`mt-0.5 text-[11px] font-medium sm:text-[12px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Supports all file types
                      </span>
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
              ) : activeTab === 'history' ? (
                <div className={`flex flex-col h-full flex-1 animate-in fade-in duration-300 ${isDarkMode ? 'bg-slate-900/35' : 'bg-white'}`}>
                  <div className={`p-5 border-b shrink-0 flex justify-between items-center ${isDarkMode ? 'border-slate-700/70 bg-slate-900/45' : 'border-gray-50 bg-gray-50/50'}`}>
                    <div>
                      <h3 className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>Conversion History</h3>
                      <p className={`text-[11px] font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                        {isHistoryFullPage
                          ? `Showing ${historyRangeStart}-${historyRangeEnd} of ${history.length}`
                          : `Showing latest ${Math.min(history.length, RECENT_HISTORY_LIMIT)} of ${history.length}`}
                      </p>
                    </div>
                    <span className={`history-count-badge text-[12px] font-medium px-2.5 py-1 rounded-md shadow-sm border ${isDarkMode ? 'bg-slate-900/70 text-slate-300 border-slate-700/70' : 'text-gray-500 bg-white border-gray-100'}`}>
                      {history.length} items
                    </span>
                  </div>

                  <div className="history-list-area px-4 sm:px-5 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1 min-h-0">
                    {history.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-center">
                        <Archive className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1.5} />
                        <h4 className={`font-bold mb-1 ${isDarkMode ? 'text-slate-200' : 'text-gray-600'}`}>No conversions yet</h4>
                        <p className={`text-[13px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Files you convert will appear here</p>
                      </div>
                    ) : (
                      <div className="grid gap-2.5 pb-2">
                        <AnimatePresence initial={false}>
                          {displayedHistoryItems.map(item => (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              key={item.id}
                              className={`history-item-card group rounded-[20px] border px-3.5 py-3 flex items-center justify-between gap-3 transition-all ${
                                isDarkMode
                                  ? 'border-slate-700/75 bg-slate-900/70 hover:border-blue-400/45'
                                  : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-3 overflow-hidden min-w-0 flex-1">
                                <div
                                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden cursor-pointer transition-all relative ${
                                    isDarkMode
                                      ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-blue-200 hover:ring-2 hover:ring-blue-400/60'
                                      : 'bg-gradient-to-br from-blue-50 to-blue-100 text-[#1E40AF] hover:ring-2 hover:ring-blue-400 hover:shadow-lg hover:shadow-blue-300/30 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent'
                                  }`}
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

                                <div className="flex-1 min-w-0 pr-1">
                                  <div className={`text-[13.5px] font-semibold truncate mb-0.5 ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`} title={item.name}>
                                    {item.name}
                                  </div>
                                  <div className={`flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                                    <span className={`${isDarkMode ? 'text-slate-300' : 'text-gray-500'} font-bold uppercase tracking-tight`}>
                                      {item.originalType.split('/')[1] || 'FILE'}
                                    </span>
                                    <span>→</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#1E40AF] font-bold uppercase tracking-tight drop-shadow-sm">
                                      {item.targetFormat}
                                    </span>
                                    <span>•</span>
                                    <span>{(item.originalSize / 1024 / 1024).toFixed(1)} MB</span>
                                    <span>•</span>
                                    <span>{item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => downloadHistoryItem(item)}
                                className={`history-download-btn w-[34px] h-[34px] rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-md relative overflow-hidden ${
                                  isDarkMode
                                    ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-blue-200 hover:from-[#2563EB] hover:to-[#1E40AF] hover:text-white hover:shadow-lg hover:shadow-blue-700/40'
                                    : 'bg-gradient-to-br from-blue-50 to-blue-100 text-[#1E40AF] hover:from-[#2563EB] hover:to-[#1E40AF] hover:text-white hover:shadow-lg hover:shadow-blue-400/40 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-100 hover:before:opacity-0 before:transition-opacity'
                                }`}
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

                  {isHistoryFullPage && historyTotalPages > 1 && (
                    <div className={`history-pagination px-4 sm:px-5 py-3 border-t shrink-0 flex items-center justify-between gap-2 ${isDarkMode ? 'border-slate-700/70 bg-slate-900/45' : 'border-gray-100 bg-white'}`}>
                      <button
                        type="button"
                        onClick={() => setHistoryPage(prev => Math.max(1, prev - 1))}
                        disabled={historyPage === 1}
                        className={`min-w-[74px] rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                          historyPage === 1
                            ? isDarkMode
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isDarkMode
                              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Prev
                      </button>

                      <div className="flex items-center gap-1.5">
                        {visibleHistoryPages.map(page => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setHistoryPage(page)}
                            className={`h-7 min-w-7 rounded-full px-2 text-[11px] font-bold transition-all ${
                              historyPage === page
                                ? 'bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white shadow-md shadow-blue-500/35'
                                : isDarkMode
                                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setHistoryPage(prev => Math.min(historyTotalPages, prev + 1))}
                        disabled={historyPage === historyTotalPages}
                        className={`min-w-[74px] rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                          historyPage === historyTotalPages
                            ? isDarkMode
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : isDarkMode
                              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`flex flex-col animate-in fade-in duration-300 ${isDarkMode ? 'bg-slate-900/35' : 'bg-white'}`}>
                  <div className={`p-4 border-b shrink-0 ${isDarkMode ? 'border-slate-700/70 bg-slate-900/45' : 'border-gray-100 bg-gray-50/50'}`}>
                    <h3 className={`font-bold text-sm ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>Buy me coffee</h3>
                    <p className={`text-[11px] mt-0.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      Support via crypto EVM or QRIS
                    </p>
                  </div>

                  <div className="px-4 py-3 space-y-2.5">
                    {/* EVM Wallet - Compact */}
                    <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-slate-700/75 bg-slate-900/70' : 'border-gray-100 bg-white'}`}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-blue-300' : 'bg-blue-50 text-[#627EEA]'}`}>
                            <EthLogo className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>EVM Wallet</p>
                            <p className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>USDT / USDC / ETH</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyPaymentValue('evm', SUPPORT_PAYMENTS.evmAddress)}
                          className={`h-7 rounded-full px-2.5 text-[10px] font-semibold flex items-center gap-1 transition-colors ${isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {copiedPaymentField === 'evm' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedPaymentField === 'evm' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className={`rounded-lg border px-2.5 py-2 text-[10px] font-mono break-all ${isDarkMode ? 'border-slate-700 bg-slate-950/60 text-slate-200' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                        {SUPPORT_PAYMENTS.evmAddress}
                      </div>
                    </div>

                    {/* QRIS - Compact */}
                    <div className={`rounded-2xl border p-3 ${isDarkMode ? 'border-slate-700/75 bg-slate-900/70' : 'border-gray-100 bg-white'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-red-300' : 'bg-red-50 text-red-600'}`}>
                          <QrisLogo className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-[11px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>QRIS</p>
                          <p className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Scan to support</p>
                        </div>
                      </div>
                      <div className={`rounded-lg border p-2 flex items-center justify-center ${isDarkMode ? 'border-slate-700 bg-slate-950/60' : 'border-gray-200 bg-gray-50'}`}>
                        <div className={`h-32 w-32 rounded-xl border-2 border-dashed grid place-content-center text-center px-3 ${isDarkMode ? 'border-slate-600 text-slate-400' : 'border-gray-300 text-gray-500'}`}>
                          <QrisLogo className="h-10 w-10 mx-auto mb-1.5" />
                          <span className="text-[10px] font-semibold">Place QRIS here</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[170] bg-slate-950/40 backdrop-blur-md"
              onClick={() => setShowLoginModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed left-1/2 top-1/2 z-[175] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
            >
              <div className={`rounded-[32px] border shadow-2xl overflow-hidden ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
                {/* Header */}
                <div className={`relative px-6 pt-6 pb-4 ${isDarkMode ? 'bg-slate-800/50' : 'bg-gradient-to-b from-blue-50/50 to-transparent'}`}>
                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                  >
                    <X className="h-4 w-4" strokeWidth={2.5} />
                  </button>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-3 flex h-16 w-16 items-center justify-center rounded-[20px] shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-blue-600 to-blue-800' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                      <img src={brandLogo} alt="BUNCONVERT" className="h-12 w-12 rounded-[16px] object-cover" />
                    </div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                      Welcome to BUNCONVERT
                    </h2>
                    <p className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Sign in to save your conversion history and access premium features
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className={`group relative flex w-full items-center justify-center gap-3 rounded-2xl border-2 px-6 py-4 font-semibold transition-all duration-200 ${
                      isDarkMode
                        ? 'border-slate-700 bg-slate-800 text-slate-100 hover:border-slate-600 hover:bg-slate-750 active:scale-[0.98]'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] shadow-sm'
                    }`}
                  >
                    <GoogleLogo className="h-6 w-6" />
                    <span>Continue with Google</span>
                  </button>

                  <div className="mt-6 flex items-center gap-3">
                    <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                    <span className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                      Or
                    </span>
                    <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className={`mt-4 w-full rounded-2xl px-6 py-3.5 text-sm font-semibold transition-colors ${
                      isDarkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Continue as Guest
                  </button>

                  <p className={`mt-4 text-center text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                    By continuing, you agree to our{' '}
                    <a href="#" className={`font-semibold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className={`font-semibold ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed inset-x-0 bottom-6 z-[82] flex justify-center px-3 sm:hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
          className="flex w-full max-w-[372px] items-center gap-2"
        >
          <AnimatePresence mode="wait">
            {showSearchForm ? (
              <motion.form
                key="search-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onSubmit={handleSearchSubmit}
                className={`mobile-dock relative flex h-[54px] flex-1 items-center overflow-visible rounded-full border px-[12px] shadow-[0_18px_38px_rgba(15,23,42,0.16),0_8px_18px_rgba(255,255,255,0.42)_inset] backdrop-blur-[28px] ${
                  isDarkMode
                    ? 'border-slate-600/80 bg-[linear-gradient(180deg,rgba(30,41,59,0.92)_0%,rgba(30,41,59,0.64)_48%,rgba(15,23,42,0.82)_100%)]'
                    : 'border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.64)_48%,rgba(245,247,251,0.82)_100%)]'
                }`}
              >
                <span className={`pointer-events-none absolute inset-[1px] rounded-full border ${isDarkMode ? 'border-slate-700/70' : 'border-white/70'}`} />
                <span className={`pointer-events-none absolute left-7 right-7 top-[5px] h-[16px] rounded-full blur-md ${isDarkMode ? 'bg-slate-700/65' : 'bg-white/65'}`} />
                <span className={`pointer-events-none absolute inset-x-10 bottom-[3px] h-[14px] rounded-full blur-lg ${isDarkMode ? 'bg-slate-800/20' : 'bg-slate-300/20'}`} />
                
                <div className="relative z-10 flex h-full w-full items-center gap-2 rounded-full px-2">
                  <Search className={`h-5 w-5 shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-[#6B7280]'}`} strokeWidth={2.25} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history..."
                    autoFocus
                    className={`flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:font-normal ${
                      isDarkMode 
                        ? 'text-slate-200 placeholder:text-slate-500' 
                        : 'text-[#111827] placeholder:text-[#9CA3AF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleCloseSearch}
                    className={`flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full transition-colors ${
                      isDarkMode
                        ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                        : 'text-[#6B7280] hover:bg-gray-100/50 hover:text-[#111827]'
                    }`}
                  >
                    <X className="h-5 w-5" strokeWidth={2.25} />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="menu-buttons"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`mobile-dock relative flex h-[54px] flex-1 items-center justify-between overflow-visible rounded-full border px-[6px] shadow-[0_18px_38px_rgba(15,23,42,0.16),0_8px_18px_rgba(255,255,255,0.42)_inset] backdrop-blur-[28px] ${
                  isDarkMode
                    ? 'border-slate-600/80 bg-[linear-gradient(180deg,rgba(30,41,59,0.92)_0%,rgba(30,41,59,0.64)_48%,rgba(15,23,42,0.82)_100%)]'
                    : 'border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.64)_48%,rgba(245,247,251,0.82)_100%)]'
                }`}
              >
                <span className={`pointer-events-none absolute inset-[1px] rounded-full border ${isDarkMode ? 'border-slate-700/70' : 'border-white/70'}`} />
                <span className={`pointer-events-none absolute left-7 right-7 top-[5px] h-[16px] rounded-full blur-md ${isDarkMode ? 'bg-slate-700/65' : 'bg-white/65'}`} />
                <span className={`pointer-events-none absolute inset-x-10 bottom-[3px] h-[14px] rounded-full blur-lg ${isDarkMode ? 'bg-slate-800/20' : 'bg-slate-300/20'}`} />

                {mobileMenuItems.map(({ key, label, icon: Icon }) => {
                  const isActive = activeMobileMenuAction === key;
                  const showHistoryBadge = key === 'history' && history.length > 0;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleMobileMenuAction(key)}
                      className="relative z-10 flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-full text-center"
                    >
                      <motion.div
                        animate={{ y: 0, scale: isActive ? 1 : 0.96 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className={`relative flex h-full w-full flex-col items-center justify-center gap-[3px] overflow-hidden rounded-full p-[6px] ${
                          isActive
                            ? isDarkMode
                              ? 'border border-slate-400/50 bg-slate-700/60 text-[#BFDBFE] shadow-[0_8px_18px_rgba(15,23,42,0.20),0_1px_0_rgba(203,213,225,0.12)_inset]'
                              : 'border border-blue-200/60 bg-gradient-to-b from-white/80 via-blue-50/40 to-blue-100/30 text-[#2563EB] shadow-[0_8px_18px_rgba(59,130,246,0.15),0_1px_0_rgba(255,255,255,0.50)_inset]'
                            : isDarkMode
                              ? 'text-[#94A3B8]'
                              : 'text-[#6B7280]'
                        }`}
                      >
                        {isActive ? (
                          <span
                            className={`pointer-events-none absolute inset-[3px] rounded-full ${
                              isDarkMode
                                ? 'bg-slate-600/40'
                                : 'bg-gradient-to-b from-white/60 to-transparent'
                            }`}
                          />
                        ) : null}

                        <span className="relative z-10 flex items-center justify-center">
                          <Icon
                            className={`${
                              isActive
                                ? isDarkMode
                                  ? 'h-[22px] w-[22px] text-[#1D4ED8]'
                                  : 'h-[22px] w-[22px] text-[#2563EB]'
                                : isDarkMode
                                  ? 'h-[20px] w-[20px] text-[#94A3B8]'
                                  : 'h-[20px] w-[20px]'
                            }`}
                            strokeWidth={2.35}
                          />

                          {showHistoryBadge ? (
                            <span className="absolute -right-[8px] -top-[6px] flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-[#ef4444] px-1 text-[9px] font-bold leading-none text-white shadow-[0_6px_14px_rgba(239,68,68,0.3)]">
                              {Math.min(history.length, 99)}
                            </span>
                          ) : null}
                        </span>

                        <span
                          className={`relative z-10 text-[9px] font-semibold leading-none tracking-tight ${
                            isActive
                              ? isDarkMode
                                ? 'text-[#1E40AF]'
                                : 'text-[#2563EB]'
                              : isDarkMode
                                ? 'text-[#94A3B8]'
                                : 'text-[#6B7280]'
                          }`}
                        >
                          {label}
                        </span>
                      </motion.div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={handleMobileSearch}
            whileTap={{ scale: 0.95 }}
            className={`mobile-search-btn relative z-10 flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full border shadow-[0_12px_26px_rgba(15,23,42,0.2),0_5px_12px_rgba(255,255,255,0.42)_inset] ${
              showSearchForm
                ? isDarkMode
                  ? 'border-slate-600/90 bg-[linear-gradient(180deg,rgba(51,65,85,0.97)_0%,rgba(30,41,59,0.96)_100%)] text-slate-300'
                  : 'border-blue-200/90 bg-[linear-gradient(180deg,rgba(219,234,254,0.97)_0%,rgba(191,219,254,0.96)_100%)] text-[#2563EB]'
                : isDarkMode
                  ? 'border-slate-600/90 bg-[linear-gradient(180deg,rgba(30,41,59,0.97)_0%,rgba(15,23,42,0.96)_100%)] text-slate-400'
                  : 'border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(247,248,251,0.96)_100%)] text-[#4B5563]'
            }`}
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
                    <div className="relative">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-lg">
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      </div>
                      {isEditingProfile && (
                        <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors">
                          <Upload className="h-3 w-3" strokeWidth={2.5} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2563EB]">Profile</p>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-blue-300 bg-white px-2 py-1 text-lg font-bold tracking-tight text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Enter username"
                        />
                      ) : (
                        <h3 className="mt-1 text-lg font-bold tracking-tight text-slate-900">{username}</h3>
                      )}
                      <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
                        Quick access to your recent activity, converter tab, and support links.
                      </p>
                    </div>

                    {isEditingProfile ? (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
                          aria-label="Save profile"
                        >
                          <Check className="h-4.5 w-4.5" strokeWidth={2.5} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)] hover:bg-white transition-colors"
                          aria-label="Cancel edit"
                        >
                          <X className="h-4.5 w-4.5" strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setTempUsername(username);
                        }}
                        className="mobile-profile-close-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.08)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        aria-label="Edit profile"
                      >
                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
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
                          setMobileMenuBaseAction('history');
                          setActiveTab('history');
                          setHistoryViewMode('all');
                          setShowMobileProfile(false);
                        }}
                        className="mobile-profile-secondary-btn flex-1 rounded-full bg-white px-4 py-3 text-[13px] font-semibold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                      >
                        Open history
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openBuyCoffeePage();
                          setShowMobileProfile(false);
                        }}
                        className="mobile-profile-primary-btn flex-1 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.35)]"
                      >
                        Buy me coffee
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

                <ConversionBeamLoader
                  progress={overallProgress}
                  fileCount={files.length}
                  fileNames={files.map(file => file.name)}
                  isDarkMode={isDarkMode}
                />
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

    </div>
    </>
  );
}
