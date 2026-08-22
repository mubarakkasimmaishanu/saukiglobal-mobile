import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  Lightbulb, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  Copy, 
  Share2, 
  AlertTriangle,
  Zap,
  ChevronLeft,
  RefreshCcw,
  ArrowRight,
  ShieldCheck,
  Check,
  Search,
  X
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface ElectricityBillProps {
  onBack: () => void;
  onFund?: () => void;
}

export interface DiscoProvider {
  id: string | number;
  name: string;
  abbreviation?: string;
  electricityid?: string;
  disco_id?: string | number;
  status?: string;
}

// 14 Comprehensive Official Nigerian DisCos Catalog (Text-Centric & Clean)
const ALL_14_DISCOS: DiscoProvider[] = [
  { id: 1,  name: 'Ikeja Electric (IKEDC)',                  abbreviation: 'IKEDC',     disco_id: 1,  status: 'On' },
  { id: 2,  name: 'Eko Electric (EKEDC)',                    abbreviation: 'EKEDC',     disco_id: 2,  status: 'On' },
  { id: 3,  name: 'Abuja Electric (AEDC)',                   abbreviation: 'AEDC',      disco_id: 3,  status: 'On' },
  { id: 4,  name: 'Kano Electric (KEDCO)',                   abbreviation: 'KEDCO',     disco_id: 4,  status: 'On' },
  { id: 5,  name: 'Enugu Electric (EEDC)',                   abbreviation: 'EEDC',      disco_id: 5,  status: 'On' },
  { id: 6,  name: 'Port Harcourt Electric (PHED)',           abbreviation: 'PHED',      disco_id: 6,  status: 'On' },
  { id: 7,  name: 'Ibadan Electric (IBEDC)',                 abbreviation: 'IBEDC',     disco_id: 7,  status: 'On' },
  { id: 8,  name: 'Kaduna Electric (KAEDCO)',                abbreviation: 'KAEDCO',    disco_id: 8,  status: 'On' },
  { id: 9,  name: 'Jos Electric (JED)',                      abbreviation: 'JED',       disco_id: 9,  status: 'On' },
  { id: 10, name: 'Yola Electric (YEDC)',                    abbreviation: 'YEDC',      disco_id: 11, status: 'On' },
  { id: 11, name: 'Benin Electric (BEDC)',                   abbreviation: 'BEDC',      disco_id: 13, status: 'On' },
  { id: 12, name: 'Aba Electric (APLE)',                     abbreviation: 'APLE',      disco_id: 14, status: 'On' },
  { id: 13, name: 'Aba Power Generation (APL Geometric)',   abbreviation: 'APLE_GEO',  disco_id: 15, status: 'On' },
  { id: 14, name: 'Yola Electric Distribution (North-East)', abbreviation: 'YEDC_NE',   disco_id: 16, status: 'On' },
];

export default function ElectricityBill({ onBack, onFund }: ElectricityBillProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState<'form' | 'verify' | 'pin' | 'success'>('form');
  
  // DisCos State
  const [discosList, setDiscosList] = useState<DiscoProvider[]>(ALL_14_DISCOS);
  const [isLoadingDiscos, setIsLoadingDiscos] = useState(false);
  
  // Vertical Dropdown States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [discoSearch, setDiscoSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form States
  const [provider, setProvider] = useState('IKEDC');
  const [meterType, setMeterType] = useState('prepaid');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  // Verification & Payment States
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    fetchDiscos();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDiscos = async () => {
    setIsLoadingDiscos(true);
    setError(null);
    try {
      const res = await api.getElectricityProviders();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const apiMap = new Map<string, DiscoProvider>();
        
        // 1. Seed defaults
        ALL_14_DISCOS.forEach(d => {
          const key = (d.abbreviation || d.name).toUpperCase();
          apiMap.set(key, d);
        });

        // 2. Overlay live API data
        res.data.forEach((item: any, idx: number) => {
          const key = (item.abbreviation || item.name || `DISCO_${idx}`).toUpperCase();
          const existing = apiMap.get(key) || {};
          apiMap.set(key, {
            ...existing,
            id: item.id || existing.id || idx + 1,
            name: item.name || item.providername || existing.name || 'Electricity Provider',
            abbreviation: item.abbreviation || existing.abbreviation || key,
            disco_id: item.disco_id || item.electricityid || existing.disco_id || idx + 1,
            status: item.status || item.providerStatus || 'On',
          });
        });

        const merged = Array.from(apiMap.values());
        setDiscosList(merged);
        if (merged.length > 0 && !provider) {
          setProvider(merged[0].abbreviation || String(merged[0].id));
        }
      }
    } catch (err) {
      console.warn('Using complete 14 DisCo catalog:', err);
    } finally {
      setIsLoadingDiscos(false);
    }
  };

  const activeDisco = discosList.find(d => 
    String(d.id) === provider || 
    (d.abbreviation && d.abbreviation.toUpperCase() === provider.toUpperCase())
  ) || discosList[0];

  const filteredDiscos = discosList.filter(d => 
    d.name.toLowerCase().includes(discoSearch.toLowerCase()) ||
    (d.abbreviation && d.abbreviation.toLowerCase().includes(discoSearch.toLowerCase()))
  );

  const handleVerifyMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !meterNumber || !amount || Number(amount) < 500) {
      if (Number(amount) < 500) {
        setError('Minimum single electricity payment is ₦500.00');
      }
      return;
    }
    
    setIsVerifying(true);
    setError(null);
    try {
      const res = await api.verifyMeter(meterNumber, provider, meterType);
      if (res.success && res.data) {
        const verifiedName = (res.data as any)?.customer_name || (res.data as any)?.name || (res.data as any)?.customerName || 'Verified Customer';
        const address = (res.data as any)?.customer_address || (res.data as any)?.address || '';
        setCustomerName(verifiedName);
        setCustomerAddress(address);
        setStep('verify');
      } else {
        setError(res.message || 'Unable to verify meter details. Please verify your meter number and selected DisCo.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to meter verification service.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinSubmit = async (pinParam?: string | React.MouseEvent) => {
    const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
    if (!finalPin || finalPin.length !== 4) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const res = await api.payElectricity(
        provider,
        meterNumber,
        Number(amount),
        finalPin,
        meterType
      );
      if (res.success) {
        setReceiptData(res.data || res);
        
        // Retrieve and format token if returned
        const token = (res.data as any)?.token || (res as any)?.token || '';
        if (token) {
          setGeneratedToken(token);
        } else if (meterType === 'prepaid') {
          setGeneratedToken((res.data as any)?.reference || '');
        }
        
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message || 'Payment processing failed. Please check your PIN and wallet balance.');
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Electricity bill payment failed. Please try again.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken).then(() => {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    });
  };

  const handleShareReceipt = () => {
    const shareMessage = `SaukiGlobal Electricity Payment:\nDisCo: ${activeDisco?.name || provider}\nMeter: ${meterNumber} (${meterType.toUpperCase()})\nCustomer: ${customerName}\nAmount: ₦${Number(amount).toLocaleString()}\nToken: ${generatedToken}`;
    if (navigator.share) {
      navigator.share({
        title: 'Electricity Token Receipt',
        text: shareMessage,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareMessage).then(() => {
        alert('Receipt copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-16 selection:bg-[#66df75] selection:text-[#111415]">
      <div className="max-w-md mx-auto relative px-5 pt-3">
        
        {/* HEADER */}
        <header className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => {
                if (step === 'success') { setStep('form'); setMeterNumber(''); setAmount(''); onBack(); }
                else if (step === 'pin') setStep('verify');
                else if (step === 'verify') setStep('form');
                else onBack();
              }}
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white transition-all border border-white/10 shadow-sm cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#66df75]/10 border border-[#66df75]/30 flex items-center justify-center text-[#66df75] shadow-[0_0_15px_rgba(102,223,117,0.15)]">
                <Lightbulb size={20} />
              </div>
              <div className="leading-tight">
                <h1 className="text-sm font-black text-white tracking-tight">Electricity</h1>
                <p className="text-xs font-black text-[#66df75] tracking-tight">Bill Payment</p>
              </div>
            </div>
          </div>

          {/* Wallet pill */}
          <button 
            type="button"
            onClick={onFund}
            className="bg-[#66df75]/10 border border-[#66df75]/30 hover:border-[#66df75] text-[#66df75] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-black tracking-wide active:scale-95 shadow-sm cursor-pointer"
          >
            <span className="text-[9px] text-[#e1e3e4]/60 font-black tracking-wider">WALLET:</span>
            <span className="font-mono font-black">₦{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </button>
        </header>

        {/* STEP 1: FORM VIEW */}
        {step === 'form' && (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
            
            {error && (
              <div className="mb-5 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-2xl animate-in shake flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {error.includes('balance') && onFund && (
                  <button
                    type="button"
                    onClick={onFund}
                    className="px-3 py-1 bg-[#66df75] text-[#111415] text-[10px] font-black rounded-lg uppercase tracking-wider flex-shrink-0 cursor-pointer"
                  >
                    Top Up
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleVerifyMeter} className="space-y-5">
              
              {/* 1. VERTICAL DISCO DROPDOWN SELECTOR (All 14 DisCos - Clean Text Design) */}
              <div className="space-y-2 relative" ref={dropdownRef}>
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">
                    Select DisCo Provider ({discosList.length} DisCos)
                  </label>
                  {activeDisco && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#66df75]/10 text-[#66df75] border border-[#66df75]/20">
                      {activeDisco.abbreviation || 'DISCO'}
                    </span>
                  )}
                </div>

                {/* Vertical Dropdown Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full bg-white/5 border rounded-2xl p-4 flex items-center justify-between gap-3 text-left transition-all duration-200 cursor-pointer ${
                    isDropdownOpen 
                      ? 'border-[#66df75] ring-2 ring-[#66df75]/20 bg-white/10 shadow-[0_0_20px_rgba(102,223,117,0.15)]' 
                      : 'border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 border border-[#66df75]/25 flex items-center justify-center text-[#66df75] flex-shrink-0 shadow-sm">
                      <Zap size={20} className="fill-current" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate leading-tight">
                        {activeDisco?.name || 'Select DisCo Provider'}
                      </p>
                      <p className="text-[10px] text-[#66df75] font-black tracking-wider uppercase mt-0.5">
                        {activeDisco?.abbreviation || 'Official DisCo'}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#66df75] flex-shrink-0">
                    <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Vertical Dropdown Panel */}
                {isDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#181b1c] border border-[#66df75]/30 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-80 flex flex-col">
                    
                    {/* Search DisCo filter bar */}
                    <div className="p-3 border-b border-white/10 bg-black/40 sticky top-0 z-10 flex items-center gap-2">
                      <Search size={16} className="text-[#66df75] flex-shrink-0 ml-1" />
                      <input
                        type="text"
                        placeholder="Search DisCo (e.g. Abuja, Ikeja, Kano, Eko, Jos)..."
                        value={discoSearch}
                        onChange={(e) => setDiscoSearch(e.target.value)}
                        className="w-full bg-transparent border-none text-xs text-white placeholder-white/40 focus:outline-none py-1"
                        autoFocus
                      />
                      {discoSearch && (
                        <button
                          type="button"
                          onClick={() => setDiscoSearch('')}
                          className="text-white/40 hover:text-white p-1 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Vertical List of DisCos */}
                    <div className="overflow-y-auto p-2 space-y-1 divide-y divide-white/5 scrollbar-thin">
                      {filteredDiscos.length > 0 ? (
                        filteredDiscos.map((d) => {
                          const isSelected = provider === String(d.id) || provider === d.abbreviation;
                          const isOffline = d.status && d.status.toLowerCase() !== 'on' && d.status.toLowerCase() !== 'active';

                          return (
                            <button
                              key={d.id}
                              type="button"
                              disabled={isOffline}
                              onClick={() => {
                                setProvider(d.abbreviation || String(d.id));
                                setIsDropdownOpen(false);
                                setDiscoSearch('');
                                setError(null);
                              }}
                              className={`w-full p-3 rounded-xl flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#66df75]/15 text-white font-bold border border-[#66df75]/40 shadow-sm'
                                  : 'hover:bg-white/5 text-[#e1e3e4]/80'
                              } ${isOffline ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                  isSelected 
                                    ? 'bg-[#66df75] text-[#111415]' 
                                    : 'bg-white/5 text-[#66df75] border border-white/10'
                                }`}>
                                  <Zap size={15} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-xs leading-snug truncate ${isSelected ? 'font-black text-white' : 'font-bold text-white/90'}`}>
                                    {d.name}
                                  </p>
                                  <span className="text-[10px] font-black text-[#66df75] uppercase tracking-wider">
                                    {d.abbreviation || 'DISCO'}
                                  </span>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="w-6 h-6 rounded-full bg-[#66df75] text-[#111415] flex items-center justify-center shadow-md flex-shrink-0">
                                  <Check size={14} strokeWidth={3.5} />
                                </div>
                              )}
                            </button>
                          );
                        })
                      ) : (
                        <div className="py-6 text-center text-xs text-white/40 font-bold">
                          No DisCo matching "{discoSearch}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. METER TYPE SELECTOR (Prepaid / Postpaid) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">
                  Meter Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setMeterType('prepaid')}
                    className={`py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      meterType === 'prepaid' 
                        ? 'bg-[#66df75] text-[#111415] font-black shadow-md shadow-[#66df75]/20 scale-[1.01]' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Zap size={14} className={meterType === 'prepaid' ? 'fill-current' : ''} />
                    <span>Prepaid (Token)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeterType('postpaid')}
                    className={`py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      meterType === 'postpaid' 
                        ? 'bg-[#66df75] text-[#111415] font-black shadow-md shadow-[#66df75]/20 scale-[1.01]' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Lightbulb size={14} className={meterType === 'postpaid' ? 'fill-current' : ''} />
                    <span>Postpaid (Bill)</span>
                  </button>
                </div>
              </div>

              {/* 3. METER NUMBER INPUT */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">
                  Meter Number / Account ID
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter 11 to 13 digits meter number"
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all font-mono tracking-wider placeholder:text-white/20"
                  />
                  {meterNumber.length >= 10 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#66df75] bg-[#66df75]/10 px-2 py-0.5 rounded">
                      READY
                    </span>
                  )}
                </div>
              </div>

              {/* 4. PURCHASE AMOUNT INPUT */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">
                  Recharge Amount (₦)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-xl font-black text-white/30">
                    ₦
                  </div>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    min="500"
                    step="100"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all font-mono"
                  />
                </div>
                <p className="text-[9px] text-[#e1e3e4]/40 font-bold uppercase tracking-wider px-1">
                  Minimum recharge is ₦500.00
                </p>
              </div>

              {/* ACTION BUTTON */}
              <button 
                type="submit"
                disabled={!provider || !meterNumber || !amount || Number(amount) < 500 || isVerifying}
                className="w-full btn-primary py-4 px-6 flex justify-center items-center gap-2.5 uppercase tracking-wider font-black text-xs shadow-[0_4px_25px_rgba(102,223,117,0.35)] disabled:opacity-40 disabled:grayscale transition-all mt-6 cursor-pointer"
              >
                {isVerifying ? (
                  <RefreshCcw size={18} className="animate-spin text-[#111415]" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFICATION SUMMARY */}
        {step === 'verify' && activeDisco && (
          <div className="mt-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#181b1c] border border-[#66df75]/30 rounded-3xl p-6 mb-6 shadow-[0_0_40px_rgba(102,223,117,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#66df75]/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/10">
                <div className="w-10 h-10 rounded-2xl bg-[#66df75]/10 border border-[#66df75]/30 flex items-center justify-center text-[#66df75] shadow-sm flex-shrink-0">
                  <Zap size={20} className="fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{activeDisco.name}</h3>
                  <span className="inline-block mt-0.5 text-[10px] font-black text-[#66df75] uppercase tracking-wider bg-[#66df75]/10 px-2 py-0.5 rounded border border-[#66df75]/20">
                    {meterType.toUpperCase()} METER
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#e1e3e4]/50 font-bold uppercase text-[10px]">Customer Name</span>
                  <span className="font-black text-white text-right">{customerName}</span>
                </div>
                {customerAddress && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[#e1e3e4]/50 font-bold uppercase text-[10px] flex-shrink-0">Address</span>
                    <span className="font-medium text-[#e1e3e4]/80 text-right text-[11px]">{customerAddress}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#e1e3e4]/50 font-bold uppercase text-[10px]">Meter Number</span>
                  <span className="font-mono font-black text-white tracking-widest">{meterNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="text-[#e1e3e4]/50 font-bold uppercase text-[10px]">Amount Payable</span>
                  <span className="text-xl font-black text-[#66df75]">₦{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setStep('pin')}
                className="w-full btn-primary py-4 uppercase tracking-wider font-black text-xs shadow-[0_4px_25px_rgba(102,223,117,0.35)] cursor-pointer"
              >
                Proceed to Authorization
              </button>
              <button 
                onClick={() => setStep('form')}
                className="w-full py-3.5 text-xs font-bold text-white/50 hover:text-white uppercase tracking-wider cursor-pointer"
              >
                Edit Parameters
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSACTION PIN */}
        {step === 'pin' && (
          <div className="mt-6 animate-in slide-in-from-bottom-4 duration-300 text-center">
            <div className="w-16 h-16 bg-[#66df75]/10 border border-[#66df75]/30 rounded-3xl flex items-center justify-center mx-auto mb-4 text-[#66df75] shadow-[0_0_20px_rgba(102,223,117,0.2)]">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-black text-white mb-1">Enter Transaction PIN</h2>
            <p className="text-xs text-[#e1e3e4]/60 font-medium px-4 mb-8 leading-relaxed">
              Confirm purchase of <strong className="text-[#66df75]">₦{Number(amount).toLocaleString()}</strong> {activeDisco.name} for <strong className="text-white">{customerName}</strong>.
            </p>

            <PinInput 
              pin={transactionPin} 
              setPin={setTransactionPin} 
              onComplete={handlePinSubmit}
              disabled={isProcessing}
            />

            <button 
              onClick={handlePinSubmit}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full btn-primary py-4 mt-8 uppercase tracking-wider font-black text-xs shadow-[0_4px_25px_rgba(102,223,117,0.35)] disabled:opacity-40 disabled:grayscale transition-all cursor-pointer"
            >
              {isProcessing ? (
                <RefreshCcw size={18} className="animate-spin text-[#111415] mx-auto" />
              ) : (
                "Authorize Transaction"
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === 'success' && activeDisco && (
          <div className="mt-4 animate-in zoom-in-95 duration-300">
            <div className="bg-[#181b1c] border border-[#66df75]/30 rounded-3xl p-6 text-center shadow-[0_0_40px_rgba(102,223,117,0.2)] relative overflow-hidden">
              <div className="w-16 h-16 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(102,223,117,0.4)]">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-xl font-black text-white mb-0.5">Payment Successful</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.2em] mb-6">Token Generated Successfully</p>

              {/* Generated Token Display */}
              {generatedToken && (
                <div className="bg-[#66df75]/10 border border-[#66df75]/30 p-5 rounded-2xl mb-6">
                  <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-1.5">Electricity Meter Token</p>
                  <p className="text-2xl font-mono font-black text-white tracking-widest select-all mb-3">
                    {generatedToken}
                  </p>
                  <button 
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    {copiedToken ? <Check size={14} className="text-[#66df75]" /> : <Copy size={14} />}
                    <span>{copiedToken ? 'Token Copied!' : 'Copy Token'}</span>
                  </button>
                </div>
              )}

              {/* Receipt Breakdown */}
              <div className="space-y-3 text-left my-6 bg-black/40 p-5 rounded-2xl border border-white/5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Customer</span>
                  <span className="font-bold text-white">{customerName}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Meter Number</span>
                  <span className="font-mono font-bold text-white">{meterNumber}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">DisCo</span>
                  <span className="font-bold text-white">{activeDisco.name}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount Paid</span>
                  <span className="font-bold text-[#66df75]">₦{Number(amount).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleShareReceipt}
                  className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-2xl border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Share2 size={16} /> Share
                </button>
                <button 
                  onClick={() => {
                    setStep('form');
                    setMeterNumber('');
                    setAmount('');
                    onBack();
                  }}
                  className="w-full btn-primary py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
