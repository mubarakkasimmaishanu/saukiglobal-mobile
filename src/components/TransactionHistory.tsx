import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Filter,
  Download,
  Share2,
  Smartphone,
  Wifi,
  GraduationCap,
  Landmark,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  Tv,
  Lightbulb,
  FileText,
  BookOpen,
  Wallet,
  Send,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Zap,
  MoreVertical
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { useUser } from '../context/UserContext';
import TransactionTable from './TransactionTable';

interface TransactionHistoryProps {
  onBack: () => void;
}

export default function TransactionHistory({ onBack }: TransactionHistoryProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'in', 'out'
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const txs = await api.getTransactions();
        setTransactions(txs);
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'in' && tx.type !== 'Funding') return false;
    if (activeTab === 'out' && tx.type === 'Funding') return false;
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    return true;
  });

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

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient">
      <div className="max-w-md mx-auto relative px-6 pb-24">
        
        {/* Header */}
        <header className="py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black tracking-tighter">Activity</h1>
          </div>
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`w-10 h-10 glass-panel flex items-center justify-center transition-colors ${statusFilter !== 'all' ? 'text-[#66df75] border-[#66df75]/20' : ''}`}
          >
            <Filter size={18} />
          </button>
        </header>

        {/* Filters */}
        <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl border border-white/5">
          {['all', 'in', 'out'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-[#66df75] text-[#111415] shadow-lg' : 'text-[#e1e3e4]/40 hover:text-white'}`}
            >
              {tab === 'all' ? 'All' : tab === 'in' ? 'Funding' : 'Payments'}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <TransactionTable 
          transactions={filteredTransactions} 
          isLoading={isLoading} 
          onRowClick={setSelectedTx} 
        />

        {/* Receipt Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center px-6 pb-12 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#111415]/80 backdrop-blur-md" onClick={() => setSelectedTx(null)}></div>
            
            <div className="w-full max-w-sm glass-panel p-8 relative overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border-emerald-500/20">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#66df75] to-transparent"></div>
              
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#66df75] rounded-md flex items-center justify-center text-[#111415]">
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
                  {React.createElement(getIconForType(selectedTx.type), { size: 32, className: "text-[#66df75]" })}
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
                  <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Recipient</span>
                  <span className="text-xs font-bold text-white text-right">{selectedTx.details}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Date</span>
                  <span className="text-xs font-bold text-white">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-widest">Reference</span>
                  <span className="text-[10px] font-mono font-bold text-white/60">{selectedTx.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="btn-primary py-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black">
                  <Download size={16} /> Save
                </button>
                <button className="glass-panel py-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black hover:bg-white/10 transition-all border-white/10">
                  <Share2 size={16} /> Share
                </button>
              </div>

              <p className="text-center mt-8 text-[8px] font-black text-[#e1e3e4]/10 uppercase tracking-[0.4em]">SaukiGlobal Automation</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

