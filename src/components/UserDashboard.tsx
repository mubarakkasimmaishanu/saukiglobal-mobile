import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wallet,
  PlusCircle,
  Send,
  Smartphone,
  Wifi,
  GraduationCap,
  Lightbulb,
  Tv,
  FileText,
  History,
  User as UserIcon,
  Home,
  Eye,
  EyeOff,
  ArrowUpRight,
  MessageSquare,
  Zap,
  RefreshCcw,
  RefreshCw,
  Cpu,
  Globe2,
  Briefcase,
  PhoneCall,
  Download,
  Share2,
  X,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigation } from '../context/NavigationContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import TransactionTable from './TransactionTable';
import { shareReceiptAsImage, downloadReceiptImage } from '../services/receiptShare';

const cleanErrorMessage = (details: string): string => {
  if (!details) return 'Unknown error occurred';

  if (details.includes('<html') || details.includes('<!DOCTYPE') || details.includes('<body') || details.includes('<div')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(details, 'text/html');
      
      const h1 = doc.querySelector('h1')?.textContent?.trim();
      const h2 = doc.querySelector('h2')?.textContent?.trim();
      const p = doc.querySelector('p')?.textContent?.trim();
      const title = doc.title?.trim();

      let error = '';
      if (h1 && h2) {
        error = `${h1}: ${h2}`;
      } else if (h1) {
        error = h1;
      } else if (h2) {
        error = h2;
      } else if (title) {
        error = title;
      } else if (p) {
        error = p;
      } else {
        error = doc.body?.textContent?.trim() || 'Internal Server Error';
      }

      error = error.replace(/\s+/g, ' ').trim();
      if (error.length > 150) {
        error = error.substring(0, 150) + '...';
      }
      return error || 'Internal Server Error';
    } catch (e) {
      return 'Method Not Allowed (405)';
    }
  }

  if (details.includes('Last API log:')) {
    const parts = details.split('Last API log:');
    if (parts.length > 1) {
      const logPart = parts[1].split('. REFUNDED')[0].trim();
      if (logPart.length > 0) return logPart;
    }
  }

  return details;
};

interface UserDashboardProps {
  onNavigate: (view: any) => void;
}

export default function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user, refreshUser } = useUser();
  const { registerBackHandler } = useNavigation();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [virtualAccounts, setVirtualAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    if (selectedTx !== null) {
      const unregister = registerBackHandler(() => {
        setSelectedTx(null);
        return true;
      });
      return unregister;
    }
  }, [selectedTx, registerBackHandler]);

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'airtime': return Smartphone;
      case 'data': return Wifi;
      case 'transfer': return Send;
      case 'electricity': return Lightbulb;
      case 'cable': return Tv;
      case 'exam': return BookOpen;
      case 'nin': return FileText;
      case 'funding': return Wallet;
      case 'ratel_call':
      case 'ratel': return PhoneCall;
      default: return Zap;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-[#66df75]';
      case 'Failed': return 'text-[#ef4444]';
      case 'Pending': return 'text-[#f59e0b]';
      default: return 'text-[#e1e3e4]/40';
    }
  };

  // Pull to Refresh & Manual Refresh States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshState, setRefreshState] = useState<'idle' | 'pulling' | 'refreshing'>('idle');

  // KYC States
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycOption, setKycOption] = useState<'nin' | 'bvn'>('bvn');
  const [kycValue, setKycValue] = useState('');
  const [kycError, setKycError] = useState<string | null>(null);
  const [isGeneratingVa, setIsGeneratingVa] = useState(false);
  const [vaSuccessMsg, setVaSuccessMsg] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const txs = await api.getTransactions();
      if (Array.isArray(txs)) {
        setRecentTransactions(txs.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVirtualAccounts = async () => {
    try {
      const res = await api.getVirtualAccounts();
      if (res.success && Array.isArray(res.data)) {
        setVirtualAccounts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch virtual accounts:", err);
    }
  };

  const fetchNotificationsCount = async () => {
    try {
      const res = await api.getUnreadNotificationsCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.unread_count);
      }
    } catch (err) {
      console.error("Failed to fetch notifications count:", err);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchTransactions();
    fetchVirtualAccounts();
    fetchNotificationsCount();
  }, []);

  const triggerRefresh = async (fromPull = false) => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (fromPull) {
      setRefreshState('refreshing');
      setPullDistance(60);
    }
    try {
      await Promise.all([
        refreshUser(),
        fetchTransactions(),
        fetchVirtualAccounts(),
        fetchNotificationsCount(),
      ]);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
      if (fromPull) {
        setRefreshState('idle');
        setPullDistance(0);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      setStartY(e.touches[0].clientY);
      setRefreshState('pulling');
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (refreshState === 'pulling') {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      if (diff > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }
        const distance = Math.min(diff * 0.4, 90);
        setPullDistance(distance);
      } else {
        setPullDistance(0);
        setRefreshState('idle');
      }
    }
  };

  const handleTouchEnd = () => {
    if (refreshState === 'pulling') {
      if (pullDistance >= 60) {
        triggerRefresh(true);
      } else {
        setPullDistance(0);
        setRefreshState('idle');
      }
    }
  };

  const handleCopy = (num: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(num).then(() => {
        setCopiedText(num);
        setTimeout(() => setCopiedText(null), 1500);
      }).catch(err => {
        fallbackCopy(num);
      });
    } else {
      fallbackCopy(num);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1500);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleGenerateAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(kycValue)) {
      setKycError(`${kycOption.toUpperCase()} must be exactly 11 digits.`);
      return;
    }
    setKycError(null);
    setIsGeneratingVa(true);
    try {
      const bvn = kycOption === 'bvn' ? kycValue : '';
      const nin = kycOption === 'nin' ? kycValue : '';
      const res = await api.createVirtualAccount(bvn, nin);
      if (res.success) {
        setVaSuccessMsg('Accounts generated successfully!');
        
        // Reload virtual accounts list
        const accountsRes = await api.getVirtualAccounts();
        if (accountsRes.success && Array.isArray(accountsRes.data)) {
          setVirtualAccounts(accountsRes.data);
        }
        
        setTimeout(() => {
          setShowKycModal(false);
          setVaSuccessMsg(null);
          setKycValue('');
        }, 1500);
      } else {
        setKycError(res.message || 'Failed to generate virtual accounts.');
      }
    } catch (err: any) {
      setKycError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsGeneratingVa(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen bg-[#111415] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(102,223,117,0.3)]" />
        <div className="w-8 h-8 border-4 border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#66df75] font-black tracking-widest text-xs uppercase">Loading SaukiGlobal...</p>
      </div>
    </div>
  );

  const ServiceButton = ({ icon: Icon, image, title, onClick }: { icon?: any, image?: string, title: string, onClick: () => void, key?: any }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-3 group transition-all"
    >
      <div className="w-16 h-16 glass-card flex items-center justify-center group-hover:bg-[#66df75]/10 group-active:scale-95 group-hover:border-[#66df75]/30 transition-all duration-300 shadow-lg overflow-hidden p-3.5">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-contain rounded-xl filter brightness-90 group-hover:brightness-100 transition-all" />
        ) : (
          Icon && <Icon size={28} className="text-[#e1e3e4] group-hover:text-[#66df75] transition-colors" />
        )}
      </div>
      <span className="text-[10px] font-bold text-[#e1e3e4]/70 uppercase tracking-wider group-hover:text-[#66df75]">
        {title}
      </span>
    </button>
  );

  // Service configuration for ecosystem features
  const servicesConfig = [
    { id: 'data', title: 'Data', icon: Wifi, onClick: () => onNavigate('data'), visible: true },
    { id: 'airtime', title: 'Airtime', icon: Smartphone, onClick: () => onNavigate('airtime'), visible: true },
    { id: 'ratel', title: 'Ratel', icon: PhoneCall, onClick: () => onNavigate('ratel'), visible: true, image: '/icons/ratel.png' },
    { id: 'cable', title: 'Cable TV', icon: Tv, onClick: () => onNavigate('cable'), visible: true },
    { id: 'electricity', title: 'Electricity', icon: Lightbulb, onClick: () => onNavigate('electricity'), visible: true },
    { id: 'exams', title: 'Exams', icon: GraduationCap, onClick: () => onNavigate('exams'), visible: true },
    { id: 'alpha', title: 'Alpha', icon: Zap, onClick: () => onNavigate('alpha'), visible: true, image: '/icons/alpha.png' },
    { id: 'kirani', title: 'Kirani', icon: RefreshCcw, onClick: () => onNavigate('kirani'), visible: true, image: '/icons/kirani icon.png' },
    { id: 'smile', title: 'Smile', icon: Wifi, onClick: () => onNavigate('smile'), visible: true, image: '/icons/smile.png' },
    { id: 'a2c', title: 'A2C', icon: ArrowUpRight, onClick: () => onNavigate('a2c'), visible: false },
    { id: 'nin', title: 'NIN', icon: FileText, onClick: () => onNavigate('nin'), visible: false },
    { id: 'history', title: 'History', icon: History, onClick: () => onNavigate('history'), visible: false },
    { id: 'esim', title: 'eSIM', icon: Cpu, onClick: () => onNavigate('esim'), visible: true, image: '/icons/esim.png' },
    { id: 'reseller', title: 'Reseller', icon: Briefcase, onClick: () => onNavigate('reseller-upgrade'), visible: true },
    { id: 'referrals', title: 'Referrals', icon: Share2, onClick: () => onNavigate('referrals'), visible: true },
    { id: 'cac', title: 'CAC', icon: Briefcase, onClick: () => onNavigate('cac'), visible: false },
    { id: 'intl', title: 'Intl Topup', icon: Globe2, onClick: () => onNavigate('intl'), visible: false },
    { id: 'more', title: 'More', icon: PlusCircle, onClick: () => onNavigate('pricing'), visible: false },
  ];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-24 relative overflow-x-hidden"
    >
      {/* Pull-to-refresh spinner */}
      {pullDistance > 0 && (
        <div 
          className="fixed top-6 left-0 right-0 flex items-center justify-center pointer-events-none z-50 transition-transform duration-75"
          style={{ 
            transform: `translateY(${pullDistance}px)` 
          }}
        >
          <div className="bg-[#1a1e20] border border-[#66df75]/25 shadow-[0_8px_24px_rgba(0,0,0,0.6)] rounded-full p-2.5 flex items-center justify-center">
            <RefreshCw 
              size={18} 
              className={`text-[#66df75] ${refreshState === 'refreshing' ? 'animate-spin' : ''}`}
              style={{ 
                transform: refreshState !== 'refreshing' ? `rotate(${pullDistance * 5}deg)` : undefined 
              }} 
            />
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="py-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(102,223,117,0.3)]" />
            <div>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.2em]">{greeting}</p>
              <h1 className="text-base font-bold text-white tracking-tight">{user?.firstName || 'User'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerRefresh(false)}
              disabled={isRefreshing}
              className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={`text-[#e1e3e4] ${isRefreshing && refreshState !== 'refreshing' ? 'animate-spin text-[#66df75]' : ''}`} />
            </button>
            <button
              onClick={() => onNavigate('notifications')}
              className="w-10 h-10 glass-panel flex items-center justify-center relative hover:bg-white/10 transition-colors active:scale-95"
            >
              <Bell size={18} className="text-[#e1e3e4]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-[#111415] shadow-[0_0_10px_#ef4444] animate-in zoom-in-50 duration-200">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>
 
        {/* Balance Card */}
        <div className="card-mesh rounded-3xl p-4 sm:p-5 mb-4 relative overflow-hidden shadow-xl border border-white/5">
          <div className="absolute top-3 right-3">
            <span className="text-[9px] font-black bg-[#66df75]/20 text-[#66df75] px-2.5 py-0.5 rounded-full border border-[#66df75]/30 uppercase tracking-widest">
              {user.tier || (user.isReseller ? 'Reseller' : 'Member')}
            </span>
          </div>

          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-[#e1e3e4]/50 uppercase tracking-widest">Available Balance</p>
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-[#66df75] p-0.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  {showBalance ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-0.5">
                {showBalance ? `₦${(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
              </h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/50 uppercase tracking-widest">Cashback:</span>
                  <span className="text-[11px] font-black text-[#66df75] tracking-widest">
                    {showBalance ? `₦${(user.cashback || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                  </span>
                </div>
                {(user.isReseller || user.tier === 'Reseller' || user.tier === 'Reseller Pro') && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#e1e3e4]/50 uppercase tracking-widest">Commission:</span>
                    <span className="text-[11px] font-black text-[#66df75] tracking-widest">
                      {showBalance ? `₦${(user.commissionBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onNavigate('fund')}
              className="bg-[#66df75] text-[#111415] hover:bg-[#52c860] active:scale-95 py-2 px-3.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(102,223,117,0.2)]"
            >
              <PlusCircle size={14} />
              <span>Add Money</span>
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#66df75]">Ecosystem Services</h3>
            <span className="w-12 h-[1px] bg-[#66df75]/30"></span>
          </div>
          
          <div className="grid grid-cols-4 gap-y-8 gap-x-4">
            {servicesConfig
              .filter(s => s.visible)
              .map(s => (
                <ServiceButton key={s.id} icon={s.icon} image={s.image} title={s.title} onClick={s.onClick} />
              ))
            }
          </div>
        </section>

        {/* Reseller Banner (Prompts Non-Reseller Users) */}
        {!user.isReseller && (
          <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-[#111415] to-black border border-[#66df75]/30 relative overflow-hidden shadow-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#66df75]/20 text-[#66df75] text-[9px] font-black uppercase tracking-widest border border-[#66df75]/30">
                  Upgrade Tier
                </span>
                <span className="text-xs font-black text-white">Earn 2x Referral Bonus</span>
              </div>
              <p className="text-[11px] text-[#e1e3e4]/70 font-medium">Upgrade to Reseller for wholesale data rates & 2% referral earnings!</p>
            </div>
            <button
              onClick={() => onNavigate('reseller-upgrade')}
              className="px-4 py-2.5 rounded-xl bg-[#66df75] hover:bg-[#52c860] text-[#111415] font-black text-xs uppercase tracking-wider shrink-0 shadow-[0_4px_12px_rgba(102,223,117,0.2)] active:scale-95 transition-all"
            >
              Upgrade
            </button>
          </div>
        )}

        {/* Recent Transactions */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#66df75]">Recent Activity</h3>
            <button 
              onClick={() => onNavigate('history')}
              className="text-[10px] font-bold uppercase tracking-widest text-[#e1e3e4]/40 hover:text-[#66df75] transition-colors"
            >
              See All
            </button>
          </div>

          <div className="space-y-4">
            <TransactionTable 
              transactions={recentTransactions} 
              isLoading={isLoading} 
              onRowClick={setSelectedTx}
            />
          </div>
        </section>

        {/* Navbar */}
        <nav className="fixed bottom-6 left-6 right-6 h-18 glass-panel flex justify-around items-center px-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
          <button onClick={() => onNavigate('dashboard')} className="flex flex-col items-center gap-1.5 group">
            <Home size={22} className="text-[#66df75]" />
            <span className="text-[8px] font-black text-[#66df75] uppercase tracking-widest">Home</span>
          </button>
          <button onClick={() => onNavigate('history')} className="flex flex-col items-center gap-1.5 group text-[#e1e3e4]/40 hover:text-[#66df75] transition-all">
            <History size={22} />
            <span className="text-[8px] font-black uppercase tracking-widest">History</span>
          </button>
          <button onClick={() => onNavigate('support')} className="flex flex-col items-center gap-1.5 group text-[#e1e3e4]/40 hover:text-[#66df75] transition-all">
            <MessageSquare size={22} />
            <span className="text-[8px] font-black uppercase tracking-widest">Support</span>
          </button>
          <button onClick={() => onNavigate('profile')} className="flex flex-col items-center gap-1.5 group text-[#e1e3e4]/40 hover:text-[#66df75] transition-all">
            <UserIcon size={22} />
            <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
          </button>
        </nav>

      </div>

      {/* KYC Modal for Virtual Account Generation (Mirroring wallet.php) */}
      {showKycModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowKycModal(false)}></div>
          <div className="relative bg-[#0b120c]/90 backdrop-blur-xl border border-white/10 w-full max-w-sm rounded-[2rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
              <h3 className="text-base font-black text-white uppercase tracking-wider">Get Transfer Accounts</h3>
              <button 
                onClick={() => setShowKycModal(false)}
                className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest font-black"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            {vaSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-[#66df75]/10 rounded-full flex items-center justify-center mx-auto text-[#66df75]">
                  <PlusCircle size={24} />
                </div>
                <p className="text-xs text-white font-bold">{vaSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleGenerateAccounts} className="space-y-4">
                <p className="text-[10px] text-white/50 leading-relaxed">
                  To comply with Central Bank regulations, please provide your BVN or NIN to generate your personal virtual transfer accounts instantly.
                </p>

                {kycError && (
                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] font-semibold rounded-xl">
                    {kycError}
                  </div>
                )}

                {/* Radio Selector */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setKycOption('bvn'); setKycValue(''); setKycError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${kycOption === 'bvn' ? 'bg-[#66df75]/10 border-[#66df75]/30 text-white font-black' : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'}`}
                  >
                    <span className="text-xs uppercase tracking-wider">BVN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setKycOption('nin'); setKycValue(''); setKycError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${kycOption === 'nin' ? 'bg-[#66df75]/10 border-[#66df75]/30 text-white font-black' : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'}`}
                  >
                    <span className="text-xs uppercase tracking-wider">NIN</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-bold text-[#66df75] uppercase tracking-widest">
                    Enter {kycOption.toUpperCase()}
                  </label>
                  <input 
                    type="text" 
                    required 
                    maxLength={11}
                    value={kycValue}
                    onChange={(e) => setKycValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="11-digit number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base font-bold font-mono focus:border-[#66df75]/50 outline-none transition-all placeholder:text-white/10 text-center tracking-[0.1em]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isGeneratingVa || kycValue.length !== 11}
                  className="w-full btn-primary py-3.5 mt-4 flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale transition-all text-xs uppercase tracking-widest font-black"
                >
                  {isGeneratingVa ? (
                    <div className="w-4 h-4 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Generate Accounts</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-6 pb-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#111415]/80 backdrop-blur-md" onClick={() => setSelectedTx(null)}></div>
          
          <div className={`w-full max-w-sm glass-panel p-8 relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500 z-[110] ${selectedTx.status === 'Failed' ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${selectedTx.status === 'Failed' ? 'via-[#ef4444]' : 'via-[#66df75]'} to-transparent`}></div>
            
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 ${selectedTx.status === 'Failed' ? 'bg-[#ef4444]' : 'bg-[#66df75]'} rounded-md flex items-center justify-center text-[#111415]`}>
                  <ShieldCheck size={14} />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Transaction Receipt</span>
              </div>
              <button onClick={() => setSelectedTx(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#e1e3e4]/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#111415] rounded-full border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                {React.createElement(getIconForType(selectedTx.type), { size: 32, className: selectedTx.status === 'Failed' ? "text-[#ef4444]" : "text-[#66df75]" })}
              </div>
              <p className="text-[10px] font-black text-[#e1e3e4]/30 uppercase tracking-[0.3em] mb-2">Total Amount</p>
              <h2 className="text-4xl font-black text-white tracking-tighter">₦{selectedTx.amount.toLocaleString()}</h2>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 mt-4 text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedTx.status)}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                {selectedTx.status}
              </div>
            </div>

            <div className="space-y-5 mb-10">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Service</span>
                <span className="text-xs font-bold text-white text-right">{selectedTx.type}</span>
              </div>
              {selectedTx.recipient && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Recipient</span>
                  <span className="text-xs font-bold text-white text-right">{selectedTx.recipient}</span>
                </div>
              )}
              {selectedTx.network && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Network</span>
                  <span className="text-xs font-bold text-white text-right uppercase">{selectedTx.network}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Details</span>
                <span className="text-xs font-bold text-white text-right max-w-[60%]">{selectedTx.details}</span>
              </div>
              {selectedTx.status === 'Failed' && (
                <div className="flex justify-between items-center py-2 border-b border-white/5 animate-in fade-in duration-300">
                  <span className="text-[10px] font-black text-[#ef4444]/60 uppercase tracking-widest">Failure Reason</span>
                  <span className="text-xs font-bold text-[#ef4444] text-right max-w-[60%]">{cleanErrorMessage(selectedTx.details)}</span>
                </div>
              )}
              {selectedTx.payment_method && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Payment Method</span>
                  <span className="text-xs font-bold text-white text-right uppercase">{selectedTx.payment_method}</span>
                </div>
              )}
              {selectedTx.cashback_earned && selectedTx.cashback_earned > 0 ? (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-black text-[#66df75]/60 uppercase tracking-widest">Cashback Earned</span>
                  <span className="text-xs font-bold text-[#66df75] text-right">₦{selectedTx.cashback_earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Date</span>
                <span className="text-xs font-bold text-white">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Reference</span>
                <span className="text-[10px] font-mono font-bold text-white/60">{selectedTx.id}</span>
              </div>
              {selectedTx.raw_response && selectedTx.raw_response.phone && selectedTx.raw_response.password ? (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                  <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest text-center">Smile E-SIM Credentials</p>
                  <div className="bg-[#66df75]/10 border border-[#66df75]/20 rounded-xl p-3 flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-black text-[#66df75]/80 uppercase tracking-widest">Smile Number</span>
                    <span className="text-lg font-black text-white font-mono tracking-wider select-all">{selectedTx.raw_response.phone}</span>
                    <div className="w-full h-px bg-[#66df75]/20 my-1"></div>
                    <span className="text-[9px] font-black text-[#66df75]/80 uppercase tracking-widest">Password</span>
                    <span className="text-sm font-bold text-white font-mono tracking-wider select-all">{selectedTx.raw_response.password}</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => downloadReceiptImage(selectedTx)}
                className="btn-primary py-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black"
              >
                <Download size={16} /> Save
              </button>
              <button 
                onClick={() => shareReceiptAsImage(selectedTx)}
                className="glass-panel py-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black hover:bg-white/10 transition-all border-white/10"
              >
                <Share2 size={16} /> Share
              </button>
            </div>

            <p className="text-center mt-8 text-[8px] font-black text-[#e1e3e4]/10 uppercase tracking-[0.4em]">SaukiGlobal Automation</p>
          </div>
        </div>
      )}
    </div>
  );
}
