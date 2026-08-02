import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, Zap, Award, CheckCircle2, Lock, AlertCircle, RefreshCw, Sparkles, TrendingUp, KeyRound } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';

interface ResellerUpgradeProps {
  onBack: () => void;
}

export default function ResellerUpgrade({ onBack }: ResellerUpgradeProps) {
  const { user, refreshUser } = useUser();
  const [upgradeFee, setUpgradeFee] = useState<number>(2000);
  const [autoApprove, setAutoApprove] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // PIN Modal
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');

  useEffect(() => {
    fetchResellerInfo();
  }, []);

  const fetchResellerInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getResellerInfo();
      if (res.success && res.data) {
        setUpgradeFee(Number(res.data.fee ?? 2000));
        setAutoApprove(!!res.data.auto_approve);
      }
    } catch (err: any) {
      console.warn("Failed to fetch reseller info", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenUpgradeModal = () => {
    if ((user?.balance || 0) < upgradeFee) {
      setError(`Insufficient wallet balance. You need ₦${upgradeFee.toLocaleString('en-US', { minimumFractionDigits: 2 })} to upgrade. Please fund your wallet.`);
      return;
    }
    setError(null);
    setPin('');
    setShowPinModal(true);
  };

  const handleConfirmUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || pin.length !== 4) {
      setError('Please enter your 4-digit transaction PIN.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.upgradeReseller(pin);
      if (res.success) {
        setSuccessMsg(res.message || 'Congratulations! Your account has been upgraded to Reseller Tier!');
        setShowPinModal(false);
        await refreshUser();
      } else {
        setError(res.message || 'Upgrade failed. Please check your PIN and wallet balance.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during upgrade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReseller = user?.isReseller ?? false;

  return (
    <div className="min-h-screen bg-[#080d09] text-[#e1e3e4] pb-24 font-sans relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 bg-[#111415]/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-black text-white tracking-wider uppercase">Reseller Tier Upgrade</h1>
        <div className="w-10 h-10"></div>
      </div>

      <div className="p-6 max-w-xl mx-auto space-y-6">

        {/* Status Banner */}
        {isReseller ? (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 shadow-[0_0_30px_rgba(102,223,117,0.1)]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-[#66df75] flex items-center justify-center mx-auto border border-emerald-500/40">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Active Reseller Account</h2>
              <p className="text-xs text-emerald-400 font-medium mt-1">You are enjoying exclusive wholesale rates & 2x double referral commissions!</p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950 via-[#111415] to-black border border-[#66df75]/30 p-6 space-y-4 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#66df75]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#66df75]/20 flex items-center justify-center text-[#66df75] border border-[#66df75]/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#66df75]/20 text-[#66df75] text-[10px] font-black uppercase tracking-widest border border-[#66df75]/40">
                  Upgrade Account
                </span>
                <h2 className="text-xl font-black text-white tracking-tight mt-0.5">Become a Reseller</h2>
              </div>
            </div>

            <p className="text-xs text-[#e1e3e4]/70 leading-relaxed font-medium">
              Start your VTU business today. Upgrade your account to unlock wholesale rates on data plans, utility bills, and earn 2x referral income!
            </p>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase tracking-widest">One-time Upgrade Fee</p>
                <p className="text-2xl font-black text-[#66df75]">₦{upgradeFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase tracking-widest">Your Wallet</p>
                <p className="text-sm font-bold text-white">₦{(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Reseller Benefits Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-[#66df75] uppercase tracking-widest px-1">Exclusive Reseller Benefits</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 rounded-2xl bg-[#111415] border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#66df75]/10 text-[#66df75] flex items-center justify-center shrink-0 border border-[#66df75]/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Wholesale Data Prices</h4>
                <p className="text-xs text-[#e1e3e4]/60 mt-0.5">Get discounted rates on MTN, Airtel, Glo & 9mobile data plans (e.g. 500MB at ₦252 instead of ₦264).</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111415] border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#66df75]/10 text-[#66df75] flex items-center justify-center shrink-0 border border-[#66df75]/20">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">2x Double Referral Commission</h4>
                <p className="text-xs text-[#e1e3e4]/60 mt-0.5">Earn 2% commission (₦2 per ₦100 spent) on all data purchases made by your referred users.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111415] border border-white/5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#66df75]/10 text-[#66df75] flex items-center justify-center shrink-0 border border-[#66df75]/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Developer API Key Access</h4>
                <p className="text-xs text-[#e1e3e4]/60 mt-0.5">Integrate SaukiGlobal API directly into your website or mobile app for automated VTU sales.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="p-5 rounded-3xl bg-[#111415] border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white">Side-by-Side Comparison</h3>

          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-3 py-2 border-b border-white/5 text-[10px] font-black uppercase tracking-wider text-[#e1e3e4]/40">
              <span>Feature</span>
              <span className="text-center">Member</span>
              <span className="text-right text-[#66df75]">Reseller</span>
            </div>

            <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
              <span className="font-medium text-white">Data Discount</span>
              <span className="text-center text-[#e1e3e4]/60">Standard</span>
              <span className="text-right font-bold text-[#66df75]">Wholesale</span>
            </div>

            <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
              <span className="font-medium text-white">Referral Rate</span>
              <span className="text-center text-[#e1e3e4]/60">1% Base</span>
              <span className="text-right font-bold text-[#66df75]">2% Double</span>
            </div>

            <div className="grid grid-cols-3 py-2.5 border-b border-white/5 items-center">
              <span className="font-medium text-white">API Access</span>
              <span className="text-center text-red-400">Disabled</span>
              <span className="text-right font-bold text-[#66df75]">Enabled</span>
            </div>

            <div className="grid grid-cols-3 py-2.5 items-center">
              <span className="font-medium text-white">Priority Support</span>
              <span className="text-center text-[#e1e3e4]/60">Standard</span>
              <span className="text-right font-bold text-[#66df75]">24/7 VIP</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!isReseller && (
          <button
            onClick={handleOpenUpgradeModal}
            disabled={isLoading || isSubmitting}
            className="w-full py-4 rounded-2xl bg-[#66df75] hover:bg-[#52cc61] text-[#111415] font-black text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(102,223,117,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" /> Upgrade Now (₦{upgradeFee.toLocaleString()})
          </button>
        )}
      </div>

      {/* 4-DIGIT PIN CONFIRMATION MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#111415] border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Confirm Reseller Upgrade</h3>
              <button onClick={() => setShowPinModal(false)} className="text-[#e1e3e4]/40 hover:text-white">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs space-y-1">
              <p className="text-[#e1e3e4]/60">Upgrade Fee: <strong class="text-white">₦{upgradeFee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
              <p className="text-[#e1e3e4]/60">Current Wallet: <strong class="text-white">₦{(user?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p>
            </div>

            <form onSubmit={handleConfirmUpgrade} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-[#66df75] uppercase tracking-widest mb-2">Enter 4-Digit Transaction PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3.5 bg-black/50 border border-white/10 rounded-2xl text-center text-xl text-white font-mono tracking-[0.5em] focus:outline-none focus:border-[#66df75]"
                  placeholder="••••"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 text-white font-bold text-xs hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || pin.length !== 4}
                  className="flex-1 py-3.5 rounded-xl bg-[#66df75] text-[#111415] font-black text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Debit & Upgrade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
