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
  TrendingUp,
  ArrowUpRight,
  BookOpen,
  MessageSquare,
  Clock
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import { Transaction } from '../types';

interface UserDashboardProps {
  onNavigate: (view: any) => void;
}

export default function UserDashboard({ onNavigate }: UserDashboardProps) {
  const { user } = useUser();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const txs = await api.getTransactions();
      setRecentTransactions(txs.slice(0, 3));
    };
    fetchTransactions();
  }, []);

  if (!user) return null;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Airtime': return Smartphone;
      case 'Data': return Wifi;
      case 'Transfer': return Send;
      case 'Electricity': return Lightbulb;
      case 'Cable': return Tv;
      case 'Exam': return BookOpen;
      case 'NIN': return FileText;
      case 'Funding': return Wallet;
      default: return History;
    }
  };

  const getIconBgForType = (type: string) => {
    switch (type) {
      case 'Airtime': return 'bg-green-100 text-green-600';
      case 'Data': return 'bg-yellow-100 text-yellow-600';
      case 'Transfer': return 'bg-blue-100 text-blue-600';
      case 'Electricity': return 'bg-orange-100 text-orange-600';
      case 'Cable': return 'bg-rose-100 text-rose-600';
      case 'Exam': return 'bg-purple-100 text-purple-600';
      case 'NIN': return 'bg-teal-100 text-teal-600';
      case 'Funding': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const ServiceIcon = ({ icon: Icon, title, bg, color }: { icon: any, title: string, bg: string, color: string }) => (
    <button className="flex flex-col items-center gap-2 group transition-all">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95 shadow-sm border border-gray-100 ${bg} ${color}`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <span className="text-[11px] font-bold text-gray-700 text-center leading-tight max-w-[70px]">
        {title}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative pb-20 md:pb-0">
        
        {/* Top Header */}
        <header className="px-5 pt-6 pb-2 sticky top-0 bg-gray-50/90 backdrop-blur-md z-30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-white">
                {user.firstName.charAt(0)}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Good morning,</p>
              <h1 className="text-base font-black text-gray-900 leading-tight">{user.firstName} 👋</h1>
            </div>
          </div>
          <button 
            onClick={() => onNavigate('notifications')}
            className="relative p-2.5 bg-white rounded-full shadow-sm border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} className="text-gray-700" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        <main className="px-5 pt-4">
          
          {/* Main Wallet Card */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-[1.5rem] p-6 text-white shadow-xl shadow-green-200 mb-6 relative overflow-hidden">
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-10 rounded-full -ml-8 -mb-8 blur-lg"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-1">
                <p className="text-green-100 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  Available Balance
                  <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                    {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </p>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20">
                  {user.isReseller ? 'Reseller Pro' : 'Basic'}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
                {showBalance ? `₦${user.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}` : '****'}
              </h2>

              <div className="flex gap-3">
                <button 
                  onClick={() => onNavigate('fund')}
                  className="flex-1 bg-white text-green-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors active:scale-95"
                >
                  <PlusCircle size={18}/> Fund Wallet
                </button>
                <button 
                  onClick={() => onNavigate('transfer')}
                  className="flex-1 bg-green-700/50 backdrop-blur-md border border-green-500/50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700/70 transition-colors active:scale-95"
                >
                  <Send size={18}/> Transfer
                </button>
              </div>
            </div>
          </div>

          {/* Quick Services Grid */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-4 px-1">Quick Services</h3>
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              <div onClick={() => onNavigate('data')}>
                <ServiceIcon icon={Wifi} title="Buy Data" bg="bg-blue-50" color="text-blue-600" />
              </div>
              <div onClick={() => onNavigate('airtime')}>
                <ServiceIcon icon={Smartphone} title="Airtime" bg="bg-green-50" color="text-green-600" />
              </div>
              <div onClick={() => onNavigate('jamb-pins')}>
                <ServiceIcon icon={GraduationCap} title="JAMB Pins" bg="bg-purple-50" color="text-purple-600" />
              </div>
              <div onClick={() => onNavigate('jamb')}>
                <ServiceIcon icon={FileText} title="JAMB Services" bg="bg-indigo-50" color="text-indigo-600" />
              </div>
              <div onClick={() => onNavigate('exams')}>
                <ServiceIcon icon={BookOpen} title="Result Checkers" bg="bg-indigo-50" color="text-indigo-600" />
              </div>
              
              <div onClick={() => onNavigate('electricity')}>
                <ServiceIcon icon={Lightbulb} title="Electricity" bg="bg-orange-50" color="text-orange-600" />
              </div>
              <div onClick={() => onNavigate('cable')}>
                <ServiceIcon icon={Tv} title="Cable TV" bg="bg-rose-50" color="text-rose-600" />
              </div>
              <div onClick={() => onNavigate('nin')}>
                <ServiceIcon icon={FileText} title="Print NIN" bg="bg-teal-50" color="text-teal-600" />
              </div>
              <div onClick={() => onNavigate('requests')}>
                <ServiceIcon icon={Clock} title="My Requests" bg="bg-orange-50" color="text-orange-600" />
              </div>
              <ServiceIcon icon={TrendingUp} title="More" bg="bg-gray-100" color="text-gray-600" />
            </div>
          </div>

          {/* Reseller Upsell Banner */}
          <div 
            onClick={() => onNavigate('referral')}
            className="bg-slate-900 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-lg relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl group-hover:bg-emerald-500/30 transition-all"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase mb-0.5">Earn More</p>
                <p className="text-sm font-bold text-white">Upgrade to Reseller Pro</p>
              </div>
            </div>
            <ArrowUpRight size={20} className="text-slate-400 group-hover:text-white transition-colors relative z-10" />
          </div>

          {/* Recent Transactions List */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="text-sm font-bold text-gray-900">Recent Transactions</h3>
              <button 
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-green-600 hover:text-green-700"
              >
                View All
              </button>
            </div>
            
            <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
              {recentTransactions.map((tx, index) => {
                const Icon = getIconForType(tx.type);
                return (
                  <div key={tx.id} className={`flex items-center justify-between p-3 ${index !== recentTransactions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBgForType(tx.type)}`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{tx.type}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{tx.details}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${tx.type === 'Funding' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'Funding' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="fixed md:absolute bottom-0 w-full bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-40 pb-safe">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center gap-1 group"
          >
            <div className={`p-1 rounded-xl ${true ? 'bg-green-50 text-green-600' : 'text-gray-400'}`}>
              <Home size={22} className="stroke-[2.5px]" />
            </div>
            <span className={`text-[10px] font-bold ${true ? 'text-green-600' : 'text-gray-400'}`}>Home</span>
          </button>
          
          <button 
            onClick={() => onNavigate('history')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <div className="p-1 rounded-xl group-hover:bg-gray-50">
              <History size={22} className="stroke-[2px]" />
            </div>
            <span className="text-[10px] font-bold">History</span>
          </button>
          
          <button 
            onClick={() => onNavigate('support')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <div className="p-1 rounded-xl group-hover:bg-gray-50">
              <MessageSquare size={22} className="stroke-[2px]" />
            </div>
            <span className="text-[10px] font-bold">Support</span>
          </button>
          
          <button 
            onClick={() => onNavigate('profile')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <div className="p-1 rounded-xl group-hover:bg-gray-50">
              <UserIcon size={22} className="stroke-[2px]" />
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </nav>
        
      </div>
    </div>
  );
}
