import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Phone,
  Contact,
  CheckCircle2,
  Lock,
  RefreshCcw,
  AlertCircle,
  ChevronLeft,
  Copy,
  Share2,
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface BuyAirtimeProps {
  onBack: () => void;
}

export default function BuyAirtime({ onBack }: BuyAirtimeProps) {
  const { user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState('vtu');
  const [step, setStep] = useState('form'); // 'form', 'pin', 'processing', 'success'
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [detectedNetwork, setDetectedNetwork] = useState<any>(null);
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  const networks: Record<string, any> = {
    mtn: { name: 'MTN', color: '#ffcb05', prefixes: ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906'] },
    airtel: { name: 'Airtel', color: '#ff0000', prefixes: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'] },
    glo: { name: 'GLO', color: '#39b54a', prefixes: ['0805', '0807', '0811', '0815', '0705', '0905'] },
    '9mobile': { name: '9mobile', color: '#00573d', prefixes: ['0809', '0818', '0817', '0909', '0908'] }
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (phone.length >= 4) {
      const prefix = phone.substring(0, 4);
      let found = null;
      for (const [key, net] of Object.entries(networks)) {
        if (net.prefixes.includes(prefix)) {
          found = { id: key, ...net };
          break;
        }
      }
      setDetectedNetwork(found);
    } else {
      setDetectedNetwork(null);
    }
  }, [phone]);

  const handleProcessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11 || !amount || Number(amount) < 50) return;
    setError(null);
    setStep('pin');
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await api.buyAirtime(detectedNetwork?.name || 'Unknown', Number(amount), phone, transactionPin.join(''));
      if (res.success) {
        setReceiptData(res.data);
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message);
        setStep('form');
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.');
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
          <h1 className="text-lg font-bold tracking-tight">Airtime Recharge</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Wallet Info */}
            <div className="glass-panel p-4 mb-8 flex items-center justify-between border-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75]">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Balance</p>
                  <p className="text-sm font-black text-white">₦{(user?.balance || 0).toLocaleString()}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#66df75] bg-[#66df75]/10 px-2 py-1 rounded-lg">Instant</span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in shake">
                {error}
              </div>
            )}

            <form onSubmit={handleProcessForm} className="space-y-8">
              {/* Phone Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Phone Number</label>
                  {detectedNetwork && (
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-md bg-white/5 text-white flex items-center gap-1.5 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: detectedNetwork.color }}></div>
                      {detectedNetwork.name}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all tracking-widest"
                    placeholder="0800 000 0000"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#66df75] hover:bg-[#66df75]/10 rounded-xl transition-colors">
                    <Contact size={20} />
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Purchase Amount</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-[#e1e3e4]/30">₦</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                    placeholder="0"
                  />
                </div>
                
                {/* Quick Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className={`py-3 rounded-xl border font-bold text-xs transition-all ${amount === amt.toString() ? 'bg-[#66df75] border-[#66df75] text-[#111415]' : 'bg-white/5 border-white/10 text-[#e1e3e4]/60 hover:bg-white/10'}`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={phone.length < 11 || !amount || Number(amount) < 50}
                className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
              >
                <span className="uppercase tracking-[0.1em] font-black text-sm">Proceed to Payment</span>
                <ArrowRight size={20} />
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
              <h2 className="text-2xl font-bold text-white mb-2">Authorize Action</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                You are about to send <span className="text-white font-bold">₦{Number(amount).toLocaleString()} {detectedNetwork?.name}</span> airtime to <span className="text-white font-bold">{phone}</span>.
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
                <span className="uppercase tracking-[0.1em] font-black text-sm">Securely Pay ₦{Number(amount).toLocaleString()}</span>
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
              
              <h2 className="text-2xl font-black text-white mb-1">Payment Success</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Transaction Verified</p>

              <div className="space-y-4 text-left mb-8">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Network</span>
                  <span className="text-sm font-bold text-white">{detectedNetwork?.name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Recipient</span>
                  <span className="text-sm font-bold text-white">{phone}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount</span>
                  <span className="text-sm font-bold text-[#66df75]">₦{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Reference</span>
                  <span className="text-[10px] font-mono font-bold text-white/60">{receiptData?.reference || 'SG-TX-98231'}</span>
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
                onClick={onBack}
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

