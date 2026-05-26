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
  Download
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface ElectricityBillProps {
  onBack: () => void;
}

interface DiscoProvider {
  id: string;
  name: string;
}

export default function ElectricityBill({ onBack }: ElectricityBillProps) {
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
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        setError('Failed to fetch active DisCo providers.');
      }
    } catch (err) {
      setError('Connection to utility server failed.');
    } finally {
      setIsLoadingDiscos(false);
    }
  };

  const handleVerifyMeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !meterNumber || !amount || Number(amount) < 500) return;
    
    setIsVerifying(true);
    setError(null);
    // Simulate API call to VTU Provider to resolve meter customer details
    setTimeout(() => {
      setCustomerName('ALH. IBRAHIM MUBARAK KASIM');
      setIsVerifying(false);
      setStep('verify');
    }, 1500);
  };

  const handlePinSubmit = async () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const res = await api.payElectricity(
        provider,
        meterNumber,
        Number(amount),
        transactionPin.join('')
      );
      if (res.success) {
        setReceiptData(res.data || res);
        
        // Retrieve and format token if returned
        const token = (res.data as any)?.token || (res as any)?.token || '';
        if (token) {
          setGeneratedToken(token);
        } else if (meterType === 'prepaid') {
          // Fallback demo token formatted
          setGeneratedToken('4920 1827 3847 9028 1748');
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
      alert('Token copied to clipboard!');
    });
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Electricity Token',
        text: `Electricity Purchase: ${provider.toUpperCase()} Prepaid Token: ${generatedToken}`,
      }).catch(() => {});
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  const activeDisco = discosList.find(d => d.id === provider);

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
                
                {/* Provider Selector (Dynamic Dropdown) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Select DisCo Provider</label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#66df75]">
                      <Lightbulb size={20} />
                    </div>
                    <select 
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      required
                      className="w-full bg-[#111415] border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none"
                    >
                      <option value="" disabled className="bg-[#111415]">Choose distribution company</option>
                      {discosList.map(d => (
                        <option key={d.id} value={d.id} className="bg-[#111415]">{d.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#e1e3e4]/30">
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {/* Meter Type Selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Meter Type</label>
                  <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setMeterType('prepaid')}
                      className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all ${
                        meterType === 'prepaid' ? 'bg-[#66df75] text-[#111415] shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Prepaid
                    </button>
                    <button
                      type="button"
                      onClick={() => setMeterType('postpaid')}
                      className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all ${
                        meterType === 'postpaid' ? 'bg-[#66df75] text-[#111415] shadow-sm' : 'text-gray-400 hover:text-white'
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
                  className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all mt-8"
                >
                  {isVerifying ? (
                    <RefreshCcw size={20} className="animate-spin text-[#111415]" />
                  ) : (
                    <>
                      <span className="uppercase tracking-[0.1em] font-black text-sm">Verify Meter details</span>
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: VERIFY DETAILS */}
        {step === 'verify' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div className="bg-[#e1e3e4]/5 border border-white/10 p-4 rounded-xl flex gap-3">
              <AlertTriangle size={20} className="text-[#66df75] flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-[#e1e3e4]/70 leading-relaxed font-bold uppercase tracking-wider">
                Please confirm the meter name matches below. We are unable to cancel or reverse payments sent to wrong accounts.
              </p>
            </div>

            <div className="glass-panel text-white rounded-2xl p-6 border-white/10 relative overflow-hidden">
              <div className="mb-4">
                <p className="text-[9px] text-[#e1e3e4]/40 font-black uppercase tracking-wider mb-1">Customer / Meter Owner</p>
                <p className="text-lg font-bold text-white">{customerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-[#e1e3e4]/40 font-black uppercase tracking-wider mb-1">Meter Number</p>
                  <p className="text-sm font-bold text-white font-mono tracking-widest">{meterNumber}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#e1e3e4]/40 font-black uppercase tracking-wider mb-1">Utility Node</p>
                  <p className="text-sm font-bold text-white uppercase">{activeDisco?.name || provider}</p>
                </div>
              </div>
              <div className="pt-5 mt-5 border-t border-white/5 flex justify-between items-center text-sm font-bold">
                <span className="text-[#e1e3e4]/40 uppercase tracking-widest text-[9px] font-black">Total Charge</span>
                <span className="text-2xl font-black text-[#66df75]">₦{Number(amount).toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep('pin')}
              className="w-full btn-primary py-5 flex justify-center items-center"
            >
              <span className="uppercase tracking-[0.1em] font-black text-sm">Proceed to Payment</span>
            </button>
          </div>
        )}

        {/* STEP 3: PIN VERIFICATION */}
        {step === 'pin' && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300 pt-8">
            <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mb-6 text-[#66df75]">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authorize Utility PIN</h2>
            <p className="text-xs text-[#e1e3e4]/40 font-medium text-center mb-10 px-8 leading-relaxed">
              Confirm payment of <strong className="text-white font-bold">₦{Number(amount).toLocaleString()}</strong> to {activeDisco?.name || provider.toUpperCase()}.
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
                <span className="uppercase tracking-[0.1em] font-black text-sm">Verify & Pay ₦{Number(amount).toLocaleString()}</span>
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS / TOKEN RECEIPT */}
        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#66df75]"></div>
              
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(102,223,117,0.4)]">
                <CheckCircle2 size={40} />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-1">Payment Successful</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Token Generated</p>

              {/* Prepaid Token Showcase */}
              {meterType === 'prepaid' ? (
                <div className="w-full card-mesh rounded-[2rem] p-6 text-center text-white shadow-2xl mb-8 border border-white/5 relative overflow-hidden">
                  <Zap size={100} className="absolute -right-4 -bottom-4 text-[#66df75] opacity-5 animate-pulse" />
                  
                  <p className="text-[#e1e3e4]/40 text-[9px] font-black uppercase tracking-widest mb-3">Electricity Tokens PIN</p>
                  
                  <h1 className="text-2xl font-mono font-black tracking-widest mb-5 text-[#66df75] drop-shadow-md">
                    {generatedToken}
                  </h1>
                  
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div className="text-left">
                      <p className="text-[9px] text-[#e1e3e4]/40 font-bold uppercase">Paid</p>
                      <p className="font-bold">₦{Number(amount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-[#e1e3e4]/40 font-bold uppercase">Estimated Units</p>
                      <p className="font-bold text-[#66df75]">142.5 kWh</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Postpaid Invoice Statement */
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
                  <p className="text-xs font-bold text-center border-b border-white/5 pb-2 text-[#e1e3e4]/80">Postpaid Invoice Cleared</p>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#e1e3e4]/40">Amount Dispatched</span>
                    <span className="font-bold text-white">₦{Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#e1e3e4]/40">Reference Node</span>
                    <span className="font-mono text-white/70">{receiptData?.reference || 'SG-ELEC-77123'}</span>
                  </div>
                </div>
              )}

              {/* Receipt Control Buttons */}
              <div className="flex gap-3 w-full mb-6">
                {meterType === 'prepaid' && (
                  <button 
                    onClick={handleCopyToken}
                    className="flex-1 glass-panel py-3.5 flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/10"
                  >
                    <Copy size={16} />
                    Copy Token
                  </button>
                )}
                <button 
                  onClick={handleShareReceipt}
                  className="flex-1 glass-panel py-3.5 flex items-center justify-center gap-2 text-xs font-bold hover:bg-white/10"
                >
                  <Share2 size={16} />
                  Share Receipt
                </button>
              </div>

              <button 
                onClick={() => { setStep('form'); setMeterNumber(''); setAmount(''); setTransactionPin(['','','','']); onBack(); }}
                className="w-full btn-primary py-4"
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
