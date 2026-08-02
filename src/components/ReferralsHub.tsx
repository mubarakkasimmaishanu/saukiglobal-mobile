import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Share2, Users, Wallet, Check, Sparkles, Award } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface ReferralsHubProps {
  onBack: () => void;
}

export default function ReferralsHub({ onBack }: ReferralsHubProps) {
  const { user, refreshUser } = useUser();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#080d09] text-[#e1e3e4] pb-24 font-sans relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-[#111415]/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all"
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
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
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
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#66df75]" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <p className="text-[10px] font-bold text-[#e1e3e4]/40 uppercase tracking-widest mb-1">Total Referrals</p>
              <p className="text-2xl font-black text-white">{totalReferrals}</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-center">
              <p class="text-[10px] font-bold text-[#e1e3e4]/40 uppercase tracking-widest mb-1">Commission Wallet</p>
              <p className="text-2xl font-black text-[#66df75]">₦{commissionBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
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

          {/* Native Share Button */}
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl bg-[#66df75] hover:bg-[#52cc61] text-[#111415] font-black text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(102,223,117,0.2)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5 fill-current" /> Share Invite Link
          </button>
        </div>

      </div>
    </div>
  );
}
