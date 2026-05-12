import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowRight,
  Smartphone,
  Banknote
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface AirtimeToCashProps {
  onBack: () => void;
}

export default function AirtimeToCash({ onBack }: AirtimeToCashProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form');
  const [network, setNetwork] = useState('mtn');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const networks = [
    { id: 'mtn', name: 'MTN', rate: 0.82 },
    { id: 'airtel', name: 'Airtel', rate: 0.80 },
    { id: 'glo', name: 'GLO', rate: 0.75 },
    { id: '9mobile', name: '9mobile', rate: 0.78 }
  ];

  const selectedNetwork = networks.find(n => n.id === network);
  const receiveAmount = Number(amount) * (selectedNetwork?.rate || 0);

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    try {
      const res = await api.submitA2C(network, phone, Number(amount));
      if (res.success) {
        setStep('success');
      } else {
        setError(res.message);
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Submission failed');
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
          <h1 className="text-lg font-bold tracking-tight">Airtime to Cash</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-panel p-6 mb-8 bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <ArrowUpRight size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">Convert Airtime</h2>
                  <p className="text-[10px] text-emerald-400 font-bold">Fast Wallet Funding</p>
                </div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setStep('pin'); }} className="space-y-8">
              <div className="grid grid-cols-4 gap-2">
                {networks.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => setNetwork(n.id)}
                    className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${network === n.id ? 'bg-[#66df75] border-[#66df75] text-[#111415]' : 'bg-white/5 border-white/10 text-[#e1e3e4]/40'}`}
                  >
                    {n.name}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Sender Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white"
                  placeholder="0800 000 0000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Airtime Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white"
                  placeholder="₦ 0.00"
                />
              </div>

              {amount && (
                <div className="glass-panel p-6 border-emerald-500/30 bg-[#66df75]/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">You will receive</span>
                    <span className="text-xl font-black text-[#66df75]">₦{receiveAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest text-right">Rate: {(selectedNetwork?.rate || 0) * 100}%</p>
                </div>
              )}

              <button type="submit" disabled={!phone || !amount} className="w-full btn-primary py-5 uppercase tracking-widest font-black text-sm">
                Submit Request
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
              <h2 className="text-2xl font-bold text-white mb-2">Authorize Conversion</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Confirming airtime conversion request of <span className="text-white font-bold">₦{Number(amount).toLocaleString()}</span>.
              </p>
            </div>
            <PinInput pin={transactionPin} setPin={setTransactionPin} onComplete={handleConfirmPurchase} disabled={isProcessing} />
            <button onClick={handleConfirmPurchase} disabled={isProcessing || transactionPin.join('').length !== 4} className="w-full btn-primary py-5 mt-12">
              {isProcessing ? <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin mx-auto"></div> : "Authorize Request"}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center">
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Request Submitted</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Awaiting Verification</p>
              <div className="text-left bg-white/5 p-6 rounded-2xl mb-8">
                <p className="text-[10px] text-white/40 uppercase font-black mb-4 tracking-widest">Next Steps:</p>
                <ul className="space-y-3 text-xs font-bold text-white/70">
                  <li className="flex gap-3"><div className="w-5 h-5 rounded-full bg-[#66df75]/20 text-[#66df75] flex items-center justify-center text-[10px]">1</div> Transfer the airtime to our provided number.</li>
                  <li className="flex gap-3"><div className="w-5 h-5 rounded-full bg-[#66df75]/20 text-[#66df75] flex items-center justify-center text-[10px]">2</div> Wallet will be credited after verification.</li>
                </ul>
              </div>
              <button onClick={onBack} className="w-full btn-primary py-4">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
