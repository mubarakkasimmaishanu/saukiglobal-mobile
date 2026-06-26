import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface ESimServicesProps {
  onBack: () => void;
}

export default function ESimServices({ onBack }: ESimServicesProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('loading'); // loading, provider, form, pin, success
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  
  // Kirani Number Pool
  const [dids, setDids] = useState<string[]>([]);
  const [isLoadingDids, setIsLoadingDids] = useState(false);
  
  // Success state
  const [assignedDid, setAssignedDid] = useState('');
  const [successRef, setSuccessRef] = useState('');
  
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNin, setClientNin] = useState(user?.nin || '');
  const [clientCurrency, setClientCurrency] = useState('NGN');
  const [clientDid, setClientDid] = useState('');
  
  // Standard Delivery Email
  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || '');
  const [smilePhone, setSmilePhone] = useState('');
  const [smilePassword, setSmilePassword] = useState('');

  // Provider statuses
  const [statuses, setStatuses] = useState<Record<string, { available: boolean; price: number }>>({
    kirani: { available: true, price: 6000 },
    ratel: { available: true, price: 2500 },
    smile: { available: true, price: 2500 },
    alpha: { available: true, price: 2500 }
  });

  // Fetching available packages simulation & real status check
  useEffect(() => {
    if (step === 'loading') {
      const fetchStatuses = async () => {
        try {
          const res = await api.getEsimStatuses();
          if (res.success && res.data) {
            setStatuses(res.data);
          }
        } catch (err) {
          console.error("Failed to fetch eSIM statuses", err);
        } finally {
          setStep('provider');
        }
      };
      fetchStatuses();
    }
  }, [step]);

  // Load DIDs when Kirani is chosen
  const loadKiraniDids = async () => {
    setIsLoadingDids(true);
    setError(null);
    try {
      const res = await api.getKiraniAvailableDids();
      if (res.success && Array.isArray(res.data)) {
        const parsedDids = res.data.map((d: any) => {
          return typeof d === 'object' ? (d.did || d.number || '') : d;
        }).filter(Boolean);
        setDids(parsedDids);
        if (parsedDids.length > 0) {
          setClientDid(parsedDids[0]);
        }
      } else {
        setError(res.message || 'Failed to fetch available Kirani numbers.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch available numbers.');
    } finally {
      setIsLoadingDids(false);
    }
  };

  const handleContinue = () => {
    if (!selectedProvider) return;
    setError(null);
    if (selectedProvider === 'kirani') {
      loadKiraniDids();
    }
    setStep('form');
  };

  const getPrice = () => {
    return selectedProvider && statuses[selectedProvider] ? statuses[selectedProvider].price : 0;
  };

  const handlePurchase = async (pinParam?: string | React.MouseEvent) => {
    setIsProcessing(true);
    setError(null);
    try {
      const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
      if (!finalPin || finalPin.length !== 4) {
        throw new Error('Please enter a valid 4-digit transaction PIN.');
      }
      const price = getPrice();
      let res;
      if (selectedProvider === 'kirani') {
        res = await api.registerKiraniEsimClient({
          client_name: clientName,
          client_email: clientEmail,
          client_address: clientAddress,
          client_phone: clientPhone,
          client_nin: clientNin || '12345678901',
          client_currency: clientCurrency,
          client_did: clientDid,
          pin: finalPin
        });
      } else {
        res = await api.buyService('esim', price, {
          network: selectedProvider,
          email: deliveryEmail,
          pin: finalPin
        });
      }

      if (res.success) {
        setSuccessRef(res.reference || (res.data as any)?.reference || 'N/A');
        setAssignedDid(res.did || clientDid);
        if (selectedProvider === 'smile' && (res.data as any)?.raw_response) {
          setSmilePhone((res.data as any).raw_response.phone || '');
          setSmilePassword((res.data as any).raw_response.password || '');
        }
        await refreshUser();
        setStep('success');
      } else {
        setError(res.message || 'Transaction failed');
        setStep('form');
        setTransactionPin(['', '', '', '']);
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStep('form');
      setTransactionPin(['', '', '', '']);
    } finally {
      setIsProcessing(false);
    }
  };

  const getHeaderTitle = () => {
    if (step === 'form' && selectedProvider === 'kirani') {
      return 'Kirani E-SIM';
    }
    return 'eSIM Services';
  };

  const getHeaderIcon = () => {
    if (step === 'form' && selectedProvider === 'kirani') {
      return '/icons/kirani%20icon.png';
    }
    return '/icons/esim.png';
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient">
      <div className="max-w-md mx-auto relative px-6 pb-12">
        <header className="py-8 flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 glass-panel flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden">
              <img 
                src={getHeaderIcon()} 
                alt="eSIM Logo" 
                className="w-full h-full object-contain rounded-md" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/icons/others.png' }}
              />
            </div>
            <h1 className="text-lg font-bold tracking-tight">{getHeaderTitle()}</h1>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-xl animate-in fade-in">
            {error}
          </div>
        )}

        {/* Step 1: Loading Packages */}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 border-2 border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Fetching Available E-SIM Packages...</p>
          </div>
        )}

        {/* Step 2: Provider Card Selection */}
        {step === 'provider' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest px-1">Select eSIM Provider</h2>
            
            <div className="space-y-4">
              {/* Kirani */}
              <div 
                onClick={() => statuses.kirani?.available && setSelectedProvider('kirani')}
                className={`glass-panel p-5 flex items-center gap-4 border transition-all ${
                  !statuses.kirani?.available
                    ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed'
                    : selectedProvider === 'kirani'
                      ? 'border-[#66df75] bg-[#66df75]/5 cursor-pointer'
                      : 'border-white/10 hover:border-white/20 cursor-pointer'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 overflow-hidden shrink-0">
                  <img src="/icons/kirani%20icon.png" alt="Kirani" className="w-full h-full object-contain rounded-md" onError={(e) => { (e.target as HTMLImageElement).src = '/icons/others.png' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">Kirani eSIM</h3>
                  <p className="text-[10px] text-zinc-500">Local number & instant client registration</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-black text-[#66df75]">₦{(statuses.kirani?.price || 6000).toLocaleString()}</span>
                  {statuses.kirani?.available ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#66df75] bg-[#66df75]/10 border border-[#66df75]/20">Available</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20">Unavailable</span>
                  )}
                </div>
              </div>

              {/* Ratel */}
              <div 
                onClick={() => statuses.ratel?.available && setSelectedProvider('ratel')}
                className={`glass-panel p-5 flex items-center gap-4 border transition-all ${
                  !statuses.ratel?.available
                    ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed'
                    : selectedProvider === 'ratel'
                      ? 'border-[#66df75] bg-[#66df75]/5 cursor-pointer'
                      : 'border-white/10 hover:border-white/20 cursor-pointer'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 overflow-hidden shrink-0">
                  <img src="/icons/ratel.png" alt="Ratel" className="w-full h-full object-contain rounded-md" onError={(e) => { (e.target as HTMLImageElement).src = '/icons/others.png' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">Ratel eSIM</h3>
                  <p className="text-[10px] text-zinc-500">Instant setup digital calling eSIM</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-black text-[#66df75]">₦{(statuses.ratel?.price || 2500).toLocaleString()}</span>
                  {statuses.ratel?.available ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#66df75] bg-[#66df75]/10 border border-[#66df75]/20">Available</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20">Unavailable</span>
                  )}
                </div>
              </div>

              {/* Smile */}
              <div 
                onClick={() => statuses.smile?.available && setSelectedProvider('smile')}
                className={`glass-panel p-5 flex items-center gap-4 border transition-all ${
                  !statuses.smile?.available
                    ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed'
                    : selectedProvider === 'smile'
                      ? 'border-[#66df75] bg-[#66df75]/5 cursor-pointer'
                      : 'border-white/10 hover:border-white/20 cursor-pointer'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 overflow-hidden shrink-0">
                  <img src="/icons/smile.png" alt="Smile" className="w-full h-full object-contain rounded-md" onError={(e) => { (e.target as HTMLImageElement).src = '/icons/others.png' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">Smile eSIM</h3>
                  <p className="text-[10px] text-zinc-500">Fast 4G voice & data eSIM</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-black text-[#66df75]">₦{(statuses.smile?.price || 2500).toLocaleString()}</span>
                  {statuses.smile?.available ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#66df75] bg-[#66df75]/10 border border-[#66df75]/20">Available</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20">Unavailable</span>
                  )}
                </div>
              </div>

              {/* Alpha */}
              <div 
                onClick={() => statuses.alpha?.available && setSelectedProvider('alpha')}
                className={`glass-panel p-5 flex items-center gap-4 border transition-all ${
                  !statuses.alpha?.available
                    ? 'border-white/5 bg-white/2 opacity-50 cursor-not-allowed'
                    : selectedProvider === 'alpha'
                      ? 'border-[#66df75] bg-[#66df75]/5 cursor-pointer'
                      : 'border-white/10 hover:border-white/20 cursor-pointer'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center p-2 overflow-hidden shrink-0">
                  <img src="/icons/alpha.png" alt="Alpha" className="w-full h-full object-contain rounded-md" onError={(e) => { (e.target as HTMLImageElement).src = '/icons/others.png' }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">Alpha eSIM</h3>
                  <p className="text-[10px] text-zinc-500">Standard global voice & data eSIM</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-black text-[#66df75]">₦{(statuses.alpha?.price || 2500).toLocaleString()}</span>
                  {statuses.alpha?.available ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#66df75] bg-[#66df75]/10 border border-[#66df75]/20">Available</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20">Unavailable</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={handleContinue} 
              disabled={!selectedProvider} 
              className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-40 transition-all uppercase tracking-widest font-black text-sm"
            >
              Continue <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 3: Registration Form Details */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <button 
              onClick={() => setStep('provider')} 
              className="flex items-center gap-2 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Back to providers
            </button>

            <form onSubmit={(e) => { e.preventDefault(); setStep('pin'); }} className="space-y-5">
              {selectedProvider === 'kirani' ? (
                <>
                  <h3 className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">Kirani Registration Details</h3>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Full Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                      placeholder="Enter client's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Physical Address</label>
                    <textarea
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                      placeholder="Enter street, city, state"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                        placeholder="e.g. +23480..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">N.I.N. / ID Number</label>
                      <input
                        type="text"
                        value={clientNin}
                        onChange={(e) => setClientNin(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                        placeholder="11-digit N.I.N."
                        maxLength={11}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Currency</label>
                      <select
                        value={clientCurrency}
                        onChange={(e) => setClientCurrency(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none"
                      >
                        <option value="NGN" className="bg-[#111415]">NGN (₦)</option>
                        <option value="USD" className="bg-[#111415]">USD ($)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Kirani Number</label>
                      <select
                        value={clientDid}
                        onChange={(e) => setClientDid(e.target.value)}
                        disabled={isLoadingDids}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all appearance-none disabled:opacity-50"
                        required
                      >
                        {isLoadingDids ? (
                          <option value="">Loading...</option>
                        ) : dids.length > 0 ? (
                          dids.map(d => (
                            <option key={d} value={d} className="bg-[#111415]">{d}</option>
                          ))
                        ) : (
                          <option value="">No numbers available</option>
                        )}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-[#66df75] uppercase tracking-widest px-1">eSIM Delivery details</h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Delivery Email</label>
                    <input
                      type="email"
                      value={deliveryEmail}
                      onChange={(e) => setDeliveryEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="glass-panel p-4 bg-[#66df75]/5 border-[#66df75]/20 text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-1">Total Price</span>
                <span className="text-xl font-black text-[#66df75]">₦{getPrice().toLocaleString()}</span>
              </div>

              <button 
                type="submit" 
                disabled={selectedProvider === 'kirani' && (isLoadingDids || dids.length === 0 || !clientName || !clientEmail || !clientAddress || !clientPhone)}
                className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 transition-all uppercase tracking-widest font-black text-sm"
              >
                Continue <ArrowRight size={20} />
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Transaction PIN */}
        {step === 'pin' && (
          <div className="animate-in slide-in-from-bottom-8 duration-500 pt-8 space-y-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#66df75]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#66df75]">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Confirm Payment</h2>
              <p className="text-xs text-[#e1e3e4]/40 font-medium px-8 leading-relaxed">
                Registering client for {selectedProvider === 'kirani' ? 'Kirani' : selectedProvider} eSIM. Total cost is <span className="text-[#66df75] font-black">₦{getPrice().toLocaleString()}</span>.
              </p>
            </div>
            <PinInput pin={transactionPin} setPin={setTransactionPin} onComplete={handlePurchase} disabled={isProcessing} />
            <button 
              onClick={handlePurchase} 
              disabled={isProcessing || transactionPin.join('').length !== 4} 
              className="w-full btn-primary py-5 mt-12 flex justify-center items-center gap-3"
            >
              {isProcessing ? <div className="w-5 h-5 border-2 border-[#111415] border-t-transparent rounded-full animate-spin"></div> : "Pay Securely"}
            </button>
          </div>
        )}

        {/* Step 5: Success View Panel */}
        {step === 'success' && (
          <div className="animate-in zoom-in-95 duration-500 pt-8">
            <div className="glass-panel p-8 text-center border-[#66df75]/20 space-y-6">
              <div className="w-20 h-20 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Purchase Successful</h2>
                <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.3em] mt-1">ORDER COMPLETED</p>
              </div>

              {selectedProvider === 'kirani' && (
                <div className="w-full glass-panel p-4 border-white/5 text-left space-y-2 bg-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Assigned Number:</span>
                    <span className="font-bold text-white">{assignedDid}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Status:</span>
                    <span className="text-[#66df75] font-bold uppercase tracking-wider text-[9px] bg-[#66df75]/10 px-1.5 py-0.5 rounded border border-[#66df75]/20">Active</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Reference:</span>
                    <span className="font-mono text-[10px] text-zinc-400">{successRef}</span>
                  </div>
                </div>
              )}

              <button onClick={onBack} className="w-full btn-primary py-4 uppercase tracking-widest font-black text-xs">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
