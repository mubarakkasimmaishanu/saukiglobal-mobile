import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  RefreshCcw
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface AlphaTopupProps {
  onBack: () => void;
}

export default function AlphaTopup({ onBack }: AlphaTopupProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form');
  const [phone, setPhone] = useState('');
  const [plansList, setPlansList] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | number>('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setIsLoadingPlans(true);
    setError(null);
    try {
      const res = await api.getAlphaPlans();
      if (res.success && Array.isArray(res.data)) {
        setPlansList(res.data);
      } else {
        setError('Failed to fetch Alpha plans.');
      }
    } catch (err) {
      setError('Connection to billing server lost.');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const selectedPlan = plansList.find(p => p.id.toString() === selectedPlanId.toString());

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    setError(null);
    try {
      const res = await api.buyAlpha(phone, selectedPlan.id, transactionPin.join(''));
      if (res.success) {
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message);
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-12">
      <div className="max-w-md mx-auto relative px-6">
        <header className="py-8 flex items-center gap-4">
          <button onClick={step === 'form' ? onBack : () => setStep('form')} className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
              <img src="/icons/alpha.png" alt="Alpha Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Alpha eSIM</h1>
          </div>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              <span className="text-[10px] font-bold text-[#66df75] bg-[#66df75]/10 px-2 py-1 rounded-lg">Instant</span>
            </div>

            {error && <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in shake">{error}</div>}

            {isLoadingPlans ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCcw size={24} className="animate-spin text-[#66df75]" />
                <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Loading Alpha plans...</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setStep('pin'); }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Alpha Phone Number / ID</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all tracking-widest"
                    placeholder="0800 000 0000"
                    maxLength={11}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Select Alpha Plan</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    required
                    className="w-full bg-[#111415] border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none"
                  >
                    <option value="" disabled>Choose plan</option>
                    {plansList.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#111415]">
                        {p.name} — ₦{Number(p.price).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={!phone || !selectedPlanId} className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 transition-all uppercase tracking-widest font-black text-sm">
                  Proceed <ArrowRight size={20} />
                </button>
              </form>
            )}
          </div>
        )}

        {step === 'pin' && selectedPlan && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Alpha Service</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Confirm purchasing <span className="text-white font-bold">{selectedPlan.name}</span> for <span className="text-[#66df75] font-black">₦{Number(selectedPlan.price).toLocaleString()}</span> on phone <span className="text-white font-bold">{phone}</span>.
              </p>
            </div>
            <PinInput pin={transactionPin} setPin={setTransactionPin} onComplete={handleConfirmPurchase} disabled={isProcessing} />
            <button onClick={handleConfirmPurchase} disabled={isProcessing || transactionPin.join('').length !== 4} className="w-full btn-primary py-5 mt-12 flex justify-center items-center gap-3">
              {isProcessing ? <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div> : "Pay Securely"}
            </button>
          </div>
        )}

        {step === 'success' && selectedPlan && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center border-[#66df75]/20">
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Topup Success</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Alpha Credits Transmitted</p>
              <div className="space-y-4 text-left my-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Plan</span>
                  <span className="text-sm font-bold text-white">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Phone</span>
                  <span className="text-sm font-bold text-white">{phone}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount Paid</span>
                  <span className="text-sm font-bold text-[#66df75]">₦{Number(selectedPlan.price).toLocaleString()}</span>
                </div>
              </div>
              <button onClick={() => { setStep('form'); setPhone(''); setSelectedPlanId(''); setTransactionPin(['','','','']); onBack(); }} className="w-full btn-primary py-4">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
