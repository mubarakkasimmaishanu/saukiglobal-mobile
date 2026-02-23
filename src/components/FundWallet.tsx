import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  CreditCard,
  Copy,
  CheckCircle2,
  Info,
  ShieldCheck,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';

interface FundWalletProps {
  onBack: () => void;
}

export default function FundWallet({ onBack }: FundWalletProps) {
  const { user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState('transfer'); // 'transfer' or 'card'
  const [amount, setAmount] = useState('');
  const [copiedStates, setCopiedStates] = useState({ accNum: false, bank: false });
  const [step, setStep] = useState('form'); // 'form', 'processing', 'success'

  // Pre-defined quick amounts
  const quickAmounts = [1000, 2000, 5000, 10000];

  const handleCopy = (text: string, type: 'accNum' | 'bank') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates({ ...copiedStates, [type]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [type]: false });
      }, 2000);
    });
  };

  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) < 100) return;

    setStep('processing');

    try {
      // Simulate Card Payment & API confirmation
      await api.addTransaction({
        type: 'Funding',
        amount: Number(amount),
        status: 'Success',
        details: 'Wallet Funding via Card (Paystack)',
      });
      await refreshUser();
      setStep('success');
    } catch (error) {
      alert('Payment failed. Please try again.');
      setStep('form');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">

        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white sticky top-0 z-20 flex items-center border-b border-gray-100">
          <button
            onClick={() => step === 'form' ? onBack() : setStep('form')}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Fund Wallet</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Current Balance & Trust Badge */}
            <div className="p-5 bg-gray-50 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  <Wallet size={16} /> Current Balance
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                  <ShieldCheck size={14} /> Secured
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">₦ {user?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>

            <div className="p-5">
              {/* Funding Method Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
                <button
                  onClick={() => setActiveTab('transfer')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'transfer'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Landmark size={18} />
                  Bank Transfer
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'card'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <CreditCard size={18} />
                  Card (ATM)
                </button>
              </div>

              {/* METHOD 1: BANK TRANSFER (Auto-funding) */}
              {activeTab === 'transfer' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                    <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Transfer money to your dedicated account below. Your wallet will be credited <strong>instantly and automatically</strong>.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                    <div className="mb-5">
                      <p className="text-xs text-gray-500 font-medium mb-1">Account Name</p>
                      <p className="text-base font-bold text-gray-900">BuyDigital - Mubarak Kasim</p>
                    </div>

                    <div className="mb-5 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Account Number</p>
                        <p className="text-2xl font-bold text-gray-900 tracking-wider">812 345 6789</p>
                      </div>
                      <button
                        onClick={() => handleCopy('8123456789', 'accNum')}
                        className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${copiedStates.accNum ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {copiedStates.accNum ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copiedStates.accNum ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">Bank Name</p>
                        <p className="text-sm font-bold text-gray-900">Wema Bank (Providus)</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-xs font-medium text-gray-400 mt-4">
                    Note: A standard CBN charge of ₦50 applies to transfers above ₦10,000.
                  </p>
                </div>
              )}

              {/* METHOD 2: CARD PAYMENT (Paystack) */}
              {activeTab === 'card' && (
                <form onSubmit={handleCardPayment} className="space-y-6 animate-in fade-in duration-300">

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Amount to Fund</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-gray-500 font-bold text-lg">₦</span>
                      </div>
                      <input
                        type="number"
                        placeholder="0.00"
                        min="100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Quick Amounts */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2">Quick Select</p>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAmount(amt.toString())}
                          className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                        >
                          ₦{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!amount || Number(amount) < 100}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                    >
                      <CreditCard size={20} />
                      Pay ₦{amount ? Number(amount).toLocaleString() : '0.00'}
                    </button>
                    <div className="flex justify-center items-center mt-3 gap-1 opacity-60">
                      <Lock size={12} className="text-gray-500" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Secured by Paystack</span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* PROCESSING STATE (For Card Payment) */}
        {step === 'processing' && (
          <div className="p-6 h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mb-6">
              <svg className="animate-spin w-full h-full text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard size={24} className="text-emerald-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Connecting to Gateway...</h2>
            <p className="text-sm text-gray-500">Please do not close this app.</p>
          </div>
        )}

        {/* SUCCESS STATE (For Card Payment) */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 pt-12">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Funding Successful!</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-[250px]">
              Your wallet has been credited with <strong className="text-gray-800">₦{Number(amount).toLocaleString()}</strong>.
            </p>

            <div className="w-full bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-3 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Previous Balance</span>
                <span className="font-bold text-gray-900">₦{(user?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Added</span>
                <span className="font-bold text-emerald-600">+ ₦{Number(amount).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base">
                <span className="text-gray-800 font-bold">New Balance</span>
                <span className="font-bold text-gray-900">₦{((user?.balance || 0) + Number(amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={() => { setStep('form'); setAmount(''); setActiveTab('transfer'); onBack(); }}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all mb-3"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
