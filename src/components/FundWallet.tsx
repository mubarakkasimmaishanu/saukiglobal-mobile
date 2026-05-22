import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Landmark,
  CreditCard,
  Copy,
  CheckCircle2,
  Info,
  ShieldCheck,
  Lock,
  ChevronLeft,
  RefreshCw,
  Send
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';

interface FundWalletProps {
  onBack: () => void;
}

interface VirtualAccount {
  bank: string;
  bankName?: string;
  bank_name?: string;
  accountNumber: string;
  account_number?: string;
  number?: string;
  accountName: string;
  account_name?: string;
  name?: string;
}

export default function FundWallet({ onBack }: FundWalletProps) {
  const { user, refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState<'payvessel' | 'flutterwave' | 'manual'>('payvessel');
  const [amount, setAmount] = useState('');
  
  // PayVessel virtual accounts state
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState('');
  
  // Manual Transfer state
  const [manualAmount, setManualAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [reference, setReference] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-defined quick amounts
  const quickAmounts = [1000, 2000, 5000, 10000];

  useEffect(() => {
    if (activeTab === 'payvessel') {
      fetchVirtualAccounts();
    }
  }, [activeTab]);

  const fetchVirtualAccounts = async () => {
    setLoadingAccounts(true);
    setAccountsError('');
    try {
      const res = await api.getVirtualAccounts();
      if (res.success && Array.isArray(res.data)) {
        setAccounts(res.data);
      } else if (res.success && res.data) {
        // Handle cases where data might be an object instead of array
        const dataArray = Array.isArray(res.data) ? res.data : [res.data];
        setAccounts(dataArray);
      } else {
        setAccountsError(res.message || 'No virtual accounts allocated yet.');
      }
    } catch (error) {
      setAccountsError('Failed to load virtual accounts. Please try again.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedStates(prev => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }));
      }, 2000);
    });
  };

  const handleFlutterwavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || numAmount < 100) {
      alert('Minimum funding amount is ₦100');
      return;
    }

    setStep('processing');

    try {
      const res = await api.initializeFlutterwave(numAmount);
      if (res.success) {
        const link = res.data?.link || res.data?.url || res.data?.checkout_url || (typeof res.data === 'string' ? res.data : null);
        if (link) {
          window.location.href = link;
        } else {
          throw new Error('Payment link not found in API response');
        }
      } else {
        throw new Error(res.message || 'Failed to initialize payment gateway.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to connect to Flutterwave gateway. Please try again.');
      setStep('form');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || !senderName || !senderBank || !reference) {
      alert('Please fill out all fields to report your payment.');
      return;
    }

    setSubmittingManual(true);
    try {
      const payload = {
        type: 'Manual Funding',
        amount: Number(manualAmount),
        sender_name: senderName,
        bank_name: senderBank,
        reference: reference,
        details: `Manual Funding: ₦${manualAmount} via ${senderBank} by ${senderName} (Ref: ${reference})`
      };

      const res = await api.addRequest(payload);
      if (res.success) {
        setSuccessMsg(`Your payment confirmation request of ₦${Number(manualAmount).toLocaleString()} has been submitted. We will verify and fund your wallet shortly.`);
        setStep('success');
      } else {
        alert(res.message || 'Failed to submit payment request. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setSubmittingManual(false);
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

            {/* Current Balance & Security Badge */}
            <div className="p-5 bg-gray-50 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                  <Wallet size={16} /> Current Balance
                </span>
                <span className="text-xs font-bold text-[#66df75] bg-[#66df75]/10 px-2 py-1 rounded-md flex items-center gap-1">
                  <ShieldCheck size={14} /> Secured
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">₦ {user?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>

            <div className="p-5">
              {/* Funding Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-xl mb-6 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('payvessel')}
                  className={`flex-1 py-3.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 ${
                    activeTab === 'payvessel'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Landmark size={16} />
                  <span>Auto Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('flutterwave')}
                  className={`flex-1 py-3.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 ${
                    activeTab === 'flutterwave'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CreditCard size={16} />
                  <span>Online Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 py-3.5 rounded-lg transition-all flex flex-col items-center justify-center gap-1.5 ${
                    activeTab === 'manual'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Send size={16} />
                  <span>Manual Bank</span>
                </button>
              </div>

              {/* PAYVESSEL VIRTUAL ACCOUNTS TAB */}
              {activeTab === 'payvessel' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                    <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Transfer money to any of your dedicated accounts below. Your wallet will be credited <strong>instantly and automatically</strong>.
                    </p>
                  </div>

                  {loadingAccounts ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <RefreshCw size={24} className="animate-spin text-emerald-600" />
                      <p className="text-xs font-semibold text-gray-500">Generating your accounts...</p>
                    </div>
                  ) : accountsError ? (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-center space-y-3">
                      <p className="text-xs text-red-800">{accountsError}</p>
                      <button
                        type="button"
                        onClick={fetchVirtualAccounts}
                        className="bg-red-100 text-red-800 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : accounts.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-center">
                      <p className="text-xs text-yellow-800">No virtual accounts allocated yet. Please click retry or contact support if this persists.</p>
                      <button
                        type="button"
                        onClick={fetchVirtualAccounts}
                        className="mt-3 bg-yellow-100 text-yellow-800 text-xs font-bold px-4 py-2 rounded-lg hover:bg-yellow-200 transition-colors"
                      >
                        Generate Accounts
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {accounts.map((acc, index) => {
                        const bankName = acc.bank || acc.bankName || acc.bank_name || 'Virtual Bank';
                        const accountNumber = acc.accountNumber || acc.account_number || acc.number || '';
                        const accountName = acc.accountName || acc.account_name || acc.name || (user ? `${user.firstName} ${user.lastName}` : '');
                        const id = `${bankName}-${index}`;

                        return (
                          <div key={id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                            <div className="mb-4">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Account Name</p>
                              <p className="text-sm font-bold text-gray-900">{accountName}</p>
                            </div>

                            <div className="mb-4 flex justify-between items-end">
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Account Number</p>
                                <p className="text-xl font-bold text-gray-900 tracking-wider">{accountNumber}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(accountNumber, id)}
                                className={`px-3 py-2 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-colors ${
                                  copiedStates[id] ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {copiedStates[id] ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                                {copiedStates[id] ? 'Copied' : 'Copy'}
                              </button>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Bank Name</p>
                                <p className="text-xs font-black text-emerald-600 uppercase tracking-wide">{bankName}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-center text-[10px] font-bold text-gray-400 mt-4">
                    Note: A service fee of ₦50 applies to auto-funding transactions.
                  </p>
                </div>
              )}

              {/* FLUTTERWAVE GATEWAY TAB */}
              {activeTab === 'flutterwave' && (
                <form onSubmit={handleFlutterwavePayment} className="space-y-6 animate-in fade-in duration-300">
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
                        required
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
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Secured by Flutterwave</span>
                    </div>
                  </div>
                </form>
              )}

              {/* MANUAL BANK TRANSFER TAB */}
              {activeTab === 'manual' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl flex gap-3">
                    <Info size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-800 leading-relaxed">
                      Please make payment to our administrative account below, then fill out the payment verification form.
                    </p>
                  </div>

                  {/* Admin Bank Details */}
                  <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>

                    <div className="mb-4">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Admin Account Name</p>
                      <p className="text-sm font-bold">SaukiGlobal - Mubarak Kasim Maishanu</p>
                    </div>

                    <div className="mb-4 flex justify-between items-end">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Account Number</p>
                        <p className="text-xl font-bold tracking-wider">8123456789</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('8123456789', 'admin-number')}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold transition-colors ${
                          copiedStates['admin-number'] ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                        }`}
                      >
                        {copiedStates['admin-number'] ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                        {copiedStates['admin-number'] ? 'Copied' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Bank Name</p>
                        <p className="text-xs font-black text-yellow-400 tracking-wider">WEMA BANK</p>
                      </div>
                    </div>
                  </div>

                  {/* Manual Form */}
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Payment Verification Report</h3>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Amount Paid (₦)</label>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        required
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Sender Name (Your Bank Account Name)</label>
                      <input
                        type="text"
                        placeholder="e.g. Aisha Bello"
                        required
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Your Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. GTBank"
                        required
                        value={senderBank}
                        onChange={(e) => setSenderBank(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Transaction Ref / Reference Number</label>
                      <input
                        type="text"
                        placeholder="e.g. TXN-928374928"
                        required
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingManual || !manualAmount || !senderName || !senderBank || !reference}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                    >
                      {submittingManual ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Submitting Report...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Submit Payment Report
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROCESSING STATE (For Flutterwave Redirection) */}
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
            <p className="text-sm text-gray-500">You will be redirected to complete your payment.</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === 'success' && (
          <div className="p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 pt-12">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 relative">
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
            <p className="text-xs text-gray-500 mb-8 max-w-[300px] leading-relaxed">
              {successMsg || 'Your transaction request has been successfully submitted and is pending verification.'}
            </p>

            <button
              onClick={() => {
                setStep('form');
                setAmount('');
                setManualAmount('');
                setSenderName('');
                setSenderBank('');
                setReference('');
                onBack();
              }}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-md transition-all mb-3 text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
