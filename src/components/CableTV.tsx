import React, { useState } from 'react';
import { 
  Wallet, 
  Tv, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  Share2, 
  AlertTriangle,
  MonitorPlay,
  Copy,
  ChevronLeft
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface CableTVProps {
  onBack: () => void;
}

export default function CableTV({ onBack }: CableTVProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'verify', 'pin', 'success'
  
  // Form States
  const [provider, setProvider] = useState('');
  const [iucNumber, setIucNumber] = useState('');
  
  // Verification & Package States
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState('');
  
  // Payment States
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);

  // Nigerian Cable Providers
  const providers = [
    { id: 'dstv', name: 'DSTV', color: 'bg-blue-500' },
    { id: 'gotv', name: 'GOTV', color: 'bg-emerald-500' },
    { id: 'startimes', name: 'Startimes', color: 'bg-orange-500' },
    { id: 'showmax', name: 'Showmax', color: 'bg-pink-500' }
  ];

  // Mock Bouquets based on provider
  const packages: Record<string, any[]> = {
    dstv: [
      { id: 'dstv-padi', name: 'DSTV Padi', price: 2950 },
      { id: 'dstv-yanga', name: 'DSTV Yanga', price: 4200 },
      { id: 'dstv-confam', name: 'DSTV Confam', price: 7400 },
      { id: 'dstv-compact', name: 'DSTV Compact', price: 12500 },
      { id: 'dstv-compact-plus', name: 'DSTV Compact Plus', price: 19800 },
      { id: 'dstv-premium', name: 'DSTV Premium', price: 29500 },
    ],
    gotv: [
      { id: 'gotv-smallie', name: 'GOtv Smallie', price: 1300 },
      { id: 'gotv-jinja', name: 'GOtv Jinja', price: 2700 },
      { id: 'gotv-jolli', name: 'GOtv Jolli', price: 3950 },
      { id: 'gotv-max', name: 'GOtv Max', price: 5700 },
      { id: 'gotv-supa', name: 'GOtv Supa', price: 7600 },
    ]
  };

  const handleVerifyIUC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !iucNumber || iucNumber.length < 9) return;
    
    setIsVerifying(true);
    // Simulate API call to VTU Provider to resolve IUC number
    setTimeout(() => {
      setCustomerDetails({
        name: 'MUBARAK IBRAHIM',
        currentPackage: provider === 'dstv' ? 'DSTV Confam' : 'GOtv Jolli',
        dueDate: '24th Feb, 2026'
      });
      setIsVerifying(false);
      setStep('verify');
    }, 1500);
  };

  const handlePinSubmit = async () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);
    
    try {
      await api.addTransaction({
        type: 'Cable',
        amount: getSelectedPrice(),
        status: 'Success',
        details: `${provider.toUpperCase()} ${getSelectedPackageName()} for ${iucNumber}`,
        recipient: iucNumber,
        network: provider.toUpperCase()
      });
      await refreshUser();
      setStep('success');
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyReceipt = () => {
    const text = `TV Subscription\nProvider: ${provider.toUpperCase()}\nPackage: ${getSelectedPackageName()}\nIUC: ${iucNumber}\nAmount: ₦${getSelectedPrice()}\nRef: BD-TV-${Math.random().toString(36).substring(7).toUpperCase()}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Receipt copied!');
    });
  };

  const handleShareReceipt = () => {
    if (navigator.share) {
      navigator.share({
        title: 'TV Subscription Receipt',
        text: `I just renewed my ${provider.toUpperCase()} subscription on Saukiglobal!`,
      }).catch(() => {});
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  const getSelectedPrice = () => {
    if (!provider || !selectedPackage) return 0;
    const pkg = packages[provider]?.find(p => p.id === selectedPackage);
    return pkg ? pkg.price : 0;
  };

  const getSelectedPackageName = () => {
    if (!provider || !selectedPackage) return '';
    const pkg = packages[provider]?.find(p => p.id === selectedPackage);
    return pkg ? pkg.name : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-blue-600 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('form'); setIucNumber(''); setSelectedPackage(''); }
              else if (step === 'pin') setStep('verify');
              else if (step === 'verify') setStep('form');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-blue-700 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">TV Subscription</h1>
        </header>

        {/* STEP 1: ENTER DETAILS */}
        {step === 'form' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Wallet Balance Snippet */}
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-xs text-blue-800 font-medium">Available Balance</p>
                  <p className="text-sm font-bold text-blue-900">₦ {user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyIUC} className="space-y-5">
              
              {/* Provider Selection (Grid Buttons instead of Dropdown for faster UX) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Provider</label>
                <div className="grid grid-cols-2 gap-3">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setProvider(p.id); setSelectedPackage(''); }}
                      className={`py-3 px-4 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                        provider === p.id 
                          ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Tv size={18} className={provider === p.id ? 'text-blue-600' : 'text-gray-400'} /> 
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* IUC / Smartcard Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">IUC / Smartcard Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MonitorPlay size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter 10 or 11 digit number"
                    value={iucNumber}
                    onChange={(e) => setIucNumber(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all tracking-wide"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={!provider || iucNumber.length < 9 || isVerifying}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:text-blue-100 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {isVerifying ? (
                    <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verifying Card...</>
                  ) : (
                    'Verify Decoder'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY DETAILS & SELECT PACKAGE */}
        {step === 'verify' && customerDetails && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Customer Details Card */}
            <div className="bg-gray-900 text-white rounded-2xl p-5 shadow-lg mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Customer Name</p>
                  <p className="text-lg font-bold">{customerDetails.name}</p>
                </div>
                <div className="bg-blue-500 bg-opacity-20 text-blue-300 px-2 py-1 rounded text-xs font-bold uppercase">
                  {provider}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700 relative z-10">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">IUC Number</p>
                  <p className="text-sm font-bold tracking-widest">{iucNumber}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Current Package</p>
                  <p className="text-sm font-bold text-blue-400">{customerDetails.currentPackage}</p>
                </div>
              </div>
            </div>

            {/* Package Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Subscription Plan</label>
              <div className="relative">
                <select 
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full pl-4 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
                >
                  <option value="" disabled>Choose a bouquet to renew/upgrade</option>
                  {packages[provider]?.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₦{p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown size={20} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Warning / Notice */}
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 mb-6 border border-blue-100">
              <AlertTriangle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Ensure your decoder is <strong className="font-bold">turned ON</strong> before making this payment to avoid viewing delays.
              </p>
            </div>

            <button 
              onClick={() => setStep('pin')}
              disabled={!selectedPackage}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center"
            >
              Pay ₦{getSelectedPrice().toLocaleString()}
            </button>
          </div>
        )}

        {/* STEP 3: PIN VERIFICATION */}
        {step === 'pin' && customerDetails && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              You are subscribing to <strong className="text-gray-800">{getSelectedPackageName()}</strong> for <strong className="text-gray-800">{customerDetails.name}</strong>.
            </p>

            <PinInput 
              pin={transactionPin} 
              setPin={setTransactionPin} 
              onComplete={handlePinSubmit}
              disabled={isProcessing}
            />

            <button 
              onClick={handlePinSubmit}
              disabled={isProcessing || transactionPin.join('').length !== 4}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Confirm & Pay'
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS / RECEIPT */}
        {step === 'success' && customerDetails && (
          <div className="p-6 flex flex-col items-center animate-in zoom-in-95 duration-500 pt-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 relative">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Recharge Successful!</h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-[250px]">
              {getSelectedPackageName()} has been activated for your decoder.
            </p>

            <div className="w-full bg-gray-50 rounded-2xl p-5 mb-6 text-left border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Customer Name</span>
                <span className="font-bold text-gray-900">{customerDetails.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">IUC / Smartcard</span>
                <span className="font-bold text-gray-900 tracking-wider">{iucNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Package</span>
                <span className="font-bold text-blue-600">{getSelectedPackageName()}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-base">
                <span className="text-gray-800 font-bold">Amount Paid</span>
                <span className="font-black text-gray-900">₦{getSelectedPrice().toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full mb-4">
              <button 
                onClick={handleCopyReceipt}
                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Copy size={18} />
                Copy Details
              </button>
              <button 
                onClick={handleShareReceipt}
                className="flex-1 bg-blue-100 text-blue-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-200 transition-colors"
              >
                <Share2 size={18} />
                Share Receipt
              </button>
            </div>

            <button 
              onClick={() => { setStep('form'); setIucNumber(''); setSelectedPackage(''); setTransactionPin(['','','','']); onBack(); }}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
