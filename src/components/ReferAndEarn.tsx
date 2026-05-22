import React, { useState } from 'react';
import {
  Gift,
  Copy,
  Share2,
  Users,
  CheckCircle2,
  TrendingUp,
  ChevronRight,
  Info,
  ChevronLeft,
  Crown,
  Lock
} from 'lucide-react';
import { useUser } from '../context/UserContext';

interface ReferAndEarnProps {
  onBack: () => void;
}

export default function ReferAndEarn({ onBack }: ReferAndEarnProps) {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  const isReseller = user?.isReseller ?? false;
  const referralCode = user?.referralCode || 'NEWUSER000';
  const referralLink = `https://saukiglobal.com/ref/${referralCode}`;
  const totalEarnings = user?.totalEarnings ?? 0;
  const commissionBalance = user?.commissionBalance ?? 0;
  const totalReferrals = user?.totalReferrals ?? 0;

  // Tier-specific bonus amount
  const bonusPerReferral = isReseller ? 500 : 100;

  // Mock Downlines (Referrals)
  const referrals = [
    { id: 1, name: 'Aisha Bello', phone: '0803 *** 1234', date: 'Today', status: 'active', earned: isReseller ? 500 : 100 },
    { id: 2, name: 'Chinedu Okeke', phone: '0902 *** 5678', date: 'Yesterday', status: 'active', earned: isReseller ? 500 : 100 },
    { id: 3, name: 'Sani Musa', phone: '0812 *** 9012', date: 'Feb 18', status: 'pending', earned: 0 },
    { id: 4, name: 'Fatima Umar', phone: '0706 *** 3456', date: 'Feb 15', status: 'active', earned: isReseller ? 1200 : 300 },
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">

        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-emerald-600 text-white sticky top-0 z-20 flex items-center shadow-md">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-emerald-700 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-2">Refer & Earn</h1>
        </header>

        <div className="p-5 animate-in fade-in slide-in-from-right-4 duration-300">

          {/* Tier-Aware Bonus Banner */}
          <div className={`rounded-2xl p-4 mb-6 flex items-center gap-3 border ${isReseller
              ? 'bg-emerald-50 border-emerald-100'
              : 'bg-slate-50 border-slate-200'
            }`}>
            <div className={`p-2 rounded-full ${isReseller ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>
              {isReseller ? <Crown size={20} /> : <Users size={20} />}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-bold ${isReseller ? 'text-emerald-800' : 'text-slate-800'}`}>
                {isReseller ? `Reseller Bonus: ₦${bonusPerReferral} per referral` : `Referral Bonus: ₦${bonusPerReferral} per referral`}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {isReseller
                  ? 'You enjoy exclusive wholesale referral bonuses!'
                  : 'Earn bonuses for every new user you introduce to SaukiGlobal.'
                }
              </p>
            </div>
          </div>

          {/* Main Reward Card */}
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200 mb-8 relative overflow-hidden">
            {/* Decorative BG */}
            <Gift size={120} className="absolute -right-6 -bottom-6 text-white opacity-10 transform -rotate-12" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>

            <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Total Earned</p>
            <h2 className="text-3xl font-black mb-6">₦ {totalEarnings.toLocaleString()}</h2>

            <div className="bg-emerald-950 bg-opacity-40 rounded-2xl p-4 flex justify-between items-center border border-emerald-700 backdrop-blur-sm">
              <div>
                <p className="text-emerald-200 text-[10px] uppercase tracking-wider mb-1">Available to Withdraw</p>
                <p className="text-xl font-bold text-yellow-400">₦ {commissionBalance.toLocaleString()}</p>
              </div>
              <button
                onClick={() => {
                  if (commissionBalance <= 0) {
                    alert('No commission balance to withdraw.');
                    return;
                  }
                  alert(`₦${commissionBalance.toLocaleString()} has been moved to your main wallet. This is a demo action.`);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-emerald-900 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                Move to Wallet
              </button>
            </div>
          </div>

          {/* Share Code Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-8 text-center">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Your Referral Link</h3>
            <p className="text-xs text-gray-500 mb-4">Share this link with friends to earn ₦{bonusPerReferral} when they sign up and transact.</p>

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 mb-4">
              <div className="flex-1 px-3 text-sm font-bold text-gray-700 truncate">
                {referralLink}
              </div>
              <button
                onClick={() => handleCopy(referralLink)}
                className={`px-4 py-3 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${copied ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              onClick={() => {
                const message = encodeURIComponent(`Join Saukiglobal and get the cheapest data, airtime & more! Use my referral link: ${referralLink}`);
                window.open(`https://wa.me/?text=${message}`, '_blank');
              }}
              className="w-full bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
            >
              <Share2 size={18} />
              Share via WhatsApp
            </button>
          </div>

          {/* How it Works / Stats */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-full w-max mb-3">
                <Users size={20} />
              </div>
              <p className="text-2xl font-black text-gray-900">{totalReferrals}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">Total Referrals</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-full w-max mb-3">
                <TrendingUp size={20} />
              </div>
              <p className="text-2xl font-black text-gray-900">₦{bonusPerReferral}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">Per Referral</p>
            </div>
          </div>

          {/* Downline List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Your Referrals</h3>
              <button
                onClick={() => alert('All your referrals are displayed below. More referral management features coming soon!')}
                className="text-xs font-bold text-emerald-600 flex items-center"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {referrals.map((ref) => (
                <div key={ref.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                      {ref.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{ref.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">{ref.date}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className={`text-[10px] font-bold ${ref.status === 'active' ? 'text-emerald-600' : 'text-orange-500'}`}>
                          {ref.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Earned</p>
                    <p className={`text-sm font-black ${ref.earned > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      ₦{ref.earned}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Banner */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4 flex gap-3 border border-gray-200">
              <Info size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                You earn <strong>₦{bonusPerReferral}</strong> every time your referral funds their wallet and makes their first transaction.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
