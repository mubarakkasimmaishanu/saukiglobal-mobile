import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  Wifi,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface SmileServicesProps {
  onBack: () => void;
}

export default function SmileServices({ onBack }: SmileServicesProps) {
  const { user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState('data'); // 'data', 'voice'
  const [step, setStep] = useState('form');
  const [smileId, setSmileId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dataPlans = [
    { id: '1gb', name: 'Smile 1GB (30 Days)', price: 1000 },
    { id: '2gb', name: 'Smile 2GB (30 Days)', price: 2000 },
    { id: '5gb', name: 'Smile 5GB (30 Days)', price: 4500 }
  ];

  const voicePlans = [
    { id: 'v1000', name: 'Smile Voice ₦1000', price: 1000 },
    { id: 'v2000', name: 'Smile Voice ₦2000', price: 2000 }
  ];

  const plans = activeTab === 'data' ? dataPlans : voicePlans;

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    try {
      const res = await api.buySmile(smileId, selectedPlan.id, activeTab);
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
          <h1 className="text-lg font-bold tracking-tight">Smile Services</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-2xl">
              <button
                onClick={() => { setActiveTab('data'); setSelectedPlan(null); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'data' ? 'bg-[#66df75] text-[#111415]' : 'text-[#e1e3e4]/40'}`}
              >
                Smile Data
              </button>
              <button
                onClick={() => { setActiveTab('voice'); setSelectedPlan(null); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'voice' ? 'bg-[#66df75] text-[#111415]' : 'text-[#e1e3e4]/40'}`}
              >
                Smile Voice
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setStep('pin'); }} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Smile ID / Account</label>
                <input
                  type="text"
                  value={smileId}
                  onChange={(e) => setSmileId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white"
                  placeholder="Enter Account Number"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Select Plan</label>
                <div className="grid grid-cols-1 gap-3">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-5 rounded-2xl border transition-all flex justify-between items-center ${selectedPlan?.id === plan.id ? 'bg-[#66df75]/10 border-[#66df75]' : 'bg-white/5 border-white/10'}`}
                    >
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{plan.name}</p>
                        <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest mt-1">₦{plan.price.toLocaleString()}</p>
                      </div>
                      {selectedPlan?.id === plan.id && <CheckCircle2 size={20} className="text-[#66df75]" />}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={!smileId || !selectedPlan} className="w-full btn-primary py-5 uppercase tracking-widest font-black text-sm">
                Confirm Selection
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
              <h2 className="text-2xl font-bold text-white mb-2">Authorize Smile</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Buying <span className="text-white font-bold">{selectedPlan.name}</span> for <span className="text-[#66df75] font-black">₦{selectedPlan.price.toLocaleString()}</span>.
              </p>
            </div>
            <PinInput pin={transactionPin} setPin={setTransactionPin} onComplete={handleConfirmPurchase} disabled={isProcessing} />
            <button onClick={handleConfirmPurchase} disabled={isProcessing || transactionPin.join('').length !== 4} className="w-full btn-primary py-5 mt-12">
              {isProcessing ? <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin mx-auto"></div> : "Pay Securely"}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center">
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-white mb-1">Smile Success</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Plan Activated Instantly</p>
              <button onClick={onBack} className="w-full btn-primary py-4">Back to Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
