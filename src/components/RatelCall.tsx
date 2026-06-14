import React, { useState, useEffect } from 'react';
import {
  Wallet,
  PhoneCall,
  Contact,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Download,
  Share2,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface RatelCallProps {
  onBack: () => void;
}

interface RatelPlan {
  plan_id: string;
  user_price: number;
  agent_price: number;
  vendor_price: number;
  buying_price: number;
}

export default function RatelCall({ onBack }: RatelCallProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState<'form' | 'pin' | 'success'>('form');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('MTN'); // Defaults to MTN
  const [plans, setPlans] = useState<Record<string, RatelPlan>>({});
  const [selectedDuration, setSelectedDuration] = useState('');
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Network visual configuration matching design system
  const networkStyles: Record<string, { color: string; label: string }> = {
    MTN: { color: '#ffcb05', label: 'MTN' },
    AIRTEL: { color: '#ff0000', label: 'Airtel' },
    GLO: { color: '#39b54a', label: 'GLO' },
    '9MOBILE': { color: '#00573d', label: '9mobile' }
  };

  const phonePrefixes: Record<string, string[]> = {
    MTN: ['0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916', '0703', '0706'],
    AIRTEL: ['0802', '0808', '0812', '0902', '0907', '0901', '0912', '0701', '0708'],
    GLO: ['0805', '0807', '0811', '0815', '0905', '0915', '0705'],
    '9MOBILE': ['0809', '0817', '0818', '0909', '0908']
  };

  // Determine user tier for proper pricing lookup
  const userTier = user?.tier?.toLowerCase() || 'member';
  const getPlanPrice = (plan: RatelPlan) => {
    if (userTier === 'agent') return Number(plan.agent_price);
    if (userTier === 'vendor') return Number(plan.vendor_price);
    return Number(plan.user_price);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    setError(null);
    try {
      const res = await api.getRatelPlans();
      if (res.success && res.data) {
        setPlans(res.data);
      } else {
        setError('Unable to load Ratel minutes packages.');
      }
    } catch (err) {
      setError('Connection to configuration nodes failed.');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  // Automatic Prefix Detector
  useEffect(() => {
    if (phone.length >= 4) {
      const prefix = phone.substring(0, 4);
      let detectedNet = 'MTN';
      let found = false;

      for (const [netKey, prefixes] of Object.entries(phonePrefixes)) {
        if (prefixes.includes(prefix)) {
          detectedNet = netKey;
          found = true;
          break;
        }
      }

      if (found && network !== detectedNet) {
        setNetwork(detectedNet);
      }
    }
  }, [phone]);

  const selectedPlanData = selectedDuration ? plans[selectedDuration] : null;
  const currentPrice = selectedPlanData ? getPlanPrice(selectedPlanData) : 0;

  const handleProcessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11 || !selectedDuration || currentPrice <= 0) return;

    if (user && user.balance < currentPrice) {
      setError(`Insufficient balance. Purchase cost: ₦${currentPrice.toLocaleString()}, available: ₦${user.balance.toLocaleString()}`);
      return;
    }

    setError(null);
    setStep('pin');
  };

  const handleConfirmPurchase = async (pinParam?: string | React.MouseEvent) => {
    setIsProcessing(true);
    setError(null);
    try {
      const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
      if (!finalPin || finalPin.length !== 4) {
        throw new Error('Please enter a valid 4-digit transaction PIN.');
      }
      const res = await api.buyRatel(
        phone,
        Number(selectedDuration),
        network,
        finalPin
      );

      if (res.success) {
        setReceiptData(res.data || res);
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message || 'Transaction failed. Please try again.');
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'System connection failed. Please retry.');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient">
      <div className="max-w-md mx-auto relative px-6 pb-12">
        {/* Header */}
        <header className="py-8 flex items-center gap-4">
          <button
            onClick={step === 'form' ? onBack : () => setStep('form')}
            className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
              <img src="/icons/ratel.png" alt="Ratel Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Ratel Voice Minutes</h1>
          </div>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Wallet Balance Banner */}
            <div className="glass-panel p-4 mb-8 flex items-center justify-between border-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75]">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Available Balance</p>
                  <p className="text-sm font-black text-white">₦{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <span className="text-[10px] font-black text-[#66df75] bg-[#66df75]/10 px-2.5 py-1 rounded-lg uppercase tracking-widest">Instant</span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in shake flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isLoadingPlans ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCcw size={24} className="animate-spin text-[#66df75]" />
                <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Loading durations and tariffs...</p>
              </div>
            ) : (
              <form onSubmit={handleProcessForm} className="space-y-8">
                {/* Phone Number Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Recipient Number</label>
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-md bg-white/5 text-white flex items-center gap-1.5 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: networkStyles[network]?.color || '#888' }}></div>
                      {networkStyles[network]?.label || network}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all tracking-widest"
                      placeholder="0800 000 0000"
                      required
                    />
                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#66df75] hover:bg-[#66df75]/10 rounded-xl transition-colors">
                      <Contact size={20} />
                    </button>
                  </div>
                </div>

                {/* Duration/Plan selector */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Minutes Package</label>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(plans).map(([duration, plan]) => {
                      const price = getPlanPrice(plan as RatelPlan);
                      const isSelected = selectedDuration === duration;
                      return (
                        <button
                          key={duration}
                          type="button"
                          onClick={() => {
                            setSelectedDuration(duration);
                            setError(null);
                          }}
                          className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                            isSelected
                              ? 'bg-[#66df75] border-[#66df75] text-[#111415]'
                              : 'bg-white/5 border-white/10 text-[#e1e3e4] hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-black/10' : 'bg-white/5'}`}>
                              <PhoneCall size={18} />
                            </div>
                            <div>
                              <p className="font-extrabold text-sm">{duration} Call Minutes</p>
                              <p className={`text-[10px] ${isSelected ? 'text-[#111415]/75' : 'text-[#e1e3e4]/50'} font-bold`}>Valid for 30 Days</p>
                            </div>
                          </div>
                          <span className="font-black text-base">₦{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic review summary display */}
                {selectedDuration && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center text-xs font-bold text-[#e1e3e4]/50">
                      <span>Tariff Price</span>
                      <span className="text-white">₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-[#e1e3e4]/50 border-t border-white/5 pt-2">
                      <span>Service Fee</span>
                      <span className="text-[#66df75]">₦0.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-black border-t border-white/5 pt-2">
                      <span className="text-[#66df75]">Total Deducted</span>
                      <span className="text-[#66df75]">₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={phone.length < 11 || !selectedDuration || currentPrice <= 0}
                  className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <span className="uppercase tracking-[0.1em] font-black text-sm">Proceed to Authorization</span>
                  <ArrowRight size={20} />
                </button>
              </form>
            )}
          </div>
        )}

        {step === 'pin' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Transaction Authorization</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                You are about to authorize the purchase of <span className="text-white font-bold">{selectedDuration} Ratel minutes</span> for <span className="text-white font-bold">{phone}</span>.
              </p>
            </div>

            <PinInput
              pin={transactionPin}
              setPin={setTransactionPin}
              onComplete={handleConfirmPurchase}
              disabled={isProcessing}
            />

            <button
              onClick={handleConfirmPurchase}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full btn-primary py-5 mt-12 flex justify-center items-center gap-3"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="uppercase tracking-[0.1em] font-black text-sm">Confirm & Pay ₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              )}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#66df75]"></div>
              
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(102,223,117,0.4)]">
                <CheckCircle2 size={40} />
              </div>
              
              <h2 className="text-2xl font-black text-white mb-1">Minutes Purchased</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Transaction Successful</p>

              <div className="space-y-4 text-left mb-8">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Service</span>
                  <span className="text-sm font-bold text-white">Ratel Call ({network})</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Minutes</span>
                  <span className="text-sm font-bold text-white">{selectedDuration} Mins</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Recipient</span>
                  <span className="text-sm font-bold text-white">{phone}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount Debited</span>
                  <span className="text-sm font-bold text-[#66df75]">₦{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Reference ID</span>
                  <span className="text-[10px] font-mono font-bold text-white/60">{receiptData?.reference || 'SG-RAT-99214'}</span>
                </div>
              </div>

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
                  setPhone('');
                  setSelectedDuration('');
                  setTransactionPin(['', '', '', '']);
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
