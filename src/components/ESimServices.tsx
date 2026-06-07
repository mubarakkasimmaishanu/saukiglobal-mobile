import React, { useState } from 'react';
import { ChevronLeft, Smartphone, Globe, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface ESimServicesProps {
  onBack: () => void;
}

export default function ESimServices({ onBack }: ESimServicesProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form');
  const [network, setNetwork] = useState('Kirani');
  const [email, setEmail] = useState('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = 2500;

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const res = await api.buyService('esim', price, { network, email });
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
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient">
      <div className="max-w-md mx-auto relative px-6 pb-12">
        <header className="py-8 flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 glass-panel flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">eSIM Services</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-6 mb-8 bg-purple-500/5 border-purple-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">Digital SIM</h2>
                  <p className="text-[10px] text-purple-400 font-bold">Instant Email Delivery</p>
                </div>
              </div>
            </div>

            {error && <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl">{error}</div>}

            <form onSubmit={(e) => { e.preventDefault(); setStep('pin'); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Select Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none"
                >
                  <option value="Kirani" className="bg-[#111415]">Kirani E-sim (₦2,500)</option>
                  <option value="Ratel" className="bg-[#111415]">Ratel E-sim (₦2,500)</option>
                  <option value="Smile" className="bg-[#111415]">Smile E-sim (₦2,500)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Delivery Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button type="submit" disabled={!email} className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 transition-all uppercase tracking-widest font-black text-sm">
                Proceed <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {step === 'pin' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirm eSIM</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Purchasing {network} eSIM for <span className="text-[#66df75] font-black">₦{price.toLocaleString()}</span>.
              </p>
            </div>
            <PinInput pin={transactionPin} setPin={setTransactionPin} onComplete={handlePurchase} disabled={isProcessing} />
            <button onClick={handlePurchase} disabled={isProcessing || transactionPin.join('').length !== 4} className="w-full btn-primary py-5 mt-12 flex justify-center items-center gap-3">
              {isProcessing ? <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div> : "Pay Securely"}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center border-[#66df75]/20">
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">eSIM Generated</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Check Your Email</p>
              <button onClick={onBack} className="w-full btn-primary py-4">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
