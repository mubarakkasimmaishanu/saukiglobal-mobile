import React, { useState } from 'react';
import { 
  Search, 
  Award, 
  TrendingUp, 
  Wifi, 
  Smartphone, 
  GraduationCap, 
  Lightbulb,
  Info,
  ChevronLeft
} from 'lucide-react';

interface PricingListProps {
  onBack: () => void;
}

export default function PricingList({ onBack }: PricingListProps) {
  const [activeTab, setActiveTab] = useState('data');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock User Package
  const userPackage = "Reseller"; // Basic, Smart Earner, Reseller

  // Mock Pricing Data
  const pricingData: Record<string, any[]> = {
    data: [
      { id: 1, network: 'MTN', name: '1GB Corporate Gifting (30 Days)', retail: 300, reseller: 255 },
      { id: 2, network: 'MTN', name: '2GB Corporate Gifting (30 Days)', retail: 600, reseller: 510 },
      { id: 3, network: 'MTN', name: '5GB Corporate Gifting (30 Days)', retail: 1500, reseller: 1275 },
      { id: 4, network: 'Airtel', name: '1GB CG (30 Days)', retail: 300, reseller: 265 },
      { id: 5, network: 'Airtel', name: '2GB CG (30 Days)', retail: 600, reseller: 530 },
      { id: 6, network: 'GLO', name: '1GB SME (30 Days)', retail: 280, reseller: 245 },
    ],
    airtime: [
      { id: 7, network: 'MTN', name: 'MTN Airtime VTU', retail: 'Face Value', reseller: '2.5% Discount' },
      { id: 8, network: 'Airtel', name: 'Airtel Airtime VTU', retail: 'Face Value', reseller: '3.0% Discount' },
      { id: 9, network: 'GLO', name: 'GLO Airtime VTU', retail: 'Face Value', reseller: '4.0% Discount' },
      { id: 10, network: '9Mobile', name: '9Mobile Airtime VTU', retail: 'Face Value', reseller: '4.5% Discount' },
    ],
    exams: [
      { id: 11, network: 'JAMB', name: 'JAMB UTME E-Pin', retail: 7500, reseller: 7200 },
      { id: 12, network: 'WAEC', name: 'WAEC Result Checker', retail: 3800, reseller: 3500 },
      { id: 13, network: 'NECO', name: 'NECO Token', retail: 1400, reseller: 1200 },
      { id: 14, network: 'NIMC', name: 'Print NIN Slip (Standard)', retail: 700, reseller: 500 },
    ],
    utilities: [
      { id: 15, network: 'Electricity', name: 'KEDCO, AEDC, IKEDC, etc.', retail: '₦100 Fee', reseller: '₦35 Fee' },
      { id: 16, network: 'Cable TV', name: 'DSTV, GOTV, Startimes', retail: '₦50 Fee', reseller: '₦15 Fee' },
    ]
  };

  const getNetworkColor = (network: string) => {
    switch(network) {
      case 'MTN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Airtel': return 'bg-red-100 text-red-800 border-red-200';
      case 'GLO': return 'bg-green-100 text-green-800 border-green-200';
      case '9Mobile': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'JAMB': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'WAEC': case 'NECO': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredData = pricingData[activeTab].filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.network.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8 relative">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative flex flex-col">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-slate-900 text-white sticky top-0 z-20 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-bold ml-2">Pricing & Discounts</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search plans or networks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </header>

        {/* Current Package Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4 border-b border-green-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-full">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Your Current Plan</p>
              <p className="text-sm font-black text-gray-900">{userPackage} Level</p>
            </div>
          </div>
          <button className="text-xs font-bold text-green-700 bg-green-200/50 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
            Upgrade <TrendingUp size={12} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-3 border-b border-gray-100 bg-white sticky top-[132px] z-10 overflow-x-auto hide-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'data' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Wifi size={14} /> Data Plans
            </button>
            <button
              onClick={() => setActiveTab('airtime')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'airtime' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Smartphone size={14} /> Airtime
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'exams' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <GraduationCap size={14} /> Exams & Pins
            </button>
            <button
              onClick={() => setActiveTab('utilities')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'utilities' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Lightbulb size={14} /> Utilities
            </button>
          </div>
        </div>

        {/* Pricing List Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
          
          <div className="bg-blue-50 p-3 rounded-xl flex gap-3 mb-4 border border-blue-100">
            <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 font-medium">
              Prices shown in <span className="font-bold text-green-700">green</span> are your exclusive {userPackage} discounted rates.
            </p>
          </div>

          <div className="space-y-3">
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const isNumeric = typeof item.reseller === 'number';
                const profit = isNumeric ? item.retail - item.reseller : null;

                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-3">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border mb-1.5 ${getNetworkColor(item.network)}`}>
                          {item.network}
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <div className="text-center flex-1 border-r border-gray-200">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Retail Price</p>
                        <p className="text-sm font-semibold text-gray-600 line-through decoration-gray-400">
                          {isNumeric ? `₦${item.retail}` : item.retail}
                        </p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider mb-0.5">Your Price</p>
                        <p className="text-lg font-black text-green-600">
                          {isNumeric ? `₦${item.reseller}` : item.reseller}
                        </p>
                      </div>
                    </div>

                    {isNumeric && profit !== null && profit > 0 && (
                      <div className="mt-3 text-right">
                        <span className="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">
                          Your Profit: ₦{profit}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10">
                <p className="text-sm font-medium text-gray-500">No plans found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
