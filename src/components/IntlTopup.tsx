import React, { useState } from 'react';
import { ChevronLeft, Globe2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface IntlTopupProps {
  onBack: () => void;
}

export default function IntlTopup({ onBack }: IntlTopupProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form');
  const [country, setCountry] = useState('Ghana');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (pinParam?: string | React.MouseEvent) => {
    setIsProcessing(true);
    try {
      const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
      if (!finalPin || finalPin.length !== 4) {
        throw new Error('Please enter a valid 4-digit transaction PIN.');
      }
      const res = await api.buyService('intl', Number(amount), { country, phone, pin: finalPin });
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
          <h1 className="text-lg font-bold tracking-tight">International Topup</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-6 mb-8 bg-sky-500/5 border-sky-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center">
                  <Globe2 size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">Global Reach</h2>
                  <p className="text-[10px] text-sky-400 font-bold">Cross-Border Airtime</p>
                </div>
              </div>
            </div>

            {error && <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl">{error}</div>}

            <form onSubmit={(e) => { e.preventDefault(); setStep('pin'); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none"
                >
                  <option value="Ghana" className="bg-[#111415]">Ghana (+233)</option>
                  <option value="Kenya" className="bg-[#111415]">Kenya (+254)</option>
                  <option value="South Africa" className="bg-[#111415]">South Africa (+27)</option>
                  <option value="USA" className="bg-[#111415]">USA (+1)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                  placeholder="e.g. 244123456"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                  placeholder="₦ 0.00"
                  required
                />
              </div>
              <button type="submit" disabled={!phone || !amount} className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 transition-all uppercase tracking-widest font-black text-sm">
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
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Intl Topup</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Sending Topup to <span className="text-white font-bold">{phone}</span> ({country}) for <span className="text-[#66df75] font-black">₦{Number(amount).toLocaleString()}</span>.
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
              <h2 className="text-2xl font-black text-white mb-1">Topup Successful</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Airtime Delivered</p>
              <button onClick={onBack} className="w-full btn-primary py-4">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
