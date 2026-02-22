import React, { useState } from 'react';
import { 
  Wallet, 
  Lightbulb, 
  ChevronDown, 
  CheckCircle2, 
  Lock, 
  Copy, 
  Share2, 
  AlertTriangle,
  Zap,
  ChevronLeft
} from 'lucide-react';
import PinInput from './PinInput';

interface ElectricityBillProps {
  onBack: () => void;
}

export default function ElectricityBill({ onBack }: ElectricityBillProps) {
  const [step, setStep] = useState('form'); // 'form', 'verify', 'pin', 'success'
  
  // Form States
  const [provider, setProvider] = useState('');
  const [meterType, setMeterType] = useState('prepaid');
  const [meterNumber, setMeterNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  // Verification & Payment States
  const [isVerifying, setIsVerifying] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');

  // Nigerian DisCos (Focused on national spread including Northern KEDCO/AEDC)
  const providers = [
    { id: 'kedco', name: 'Kano (KEDCO)' },
    { id: 'aedc', name: 'Abuja (AEDC)' },
    { id: 'kaduna', name: 'Kaduna (KAEDCO)' },
    { id: 'jos', name: 'Jos (JED)' },
    { id: 'ikedc', name: 'Ikeja (IKEDC)' },
    { id: 'ekedc', name: 'Eko (EKEDC)' },
    { id: 'ibedc', name: 'Ibadan (IBEDC)' },
  ];

  const handleVerifyMeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !meterNumber || !amount || Number(amount) < 500) return;
    
    setIsVerifying(true);
    // Simulate API call to VTU Provider to resolve meter number
    setTimeout(() => {
      setCustomerName('ALH. IBRAHIM MUBARAK');
      setIsVerifying(false);
      setStep('verify');
    }, 1500);
  };

  const handlePinSubmit = () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);
    
    // Simulate Payment and Token Generation via API
    setTimeout(() => {
      setIsProcessing(false);
      if (meterType === 'prepaid') {
        setGeneratedToken('1234 5678 9012 3456 7890');
      }
      setStep('success');
    }, 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(generatedToken).then(() => {
      // Success feedback
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-orange-500 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('form'); setMeterNumber(''); setAmount(''); }
              else if (step === 'pin') setStep('verify');
              else if (step === 'verify') setStep('form');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-orange-600 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">Pay Electricity</h1>
        </header>

        {/* STEP 1: ENTER DETAILS */}
        {step === 'form' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Wallet Balance Snippet */}
            <div className="flex items-center justify-between bg-orange-50 p-4 rounded-2xl mb-6 border border-orange-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full text-orange-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-xs text-orange-800 font-medium">Available Balance</p>
                  <p className="text-sm font-bold text-orange-900">₦ 12,500.00</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyMeter} className="space-y-5">
              
              {/* Provider Selection */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Provider</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lightbulb size={18} className="text-gray-400" />
                  </div>
                  <select 
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    required
                    className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  >
                    <option value="" disabled>Choose Distribution Company</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown size={18} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Meter Type (Prepaid/Postpaid) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meter Type</label>
                <div className="flex p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMeterType('prepaid')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                      meterType === 'prepaid' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Prepaid
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeterType('postpaid')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                      meterType === 'postpaid' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Postpaid
                  </button>
                </div>
              </div>

              {/* Meter Number */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meter / Account Number</label>
                <input 
                  type="text" 
                  placeholder="Enter meter number"
                  value={meterNumber}
                  onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all tracking-wide"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₦)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-bold text-lg">₦</span>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    min="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Minimum amount is ₦500</p>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={!provider || !meterNumber || !amount || isVerifying}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:text-orange-100 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {isVerifying ? (
                    <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verifying Meter...</>
                  ) : (
                    'Verify Meter Number'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFY DETAILS */}
        {step === 'verify' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 mb-6">
              <AlertTriangle size={24} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                Please confirm the meter name below. We will not be able to reverse payments sent to the wrong meter.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium mb-1">Customer Name</p>
                <p className="text-lg font-black text-gray-900">{customerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Meter Number</p>
                  <p className="text-sm font-bold text-gray-900">{meterNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Provider</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">{provider}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-500 font-medium">Amount to Pay</p>
                <p className="text-2xl font-black text-orange-600">₦{Number(amount).toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={() => setStep('pin')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center"
            >
              Confirm & Continue
            </button>
          </div>
        )}

        {/* STEP 3: PIN VERIFICATION */}
        {step === 'pin' && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Wallet PIN</h2>
            <p className="text-sm text-gray-500 text-center mb-8">
              You are paying <strong className="text-gray-800">₦{Number(amount).toLocaleString()}</strong> to {provider.toUpperCase()}.
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
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS / TOKEN RECEIPT */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Successful!</h2>
            <p className="text-xs text-gray-500 mb-6 text-center">
              Meter: {customerName}
            </p>

            {/* If Prepaid, show the massive Token Card */}
            {meterType === 'prepaid' ? (
              <div className="w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 text-center text-white shadow-lg mb-6 relative overflow-hidden">
                <Zap size={120} className="absolute -right-4 -bottom-4 text-white opacity-5" />
                
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Your Electricity Token</p>
                {/* Visual split of the 20 digit token to make reading easy */}
                <h1 className="text-2xl md:text-3xl font-black tracking-widest mb-4 font-mono text-orange-400 drop-shadow-md">
                  {generatedToken.split(' ').map((chunk, i) => (
                    <span key={i} className="inline-block mr-2">{chunk}</span>
                  ))}
                </h1>
                
                <div className="bg-gray-950 bg-opacity-50 rounded-xl p-3 flex justify-between items-center border border-gray-700">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 uppercase">Amount</p>
                    <p className="text-sm font-bold">₦{Number(amount).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase">Units</p>
                    <p className="text-sm font-bold text-green-400">142.5 kWh</p>
                  </div>
                </div>
              </div>
            ) : (
              // If Postpaid, just show a standard receipt block
              <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 text-left border border-gray-200">
                <p className="text-sm font-bold text-gray-800 text-center mb-4">Postpaid Bill Cleared</p>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-bold text-gray-900">₦{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-mono text-xs text-gray-800">BD-ELEC-99382</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 w-full mb-6">
              {meterType === 'prepaid' && (
                <button 
                  onClick={handleCopyToken}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <Copy size={18} />
                  Copy Token
                </button>
              )}
              <button className="flex-1 bg-orange-100 text-orange-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-200 transition-colors">
                <Share2 size={18} />
                Share
              </button>
            </div>

            <button 
              onClick={() => { setStep('form'); setMeterNumber(''); setAmount(''); setTransactionPin(['','','','']); onBack(); }}
              className="mt-2 text-sm font-bold text-gray-500 hover:text-gray-800"
            >
              Pay Another Bill
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
