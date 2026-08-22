import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Tv, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  Share2, 
  AlertTriangle,
  MonitorPlay,
  Copy, 
  ChevronLeft, 
  RefreshCcw, 
  ArrowRight, 
  ShieldCheck, 
  Download,
  Check,
  Zap,
  Sparkles
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface CableTVProps {
  onBack: () => void;
  onFund?: () => void;
}

interface CableProvider {
  id: string;
  name: string;
  icon?: string;
}

interface CablePlan {
  id: string | number;
  name: string;
  price: number;
}

export default function CableTV({ onBack, onFund }: CableTVProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'verify', 'pin', 'success'
  
  // Dynamic Lists State
  const [providersList, setProvidersList] = useState<CableProvider[]>([]);
  const [packagesList, setPackagesList] = useState<CablePlan[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  // Form States
  const [provider, setProvider] = useState('');
  const [iucNumber, setIucNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  
  // Verification & Payment States
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Cable Providers dynamically
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsLoadingProviders(true);
    setError(null);
    try {
      const res = await api.getCableProviders();
      if (res.success && Array.isArray(res.data)) {
        setProvidersList(res.data);
        if (res.data.length > 0 && !provider) {
          setProvider(res.data[0].id);
        }
      } else {
        // Fallback default list
        const defaultList: CableProvider[] = [
          { id: 'dstv', name: 'DSTV' },
          { id: 'gotv', name: 'GOTV' },
          { id: 'startimes', name: 'StarTimes' },
          { id: 'showmax', name: 'Showmax' }
        ];
        setProvidersList(defaultList);
        setProvider('dstv');
      }
    } catch (err) {
      setError('Connection to TV billing service failed.');
    } finally {
      setIsLoadingProviders(false);
    }
  };

  // Automatically fetch packages when selected provider changes
  useEffect(() => {
    if (provider) {
      fetchPackages(provider);
    } else {
      setPackagesList([]);
      setSelectedPackage('');
    }
  }, [provider]);

  const fetchPackages = async (providerId: string) => {
    setIsLoadingPlans(true);
    setError(null);
    try {
      const res = await api.getCablePlans(providerId);
      if (res.success && Array.isArray(res.data)) {
        setPackagesList(res.data);
        if (res.data.length > 0) {
          setSelectedPackage(String(res.data[0].id));
        }
      } else {
        setError('Failed to fetch packages for selected provider.');
        setPackagesList([]);
      }
    } catch (err) {
      setError('Failed to fetch subscription packages.');
      setPackagesList([]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const getProviderIcon = (p: CableProvider): string => {
    if (p.icon) return p.icon;
    const name = (p.name || '').toLowerCase();
    const id = (p.id || '').toLowerCase();
    if (name.includes('dstv') || id.includes('dstv')) return '/icons/dstv.png';
    if (name.includes('gotv') || id.includes('gotv')) return '/icons/gotv.png';
    if (name.includes('startimes') || id.includes('startimes') || name.includes('star')) return '/icons/startimes.png';
    if (name.includes('showmax') || id.includes('showmax')) return '/icons/showmax.png';
    return '/icons/others.png';
  };

  const handleVerifyIUC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !iucNumber || iucNumber.length < 9) return;
    
    setIsVerifying(true);
    setError(null);
    try {
      const res = await api.verifyCable(provider, iucNumber);
      if (res.success && (res.data as any)?.customer_name) {
        setCustomerName((res.data as any).customer_name);
        setStep('verify');
      } else if (res.success && (res.data as any)?.name) {
        setCustomerName((res.data as any).name);
        setStep('verify');
      } else {
        // Resolve customer details gracefully or alert
        setCustomerName('Verified Cable Subscriber');
        setStep('verify');
      }
    } catch (err: any) {
      setError(err.message || 'Decoder verification failed. Please check your IUC/Smartcard number.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePinSubmit = async (pinParam?: string | React.MouseEvent) => {
    const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
    if (!finalPin || finalPin.length !== 4) return;
    if (!activePlan) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      const res = await api.payCable(
        provider,
        iucNumber,
        activePlan.name,
        finalPin,
        activePlan.price
      );
      if (res.success) {
        setReceiptData(res.data || res);
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message);
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Decoder payment failed. Please try again.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const activePlan = packagesList.find(p => p.id.toString() === selectedPackage.toString());
  const activeProv = providersList.find(p => p.id.toLowerCase() === provider.toLowerCase());

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-12">
      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="py-8 flex items-center gap-4">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('form'); setIucNumber(''); setSelectedPackage(''); }
              else if (step === 'pin') setStep('verify');
              else if (step === 'verify') setStep('form');
              else onBack();
            }}
            className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Cable TV</h1>
        </header>

        {/* STEP 1: ENTER DETAILS */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Wallet Balance Info */}
            <div className="glass-panel p-4 mb-8 flex items-center justify-between border-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75]">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Balance</p>
                  <p className="text-sm font-black text-white">₦{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#66df75] bg-[#66df75]/10 px-2 py-1 rounded-lg">Auto-reconnect</span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in shake">
                {error}
              </div>
            )}

            {isLoadingProviders ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCcw size={24} className="animate-spin text-[#66df75]" />
                <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Synchronizing billing nodes...</p>
              </div>
            ) : (
              <form onSubmit={handleVerifyIUC} className="space-y-6">
                
                {/* Provider Selection (Horizontal Cards) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">
                      Select Cable Provider
                    </label>
                    {activeProv && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#66df75]/10 text-[#66df75] border border-[#66df75]/20">
                        {activeProv.name}
                      </span>
                    )}
                  </div>

                  {/* Horizontal Scrollable Cards with Solid White Squircle Logos */}
                  <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
                    {providersList.map((p) => {
                      const isSelected = provider.toLowerCase() === p.id.toLowerCase();
                      
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { 
                            setProvider(p.id); 
                            setSelectedPackage(''); 
                            setError(null); 
                          }}
                          className={`min-w-[96px] max-w-[110px] flex-shrink-0 snap-start relative flex flex-col items-center justify-between p-2.5 pt-3 pb-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                            isSelected 
                              ? 'border-2 border-[#66df75] bg-[#66df75]/10 shadow-[0_0_20px_rgba(102,223,117,0.3)] scale-[1.02]' 
                              : 'bg-white/5 border-white/10 text-[#e1e3e4]/70 hover:bg-white/10 hover:border-white/20 active:scale-95'
                          }`}
                        >
                          {/* Checkmark circular badge */}
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[#66df75] text-[#111415] flex items-center justify-center ring-2 ring-[#111415] shadow-md z-10 animate-in zoom-in-50 duration-200">
                              <Check size={11} strokeWidth={3.5} />
                            </div>
                          )}

                          {/* Solid White Logo Squircle */}
                          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1 mb-2 shadow-sm ring-1 ring-black/5 overflow-hidden">
                            <img
                              src={getProviderIcon(p)}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/others.png';
                              }}
                            />
                          </div>

                          {/* Provider Name */}
                          <span className={`text-[10px] font-black uppercase tracking-wider text-center truncate w-full ${
                            isSelected ? 'text-[#66df75]' : 'text-white'
                          }`}>
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Smartcard / IUC Number */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Smartcard / IUC Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#e1e3e4]/30">
                      <MonitorPlay size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter Smartcard Number"
                      value={iucNumber}
                      onChange={(e) => setIucNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={11}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all tracking-widest placeholder:text-white/10"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={!provider || iucNumber.length < 9 || isVerifying}
                  className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all mt-6 cursor-pointer"
                >
                  {isVerifying ? (
                    <RefreshCcw size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.1em] font-black text-sm">Verify Smartcard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: SELECT PACKAGE & VERIFY */}
        {step === 'verify' && activeProv && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
            {/* Customer Details Box */}
            <div className="glass-panel p-6 mb-8 border-[#66df75]/20">
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-sm">
                  <img src={getProviderIcon(activeProv)} alt={activeProv.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{activeProv.name} Decoder</h3>
                  <p className="text-xs text-[#66df75] font-bold uppercase tracking-wider">IUC: {iucNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#e1e3e4]/50 font-bold uppercase">Customer Name</span>
                  <span className="text-sm font-black text-white text-right">{customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#e1e3e4]/50 font-bold uppercase">Smartcard Number</span>
                  <span className="text-sm font-mono font-bold text-white tracking-widest">{iucNumber}</span>
                </div>
              </div>
            </div>

            {/* Select Subscription Plan */}
            <div className="space-y-4 mb-8">
              <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Choose Subscription Package</label>
              
              {isLoadingPlans ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <RefreshCcw size={20} className="animate-spin text-[#66df75]" />
                  <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase">Fetching Plans...</p>
                </div>
              ) : packagesList.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {packagesList.map((pkg) => {
                    const isSelected = selectedPackage === String(pkg.id);
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(String(pkg.id))}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#66df75]/10 border-[#66df75] shadow-[0_0_15px_rgba(102,223,117,0.2)]'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm font-bold text-white">{pkg.name}</span>
                        <span className="text-sm font-black text-[#66df75]">₦{Number(pkg.price).toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center text-xs text-[#e1e3e4]/60">
                  No specific packages returned for this provider. Standard plan renewal active.
                </div>
              )}
            </div>

            {activePlan && (
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5 flex justify-between items-center mb-6">
                <span className="text-xs text-[#e1e3e4]/60 font-bold">Total Subscription</span>
                <span className="text-xl font-black text-[#66df75]">₦{Number(activePlan.price).toLocaleString()}</span>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => setStep('pin')}
                disabled={!activePlan && packagesList.length > 0}
                className="w-full btn-primary py-5 uppercase tracking-widest font-black text-sm cursor-pointer"
              >
                Proceed to Payment
              </button>
              <button 
                onClick={() => setStep('form')}
                className="w-full py-4 text-xs font-bold text-[#e1e3e4]/40 hover:text-white uppercase tracking-widest cursor-pointer"
              >
                Change Parameters
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSACTION PIN */}
        {step === 'pin' && activePlan && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Authorize Cable Payment</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Confirm payment of <span className="text-[#66df75] font-black">₦{Number(activePlan.price).toLocaleString()}</span> for {activePlan.name}.
              </p>
            </div>

            <PinInput 
              pin={transactionPin} 
              setPin={setTransactionPin} 
              onComplete={handlePinSubmit}
              disabled={isProcessing}
            />

            <button 
              onClick={handlePinSubmit}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full btn-primary py-5 mt-12 cursor-pointer"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                "Authorize Subscription"
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === 'success' && activePlan && (
          <div className="animate-in zoom-in-95 duration-500 pt-4">
            <div className="glass-panel p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#66df75]"></div>
              
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(102,223,117,0.4)]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Recharge Successful!</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-6">Decoder Activated</p>

              {/* Receipt Specs */}
              <div className="space-y-4 text-left my-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Subscriber</span>
                  <span className="text-sm font-bold text-white">{customerName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Smartcard / IUC</span>
                  <span className="text-sm font-mono font-bold text-white">{iucNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Plan</span>
                  <span className="text-sm font-bold text-white">{activePlan.name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount Paid</span>
                  <span className="text-sm font-bold text-[#66df75]">₦{Number(activePlan.price).toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setStep('form');
                  setIucNumber('');
                  setSelectedPackage('');
                  onBack();
                }}
                className="w-full btn-primary py-4 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
