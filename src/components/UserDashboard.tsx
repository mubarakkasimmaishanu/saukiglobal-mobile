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
  BookOpen,
  MessageSquare,
  Clock,
  ArrowRight,
  Zap,
  RefreshCcw,
  Cpu,
  Globe2,
  Briefcase
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
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

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
    fetchTransactions();
  }, []);

  if (!user) return (
    <div className="min-h-screen bg-[#111415] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-6">
        <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_20px_rgba(102,223,117,0.3)]" />
        <div className="w-8 h-8 border-4 border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#66df75] font-black tracking-widest text-xs uppercase">Loading SaukiGlobal...</p>
      </div>
    </div>
  );

  const ServiceButton = ({ icon: Icon, title, onClick }: { icon: any, title: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-3 group transition-all"
    >
      <div className="w-16 h-16 glass-card flex items-center justify-center group-hover:bg-[#66df75]/10 group-active:scale-95 group-hover:border-[#66df75]/30 transition-all duration-300 shadow-lg">
        <Icon size={28} className="text-[#e1e3e4] group-hover:text-[#66df75] transition-colors" />
      </div>
      <span className="text-[10px] font-bold text-[#e1e3e4]/70 uppercase tracking-wider group-hover:text-[#66df75]">
        {title}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-24">
      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="py-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(102,223,117,0.3)]" />
            <div>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.2em]">{greeting}</p>
              <h1 className="text-lg font-bold tracking-tight">@{user?.firstName?.toLowerCase() || 'user'}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#66df75] to-[#4ade80] flex items-center justify-center text-[#111415] font-black text-lg shadow-[0_0_15px_rgba(102,223,117,0.3)]">
              {user?.firstName?.charAt(0) || 'S'}
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              className="w-10 h-10 glass-panel flex items-center justify-center relative hover:bg-white/10 transition-colors"
            >
              <Bell size={18} className="text-[#e1e3e4]" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#66df75] rounded-full shadow-[0_0_10px_#66df75]"></span>
            </button>
          </div>
        </header>

        {/* Balance Card */}
        <div className="card-mesh rounded-[2rem] p-8 mb-10 relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 p-4">
            <span className="text-[10px] font-black bg-[#66df75]/20 text-[#66df75] px-3 py-1.5 rounded-full border border-[#66df75]/30 uppercase tracking-widest">
              {user.isReseller ? 'Reseller Pro' : 'Premium'}
            </span>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-[11px] font-bold text-[#e1e3e4]/60 uppercase tracking-widest">Available Balance</p>
              <button 
                onClick={() => setShowBalance(!showBalance)}
                className="text-[#66df75] p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white">
              {showBalance ? `₦${(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••••••'}
            </h2>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => onNavigate('fund')}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} />
              <span>Fund Wallet</span>
            </button>
            <button
              onClick={() => onNavigate('transfer')}
              className="flex-1 glass-panel flex items-center justify-center gap-2 py-3.5 font-bold hover:bg-white/10"
            >
              <Send size={18} />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#66df75]">Ecosystem Services</h3>
            <span className="w-12 h-[1px] bg-[#66df75]/30"></span>
          </div>
          
          <div className="grid grid-cols-4 gap-y-8 gap-x-4">
            <ServiceButton icon={Wifi} title="Data" onClick={() => onNavigate('data')} />
            <ServiceButton icon={Smartphone} title="Airtime" onClick={() => onNavigate('airtime')} />
            <ServiceButton icon={Tv} title="Cable TV" onClick={() => onNavigate('cable')} />
            <ServiceButton icon={Lightbulb} title="Power" onClick={() => onNavigate('electricity')} />
            
            <ServiceButton icon={GraduationCap} title="Exams" onClick={() => onNavigate('exams')} />
            <ServiceButton icon={Zap} title="Alpha" onClick={() => onNavigate('alpha')} />
            <ServiceButton icon={RefreshCcw} title="Kirani" onClick={() => onNavigate('kirani')} />
            <ServiceButton icon={Wifi} title="Smile" onClick={() => onNavigate('smile')} />

            <ServiceButton icon={ArrowUpRight} title="A2C" onClick={() => onNavigate('a2c')} />
            <ServiceButton icon={FileText} title="NIN" onClick={() => onNavigate('nin')} />
            <ServiceButton icon={History} title="History" onClick={() => onNavigate('history')} />
            <ServiceButton icon={Cpu} title="eSIM" onClick={() => onNavigate('esim')} />
            <ServiceButton icon={Briefcase} title="CAC" onClick={() => onNavigate('cac')} />
            <ServiceButton icon={Globe2} title="Intl Topup" onClick={() => onNavigate('intl')} />
            <ServiceButton icon={PlusCircle} title="More" onClick={() => onNavigate('pricing')} />
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
    </div>
  );
}

