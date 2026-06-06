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
  Send,
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'payvessel' | 'gateway' | 'manual'>('payvessel');
  const [amount, setAmount] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('korapay');
  
  // PayVessel virtual accounts state
  const [accounts, setAccounts] = useState<VirtualAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState('');
  
  // Dynamic virtual account creation state
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [generatingAccounts, setGeneratingAccounts] = useState(false);

  // Manual Transfer state
  const [manualAmount, setManualAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [reference, setReference] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualStep, setManualStep] = useState<'amount' | 'details'>('amount');
  const [manualInstructions, setManualInstructions] = useState('');
  const [loadingManualInit, setLoadingManualInit] = useState(false);
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState('');

  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [successMsg, setSuccessMsg] = useState('');

  const quickAmounts = [1000, 2000, 5000, 10000];

  useEffect(() => {
    if (activeTab === 'payvessel') {
      fetchVirtualAccounts();
    } else if (activeTab === 'manual') {
      setManualStep('amount');
      setManualAmount('');
      setSenderName('');
      setSenderBank('');
      setSenderAccount('');
      setReference('');
      setReceiptFile(null);
      setReceiptBase64('');
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
        const dataArray = Array.isArray(res.data) ? res.data : [res.data];
        setAccounts(dataArray);
      } else {
        setAccountsError(res.message || 'No dynamic accounts allocated yet.');
      }
    } catch (error) {
      setAccountsError('Failed to synchronize virtual bank nodes.');
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleCreateVirtualAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bvn && !nin) {
      alert('Please enter either your BVN or NIN');
      return;
    }
    
    if (bvn && bvn.length !== 11) {
      alert('BVN must be exactly 11 digits');
      return;
    }
    if (nin && nin.length !== 11) {
      alert('NIN must be exactly 11 digits');
      return;
    }

    setGeneratingAccounts(true);
    setAccountsError('');
    try {
      const res = await api.createVirtualAccount(bvn, nin);
      if (res.success) {
        // Fetch accounts again to display them
        await fetchVirtualAccounts();
      } else {
        alert(res.message || 'Failed to generate virtual accounts.');
      }
    } catch (error) {
      setAccountsError('An error occurred during virtual account generation.');
    } finally {
      setGeneratingAccounts(false);
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

  const handleOnlinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || numAmount < 100) {
      alert('Minimum funding amount is ₦100');
      return;
    }

    setStep('processing');

    try {
      const res = await api.initializePayment(numAmount, selectedGateway);
      if (res.success) {
        const link = res.data?.checkout_url || res.data?.link || res.data?.url || (typeof res.data === 'string' ? res.data : null);
        if (link) {
          window.location.href = link;
        } else {
          throw new Error('Verification callback node failed to initialize checkout URL.');
        }
      } else {
        throw new Error(res.message || 'Payment server failed to respond.');
      }
    } catch (error: any) {
      alert(error.message || 'Failed to initialize gateway checkouts.');
      setStep('form');
    }
  };

  const handleManualInit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(manualAmount);
    if (!manualAmount || numAmount < 100) {
      alert('Minimum funding amount is ₦100');
      return;
    }
    setLoadingManualInit(true);
    try {
      const res = await api.initializePayment(numAmount, 'bank_transfer');
      if (res.success && res.data) {
        setReference(res.data.reference);
        setManualInstructions(res.data.instructions || '');
        setManualStep('details');
      } else {
        alert(res.message || 'Failed to initialize manual transfer.');
      }
    } catch (error) {
      alert('Failed to connect to funding server.');
    } finally {
      setLoadingManualInit(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large (max 5MB)');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || !senderName || !senderBank || !senderAccount || !reference || !receiptBase64) {
      alert('Please fill in all details and upload a payment receipt.');
      return;
    }

    setSubmittingManual(true);
    try {
      const res = await api.submitManualDeposit(
        reference,
        Number(manualAmount),
        senderName,
        senderBank,
        senderAccount,
        receiptBase64,
        receiptFile?.name || 'receipt.png'
      );
      if (res.success) {
        setSuccessMsg(`Your verification report of ₦${Number(manualAmount).toLocaleString()} has been queued for audit. Wallet will credit upon confirmation.`);
        setStep('success');
      } else {
        alert(res.message || 'Failed to file funding report.');
      }
    } catch (error) {
      alert('An error occurred filing verification audits.');
    } finally {
      setSubmittingManual(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-12">
      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="py-8 flex items-center gap-4">
          <button
            onClick={() => step === 'form' ? onBack() : setStep('form')}
            className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Fund Wallet</h1>
        </header>

        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Wallet Balance Display & Compliancy badge */}
            <div className="card-mesh rounded-[2rem] p-6 mb-8 border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black text-[#e1e3e4]/40 uppercase tracking-widest flex items-center gap-1.5">
                  <Wallet size={14} /> Available Balance
                </span>
                <span className="text-[9px] font-black text-[#66df75] bg-[#66df75]/10 px-2 py-1 rounded-md flex items-center gap-1 border border-[#66df75]/20">
                  <ShieldCheck size={12} /> SECURED
                </span>
              </div>
              <h2 className="text-3xl font-black text-white">₦ {(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
            </div>

            {/* Selector Tabs matching ecosystem theme */}
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setActiveTab('payvessel')}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
                  activeTab === 'payvessel'
                    ? 'bg-[#66df75] text-[#111415]'
                    : 'text-[#e1e3e4]/50 hover:text-white'
                }`}
              >
                <Landmark size={16} />
                <span>Auto Account</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gateway')}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
                  activeTab === 'gateway'
                    ? 'bg-[#66df75] text-[#111415]'
                    : 'text-[#e1e3e4]/50 hover:text-white'
                }`}
              >
                <CreditCard size={16} />
                <span>Online Pay</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1.5 ${
                  activeTab === 'manual'
                    ? 'bg-[#66df75] text-[#111415]'
                    : 'text-[#e1e3e4]/50 hover:text-white'
                }`}
              >
                <Send size={16} />
                <span>Admin Deposit</span>
              </button>
            </div>

            {/* DEDICATED ACCOUNTS PANEL */}
            {activeTab === 'payvessel' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="glass-panel p-4 flex gap-3 border-[#66df75]/10">
                  <Info size={20} className="text-[#66df75] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#e1e3e4]/70 leading-relaxed font-bold uppercase tracking-wider">
                    Deposit to any personal bank details below. Wallet refreshes <strong className="text-white">instantly and automatically</strong>.
                  </p>
                </div>

                {loadingAccounts ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw size={24} className="animate-spin text-[#66df75]" />
                    <p className="text-xs text-[#e1e3e4]/50 font-bold uppercase tracking-wider">Generating dedicated details...</p>
                  </div>
                ) : accountsError ? (
                  <div className="glass-panel p-6 text-center space-y-3 border-red-500/20 bg-red-950/10">
                    <p className="text-xs text-red-400 font-semibold">{accountsError}</p>
                    <button
                      type="button"
                      onClick={fetchVirtualAccounts}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-black px-4 py-2 rounded-xl transition-colors border border-red-500/20 uppercase tracking-widest"
                    >
                      Retry sync
                    </button>
                  </div>
                ) : accounts.length === 0 ? (
                  <form onSubmit={handleCreateVirtualAccount} className="glass-panel p-6 space-y-4 border-yellow-500/20 bg-yellow-950/10">
                    <div className="text-center mb-2">
                      <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">No dynamic details assigned yet.</p>
                      <p className="text-[10px] text-gray-400 mt-1">To automatically credit your wallet via bank transfers, please generate your dedicated accounts using your BVN or NIN.</p>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest mb-1.5">BVN (11 Digits)</label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="Enter 11-digit BVN"
                        value={bvn}
                        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all text-white font-mono font-bold"
                      />
                    </div>

                    <div className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-wider">— OR —</div>

                    <div>
                      <label className="block text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest mb-1.5">NIN (11 Digits)</label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="Enter 11-digit NIN"
                        value={nin}
                        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all text-white font-mono font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={generatingAccounts || (!bvn && !nin)}
                      className="w-full bg-[#66df75] text-[#111415] hover:bg-[#66df75]/95 disabled:bg-gray-700 disabled:text-gray-500 text-sm font-black py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 uppercase tracking-wider"
                    >
                      {generatingAccounts ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Generating accounts...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate accounts
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {accounts.map((acc, index) => {
                      const bankName = acc.bank || acc.bankName || acc.bank_name || 'Dynamic Bank';
                      const accountNumber = acc.accountNumber || acc.account_number || acc.number || '';
                      const accountName = acc.accountName || acc.account_name || acc.name || (user ? `${user.firstName} ${user.lastName}` : 'SaukiGlobal User');
                      const id = `${bankName}-${index}`;

                      return (
                        <div key={id} className="glass-panel rounded-3xl p-6 relative overflow-hidden shadow-lg border border-white/5">
                          <div className="absolute top-0 left-0 w-1 h-full bg-[#66df75]"></div>

                          <div className="mb-4">
                            <p className="text-[9px] text-[#e1e3e4]/30 font-black uppercase tracking-wider mb-1">Account Holder</p>
                            <p className="text-sm font-bold text-white uppercase tracking-wide">{accountName}</p>
                          </div>

                          <div className="mb-4 flex justify-between items-end">
                            <div>
                              <p className="text-[9px] text-[#e1e3e4]/30 font-black uppercase tracking-wider mb-1">Smart account number</p>
                              <p className="text-xl font-mono font-black text-white tracking-widest select-all">{accountNumber}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(accountNumber, id)}
                              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                                copiedStates[id] 
                                  ? 'bg-[#66df75] text-[#111415]' 
                                  : 'bg-white/5 text-[#e1e3e4]/70 border border-white/10 hover:bg-white/10'
                              }`}
                            >
                              {copiedStates[id] ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                              {copiedStates[id] ? 'Copied' : 'Copy'}
                            </button>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                            <div>
                              <p className="text-[9px] text-[#e1e3e4]/30 font-black uppercase tracking-wider mb-0.5">Assigned Bank</p>
                              <p className="text-xs font-black text-[#66df75] uppercase tracking-widest">{bankName}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-center text-[9px] font-black text-[#e1e3e4]/30 uppercase tracking-[0.1em] mt-6">
                  Standard service gateway charge of ₦50 applies.
                </p>
              </div>
            )}

            {/* ONLINE GATEWAYS PAYMENT */}
            {activeTab === 'gateway' && (
              <form onSubmit={handleOnlinePayment} className="space-y-6 animate-in fade-in duration-300">
                <div className="glass-panel p-4 flex gap-3 border-[#66df75]/10">
                  <Info size={20} className="text-[#66df75] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#e1e3e4]/70 leading-relaxed font-bold uppercase tracking-wider">
                    Online payments are securely processed via <strong className="text-white">PayVessel (Card / Bank Transfer)</strong>.
                  </p>
                </div>

                {/* Amount to refuel */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] px-1">Refill Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-2xl font-black text-white/30">
                      ₦
                    </div>
                    <input
                      type="number"
                      placeholder="0.00"
                      min="100"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                    />
                  </div>
                </div>

                {/* Quick Selection Options */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest px-1">Quick Select Options</p>
                  <div className="grid grid-cols-4 gap-3">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt.toString())}
                        className="py-3 bg-white/5 border border-white/10 text-[#e1e3e4]/80 text-xs font-bold rounded-xl hover:bg-white/10 transition-colors"
                      >
                        ₦{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!amount || Number(amount) < 100}
                    className="w-full btn-primary py-5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    <CreditCard size={20} />
                    <span className="uppercase font-black text-sm tracking-wider">Pay ₦{amount ? Number(amount).toLocaleString() : '0.00'}</span>
                  </button>
                  <div className="flex justify-center items-center mt-4 gap-1.5 opacity-40">
                    <Lock size={12} />
                    <span className="text-[8px] font-black text-[#e1e3e4] uppercase tracking-[0.2em]">Pristine Cryptographic Escrows</span>
                  </div>
                </div>
              </form>
            )}

            {/* MANUAL DIRECT PAYMENT */}
            {activeTab === 'manual' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {manualStep === 'amount' ? (
                  <form onSubmit={handleManualInit} className="space-y-6">
                    <div className="glass-panel p-4 flex gap-3 border-yellow-500/10 bg-yellow-950/5">
                      <Info size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-yellow-200/70 leading-relaxed font-bold uppercase tracking-wider">
                        Enter the amount you wish to deposit. We will generate a secure reference and display our payment instructions.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] px-1">Deposit Amount</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-2xl font-black text-white/30">
                          ₦
                        </div>
                        <input
                          type="number"
                          placeholder="0.00"
                          min="100"
                          required
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 text-3xl font-black text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest px-1">Quick Select Options</p>
                      <div className="grid grid-cols-4 gap-3">
                        {quickAmounts.map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setManualAmount(amt.toString())}
                            className="py-3 bg-white/5 border border-white/10 text-[#e1e3e4]/80 text-xs font-bold rounded-xl hover:bg-white/10 transition-colors"
                          >
                            ₦{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingManualInit || !manualAmount || Number(manualAmount) < 100}
                      className="w-full bg-[#66df75] text-[#111415] hover:bg-[#66df75]/95 disabled:bg-gray-700 disabled:text-gray-500 text-sm font-black py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 uppercase tracking-wider"
                    >
                      {loadingManualInit ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Proceed to instructions
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="glass-panel p-4 flex gap-3 border-yellow-500/10 bg-yellow-950/5">
                      <Info size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[10px] text-yellow-200/70 leading-relaxed font-bold uppercase tracking-wider">
                        Please transfer exactly <strong className="text-white">₦{Number(manualAmount).toLocaleString()}</strong> to the account below, then upload your receipt.
                      </p>
                    </div>

                    {/* Dynamic bank instructions */}
                    <div className="glass-panel rounded-[2rem] p-6 text-white shadow-lg border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>

                      <div className="mb-4">
                        <p className="text-[9px] text-[#e1e3e4]/30 font-black uppercase tracking-wider mb-1">Corporate Beneficiary & Instructions</p>
                        <p className="text-xs leading-relaxed text-[#e1e3e4]/80 whitespace-pre-line font-bold">{manualInstructions}</p>
                      </div>

                      <div className="mb-4 flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-[#e1e3e4]/30 font-black uppercase tracking-wider mb-1">Narration/Description Reference</p>
                          <p className="text-md font-mono font-black text-[#66df75] tracking-wider select-all">{reference}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(reference, 'admin-ref')}
                          className={`px-3 py-2 rounded-xl flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-colors ${
                            copiedStates['admin-ref'] ? 'bg-[#66df75] text-[#111415]' : 'bg-white/5 text-[#e1e3e4]/70 border border-white/10'
                          }`}
                        >
                          {copiedStates['admin-ref'] ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                          {copiedStates['admin-ref'] ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Audit Form */}
                    <form onSubmit={handleManualSubmit} className="space-y-4 pt-4 border-t border-white/5">
                      <h3 className="text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-4">Verification Audit Form</h3>

                      <div>
                        <label className="block text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest mb-1.5">Depositor Account Name</label>
                        <input
                          type="text"
                          placeholder="Name on bank receipt"
                          required
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all text-white font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest mb-1.5">Originating Bank Name</label>
                          <input
                            type="text"
                            placeholder="e.g. GTBank"
                            required
                            value={senderBank}
                            onChange={(e) => setSenderBank(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all text-white font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest mb-1.5">Originating Account Number</label>
                          <input
                            type="text"
                            placeholder="Sender Account No"
                            required
                            value={senderAccount}
                            onChange={(e) => setSenderAccount(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[9px] font-black text-[#e1e3e4]/40 uppercase tracking-widest">Upload Payment Receipt (Image/PDF)</label>
                        <div className="relative border-2 border-dashed border-white/10 hover:border-[#66df75]/30 rounded-2xl p-6 text-center transition-all bg-white/5">
                          <input
                            type="file"
                            required
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className="space-y-1">
                            <p className="text-xs text-[#e1e3e4]/70 font-bold">
                              {receiptFile ? receiptFile.name : 'Click to select receipt'}
                            </p>
                            <p className="text-[9px] text-[#e1e3e4]/40 uppercase tracking-wider">Max size 5MB (Image/PDF)</p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingManual || !senderName || !senderBank || !senderAccount || !receiptBase64}
                        className="w-full bg-[#66df75] text-[#111415] hover:bg-[#66df75]/95 disabled:bg-gray-700 disabled:text-gray-500 text-sm font-black py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 uppercase tracking-wider mt-6"
                      >
                        {submittingManual ? (
                          <>
                            <RefreshCw size={18} className="animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            Submit Verification
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setManualStep('amount')}
                        className="w-full bg-transparent border border-white/10 text-white/70 hover:bg-white/5 text-xs font-bold py-3 rounded-xl transition-colors uppercase tracking-wider mt-2"
                      >
                        Back / Change Amount
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LOADING HANDLER */}
        {step === 'processing' && (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
            <div className="relative w-20 h-20 mb-6">
              <svg className="animate-spin w-full h-full text-[#66df75]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard size={24} className="text-[#66df75] animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Initializing Payment...</h2>
            <p className="text-xs text-[#e1e3e4]/50 font-semibold uppercase tracking-wider">Connecting to PayVessel</p>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {step === 'success' && (
          <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500 pt-12">
            <div className="w-24 h-24 bg-[#66df75] text-[#111415] rounded-full flex items-center justify-center mb-6 relative shadow-[0_0_30px_rgba(102,223,117,0.4)]">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Report Filed</h2>
            <p className="text-[10px] text-[#66df75] font-black uppercase tracking-[0.25em] mb-6">Pending Audit</p>
            <p className="text-xs text-[#e1e3e4]/60 mb-8 max-w-[280px] leading-relaxed">
              {successMsg || 'Your transaction request has been successfully submitted and is pending verification.'}
            </p>

            <button
              onClick={() => {
                setStep('form');
                setAmount('');
                setManualAmount('');
                setSenderName('');
                setSenderBank('');
                setSenderAccount('');
                setReference('');
                setReceiptFile(null);
                setReceiptBase64('');
                setManualStep('amount');
                onBack();
              }}
              className="w-full btn-primary py-4"
            >
              Back to Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
