import React, { useState } from 'react';
import { 
  Wallet, 
  Send, 
  User, 
  Lock, 
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface WalletTransferProps {
  onBack: () => void;
}

export default function WalletTransfer({ onBack }: WalletTransferProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'verify', 'pin', 'success'
  
  // Form States
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  
  // Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  
  // Payment States
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock Recent Beneficiaries
  const recentBeneficiaries = [
    { id: 1, name: 'Aisha Bello', identifier: '08031234567', initials: 'AB', color: 'bg-purple-100 text-purple-700' },
    { id: 2, name: 'CyberCafe Pro', identifier: 'cyberpro@gmail.com', initials: 'CP', color: 'bg-blue-100 text-blue-700' },
    { id: 3, name: 'Sani Musa', identifier: '08129876543', initials: 'SM', color: 'bg-orange-100 text-orange-700' },
  ];

  const handleVerifyRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientIdentifier || !amount || Number(amount) < 100) return;
    if (user && Number(amount) > user.balance) {
      alert('Insufficient wallet balance');
      return;
    }
    
    setIsVerifying(true);
    // Simulate API call to check if user exists
    setTimeout(() => {
      setRecipientName('IBRAHIM MUBARAK OLAWALE'); // Mock resolved name
      setIsVerifying(false);
      setStep('verify');
    }, 1200);
  };

  const handleSelectBeneficiary = (beneficiary: any) => {
    setRecipientIdentifier(beneficiary.identifier);
  };

  const handlePinSubmit = async () => {
    if (transactionPin.join('').length !== 4) return;
    setIsProcessing(true);
    
    try {
      await api.addTransaction({
        type: 'Transfer',
        amount: Number(amount),
        status: 'Success',
        details: `Wallet Transfer to ${recipientName}`,
        recipient: recipientIdentifier
      });
      await refreshUser();
      setStep('success');
    } catch (error) {
      alert('Transfer failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white sticky top-0 z-20 flex items-center border-b border-gray-100 shadow-sm">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('form'); setRecipientIdentifier(''); setAmount(''); setNarration(''); }
              else if (step === 'pin') setStep('verify');
              else if (step === 'verify') setStep('form');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Transfer Funds</h1>
        </header>

        {/* STEP 1: ENTER DETAILS */}
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            
            <div className="p-5">
              {/* Wallet Balance Snippet */}
              <div className="flex items-center justify-between bg-green-50 p-4 rounded-2xl mb-6 border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-green-800 font-medium">Available Balance</p>
                    <p className="text-sm font-bold text-green-900">₦ {user?.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyRecipient} className="space-y-5">
                
                {/* Recipient Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Send To (Email or Phone Number)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. 08012345678 or user@email.com"
                      value={recipientIdentifier}
                      onChange={(e) => setRecipientIdentifier(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₦)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-lg">₦</span>
                    </div>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      min="100"
                      max="12500" // Bound by available balance
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Narration Input (Optional) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Note / Narration (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="What is this for?"
                    value={narration}
                    maxLength={50}
                    onChange={(e) => setNarration(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Action Button */}
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={!recipientIdentifier || !amount || Number(amount) < 100 || isVerifying}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    {isVerifying ? (
                      <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verifying User...</>
                    ) : (
                      'Next'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Beneficiaries Section */}
            <div className="mt-2 border-t border-gray-100 pt-5 px-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Recent Transfers</h3>
              <div className="space-y-3">
                {recentBeneficiaries.map((beneficiary) => (
                  <button 
                    key={beneficiary.id}
                    onClick={() => handleSelectBeneficiary(beneficiary)}
                    className="w-full bg-white border border-gray-100 p-3 rounded-xl flex items-center gap-3 hover:border-green-200 hover:bg-green-50/50 transition-all text-left group"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${beneficiary.color}`}>
                      {beneficiary.initials}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">{beneficiary.name}</h4>
                      <p className="text-xs text-gray-500">{beneficiary.identifier}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-green-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: VERIFY DETAILS */}
        {step === 'verify' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex gap-3 mb-6">
              <AlertCircle size={24} className="text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-800 leading-relaxed font-medium">
                Please confirm the recipient's name. Wallet transfers are instant and <strong className="font-bold">cannot be reversed</strong>.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mb-3 shadow-inner">
                <User size={32} />
              </div>
              <p className="text-xs text-gray-500 font-medium mb-1">Sending to</p>
              <h3 className="text-xl font-black text-gray-900 mb-1">{recipientName}</h3>
              <p className="text-sm font-bold text-gray-500 tracking-wider mb-6">{recipientIdentifier}</p>
              
              <div className="w-full pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-500 font-medium">Amount to Send</p>
                <p className="text-2xl font-black text-green-600">₦{Number(amount).toLocaleString()}</p>
              </div>
            </div>

            <button 
              onClick={() => setStep('pin')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center"
            >
              Confirm & Continue
            </button>
          </div>
        )}

        {/* STEP 3: PIN VERIFICATION */}
        {step === 'pin' && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Wallet PIN</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              Enter your 4-digit PIN to authorize the transfer of <strong className="text-gray-800">₦{Number(amount).toLocaleString()}</strong>.
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
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
              ) : (
                'Send Money'
              )}
            </button>
          </div>
        )}

        {/* STEP 4: SUCCESS / RECEIPT */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center animate-in zoom-in-95 duration-500 pt-10">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 relative">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-green-400 opacity-20"></span>
              <Send size={32} className="ml-1" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
            <p className="text-sm text-gray-500 mb-8 text-center max-w-[250px]">
              You have successfully sent funds to <strong className="text-gray-800">{recipientName}</strong>.
            </p>

            <div className="w-full bg-gray-50 rounded-2xl p-5 mb-6 text-left border border-gray-200 shadow-sm space-y-4">
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-500 font-medium">Amount Sent</span>
                <span className="font-black text-green-600 text-lg">₦{Number(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-500 font-medium">Recipient</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900 block">{recipientName}</span>
                  <span className="text-xs text-gray-500">{recipientIdentifier}</span>
                </div>
              </div>
              {narration && (
                <div className="flex justify-between items-start text-sm">
                  <span className="text-gray-500 font-medium">Note</span>
                  <span className="font-medium text-gray-800 text-right max-w-[60%] italic">"{narration}"</span>
                </div>
              )}
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Transaction Fee</span>
                <span className="font-bold text-gray-900">₦0.00 (Free)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Reference ID</span>
                <span className="font-mono text-xs text-gray-600">BD-TRF-92813X</span>
              </div>
            </div>

            <button 
              onClick={() => { setStep('form'); setRecipientIdentifier(''); setAmount(''); setNarration(''); setTransactionPin(['','','','']); onBack(); }}
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
