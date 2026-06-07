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
  Cpu,
  Globe2,
  Briefcase,
  PhoneCall
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { Transaction } from '../types';
import TransactionTable from './TransactionTable';

interface UserDashboardProps {
  onNavigate: (view: any) => void;
}

export default function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user } = useUser();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [virtualAccounts, setVirtualAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // KYC States
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycOption, setKycOption] = useState<'nin' | 'bvn'>('bvn');
  const [kycValue, setKycValue] = useState('');
  const [kycError, setKycError] = useState<string | null>(null);
  const [isGeneratingVa, setIsGeneratingVa] = useState(false);
  const [vaSuccessMsg, setVaSuccessMsg] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

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
        const res = await api.getNotifications();
        if (res.success && res.data && Array.isArray(res.data.notifications)) {
          const readIdsStr = localStorage.getItem('saukiglobal_read_notifs') || '[]';
          const readIds = JSON.parse(readIdsStr) as number[];
          const unread = res.data.notifications.filter((n: any) => !readIds.includes(Number(n.id)));
          setUnreadCount(unread.length);
        }
      } catch (err) {
        console.error("Failed to fetch notifications count:", err);
      }
    };

    fetchTransactions();
    fetchVirtualAccounts();
    fetchNotificationsCount();
  }, []);

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
          <img src={image} alt={title} className="w-full h-full object-contain filter brightness-90 group-hover:brightness-100 transition-all" />
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
    { id: 'ratel', title: 'Ratel', icon: PhoneCall, onClick: () => onNavigate('ratel'), visible: true, image: '/icons/others.png' },
    { id: 'cable', title: 'Cable TV', icon: Tv, onClick: () => onNavigate('cable'), visible: true },
    { id: 'electricity', title: 'Electricity', icon: Lightbulb, onClick: () => onNavigate('electricity'), visible: true },
    { id: 'exams', title: 'Exams', icon: GraduationCap, onClick: () => onNavigate('exams'), visible: true },
    { id: 'alpha', title: 'Alpha', icon: Zap, onClick: () => onNavigate('alpha'), visible: true, image: '/icons/alpha.png' },
    { id: 'kirani', title: 'Kirani', icon: RefreshCcw, onClick: () => onNavigate('kirani'), visible: true, image: '/icons/kirani icon.png' },
    { id: 'smile', title: 'Smile', icon: Wifi, onClick: () => onNavigate('smile'), visible: true, image: '/icons/smile.png' },
    { id: 'a2c', title: 'A2C', icon: ArrowUpRight, onClick: () => onNavigate('a2c'), visible: false },
    { id: 'nin', title: 'NIN', icon: FileText, onClick: () => onNavigate('nin'), visible: false },
    { id: 'history', title: 'History', icon: History, onClick: () => onNavigate('history'), visible: false },
    { id: 'esim', title: 'eSIM', icon: Cpu, onClick: () => onNavigate('esim'), visible: true },
    { id: 'cac', title: 'CAC', icon: Briefcase, onClick: () => onNavigate('cac'), visible: false },
    { id: 'intl', title: 'Intl Topup', icon: Globe2, onClick: () => onNavigate('intl'), visible: false },
    { id: 'more', title: 'More', icon: PlusCircle, onClick: () => onNavigate('pricing'), visible: false },
  ];

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-24">
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
          <button
            onClick={() => onNavigate('notifications')}
            className="w-10 h-10 glass-panel flex items-center justify-center relative hover:bg-white/10 transition-colors"
          >
            <Bell size={18} className="text-[#e1e3e4]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-[#111415] shadow-[0_0_10px_#ef4444] animate-in zoom-in-50 duration-200">
                {unreadCount}
              </span>
            )}
          </button>
        </header>
 
        {/* Balance Card */}
        <div className="card-mesh rounded-3xl p-6 mb-6 relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 p-4">
            <span className="text-[9px] font-black bg-[#66df75]/20 text-[#66df75] px-2.5 py-1 rounded-full border border-[#66df75]/30 uppercase tracking-widest">
              {user.isReseller ? 'Reseller Pro' : 'Premium'}
            </span>
          </div>
 
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1.5">
              <p className="text-[10px] font-bold text-[#e1e3e4]/50 uppercase tracking-widest">Available Balance</p>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-[#66df75] p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">
              {showBalance ? `₦${(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
            </h2>
          </div>
 
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => onNavigate('fund')}
              className="flex-1 bg-[#66df75] text-[#111415] hover:bg-[#52c860] active:scale-95 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(102,223,117,0.2)]"
            >
              <PlusCircle size={15} />
              <span>Fund</span>
            </button>
            <button
              onClick={() => onNavigate('transfer')}
              className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-white transition-all"
            >
              <Send size={15} />
              <span>Transfer</span>
            </button>
          </div>
 
          {/* Virtual Accounts inside Dashboard Card (Mirroring wallet.php) */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            {virtualAccounts.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#66df75]">Your Virtual Transfer Accounts</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {virtualAccounts.map((va: any, idx: number) => (
                    <div key={idx} className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/5 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-white">{va.bank_name}</span>
                          <span className="text-[7px] bg-[#66df75]/25 text-[#66df75] px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Instant</span>
                        </div>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="font-black text-sm text-white tracking-wider font-mono">{va.account_number}</span>
                          <button 
                            onClick={() => handleCopy(va.account_number)} 
                            className="text-xs text-white/50 hover:text-white transition-colors"
                          >
                            {copiedText === va.account_number ? (
                              <span className="text-[10px] text-[#66df75] font-black uppercase tracking-widest">Copied</span>
                            ) : (
                              <span className="text-[10px] text-white/40 uppercase tracking-widest underline">Copy</span>
                            )}
                          </button>
                        </div>
                        <p className="text-[8px] text-white/30 font-bold uppercase tracking-wider truncate mt-0.5">{va.account_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-3 text-center bg-black/20 rounded-2xl border border-white/5">
                <p className="text-[10px] text-white/40 font-semibold mb-2 leading-relaxed">No transfer account generated. Fund instantly via direct bank transfer to your personal virtual account.</p>
                <button 
                  onClick={() => setShowKycModal(true)} 
                  className="w-full bg-[#66df75]/10 border border-[#66df75]/20 text-[#66df75] font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#66df75]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle size={12} />
                  <span>Get Transfer Accounts</span>
                </button>
              </div>
            )}
          </div>
        </div>
 
        {/* Services Grid */}
        <section className="mb-12">
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
    </div>
  );
}
