import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Wallet,
  Phone,
  ChevronDown,
  Lock,
  CheckCircle2,
  Wifi,
  Contact,
  Share2,
  Copy,
  ChevronLeft
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

  // Auto-Detect Network logic
  const networkPrefixes: Record<string, string[]> = {
    mtn: ['0803', '0806', '0814', '0810', '0813', '0816', '0703', '0706', '0903', '0906'],
    airtel: ['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'],
    glo: ['0805', '0807', '0811', '0815', '0705', '0905'],
    '9mobile': ['0809', '0818', '0817', '0909', '0908']
  };

  useEffect(() => {
    if (phone.length >= 4) {
      const prefix = phone.substring(0, 4);
      let detected = '';
      for (const [net, prefixes] of Object.entries(networkPrefixes)) {
        if (prefixes.includes(prefix)) {
          detected = net;
          break;
        }
      }
      if (detected && detected !== network) {
        setNetwork(detected);
        setSelectedPlanId(''); // Reset plan if network changes automatically
      }
    }
  }, [phone]);

  // Mock Data for Networks and Plans
  const networks = [
    { id: 'mtn', name: 'MTN', color: 'bg-yellow-400', text: 'text-yellow-900', border: 'border-yellow-400' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-500', text: 'text-white', border: 'border-red-500' },
    { id: 'glo', name: 'GLO', color: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500' },
    { id: '9mobile', name: '9mobile', color: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-800' },
  ];

  const dataPlans: Record<string, any[]> = {
    mtn: [
      { id: 'm1', size: '500MB', type: 'SME', validity: '30 Days', retail: 150, reseller: 135 },
      { id: 'm2', size: '1.0GB', type: 'Corporate Gifting', validity: '30 Days', retail: 300, reseller: 255 },
      { id: 'm3', size: '2.0GB', type: 'Corporate Gifting', validity: '30 Days', retail: 600, reseller: 510 },
      { id: 'm4', size: '5.0GB', type: 'Corporate Gifting', validity: '30 Days', retail: 1500, reseller: 1275 },
      { id: 'm5', size: '10.0GB', type: 'SME', validity: '30 Days', retail: 2800, reseller: 2500 },
    ],
    airtel: [
      { id: 'a1', size: '1.0GB', type: 'Corporate Gifting', validity: '30 Days', retail: 300, reseller: 265 },
      { id: 'a2', size: '2.0GB', type: 'Corporate Gifting', validity: '30 Days', retail: 600, reseller: 530 },
      { id: 'a3', size: '5.0GB', type: 'Corporate Gifting', validity: '30 Days', retail: 1500, reseller: 1325 },
    ],
    glo: [
      { id: 'g1', size: '1.0GB', type: 'SME', validity: '30 Days', retail: 280, reseller: 245 },
      { id: 'g2', size: '2.0GB', type: 'SME', validity: '30 Days', retail: 560, reseller: 490 },
    ],
    '9mobile': [
      { id: 'n1', size: '1.0GB', type: 'Corporate Gifting', validity: '30 Days', retail: 200, reseller: 150 },
    ]
  };

  const selectedPlan = network && selectedPlanId ? dataPlans[network].find(p => p.id === selectedPlanId) : null;
  const activeNetworkConfig = networks.find(n => n.id === network);
  const isReseller = user?.isReseller ?? false;
  const planPrice = selectedPlan ? (isReseller ? selectedPlan.reseller : selectedPlan.retail) : 0;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!network || !phone || !selectedPlanId || phone.length < 11) return;
    if (user && selectedPlan && planPrice > user.balance) {
      alert('Insufficient wallet balance');
      return;
    }
    setStep('pin');
  };

  const handlePinSubmit = async () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);

    try {
      await api.addTransaction({
        type: 'Data',
        amount: planPrice,
        status: 'Success',
        details: `${activeNetworkConfig?.name} ${selectedPlan?.size} ${selectedPlan?.type} to ${phone}`,
        recipient: phone,
        network: activeNetworkConfig?.name,
        profit: isReseller && selectedPlan ? selectedPlan.retail - selectedPlan.reseller : undefined
      });
      await refreshUser();
      setStep('success');
    } catch (error) {
      alert('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyReceipt = () => {
    const receiptId = `BD-DAT-${Math.random().toString(36).substring(7).toUpperCase()}`;
    const receiptText = `Data Purchase Successful!\nNetwork: ${activeNetworkConfig?.name}\nPlan: ${selectedPlan?.size} ${selectedPlan?.type}\nPhone: ${phone}\nAmount: ₦${planPrice}\nRef: ${receiptId}`;
    navigator.clipboard.writeText(receiptText).then(() => {
      alert('Receipt copied to clipboard!');
    });
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Data Receipt',
        text: `I just bought ${selectedPlan?.size} data on BuyDigital!`,
      }).catch(() => {});
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">

        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white sticky top-0 z-20 flex items-center border-b border-gray-100 shadow-sm">
          <button
            onClick={() => {
              if (step === 'success') { setStep('form'); setPhone(''); setSelectedPlanId(''); }
              else if (step === 'pin') setStep('form');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Buy Data</h1>
        </header>

        {/* STEP 1: FILL DETAILS */}
        {step === 'form' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Wallet Balance Snippet */}
            <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl mb-6 border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-0.5">Wallet Balance</p>
                  <p className="text-base font-black text-emerald-900">₦ {user?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <button
                onClick={onFund}
                className="text-xs font-bold text-emerald-700 bg-white px-3 py-2 rounded-lg shadow-sm hover:bg-emerald-100 transition-colors"
              >
                Fund
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-6">

              {/* Phone Number Input with Auto-Detect */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                  {activeNetworkConfig && (
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow-sm ${activeNetworkConfig.color} ${activeNetworkConfig.text}`}>
                      {activeNetworkConfig.name} Network
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    placeholder="0801 234 5678"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-11 pr-12 py-4 bg-gray-50 border-2 rounded-xl text-lg text-gray-900 font-bold focus:outline-none transition-all tracking-wide ${activeNetworkConfig ? activeNetworkConfig.border : 'border-gray-200 focus:border-emerald-500'
                      }`}
                  />
                  <button 
                    type="button" 
                    onClick={() => alert('Contact Picker Coming Soon: This will allow you to select numbers from your phone directory.')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-600 hover:text-emerald-700"
                  >
                    <Contact size={20} />
                  </button>
                </div>
              </div>

              {/* Network Selection (Fallback/Manual override) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Network</label>
                <div className="grid grid-cols-4 gap-2">
                  {networks.map((net) => (
                    <button
                      key={net.id}
                      type="button"
                      onClick={() => { setNetwork(net.id); setSelectedPlanId(''); }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${network === net.id
                          ? `${net.color} ${net.text} border-transparent shadow-md transform scale-[1.02]`
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {net.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Plan Selection */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Data Plan</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Wifi size={18} className="text-gray-400" />
                  </div>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    disabled={!network}
                    className="w-full pl-11 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-50"
                  >
                    <option value="" disabled>
                      {network ? 'Select a data plan' : 'Choose a network first'}
                    </option>
                    {network && dataPlans[network]?.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.size} {p.type} — ₦{isReseller ? p.reseller : p.retail} ({p.validity})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Tier Pricing Info */}
              {selectedPlan && isReseller && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center animate-in zoom-in-95 duration-200">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-0.5">Your Profit</p>
                    <p className="text-xs text-emerald-700 font-medium">If sold at retail (₦{selectedPlan.retail})</p>
                  </div>
                  <span className="text-lg font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">
                    + ₦{selectedPlan.retail - selectedPlan.reseller}
                  </span>
                </div>
              )}
              {selectedPlan && !isReseller && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center animate-in zoom-in-95 duration-200">
                  <div>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-0.5">Reseller Price</p>
                    <p className="text-xs text-amber-700 font-medium">Upgrade to save ₦{selectedPlan.retail - selectedPlan.reseller} per purchase</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-lg">
                    ₦{selectedPlan.reseller}
                  </span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!network || !selectedPlanId || phone.length < 11}
                  className="w-full bg-slate-900 hover:bg-black disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-between items-center px-6"
                >
                  <span>Pay Now</span>
                  {selectedPlan && <span>₦{planPrice.toLocaleString()}</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PIN VERIFICATION */}
        {step === 'pin' && selectedPlan && activeNetworkConfig && (
          <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 border border-blue-100 shadow-inner">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h2>

            <div className="bg-gray-50 border border-gray-100 w-full rounded-2xl p-4 mb-8 text-center">
              <p className="text-sm text-gray-500 mb-1">You are about to buy</p>
              <p className="font-black text-gray-900 text-lg">{activeNetworkConfig.name} {selectedPlan.size} {selectedPlan.type}</p>
              <p className="text-sm text-gray-500 mt-1">for <strong className="text-emerald-600 font-black tracking-wider">{phone}</strong></p>
            </div>

            <PinInput
              pin={transactionPin}
              setPin={setTransactionPin}
              onComplete={handlePinSubmit}
              disabled={isProcessing}
            />

            <button
              onClick={handlePinSubmit}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing Request...</>
              ) : (
                `Pay ₦${planPrice.toLocaleString()}`
              )}
            </button>
            <button onClick={() => setStep('form')} className="mt-4 text-sm font-bold text-gray-500 hover:text-gray-800 py-2">
              Cancel
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS STATE (Screenshot Optimized) */}
        {step === 'success' && selectedPlan && activeNetworkConfig && (
          <div className="p-0 flex flex-col h-full animate-in zoom-in-95 duration-500">

            {/* Dark Premium Header for Success */}
            <div className="bg-slate-900 text-white pt-10 pb-8 px-6 text-center rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[40px] opacity-40"></div>

              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 border border-emerald-500/50">
                <CheckCircle2 size={40} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-black mb-1 relative z-10">Transaction Successful!</h2>
              <p className="text-slate-400 text-sm relative z-10">
                Data sent to <strong className="text-white tracking-widest">{phone}</strong>
              </p>
            </div>

            <div className="p-6 flex-1">
              {/* Receipt Card */}
              <div className="w-full bg-white rounded-2xl p-5 mb-8 border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <span className="text-gray-500 font-medium">Network</span>
                  <span className={`font-bold px-2 py-1 rounded text-xs uppercase ${activeNetworkConfig.color} ${activeNetworkConfig.text}`}>
                    {activeNetworkConfig.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <span className="text-gray-500 font-medium">Data Plan</span>
                  <span className="font-bold text-gray-900">{selectedPlan.size} {selectedPlan.type}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <span className="text-gray-500 font-medium">Amount Paid</span>
                  <span className="font-black text-gray-900 text-base">₦{planPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Reference ID</span>
                  <span className="font-mono text-xs font-bold text-gray-600">BD-DAT-{Math.random().toString(36).substring(7).toUpperCase()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={handleCopyReceipt}
                  className="bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <Copy size={18} /> Copy
                </button>
                <button 
                  onClick={handleShareReceipt}
                  className="bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                >
                  <Share2 size={18} /> Share
                </button>
              </div>

              <button
                onClick={() => { setStep('form'); setPhone(''); setSelectedPlanId(''); setTransactionPin(['', '', '', '']); }}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-xl transition-all"
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
