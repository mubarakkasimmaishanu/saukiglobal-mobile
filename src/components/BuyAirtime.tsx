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

interface NetworkProvider {
  id: string | number;
  network: string;
  networkStatus: string;
}

export default function BuyAirtime({ onBack }: BuyAirtimeProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'pin', 'processing', 'success'
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [networksList, setNetworksList] = useState<NetworkProvider[]>([]);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(true);
  const [detectedNetwork, setDetectedNetwork] = useState<any>(null);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | number>('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Network brand visual configurations
  const networkStyles: Record<string, { color: string; label: string }> = {
    mtn: { color: '#ffcb05', label: 'MTN' },
    airtel: { color: '#ff0000', label: 'Airtel' },
    glo: { color: '#39b54a', label: 'GLO' },
    '9mobile': { color: '#00573d', label: '9mobile' }
  };

  const phonePrefixes: Record<string, string[]> = {
    mtn: ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906'],
    airtel: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'],
    glo: ['0805', '0807', '0811', '0815', '0705', '0905'],
    '9mobile': ['0809', '0818', '0817', '0909', '0908']
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    setIsLoadingNetworks(true);
    setError(null);
    try {
      const res = await api.getAirtimeNetworks();
      if (res.success && Array.isArray(res.data)) {
        // Filter out inactive ones
        setNetworksList(res.data);
      } else {
        setError('Failed to fetch active network providers.');
      }
    } catch (err) {
      setError('Connection to billing server lost. Please retry.');
    } finally {
      setIsLoadingNetworks(false);
    }
  };

  // Automatic Prefix Detector
  useEffect(() => {
    if (phone.length >= 4) {
      const prefix = phone.substring(0, 4);
      let detectedKey = '';
      for (const [key, prefixes] of Object.entries(phonePrefixes)) {
        if (prefixes.includes(prefix)) {
          detectedKey = key;
          break;
        }
      }

      if (detectedKey) {
        // Find match in dynamic networks list
        const style = networkStyles[detectedKey];
        const match = networksList.find(
          (n) => n.network.toLowerCase() === style.label.toLowerCase()
        );
        if (match) {
          setDetectedNetwork({
            id: match.id,
            name: match.network,
            color: style.color,
            status: match.networkStatus
          });
          setSelectedNetworkId(match.id);
          return;
        }
      }
    }
    setDetectedNetwork(null);
  }, [phone, networksList]);

  const handleProcessForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11 || !amount || Number(amount) < 50) return;
    
    // Ensure selected/detected network is valid and active
    const activeNet = networksList.find((n) => n.id === selectedNetworkId);
    if (!activeNet) {
      setError('Please select a valid network provider.');
      return;
    }
    if (activeNet.networkStatus.toLowerCase() !== 'on') {
      setError(`${activeNet.network} is currently offline. Please try again later.`);
      return;
    }

    setError(null);
    setStep('pin');
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const activeNet = networksList.find((n) => n.id === selectedNetworkId);
      const networkParam = activeNet ? activeNet.id : (detectedNetwork?.id || '1');

      const res = await api.buyAirtime(
        networkParam,
        Number(amount),
        phone,
        transactionPin.join('')
      );

      if (res.success) {
        setReceiptData(res.data || res);
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
            {/* Wallet balance */}
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

            {/* Dynamic branding header */}
            {selectedNetworkId && (() => {
              const net = networksList.find(n => n.id === selectedNetworkId);
              if (!net) return null;
              const lowerName = net.network.toLowerCase();
              const style = networkStyles[lowerName] || { color: '#888888', label: net.network };
              return (
                <div className="glass-panel p-4 mb-6 flex items-center justify-between border-white/5 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-1.5 border border-white/10">
                      <img
                        src={`/icons/${lowerName}.png`}
                        alt={style.label}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/icons/others.png';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Selected Network</p>
                      <p className="text-sm font-black text-white">{style.label}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                    net.networkStatus.toLowerCase() === 'on' 
                      ? 'bg-[#66df75]/10 text-[#66df75] border-[#66df75]/10' 
                      : 'bg-red-500/10 text-red-500 border-red-500/10'
                  }`}>
                    {net.networkStatus.toLowerCase() === 'on' ? 'Online' : 'Offline'}
                  </span>
                </div>
              );
            })()}

            {error && (
              <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in shake">
                {error}
              </div>
            )}

            {isLoadingNetworks ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <RefreshCcw size={24} className="animate-spin text-[#66df75]" />
                <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Synchronizing billing nodes...</p>
              </div>
            ) : (
              <form onSubmit={handleProcessForm} className="space-y-8">
                {/* Network Selection Selector (Dynamic) */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Network Operator</label>
                  <div className="grid grid-cols-4 gap-3">
                    {networksList.map((net) => {
                      const lowerName = net.network.toLowerCase();
                      const style = networkStyles[lowerName] || { color: '#888888', label: net.network };
                      const isSelected = selectedNetworkId === net.id;
                      const isOffline = net.networkStatus.toLowerCase() !== 'on';

                      return (
                        <button
                          key={net.id}
                          type="button"
                          disabled={isOffline}
                          onClick={() => {
                            setSelectedNetworkId(net.id);
                            setError(null);
                          }}
                          className={`py-3 px-2 rounded-xl border font-bold text-[10px] uppercase tracking-wider transition-all flex flex-col items-center gap-2 relative ${
                            isSelected 
                              ? 'border-[#66df75] bg-[#66df75]/5 text-[#66df75] shadow-lg shadow-[#66df75]/5' 
                              : 'bg-white/5 border-white/10 text-[#e1e3e4]/60 hover:bg-white/10'
                          } ${isOffline ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-1 border border-white/5">
                            <img
                              src={`/icons/${lowerName}.png`}
                              alt={style.label}
                              className="w-full h-full object-contain rounded-md"
                              onError={(e) => {
                                e.currentTarget.src = '/icons/others.png';
                              }}
                            />
                          </div>
                          <span>{style.label}</span>
                          {isOffline && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full scale-75">
                              OFF
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phone input */}
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

                {/* Amount input */}
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
                  
                  {/* Quick Select Buttons */}
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
                  disabled={phone.length < 11 || !amount || Number(amount) < 50 || !selectedNetworkId}
                  className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <span className="uppercase tracking-[0.1em] font-black text-sm">Review Recharge</span>
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
              <h2 className="text-2xl font-bold text-white mb-2">Authorize Action</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                You are about to purchase <span className="text-white font-bold">₦{Number(amount).toLocaleString()}</span> airtime for <span className="text-white font-bold">{phone}</span>.
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
                <span className="uppercase tracking-[0.1em] font-black text-sm">Secure Pay ₦{Number(amount).toLocaleString()}</span>
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
              
              <h2 className="text-2xl font-black text-white mb-1">Recharge Success</h2>
              <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mb-8">Transaction Complete</p>

              <div className="space-y-4 text-left mb-8">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase">Operator</span>
                  <span className="text-sm font-bold text-white">
                    {networksList.find((n) => n.id === selectedNetworkId)?.network || detectedNetwork?.name || 'Airtime'}
                  </span>
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
                  <span className="text-[10px] font-mono font-bold text-white/60">{receiptData?.reference || 'SG-AIR-92841'}</span>
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
                  setAmount('');
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
