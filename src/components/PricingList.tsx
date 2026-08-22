import React, { useState, useEffect } from 'react';
import {
  Search,
  Award,
  TrendingUp,
  Wifi,
  Smartphone,
  GraduationCap,
  Lightbulb,
  Info,
  ChevronLeft,
  Crown,
  RefreshCw
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';

interface PricingListProps {
  onBack: () => void;
}

export default function PricingList({ onBack }: PricingListProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'data' | 'airtime' | 'exams' | 'utilities'>('data');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isReseller = user?.isReseller ?? false;
  const tierLabel = isReseller ? 'Reseller Pro' : 'Member';

  // Dynamic pricing state
  const [dynamicPricing, setDynamicPricing] = useState<Record<string, any[]>>({
    data: [
      { id: 1, network: 'MTN', name: '1GB Corporate Gifting (30 Days)', retail: 300, reseller: 255 },
      { id: 2, network: 'MTN', name: '2GB Corporate Gifting (30 Days)', retail: 600, reseller: 510 },
      { id: 3, network: 'MTN', name: '5GB Corporate Gifting (30 Days)', retail: 1500, reseller: 1275 },
      { id: 4, network: 'Airtel', name: '1GB CG (30 Days)', retail: 300, reseller: 265 },
      { id: 5, network: 'Airtel', name: '2GB CG (30 Days)', retail: 600, reseller: 530 },
      { id: 6, network: 'GLO', name: '1GB SME (30 Days)', retail: 280, reseller: 245 },
    ],
    airtime: [
      { id: 7, network: 'MTN', name: 'MTN Airtime VTU', retail: 'Face Value', reseller: '4% Discount' },
      { id: 8, network: 'Airtel', name: 'Airtel Airtime VTU', retail: 'Face Value', reseller: '4% Discount' },
      { id: 9, network: 'GLO', name: 'GLO Airtime VTU', retail: 'Face Value', reseller: '4% Discount' },
      { id: 10, network: '9Mobile', name: '9Mobile Airtime VTU', retail: 'Face Value', reseller: '4% Discount' },
    ],
    exams: [
      { id: 12, network: 'WAEC', name: 'WAEC Result Checker', retail: 3800, reseller: 3500 },
      { id: 13, network: 'NECO', name: 'NECO Token', retail: 1400, reseller: 1200 },
      { id: 14, network: 'NBAIS', name: 'NBAIS Result Token', retail: 1600, reseller: 1500 },
      { id: 15, network: 'NABTEB', name: 'NABTEB Scratch Card', retail: 1200, reseller: 1000 },
    ],
    utilities: [
      { id: 16, network: 'Electricity', name: 'All DisCos (IKEDC, AEDC, EKEDC, etc.)', retail: '₦100 Fee', reseller: '₦35 Fee' },
      { id: 17, network: 'Cable TV', name: 'DSTV, GOTV, StarTimes', retail: '₦50 Fee', reseller: '₦15 Fee' },
    ]
  });

  // Fetch live prices from admin API
  useEffect(() => {
    const fetchLivePrices = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch exam provider prices
        const examRes = await api.getExamProviders();
        if (examRes.success && Array.isArray(examRes.data)) {
          const liveExams = examRes.data.map((ex: any, idx: number) => ({
            id: ex.id || idx + 100,
            network: ex.name?.split(' ')[0] || ex.code || 'EXAM',
            name: ex.name || ex.exam_name || 'Result Token',
            retail: Number(ex.price || ex.amount || 1500),
            reseller: Number(ex.reseller_price || ex.resellerPrice || (ex.price ? ex.price * 0.95 : 1400))
          }));
          if (liveExams.length > 0) {
            setDynamicPricing(prev => ({ ...prev, exams: liveExams }));
          }
        }

        // 2. Fetch airtime discounts
        const airtimeRes = await api.getAirtimeNetworks();
        if (airtimeRes.success && Array.isArray(airtimeRes.data)) {
          const liveAirtime = airtimeRes.data.map((net: any, idx: number) => ({
            id: net.id || idx + 200,
            network: net.name || net.network || 'VTU',
            name: `${net.name || 'VTU'} Airtime Top-up`,
            retail: 'Face Value (1% Cashback)',
            reseller: `${net.reseller_discount || net.discount || '3 - 4%'} Discount`
          }));
          if (liveAirtime.length > 0) {
            setDynamicPricing(prev => ({ ...prev, airtime: liveAirtime }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch live pricing from API', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLivePrices();
  }, []);

  const getNetworkBadge = (network: string) => {
    const net = (network || '').toUpperCase();
    if (net.includes('MTN')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (net.includes('AIRTEL')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (net.includes('GLO')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (net.includes('9MOBILE') || net.includes('ETISALAT')) return 'bg-lime-500/20 text-lime-400 border-lime-500/30';
    if (net.includes('WAEC') || net.includes('NECO') || net.includes('NBAIS') || net.includes('NABTEB')) {
      return 'bg-[#66df75]/20 text-[#66df75] border-[#66df75]/30';
    }
    return 'bg-white/10 text-white border-white/20';
  };

  const filteredData = (dynamicPricing[activeTab] || []).filter(item =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.network || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans pb-24 relative overflow-x-hidden selection:bg-[#66df75] selection:text-[#111415]">
      <div className="max-w-md mx-auto relative px-5 pt-4">

        {/* Header */}
        <header className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all border border-white/10 shadow-sm cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="leading-tight">
              <h1 className="text-base font-black text-white tracking-tight">Pricing & Rates</h1>
              <p className="text-xs text-[#66df75] font-bold">Live API Synced</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            {isReseller ? <Crown size={14} className="text-[#66df75]" /> : <Award size={14} className="text-white/60" />}
            <span className={`text-[10px] font-black uppercase tracking-wider ${isReseller ? 'text-[#66df75]' : 'text-white/70'}`}>
              {tierLabel}
            </span>
          </div>
        </header>

        {/* Search Bar */}
        <div className="relative mt-2 mb-4">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search plans or networks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 hide-scrollbar">
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'data' ? 'btn-primary' : 'bg-white/5 text-[#e1e3e4]/70 hover:bg-white/10'
            }`}
          >
            <Wifi size={13} /> Data Plans
          </button>
          <button
            onClick={() => setActiveTab('airtime')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'airtime' ? 'btn-primary' : 'bg-white/5 text-[#e1e3e4]/70 hover:bg-white/10'
            }`}
          >
            <Smartphone size={13} /> Airtime
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'exams' ? 'btn-primary' : 'bg-white/5 text-[#e1e3e4]/70 hover:bg-white/10'
            }`}
          >
            <GraduationCap size={13} /> Exams & Pins
          </button>
          <button
            onClick={() => setActiveTab('utilities')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
              activeTab === 'utilities' ? 'btn-primary' : 'bg-white/5 text-[#e1e3e4]/70 hover:bg-white/10'
            }`}
          >
            <Lightbulb size={13} /> Utilities
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-[#66df75]/10 border border-[#66df75]/25 p-3 rounded-2xl flex items-center gap-2.5 mb-4 text-xs">
          <Info size={16} className="text-[#66df75] flex-shrink-0" />
          <p className="text-[11px] text-[#e1e3e4]/80 font-medium">
            {isReseller
              ? <>You are enjoying exclusive <strong className="text-[#66df75]">Wholesale Reseller Rates</strong> across all services.</>
              : <>Standard <strong className="text-white">Member Rates</strong>. Upgrade to Reseller to enjoy wholesale discounts!</>
            }
          </p>
        </div>

        {/* Pricing List Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw size={24} className="animate-spin text-[#66df75]" />
            <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Syncing Rates with API...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const isNumeric = typeof item.reseller === 'number';
                const profit = isNumeric ? item.retail - item.reseller : null;

                return (
                  <div key={item.id} className="bg-[#181b1c] border border-white/5 rounded-2xl p-4 shadow-sm hover:border-[#66df75]/30 transition-all">
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="flex-1 pr-2">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border mb-1.5 ${getNetworkBadge(item.network)}`}>
                          {item.network}
                        </span>
                        <h3 className="text-xs font-bold text-white leading-tight">{item.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-black/40 rounded-xl p-2.5 border border-white/5">
                      {/* Left: Standard Member Price */}
                      <div className="text-center flex-1 border-r border-white/10">
                        <p className="text-[9px] text-[#e1e3e4]/50 font-bold uppercase tracking-wider mb-0.5">
                          {isReseller ? 'Member Rate' : 'Your Rate'}
                        </p>
                        <p className={`text-xs ${isReseller ? 'text-white/50 line-through' : 'text-white font-black'}`}>
                          {isNumeric ? `₦${item.retail.toLocaleString()}` : item.retail}
                        </p>
                      </div>

                      {/* Right: Reseller Price */}
                      <div className="text-center flex-1">
                        <p className="text-[9px] text-[#66df75] font-black uppercase tracking-wider mb-0.5">
                          {isReseller ? 'Your Reseller Rate' : 'Wholesale Rate'}
                        </p>
                        <p className="text-xs font-black text-[#66df75]">
                          {isNumeric ? `₦${item.reseller.toLocaleString()}` : item.reseller}
                        </p>
                      </div>
                    </div>

                    {/* Profit Margin or Upgrade Hint */}
                    {isNumeric && profit !== null && profit > 0 && (
                      <div className="mt-2 text-right">
                        {isReseller ? (
                          <span className="inline-block text-[10px] font-black text-[#66df75] bg-[#66df75]/10 px-2 py-0.5 rounded-md border border-[#66df75]/20">
                            Margin: +₦{profit.toLocaleString()} / sale
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold text-[#e1e3e4]/60 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                            Save ₦{profit.toLocaleString()} with Reseller
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-xs font-bold text-[#e1e3e4]/40">No plans found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
