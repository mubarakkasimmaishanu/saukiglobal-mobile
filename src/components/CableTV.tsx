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
  Download
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface CableTVProps {
  onBack: () => void;
}

interface CableProvider {
  id: string;
  name: string;
}

interface CablePlan {
  id: string | number;
  name: string;
  price: number;
}

export default function CableTV({ onBack }: CableTVProps) {
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
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Styling properties matching decoder brands
  const providerBrands: Record<string, { color: string; bg: string }> = {
    dstv: { color: '#009bf6', bg: 'bg-[#009bf6]/10' },
    gotv: { color: '#00af43', bg: 'bg-[#00af43]/10' },
    startimes: { color: '#f36f21', bg: 'bg-[#f36f21]/10' },
    showmax: { color: '#e50914', bg: 'bg-[#e50914]/10' }
  };

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
      } else {
        setError('Failed to fetch television billing channels.');
      }
    } catch (err) {
      setError('Connection to TV billing node lost.');
    } finally {
      setIsLoadingProviders(false);
    }
  };

  // Fetch plans whenever provider changes
  useEffect(() => {
    if (provider) {
      fetchPlans(provider);
    } else {
      setPackagesList([]);
      setSelectedPackage('');
    }
  }, [provider]);

  const fetchPlans = async (provId: string) => {
    setIsLoadingPlans(true);
    setError(null);
    try {
      const res = await api.getCablePlans(provId);
      if (res.success && Array.isArray(res.data)) {
        setPackagesList(res.data);
      } else {
        setPackagesList([]);
        setError(res.message || 'No packages found for this provider.');
      }
    } catch (err) {
      setPackagesList([]);
      setError('Failed to retrieve billing bouquets.');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const handleVerifyIUC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !iucNumber || iucNumber.length < 9) return;
    
    setIsVerifying(true);
    setError(null);
    // Simulate API call to VTU Provider to resolve IUC/Smartcard decoder details
    setTimeout(() => {
      setCustomerDetails({
        name: 'MUBARAK IBRAHIM MAISHANU',
        currentPackage: provider.toUpperCase() + ' Compact / Yanga Active',
        dueDate: '24th June, 2026'
      });
      setIsVerifying(false);
      setStep('verify');
    }, 1500);
  };

  const handlePinSubmit = async () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const planObj = packagesList.find(p => p.id.toString() === selectedPackage.toString());
      const res = await api.payCable(
        provider,
        iucNumber,
        selectedPackage,
        transactionPin.join(''),
        planObj ? Number(planObj.price) : 0
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
  const activeBrand = providerBrands[provider.toLowerCase()] || { color: '#66df75', bg: 'bg-[#66df75]/10' };

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
                
                {/* Provider Grid Selector (Dynamic) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Select Cable Provider</label>
                  <div className="grid grid-cols-2 gap-3">
                    {providersList.map((p) => {
                      const brand = providerBrands[p.name.toLowerCase()] || { color: '#ffffff', bg: 'bg-white/10' };
                      const isSelected = provider.toLowerCase() === p.id.toLowerCase();
                      
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setProvider(p.id); setSelectedPackage(''); setError(null); }}
                          className={`py-4 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                            isSelected 
                              ? 'bg-[#66df75] border-[#66df75] text-[#111415] shadow-lg shadow-[#66df75]/20 scale-[1.02]' 
                              : 'bg-white/5 border-white/10 text-[#e1e3e4]/70 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <Tv size={18} className={isSelected ? 'text-[#111415]' : 'text-[#e1e3e4]/50'} /> 
                          {p.name}
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
                  className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all mt-6"
                >
                  {isVerifying ? (
                    <RefreshCcw size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.1em] font-black text-sm">Verify Smartcard</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: VERIFY DETAILS & BOUQUET SELECTION */}
        {step === 'verify' && customerDetails && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
            <div className="bg-[#e1e3e4]/5 border border-white/10 p-4 rounded-xl flex gap-3">
              <AlertTriangle size={20} className="text-[#66df75] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#e1e3e4]/70 leading-relaxed font-bold uppercase tracking-wider">
                Confirm your decoder details below. Subscriptions sent to wrong accounts cannot be reversed.
              </p>
            </div>

            {/* Customer Decoder Details Card */}
            <div className="glass-panel text-white rounded-2xl p-6 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="text-[9px] font-black bg-white/10 px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                  {provider.toUpperCase()}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-[9px] text-[#e1e3e4]/40 font-black uppercase tracking-wider mb-1">Customer Name</p>
                <p className="text-lg font-bold text-white">{customerDetails.name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-[#e1e3e4]/40 font-black uppercase tracking-wider mb-1">IUC Number</p>
                  <p className="text-sm font-bold text-white font-mono tracking-widest">{iucNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#e1e3e4]/40 font-black uppercase tracking-wider mb-1">Current Bouquet</p>
                  <p className="text-sm font-bold text-[#66df75]">{customerDetails.currentPackage}</p>
                </div>
              </div>
            </div>

            {/* Bouquet Select Menu */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Choose Subscription bouquet</label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#66df75]">
                  {isLoadingPlans ? <RefreshCcw size={20} className="animate-spin" /> : <Tv size={20} />}
                </div>
                <select 
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  disabled={isLoadingPlans || packagesList.length === 0}
                  className="w-full bg-[#111415] border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none"
                >
                  <option value="" disabled className="bg-[#111415]">
                    {isLoadingPlans ? 'Downloading bouquets...' : 'Select a package'}
                  </option>
                  {packagesList.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#111415]">
                      {p.name} — ₦{Number(p.price).toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#e1e3e4]/30">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="glass-panel p-4 rounded-xl flex gap-3 border-white/10">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" />
              <p className="text-[10px] text-[#e1e3e4]/60 font-semibold leading-relaxed">
                ENSURE YOUR DECODER IS POWERED ON BEFORE PAYING TO PREVENT DELAY IN COMMENCING VIEWS.
              </p>
            </div>

            <button 
              onClick={() => setStep('pin')}
              disabled={!selectedPackage}
              className="w-full btn-primary py-5 flex justify-center items-center"
            >
              <span className="uppercase tracking-[0.1em] font-black text-sm">Pay ₦{activePlan ? Number(activePlan.price).toLocaleString() : '0.00'}</span>
            </button>
          </div>
        )}

        {/* STEP 3: PIN VERIFICATION */}
        {step === 'pin' && customerDetails && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300 pt-8">
            <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mb-6 text-[#66df75]">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Confirm Payment</h2>
            <p className="text-xs text-[#e1e3e4]/40 font-medium text-center mb-10 px-8 leading-relaxed">
              You are subscribing <strong className="text-white font-bold">{customerDetails.name}</strong> to the package <strong className="text-white font-bold">{activePlan?.name}</strong>.
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
              className="w-full btn-primary py-5 mt-12 flex justify-center items-center gap-3"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="uppercase tracking-[0.1em] font-black text-sm">Pay ₦{activePlan ? Number(activePlan.price).toLocaleString() : '0.00'}</span>
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS / RECEIPT */}
        {step === 'success' && customerDetails && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#66df75]"></div>
              
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(102,223,117,0.4)]">
                <CheckCircle2 size={40} />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-1">Recharge Success</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Service Activated</p>

              <div className="space-y-4 text-left mb-8">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Subscriber</span>
                  <span className="text-sm font-bold text-white">{customerDetails.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Smartcard / IUC</span>
                  <span className="text-sm font-bold text-white tracking-widest font-mono">{iucNumber}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Bouquet</span>
                  <span className="text-sm font-bold text-[#66df75]">{activePlan?.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount Paid</span>
                  <span className="text-sm font-black text-white">₦{activePlan ? Number(activePlan.price).toLocaleString() : '0.00'}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Reference</span>
                  <span className="text-[10px] font-mono font-bold text-white/60">{receiptData?.reference || 'SG-TV-28193'}</span>
                </div>
              </div>

              {/* Receipt Control Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button className="glass-panel py-3.5 flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/10">
                  <Download size={16} /> Receipt
                </button>
                <button className="glass-panel py-3.5 flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/10">
                  <Share2 size={16} /> Share
                </button>
              </div>

              <button 
                onClick={() => {
                  setStep('form');
                  setIucNumber('');
                  setSelectedPackage('');
                  setTransactionPin(['','','','']);
                  onBack();
                }}
                className="w-full btn-primary py-4 mt-2"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
