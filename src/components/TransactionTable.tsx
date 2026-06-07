import React from 'react';
import { Transaction } from '../types';
import { Smartphone, Wifi, Send, Lightbulb, Tv, BookOpen, FileText, Wallet, Zap, ArrowDownLeft, ArrowUpRight, PhoneCall } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onRowClick?: (tx: Transaction) => void;
}

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
  switch (status?.toLowerCase()) {
    case 'success': return 'text-[#66df75] bg-[#66df75]/10 border-[#66df75]/20';
    case 'failed': return 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/20';
    case 'processing':
    case 'pending': return 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20';
    default: return 'text-[#e1e3e4]/60 bg-white/5 border-white/10';
  }
};

export default function TransactionTable({ transactions, isLoading, onRowClick }: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className="w-full glass-panel p-8 flex flex-col items-center justify-center gap-4 animate-pulse">
        <div className="w-8 h-8 border-2 border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[#e1e3e4]/50">Syncing Ledger...</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="w-full glass-panel p-8 flex flex-col items-center justify-center gap-4">
        <Zap size={32} className="text-[#e1e3e4]/20" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#e1e3e4]/40">No activity found</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-white/5 bg-[#111415]/50 backdrop-blur-sm custom-scrollbar">
      <table className="w-full min-w-[600px] text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 bg-white/5">
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#e1e3e4]/50">Service</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#e1e3e4]/50">Reference / Details</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#e1e3e4]/50">Amount</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#e1e3e4]/50">Date</th>
            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[#e1e3e4]/50 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {transactions.map((tx) => {
            const Icon = getIconForType(tx.type);
            const isFunding = tx.type === 'Funding';
            
            return (
              <tr 
                key={tx.id} 
                onClick={() => onRowClick?.(tx)}
                className="group hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isFunding ? 'bg-[#66df75]/10 text-[#66df75]' : 'bg-white/5 text-[#e1e3e4]/80'}`}>
                      {isFunding ? <ArrowDownLeft size={16} /> : <Icon size={16} />}
                    </div>
                    <span className="text-xs font-bold text-white">{tx.type}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#e1e3e4] truncate max-w-[200px]">{tx.details}</span>
                    <span className="text-[10px] text-[#e1e3e4]/40 font-mono mt-0.5">{tx.id}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-black ${isFunding ? 'text-[#66df75]' : 'text-white'}`}>
                    {isFunding ? '+' : '-'}₦{tx.amount.toLocaleString()}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/60 uppercase tracking-wider whitespace-nowrap">
                    {tx.date}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusColor(tx.status)}`}>
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${(tx.status === 'Pending' || tx.status === 'Processing') ? 'animate-pulse' : ''}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">{tx.status}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
