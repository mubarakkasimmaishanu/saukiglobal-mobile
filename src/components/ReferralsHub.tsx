import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Share2, 
  Users, 
  Wallet, 
  Check, 
  Sparkles, 
  ArrowRight, 
  X, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';
import PinInput from './PinInput';

interface ReferralsHubProps {
  onBack: () => void;
}

export default function ReferralsHub({ onBack }: ReferralsHubProps) {
  const { user, refreshUser } = useUser();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Transfer Modal States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferPin, setTransferPin] = useState(['', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  useEffect(() => {
    refreshUser();
  }, []);

  const userPhone = user?.phone || user?.referralCode || '';
  const referralLink = `https://saukiglobal.com/auth.php?ref=${encodeURIComponent(userPhone)}`;
  const isReseller = user?.isReseller ?? false;

  const totalReferrals = user?.totalReferrals || 0;
  const commissionBalance = user?.commissionBalance || 0;

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'link') {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join SaukiGlobal',
        text: `Register on SaukiGlobal using my referral phone code ${userPhone} to enjoy fast and reliable VTU services!`,
        url: referralLink,
      }).catch(() => {});
    } else {
      copyToClipboard(referralLink, 'link');
    }
  };

  const handleOpenTransferModal = () => {
    setTransferAmount('');
    setTransferPin(['', '', '', '']);
    setTransferError(null);
    setTransferSuccess(null);
    setShowTransferModal(true);
  };

  const handleSetMaxAmount = () => {
    if (commissionBalance > 0) {
      setTransferAmount(commissionBalance.toString());
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(transferAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferError('Please enter a valid transfer amount.');
      return;
    }

    if (amountNum < 10) {
      setTransferError('Minimum commission transfer amount is ₦10.00.');
      return;
    }

    if (amountNum > commissionBalance) {
      setTransferError(`Amount exceeds available commission balance (₦${commissionBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}).`);
      return;
    }

    const finalPin = transferPin.join('');
    setIsProcessing(true);
    setTransferError(null);

    try {
      const res = await api.transferCommission(amountNum, finalPin);
      if (res.success) {
        setTransferSuccess(res.message || `₦${amountNum.toLocaleString(undefined, { minimumFractionDigits: 2 })} successfully transferred to your main wallet!`);
        await refreshUser();
        setTimeout(() => {
          setShowTransferModal(false);
          setTransferSuccess(null);
        }, 2200);
      } else {
        setTransferError(res.message || 'Transfer failed. Please verify your details.');
      }
    } catch (err: any) {
      setTransferError(err.message || 'Commission transfer failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d09] text-[#e1e3e4] pb-24 font-sans relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-[#111415]/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black text-white tracking-wider uppercase">Referral Program</h1>
        <div className="w-10 h-10"></div>
      </div>

      <div className="p-6 max-w-xl mx-auto space-y-6">

        {/* Title Hero */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#66df75]/10 flex items-center justify-center text-[#66df75] border border-[#66df75]/20 shadow-[0_0_20px_rgba(102,223,117,0.1)]">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Refer & Earn</h2>
              {isReseller && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#66df75]/20 text-[#66df75] text-[10px] font-black uppercase tracking-widest border border-[#66df75]/40">
                  2x Double Rate
                </span>
              )}
            </div>
            <p className="text-xs text-[#e1e3e4]/60 font-medium">Invite friends and earn passive commission on every transaction</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative rounded-3xl bg-[#111415] border border-white/5 p-6 space-y-6 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#66df75]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          {/* Referral Code (Phone) & Link */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-1.5">
                Your Referral Code (Phone Number)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={userPhone}
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-2xl text-center text-sm font-mono font-bold text-white tracking-widest outline-none"
                />
                <button
                  onClick={() => copyToClipboard(userPhone, 'code')}
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-[#66df75]" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-1.5">
                Your Referral Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-2xl text-xs font-mono text-[#66df75] truncate outline-none"
                />
                <button
                  onClick={() => copyToClipboard(referralLink, 'link')}
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#66df75]" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center flex flex-col justify-center">
              <p className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase tracking-widest mb-1">Total Referrals</p>
              <p className="text-2xl font-black text-white">{totalReferrals}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-[#66df75]/20 text-center flex flex-col justify-center relative overflow-hidden">
              <p className="text-[10px] font-bold text-[#66df75] uppercase tracking-widest mb-1">Commission Wallet</p>
              <p className="text-2xl font-black text-[#66df75]">₦{commissionBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Transfer Commission Button Card */}
          <div className="p-4 rounded-2xl bg-[#66df75]/10 border border-[#66df75]/25 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-[#66df75] uppercase tracking-widest">Commission Transfer</p>
              <p className="text-xs font-bold text-white mt-0.5">Send earnings to main balance</p>
            </div>
            <button
              onClick={handleOpenTransferModal}
              disabled={commissionBalance < 10}
              className="px-4 py-2.5 rounded-xl bg-[#66df75] text-[#111415] font-black text-xs uppercase tracking-wider shadow-[0_4px_15px_rgba(102,223,117,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:grayscale transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0"
            >
              <Wallet size={14} />
              <span>Transfer</span>
            </button>
          </div>

          {/* Commission Rules Banner */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#66df75]" /> Commission Calculation Rules
            </h4>
            <p className="text-xs text-[#e1e3e4]/70 leading-relaxed font-medium">
              {isReseller ? (
                <>As a <strong className="text-[#66df75]">Reseller Pro</strong>, you earn <strong className="text-white">2.0% commission</strong> (₦2 per ₦100 spent) on every data purchase made by your referred users.</>
              ) : (
                <>As a <strong className="text-white">Member</strong>, you earn <strong className="text-[#66df75]">1.0% commission</strong> (₦1 per ₦100 spent). Upgrade to Reseller to double your earnings to 2.0%!</>
              )}
            </p>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleOpenTransferModal}
              disabled={commissionBalance < 10}
              className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-wider border border-white/10 active:scale-95 disabled:opacity-40 disabled:grayscale transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-[#66df75]" /> Transfer Funds
            </button>
            <button
              onClick={handleShare}
              className="w-full py-4 rounded-2xl btn-primary text-xs uppercase tracking-wider font-black shadow-[0_10px_30px_rgba(102,223,117,0.25)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 fill-current" /> Share Link
            </button>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SEND COMMISSION TO MAIN WALLET MODAL */}
      {/* ------------------------------------------------------------- */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm bg-[#181b1c] border border-[#66df75]/30 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(102,223,117,0.25)] animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Spotlight Accent */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#66df75]/15 blur-3xl pointer-events-none rounded-full"></div>

            <button
              onClick={() => setShowTransferModal(false)}
              disabled={isProcessing}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="w-14 h-14 bg-[#66df75]/10 border border-[#66df75]/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#66df75] shadow-[0_0_20px_rgba(102,223,117,0.2)]">
              <Wallet size={28} />
            </div>

            <h3 className="text-lg font-black text-white mb-1">
              Send Commission to Wallet
            </h3>
            <p className="text-xs text-[#e1e3e4]/60 mb-6 font-medium">
              Available: <span className="text-[#66df75] font-black">₦{commissionBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </p>

            {transferError && (
              <div className="mb-5 p-3.5 bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-bold rounded-2xl animate-in shake flex items-center gap-2 text-left">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            {transferSuccess && (
              <div className="mb-5 p-3.5 bg-[#66df75]/10 border border-[#66df75]/30 text-[#66df75] text-xs font-bold rounded-2xl animate-in zoom-in-95 flex items-center gap-2 text-left">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{transferSuccess}</span>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-1.5 px-1">
                  Transfer Amount (₦)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 font-black text-base">
                    ₦
                  </div>
                  <input
                    type="number"
                    min="10"
                    max={commissionBalance}
                    step="0.01"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    required
                    disabled={isProcessing}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-9 pr-16 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSetMaxAmount}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#66df75]/15 hover:bg-[#66df75]/25 text-[#66df75] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
                <p className="text-[9px] text-[#e1e3e4]/40 font-bold uppercase tracking-wider mt-1 px-1">
                  Minimum transfer amount is ₦10.00
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2 px-1 text-center">
                  Enter 4-Digit Transaction PIN
                </label>
                <PinInput
                  pin={transferPin}
                  setPin={setTransferPin}
                  disabled={isProcessing}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing || !transferAmount || parseFloat(transferAmount) < 10}
                  className="w-full btn-primary py-4 px-6 flex items-center justify-center gap-2 uppercase tracking-wider font-black text-xs shadow-[0_4px_25px_rgba(102,223,117,0.35)] disabled:opacity-40 disabled:grayscale transition-all cursor-pointer"
                >
                  {isProcessing ? (
                    <RefreshCw size={18} className="animate-spin text-[#111415]" />
                  ) : (
                    <>
                      <span>Confirm Transfer</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
