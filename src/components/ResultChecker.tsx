import React, { useState } from 'react';
import { 
  Wallet, 
  BookOpen, 
  Lock, 
  CheckCircle2, 
  Copy, 
  Share2, 
  Minus, 
  Plus, 
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import PinInput from './PinInput';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface ResultCheckerProps {
  onBack: () => void;
}

export default function ResultChecker({ onBack }: ResultCheckerProps) {
  const { user, refreshUser } = useUser();
  const [step, setStep] = useState('form'); // 'form', 'pin', 'success'
  
  // Form States
  const [examType, setExamType] = useState<'waec' | 'neco' | 'nabteb'>('waec');
  const [quantity, setQuantity] = useState(1);
  
  // Payment States
  const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPins, setGeneratedPins] = useState<{ serial: string, pin: string }[]>([]);

  // Exam Pricing & Details
  const exams = {
    waec: { id: 'waec', name: 'WAEC Result Checker', price: 3500, color: 'bg-indigo-50', border: 'border-indigo-500', text: 'text-indigo-700' },
    neco: { id: 'neco', name: 'NECO Token', price: 1000, color: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700' },
    nabteb: { id: 'nabteb', name: 'NABTEB Scratch Card', price: 1000, color: 'bg-rose-50', border: 'border-rose-500', text: 'text-rose-700' },
  };

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'decrease' && quantity > 1) setQuantity(q => q - 1);
    if (type === 'increase' && quantity < 20) setQuantity(q => q + 1); // Max 20 per transaction
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examType || quantity < 1) return;
    setStep('pin');
  };

  const handlePinSubmit = async (pinParam?: string | React.MouseEvent) => {
    const finalPin = typeof pinParam === 'string' ? pinParam : transactionPin.join('');
    if (!finalPin || finalPin.length !== 4) return;
    setIsProcessing(true);
    
    try {
      const mockPins = Array.from({ length: quantity }).map((_, i) => ({
        serial: `${examType.toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`,
        pin: Math.floor(100000000000 + Math.random() * 900000000000).toString()
      }));

      await api.addTransaction({
        type: 'Exam',
        amount: totalAmount,
        status: 'Success',
        details: `${quantity}x ${exams[examType].name} PINs Generated`,
        recipient: examType.toUpperCase(),
        pin: finalPin
      });
      
      await refreshUser();
      setGeneratedPins(mockPins);
      setStep('success');
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAll = () => {
    const textToCopy = generatedPins.map((p, i) => `Pin ${i+1}: ${p.pin} | S/N: ${p.serial}`).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('All PINs copied to clipboard!');
    });
  };

  const handleShareReceipt = () => {
    const text = generatedPins.map((p, i) => `P${i+1}: ${p.pin}`).join(', ');
    if (navigator.share) {
      navigator.share({
        title: `${exams[examType].name} Receipt`,
        text: `I just bought my ${exams[examType].name} PINs on Saukiglobal! ${text}`,
      }).catch(() => {});
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  const totalAmount = exams[examType].price * quantity;

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-indigo-600 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button 
            onClick={() => {
              if (step === 'success') { setStep('form'); setQuantity(1); setGeneratedPins([]); }
              else if (step === 'pin') setStep('form');
              else onBack();
            }}
            className="p-2 -ml-2 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">Result Checkers</h1>
        </header>

        {/* STEP 1: SELECT EXAM & QUANTITY */}
        {step === 'form' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Wallet Balance Snippet */}
            <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-2xl mb-6 border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-xs text-indigo-800 font-medium">Available Balance</p>
                  <p className="text-sm font-bold text-indigo-900">₦ {user?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-6">
              
              {/* Exam Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Select Examination</label>
                <div className="space-y-3">
                  {(Object.values(exams) as any[]).map((exam) => (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => setExamType(exam.id)}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        examType === exam.id 
                          ? `${exam.border} ${exam.color} shadow-sm transform scale-[1.01]` 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${examType === exam.id ? 'bg-white shadow-sm' : 'bg-gray-100'} ${exam.text}`}>
                          <BookOpen size={20} />
                        </div>
                        <h3 className={`font-bold text-sm ${examType === exam.id ? exam.text : 'text-gray-700'}`}>
                          {exam.name}
                        </h3>
                      </div>
                      <span className="font-black text-gray-900 text-sm">₦{exam.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector (Crucial for Resellers) */}
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                <label className="block text-sm font-bold text-gray-700 mb-3 text-center">How many PINs do you want?</label>
                <div className="flex items-center justify-center gap-6">
                  <button 
                    type="button"
                    onClick={() => handleQuantityChange('decrease')}
                    disabled={quantity <= 1}
                    className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <Minus size={20} />
                  </button>
                  
                  <div className="w-16 text-center">
                    <span className="text-3xl font-black text-indigo-600">{quantity}</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => handleQuantityChange('increase')}
                    disabled={quantity >= 20}
                    className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50 hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-3 font-medium">Max 20 PINs per transaction.</p>
              </div>

              {/* Order Summary & Action Button */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-gray-500 font-medium">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">₦{totalAmount.toLocaleString()}</span>
                </div>
                <button 
                  type="submit"
                  disabled={!user || totalAmount > user.balance}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {(!user || totalAmount > user.balance) ? 'Insufficient Funds' : `Pay ₦${totalAmount.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: PIN VERIFICATION */}
        {step === 'pin' && (
          <div className="p-6 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-300">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
            <p className="text-sm text-gray-500 text-center mb-8 px-4">
              You are buying <strong className="text-gray-800">{quantity}x {exams[examType].name}</strong> for <strong className="text-indigo-600">₦{totalAmount.toLocaleString()}</strong>.
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating PIN(s)...</>
              ) : (
                'Pay & Generate PIN'
              )}
            </button>
          </div>
        )}

        {/* STEP 3: SUCCESS / PINS RECEIPT */}
        {step === 'success' && (
          <div className="p-0 flex flex-col h-full animate-in zoom-in-95 duration-500">
            
            <div className="bg-indigo-600 text-white pt-8 pb-6 px-6 text-center rounded-b-3xl shadow-md">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Purchase Successful!</h2>
              <p className="text-indigo-200 text-sm">
                {quantity}x {exams[examType].name} Generated
              </p>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {/* Alert for bulk printing */}
              {quantity > 1 && (
                <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex gap-2 mb-4">
                  <AlertCircle size={16} className="text-orange-500 mt-0.5" />
                  <p className="text-xs text-orange-800 font-medium">Tip: Use the 'Copy All' button below to easily paste these PINs to your customer on WhatsApp.</p>
                </div>
              )}

              {/* Generated PINs List */}
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {generatedPins.map((item, index) => (
                  <div key={index} className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 relative">
                    <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                      #{index + 1}
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">PIN Number</p>
                      <p className="text-xl font-black text-indigo-700 tracking-widest">{item.pin}</p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Serial Number</p>
                      <p className="text-sm font-bold text-gray-800">{item.serial}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={handleCopyAll}
                  className="bg-indigo-50 text-indigo-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"
                >
                  <Copy size={18} />
                  Copy All
                </button>
                <button 
                  onClick={handleShareReceipt}
                  className="bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <Share2 size={18} />
                  Share Receipt
                </button>
              </div>

              <button 
                onClick={() => { setStep('form'); setQuantity(1); setGeneratedPins([]); setTransactionPin(['','','','']); }}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all"
              >
                Buy More PINs
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
