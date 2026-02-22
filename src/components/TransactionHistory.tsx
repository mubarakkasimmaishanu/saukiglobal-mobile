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
  Send
} from 'lucide-react';
import { api } from '../services/api';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  onBack: () => void;
}

export default function TransactionHistory({ onBack }: TransactionHistoryProps) {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'in', 'out'
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    if (activeTab === 'all') return true;
    if (activeTab === 'in') return tx.type === 'Funding';
    if (activeTab === 'out') return tx.type !== 'Funding';
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
      default: return History;
    }
  };

  const getIconBgForType = (type: string) => {
    switch (type) {
      case 'Airtime': return 'bg-green-50 text-green-600';
      case 'Data': return 'bg-yellow-50 text-yellow-600';
      case 'Transfer': return 'bg-blue-50 text-blue-600';
      case 'Electricity': return 'bg-orange-50 text-orange-600';
      case 'Cable': return 'bg-rose-50 text-rose-600';
      case 'Exam': return 'bg-purple-50 text-purple-600';
      case 'NIN': return 'bg-teal-50 text-teal-600';
      case 'Funding': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Success':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full"><CheckCircle2 size={12}/> Successful</span>;
      case 'Failed':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full"><XCircle size={12}/> Failed</span>;
      case 'Pending':
        return <span className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full"><Clock size={12}/> Pending</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8 relative">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white sticky top-0 z-20 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 ml-2">History</h1>
          </div>
          <button className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100">
            <Filter size={18} />
          </button>
        </header>

        {/* Filters/Tabs */}
        <div className="px-5 py-4 bg-white sticky top-[68px] z-10">
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('in')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'in' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Money In
            </button>
            <button
              onClick={() => setActiveTab('out')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'out' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Money Out
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="px-5 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
                const Icon = getIconForType(tx.type);
                return (
                  <button 
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:border-green-200 transition-colors shadow-sm active:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${getIconBgForType(tx.type)}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{tx.type}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className={`text-sm font-bold ${tx.type === 'Funding' ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.type === 'Funding' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                      </span>
                      {getStatusBadge(tx.status)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RECEIPT MODAL / BOTTOM SHEET */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end md:items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
              
              {/* Receipt Header */}
              <div className="bg-gray-50 p-5 flex justify-between items-center border-b border-gray-100">
                <h2 className="font-bold text-gray-800">Transaction Receipt</h2>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="p-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Receipt Content */}
              <div className="p-6">
                <div className="flex flex-col items-center mb-6 text-center">
                  <div className={`p-4 rounded-full mb-3 ${getIconBgForType(selectedTx.type)}`}>
                    {React.createElement(getIconForType(selectedTx.type), { size: 32 })}
                  </div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {selectedTx.type === 'Funding' ? 'Amount Received' : 'Amount Paid'}
                  </h3>
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    ₦{selectedTx.amount.toLocaleString()}
                  </p>
                  {getStatusBadge(selectedTx.status)}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4 mb-6">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500 font-medium">Service</span>
                    <span className="text-sm font-bold text-gray-900 text-right">{selectedTx.type}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500 font-medium">Recipient/Details</span>
                    <span className="text-sm font-bold text-gray-900 text-right max-w-[60%]">{selectedTx.details}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500 font-medium">Date & Time</span>
                    <span className="text-sm font-bold text-gray-900 text-right">{selectedTx.date}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-gray-500 font-medium">Reference ID</span>
                    <span className="text-xs font-mono font-bold text-gray-600 text-right">{selectedTx.id}</span>
                  </div>
                  
                  {selectedTx.note && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-red-600 font-medium">{selectedTx.note}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-green-50 text-green-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-100 transition-colors">
                    <Download size={18} />
                    Save
                  </button>
                  <button className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-md">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>

                <button 
                  onClick={() => setSelectedTx(null)}
                  className="w-full mt-3 py-3 text-sm font-bold text-gray-500 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
