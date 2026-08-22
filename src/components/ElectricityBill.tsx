import React, { useState, useEffect } from 'react';
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
  Download,
  Check,
  ExternalLink
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface ElectricityBillProps {
  onBack: () => void;
  onFund?: () => void;
}

interface DiscoProvider {
  id: string | number;
  name: string;
  abbreviation?: string;
  electricityid?: string;
  disco_id?: string | number;
  status?: string;
  icon?: string;
}

export default function ElectricityBill({ onBack, onFund }: ElectricityBillProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'verify', 'pin', 'success'
  
  // Lists state
  const [discosList, setDiscosList] = useState<DiscoProvider[]>([]);
  const [isLoadingDiscos, setIsLoadingDiscos] = useState(true);

  // Form States
  const [provider, setProvider] = useState('');
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

  const fetchDiscos = async () => {
    setIsLoadingDiscos(true);
    setError(null);
    try {
      const res = await api.getElectricityProviders();
      if (res.success && Array.isArray(res.data)) {
        setDiscosList(res.data);
        if (res.data.length > 0 && !provider) {
          const first = res.data[0];
          setProvider(first.abbreviation || String(first.id));
        }
      } else {
        setError('Failed to fetch active DisCo providers.');
      }
    } catch (err) {
      setError('Connection to utility server failed.');
    } finally {
      setIsLoadingDiscos(false);
    }
  };

  const getDiscoIcon = (disco: DiscoProvider): string => {
    if (disco.icon) return disco.icon;
    const name = (disco.name || '').toLowerCase();
    const abbr = (disco.abbreviation || '').toLowerCase();
    
    if (abbr.includes('ikeja') || name.includes('ikeja') || abbr.includes('ikedc')) return '/icons/ikeja.png';
    if (abbr.includes('eko') || name.includes('eko') || abbr.includes('ekedc')) return '/icons/ekedc.png';
    if (abbr.includes('abuja') || name.includes('abuja') || abbr.includes('aedc')) return '/icons/aedc.png';
    if (abbr.includes('kano') || name.includes('kano') || abbr.includes('kedco')) return '/icons/kedco.png';
    if (abbr.includes('ibadan') || name.includes('ibadan') || abbr.includes('ibedc')) return '/icons/ibedc.png';
    if (abbr.includes('kaduna') || name.includes('kaduna') || abbr.includes('kaedco')) return '/icons/kaduna.png';
    if (abbr.includes('jos') || name.includes('jos') || abbr.includes('jed')) return '/icons/jos.png';
    if (abbr.includes('port') || name.includes('port') || abbr.includes('phed')) return '/icons/phedc.png';
    if (abbr.includes('enugu') || name.includes('enugu') || abbr.includes('eedc')) return '/icons/enugu.png';
    if (abbr.includes('yola') || name.includes('yola') || abbr.includes('yedc')) return '/icons/yola.png';
    if (abbr.includes('benin') || name.includes('benin') || abbr.includes('bedc')) return '/icons/benin.png';
    if (abbr.includes('aba') || name.includes('aba') || abbr.includes('aple')) return '/icons/aba.png';
    
    return '/icons/others.png';
  };

  const handleVerifyMeter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !meterNumber || !amount || Number(amount) < 500) return;
    
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
        setError(res.message || 'Unable to verify meter details. Please check the meter number and provider.');
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
        setError(res.message);
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Electricity bill payment failed.');
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
    if (navigator.share) {
      navigator.share({
        title: 'Electricity Token',
        text: `Electricity Purchase: ${provider.toUpperCase()} ${meterType.toUpperCase()} Token: ${generatedToken}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Electricity Purchase: ${provider.toUpperCase()} ${meterType.toUpperCase()} Token: ${generatedToken}`).then(() => {
        alert('Receipt copied to clipboard!');
      });
    }
  };

  const activeDisco = discosList.find(d => String(d.id) === provider || d.abbreviation === provider);

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-12">
      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="py-8 flex items-center gap-4">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('form'); setMeterNumber(''); setAmount(''); }
              else if (step === 'pin') setStep('verify');
              else if (step === 'verify') setStep('form');
              else onBack();
            }}
            className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Electricity</h1>
        </header>

        {/* STEP 1: ENTER DETAILS */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Balance Snippet */}
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
              <span className="text-[10px] font-bold text-[#66df75] bg-[#66df75]/10 px-2 py-1 rounded-lg">Instant Tokens</span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in shake">
                {error}
              </div>
            )}

            {isLoadingDiscos ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCcw size={24} className="animate-spin text-[#66df75]" />
                <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Retrieving DisCos...</p>
              </div>
            ) : (
              <form onSubmit={handleVerifyMeter} className="space-y-6">
                
                {/* Provider Selection (Horizontal Cards) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">
                      Select DisCo Provider
                    </label>
                    {activeDisco && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#66df75]/10 text-[#66df75] border border-[#66df75]/20">
                        {activeDisco.abbreviation || activeDisco.name}
                      </span>
                    )}
                  </div>

                  {/* Horizontal Scrollable DisCo Cards */}
                  <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
                    {discosList.map((d) => {
                      const isSelected = provider === String(d.id) || provider === d.abbreviation;
                      const isOffline = d.status && d.status.toLowerCase() !== 'on' && d.status.toLowerCase() !== 'active';

                      return (
                        <button
                          key={d.id}
                          type="button"
                          disabled={isOffline}
                          onClick={() => {
                            setProvider(d.abbreviation || String(d.id));
                            setError(null);
                          }}
                          className={`min-w-[96px] max-w-[110px] flex-shrink-0 snap-start relative flex flex-col items-center justify-between p-2.5 pt-3 pb-2.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-[#66df75]/10 border-2 border-[#66df75] shadow-[0_0_20px_rgba(102,223,117,0.3)] scale-[1.02]'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 active:scale-95'
                          } ${isOffline ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                        >
                          {/* Checkmark badge */}
                          {isSelected && (
                            <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[#66df75] text-[#111415] flex items-center justify-center ring-2 ring-[#111415] shadow-md z-10 animate-in zoom-in-50 duration-200">
                              <Check size={11} strokeWidth={3.5} />
                            </div>
                          )}

                          {/* Solid White Squircle Container for DisCo Logo */}
                          <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1 mb-2 shadow-sm ring-1 ring-black/5 overflow-hidden">
                            <img
                              src={getDiscoIcon(d)}
                              alt={d.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/others.png';
                              }}
                            />
                          </div>

                          {/* DisCo Abbreviation / Name */}
                          <span className={`text-[10px] font-black uppercase tracking-wider text-center truncate w-full ${
                            isSelected ? 'text-[#66df75]' : 'text-white'
                          }`}>
                            {d.abbreviation || d.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected DisCo Overview Pill */}
                {activeDisco && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 animate-in fade-in duration-300">
                    <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm flex-shrink-0">
                      <img 
                        src={getDiscoIcon(activeDisco)} 
                        alt={activeDisco.name} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{activeDisco.name}</p>
                      <p className="text-[10px] text-[#66df75] font-bold">Official Distribution Company</p>
                    </div>
                  </div>
                )}

                {/* Meter Type Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Meter Type</label>
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setMeterType('prepaid')}
                      className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        meterType === 'prepaid' ? 'bg-[#66df75] text-[#111415] shadow-sm font-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Prepaid
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeterType('postpaid')}
                      className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        meterType === 'postpaid' ? 'bg-[#66df75] text-[#111415] shadow-sm font-black' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Postpaid
                    </button>
                  </div>
                </div>

                {/* Meter Number */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Meter Number / Account ID</label>
                  <input 
                    type="text" 
                    placeholder="Enter meter number"
                    value={meterNumber}
                    onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all tracking-widest placeholder:text-white/10"
                  />
                </div>

                {/* Amount */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Purchase Amount (₦)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-2xl font-black text-white/30">
                      ₦
                    </div>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      min="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                    />
                  </div>
                  <p className="text-[9px] text-[#e1e3e4]/40 font-bold uppercase tracking-wider px-1">Minimum single payment is ₦500</p>
                </div>

                {/* Action Button */}
                <button 
                  type="submit"
                  disabled={!provider || !meterNumber || !amount || isVerifying}
                  className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all mt-8 cursor-pointer"
                >
                  {isVerifying ? (
                    <RefreshCcw size={20} className="animate-spin text-[#111415]" />
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.1em] font-black text-sm">Verify Meter details</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: VERIFICATION SUMMARY */}
        {step === 'verify' && activeDisco && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
            <div className="glass-panel p-6 mb-8 border-[#66df75]/20">
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-white/5">
                <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-sm">
                  <img src={getDiscoIcon(activeDisco)} alt={activeDisco.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{activeDisco.name}</h3>
                  <p className="text-xs text-[#66df75] font-bold uppercase tracking-wider">{meterType} Meter</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#e1e3e4]/50 font-bold uppercase">Customer Name</span>
                  <span className="text-sm font-black text-white text-right">{customerName}</span>
                </div>
                {customerAddress && (
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs text-[#e1e3e4]/50 font-bold uppercase flex-shrink-0">Address</span>
                    <span className="text-xs font-medium text-[#e1e3e4]/80 text-right">{customerAddress}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#e1e3e4]/50 font-bold uppercase">Meter Number</span>
                  <span className="text-sm font-mono font-bold text-white tracking-widest">{meterNumber}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <span className="text-xs text-[#e1e3e4]/50 font-bold uppercase">Total Payable</span>
                  <span className="text-xl font-black text-[#66df75]">₦{Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setStep('pin')}
                className="w-full btn-primary py-5 uppercase tracking-widest font-black text-sm cursor-pointer"
              >
                Proceed to Payment
              </button>
              <button 
                onClick={() => setStep('form')}
                className="w-full py-4 text-xs font-bold text-[#e1e3e4]/40 hover:text-white uppercase tracking-widest cursor-pointer"
              >
                Edit Parameters
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRANSACTION PIN */}
        {step === 'pin' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Authorize Payment</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Confirm payment of <span className="text-[#66df75] font-black">₦{Number(amount).toLocaleString()}</span> for {customerName}.
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
                "Authorize Transaction"
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === 'success' && activeDisco && (
          <div className="animate-in zoom-in-95 duration-500 pt-4">
            <div className="glass-panel p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#66df75]"></div>
              
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(102,223,117,0.4)]">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Payment Successful</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-6">Token Generated</p>

              {/* Generated Token Display */}
              {generatedToken && (
                <div className="bg-[#66df75]/10 border border-[#66df75]/20 p-6 rounded-2xl mb-8">
                  <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2">Meter Token</p>
                  <p className="text-2xl font-mono font-black text-white tracking-widest select-all mb-4">
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

              {/* Receipt Specs */}
              <div className="space-y-4 text-left my-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Customer</span>
                  <span className="text-sm font-bold text-white">{customerName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Meter Number</span>
                  <span className="text-sm font-mono font-bold text-white">{meterNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">DisCo</span>
                  <span className="text-sm font-bold text-white">{activeDisco.name}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount Paid</span>
                  <span className="text-sm font-bold text-[#66df75]">₦{Number(amount).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={handleShareReceipt}
                  className="w-full py-4 glass-panel text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 cursor-pointer"
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
                  className="w-full btn-primary py-4 text-xs font-black uppercase tracking-wider cursor-pointer"
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
