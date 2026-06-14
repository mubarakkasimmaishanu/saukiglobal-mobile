import React, { useState } from 'react';
import { 
  Wallet, 
  Fingerprint, 
  FileText, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Download,
  CreditCard,
  ChevronLeft
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface NINPrintProps {
  onBack: () => void;
}

export default function NINPrint({ onBack }: NINPrintProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'pin', 'success'
  
  // Form States
  const [ninNumber, setNinNumber] = useState('');
  const [slipType, setSlipType] = useState('standard'); // 'standard', 'premium'
  
  // Payment States
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);

  // Pricing
  const pricing: Record<string, number> = {
    standard: 500, // Regular paper slip PDF
    premium: 1000  // Premium plastic ID card format PDF
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (ninNumber.length !== 11) return;
    setStep('pin');
  };

  const handlePinSubmit = async (pinParam?: string | React.MouseEvent) => {
    const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
    if (!finalPin || finalPin.length !== 4) return;
    setIsProcessing(true);
    
    try {
      await api.addTransaction({
        type: 'General',
        amount: pricing[slipType],
        status: 'Success',
        details: `NIN Print (${slipType.toUpperCase()}) for ${ninNumber}`,
        recipient: ninNumber,
        pin: finalPin
      });
      
      await api.addRequest({
        service: 'NIN Printing',
        price: pricing[slipType],
        details: `Type: ${slipType.toUpperCase()} | NIN: ${ninNumber}`
      });
      
      await refreshUser();
      setStep('success');
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPrice = pricing[slipType];

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-teal-600 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('form'); setNinNumber(''); }
              else if (step === 'pin') setStep('form');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-teal-700 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">Print NIN Slip</h1>
        </header>

        {/* STEP 1: ENTER DETAILS */}
        {step === 'form' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Wallet Balance */}
            <div className="flex items-center justify-between bg-teal-50 p-4 rounded-2xl mb-6 border border-teal-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-full text-teal-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-xs text-teal-800 font-medium">Available Balance</p>
                  <p className="text-sm font-bold text-teal-900">₦ {user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-6">
              
              {/* Slip Type Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Slip Format</label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setSlipType('standard')}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex gap-4 items-center ${
                      slipType === 'standard' 
                        ? 'border-teal-500 bg-teal-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-teal-200'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${slipType === 'standard' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                      <FileText size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">Standard Slip PDF</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Regular black & white NIMC paper format.</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-teal-600">₦{pricing.standard}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSlipType('premium')}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex gap-4 items-center ${
                      slipType === 'premium' 
                        ? 'border-teal-500 bg-teal-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-teal-200'
                    }`}
                  >
                    <div className={`p-3 rounded-full ${slipType === 'premium' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                      <CreditCard size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-sm">Premium ID Card PDF</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Colored, cropped, and ready to print on plastic.</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-teal-600">₦{pricing.premium}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* NIN Number Input */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">11-Digit NIN Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Fingerprint size={20} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter NIN (e.g., 12345678901)"
                    value={ninNumber}
                    onChange={(e) => setNinNumber(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                    required
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all tracking-widest"
                  />
                </div>
                {ninNumber.length > 0 && ninNumber.length < 11 && (
                  <p className="text-xs text-red-500 mt-2 font-medium">NIN must be exactly 11 digits.</p>
                )}
              </div>

              {/* Warning Notice */}
              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  This is a manual service. Your slip will be processed by our admin and available for download within <strong className="font-bold">10 to 30 minutes</strong>.
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={ninNumber.length !== 11 || !user || currentPrice > user.balance}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center"
                >
                  {(!user || currentPrice > user.balance) ? 'Insufficient Funds' : `Pay ₦${currentPrice.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PIN VERIFICATION */}
        {step === 'pin' && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              You are paying <strong className="text-gray-800">₦{currentPrice.toLocaleString()}</strong> to process NIN <strong className="text-gray-800">{ninNumber}</strong>.
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
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Confirm & Pay'
              )}
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS / PENDING ADMIN */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center animate-in zoom-in-95 duration-500 pt-8">
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 relative">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-orange-400 opacity-20"></span>
              <Clock size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-[280px]">
              Your payment of <strong>₦{currentPrice.toLocaleString()}</strong> was successful. Our admin is currently processing your NIN slip.
            </p>

            <div className="w-full bg-gray-50 rounded-2xl p-5 mb-6 text-left border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Service</span>
                <span className="font-bold text-gray-900">{slipType === 'standard' ? 'Standard Slip' : 'Premium ID Card'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">NIN Number</span>
                <span className="font-bold text-gray-900 tracking-widest">{ninNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Status</span>
                <span className="font-bold text-orange-600 flex items-center gap-1">
                  <Clock size={14} /> Pending Processing
                </span>
              </div>
            </div>

            <div className="w-full bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex flex-col items-center justify-center text-center">
               <Download size={24} className="text-teal-500 mb-2 opacity-50" />
               <p className="text-xs text-teal-800 font-medium">
                 You will receive a notification here when your PDF is ready for download. You can also check your <strong>Transaction History</strong>.
               </p>
            </div>

            <button 
              onClick={() => { setStep('form'); setNinNumber(''); setTransactionPin(['','','','']); onBack(); }}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
