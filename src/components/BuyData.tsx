import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Phone,
  ChevronDown,
  Lock,
  CheckCircle2,
  Wifi,
  Contact,
  Share2,
  Copy,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface BuyDataProps {
  onBack: () => void;
  onFund: () => void;
}

export default function BuyData({ onBack, onFund }: BuyDataProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'pin', 'success'
  const [network, setNetwork] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  const networks = [
    { id: 'mtn', name: 'MTN', color: '#ffcb05' },
    { id: 'airtel', name: 'Airtel', color: '#ff0000' },
    { id: 'glo', name: 'GLO', color: '#39b54a' },
    { id: '9mobile', name: '9mobile', color: '#00573d' },
  ];

  // Logic to detect network based on prefix
  const networkPrefixes: Record<string, string[]> = {
    mtn: ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906'],
    airtel: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'],
    glo: ['0805', '0807', '0811', '0815', '0705', '0905'],
    '9mobile': ['0809', '0818', '0817', '0909', '0908']
  };

  useEffect(() => {
    if (phone.length >= 4) {
      const prefix = phone.substring(0, 4);
      for (const [net, prefixes] of Object.entries(networkPrefixes)) {
        if (prefixes.includes(prefix)) {
          setNetwork(net);
          break;
        }
      }
    }
  }, [phone]);

  const dataPlans: Record<string, any[]> = {
    mtn: [
      { id: '1', size: '500MB', type: 'SME', validity: '30 Days', price: 135 },
      { id: '2', size: '1.0GB', type: 'SME', validity: '30 Days', price: 265 },
      { id: '3', size: '2.0GB', type: 'SME', validity: '30 Days', price: 530 },
      { id: '4', size: '5.0GB', type: 'SME', validity: '30 Days', price: 1325 },
      { id: '5', size: '10.0GB', type: 'SME', validity: '30 Days', price: 2650 },
    ],
    airtel: [
      { id: '6', size: '1.0GB', type: 'CG', validity: '30 Days', price: 280 },
      { id: '7', size: '2.0GB', type: 'CG', validity: '30 Days', price: 560 },
      { id: '8', size: '5.0GB', type: 'CG', validity: '30 Days', price: 1400 },
    ],
    glo: [
      { id: '9', size: '1.0GB', type: 'SME', validity: '30 Days', price: 250 },
      { id: '10', size: '2.0GB', type: 'SME', validity: '30 Days', price: 500 },
    ],
    '9mobile': [
      { id: '11', size: '1.0GB', type: 'CG', validity: '30 Days', price: 180 },
    ]
  };

  const selectedPlan = network && selectedPlanId ? dataPlans[network].find(p => p.id === selectedPlanId) : null;
  const activeNetworkConfig = networks.find(n => n.id === network);

  const handleProcessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!network || !phone || !selectedPlanId || phone.length < 11) return;
    setError(null);
    setStep('pin');
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await api.buyData(activeNetworkConfig?.name || 'Unknown', selectedPlanId, phone);
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
          <h1 className="text-lg font-bold tracking-tight">Data Bundle</h1>
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
                  <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Available</p>
                  <p className="text-sm font-black text-white">₦{(user?.balance || 0).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={onFund} className="text-[10px] font-black text-[#66df75] hover:underline uppercase tracking-widest">Refill</button>
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
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Recipient Number</label>
                  {activeNetworkConfig && (
                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-md bg-white/5 text-white flex items-center gap-1.5 border border-white/5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeNetworkConfig.color }}></div>
                      {activeNetworkConfig.name}
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

              {/* Network Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Network Provider</label>
                <div className="grid grid-cols-4 gap-3">
                  {networks.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => { setNetwork(net.id); setSelectedPlanId(''); }}
                      className={`py-3 rounded-xl border font-bold text-[10px] transition-all flex flex-col items-center gap-2 ${network === net.id ? 'bg-[#66df75] border-[#66df75] text-[#111415]' : 'bg-white/5 border-white/10 text-[#e1e3e4]/60'}`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: net.color }}></div>
                      {net.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Select Data Plan</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#66df75]">
                    <Wifi size={20} />
                  </div>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={!network}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-12 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none disabled:opacity-30"
                  >
                    <option value="" disabled className="bg-[#111415]">
                      {network ? 'Select a package' : 'Select network first'}
                    </option>
                    {network && dataPlans[network]?.map(p => (
                      <option key={p.id} value={p.id} className="bg-[#111415]">
                        {p.size} ({p.type}) — ₦{p.price} — {p.validity}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#e1e3e4]/30">
                    <ChevronDown size={20} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!network || !selectedPlanId || phone.length < 11}
                className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
              >
                <span className="uppercase tracking-[0.1em] font-black text-sm">Review Purchase</span>
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
              <h2 className="text-2xl font-bold text-white mb-2">Authorize Payment</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Purchase <span className="text-white font-bold">{activeNetworkConfig?.name} {selectedPlan?.size}</span> for <span className="text-white font-bold">{phone}</span>?
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
                <span className="uppercase tracking-[0.1em] font-black text-sm">Pay ₦{selectedPlan?.price.toLocaleString()}</span>
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
              
              <h2 className="text-2xl font-black text-white mb-1">Data Delivered</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Secure Transaction</p>

              <div className="space-y-4 text-left mb-8">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Plan</span>
                  <span className="text-sm font-bold text-white">{activeNetworkConfig?.name} {selectedPlan?.size}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Recipient</span>
                  <span className="text-sm font-bold text-white">{phone}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Amount</span>
                  <span className="text-sm font-bold text-[#66df75]">₦{selectedPlan?.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Reference</span>
                  <span className="text-[10px] font-mono font-bold text-white/60">{receiptData?.reference || 'SG-DAT-77123'}</span>
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
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

