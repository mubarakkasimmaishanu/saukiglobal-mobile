import React, { useState } from 'react';
import {
    ChevronLeft,
    Crown,
    CheckCircle,
    XCircle,
    Zap,
    TrendingUp,
    Users,
    Shield,
    Lock,
    Sparkles,
    Calculator,
    ArrowRight
} from 'lucide-react';
import PinInput from './PinInput';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';

interface UpgradeToResellerProps {
    onBack: () => void;
    onSuccess: () => void;
}

export default function UpgradeToReseller({ onBack, onSuccess }: UpgradeToResellerProps) {
    const { user, refreshUser } = useUser();
    const [step, setStep] = useState<'info' | 'pin' | 'success'>('info');
    const [transactionPin, setTransactionPin] = useState(['', '', '', '']);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dailySales, setDailySales] = useState(10);

    const UPGRADE_FEE = 2000;

    const features = [
        { name: 'Buy Data & Airtime', basic: true, reseller: true },
        { name: 'Pay Bills (Electricity/Cable)', basic: true, reseller: true },
        { name: 'JAMB & Exam Services', basic: true, reseller: true },
        { name: 'Fund Wallet & Transfer', basic: true, reseller: true },
        { name: 'Data at Wholesale Price', basic: false, reseller: true },
        { name: 'Airtime 4% Discount', basic: false, reseller: true },
        { name: 'Commission Dashboard', basic: false, reseller: true },
        { name: 'Per-Transaction Profit Tracking', basic: false, reseller: true },
        { name: '₦500 Referral Bonus', basic: '₦100', reseller: '₦500' },
        { name: 'Priority WhatsApp Support', basic: false, reseller: true },
        { name: 'API Access (Coming Soon)', basic: false, reseller: true },
        { name: 'Custom Pricing Tiers', basic: false, reseller: true },
    ];

    const pricingExamples = [
        { service: 'MTN 1GB', basic: '₦300', reseller: '₦255', save: '₦45' },
        { service: 'MTN 2GB', basic: '₦600', reseller: '₦510', save: '₦90' },
        { service: 'MTN 5GB', basic: '₦1,500', reseller: '₦1,275', save: '₦225' },
        { service: 'Airtel 1GB', basic: '₦300', reseller: '₦265', save: '₦35' },
        { service: 'Airtime ₦1,000', basic: '₦1,000', reseller: '₦960', save: '₦40' },
        { service: 'WAEC Checker', basic: '₦3,800', reseller: '₦3,500', save: '₦300' },
    ];

    // Earnings calculator logic
    const avgProfitPerSale = 50; // average ₦50 profit per transaction
    const dailyProfit = dailySales * avgProfitPerSale;
    const monthlyProfit = dailyProfit * 30;
    const yearlyProfit = monthlyProfit * 12;

    const handleUpgrade = async () => {
        if (transactionPin.join('').length !== 4) return;
        if (!user || user.balance < UPGRADE_FEE) {
            alert('Insufficient balance. Please fund your wallet with at least ₦2,000.');
            return;
        }

        setIsProcessing(true);
        try {
            await api.upgradeToReseller();
            await refreshUser();
            setStep('success');
        } catch (err: any) {
            alert(err.message || 'Upgrade failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (user?.isReseller) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center p-5">
                <div className="max-w-md mx-auto bg-white rounded-3xl p-10 text-center shadow-xl border border-gray-100">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">You're Already a Reseller!</h2>
                    <p className="text-gray-500 mb-8">You have full access to wholesale prices and all premium features.</p>
                    <button onClick={onBack} className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans md:py-8">
            <div className="max-w-2xl mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative">

                {/* Header */}
                <header className="px-5 pt-6 pb-4 bg-white sticky top-0 z-20 flex items-center border-b border-gray-100 shadow-sm">
                    <button
                        onClick={() => {
                            if (step === 'pin') setStep('info');
                            else if (step === 'success') onSuccess();
                            else onBack();
                        }}
                        className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 ml-2">
                        {step === 'success' ? 'Welcome, Reseller!' : 'Upgrade to Reseller'}
                    </h1>
                </header>

                {/* STEP 1: INFO & COMPARISON */}
                {step === 'info' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Hero Banner */}
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                            <div className="absolute right-0 top-0 w-60 h-60 bg-emerald-500/20 rounded-full blur-[80px]"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                                    <Sparkles size={12} /> Most Popular
                                </div>
                                <h2 className="text-3xl font-black mb-2 leading-tight">Unlock Wholesale<br />Prices Forever.</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">One-time payment. No monthly fees. Start earning from day one.</p>
                                <div className="mt-6 flex items-end gap-2">
                                    <span className="text-5xl font-black text-white">₦2,000</span>
                                    <span className="text-slate-400 text-sm font-bold mb-2">one-time</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5">

                            {/* Feature Comparison Table */}
                            <div className="mb-8">
                                <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">Feature Comparison</h3>
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-[1fr_80px_80px] bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 p-3">
                                        <span>Feature</span>
                                        <span className="text-center">Basic</span>
                                        <span className="text-center text-emerald-600">Reseller</span>
                                    </div>
                                    {/* Table Rows */}
                                    {features.map((f, i) => (
                                        <div
                                            key={i}
                                            className={`grid grid-cols-[1fr_80px_80px] p-3 text-sm items-center ${i !== features.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        >
                                            <span className="font-bold text-gray-800 text-xs">{f.name}</span>
                                            <div className="flex justify-center">
                                                {typeof f.basic === 'string' ? (
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{f.basic}</span>
                                                ) : f.basic ? (
                                                    <CheckCircle size={16} className="text-gray-400" />
                                                ) : (
                                                    <XCircle size={16} className="text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex justify-center">
                                                {typeof f.reseller === 'string' ? (
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{f.reseller}</span>
                                                ) : f.reseller ? (
                                                    <CheckCircle size={16} className="text-emerald-600" />
                                                ) : (
                                                    <XCircle size={16} className="text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pricing Examples */}
                            <div className="mb-8">
                                <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-wider">Price Comparison</h3>
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                                    <div className="grid grid-cols-[1fr_70px_70px_60px] bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-500 p-3">
                                        <span>Service</span>
                                        <span className="text-center">Basic</span>
                                        <span className="text-center text-emerald-600">Reseller</span>
                                        <span className="text-center text-amber-600">You Save</span>
                                    </div>
                                    {pricingExamples.map((p, i) => (
                                        <div
                                            key={i}
                                            className={`grid grid-cols-[1fr_70px_70px_60px] p-3 text-xs items-center ${i !== pricingExamples.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        >
                                            <span className="font-bold text-gray-800">{p.service}</span>
                                            <span className="text-center text-gray-500 line-through">{p.basic}</span>
                                            <span className="text-center font-black text-emerald-600">{p.reseller}</span>
                                            <span className="text-center font-black text-amber-600">{p.save}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Earnings Calculator */}
                            <div className="mb-8 bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calculator size={20} className="text-emerald-600" />
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Earnings Calculator</h3>
                                </div>
                                <p className="text-xs text-gray-600 mb-4">How much can you earn? Adjust the slider below.</p>

                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-700 mb-2 block">
                                        Daily Transactions: <span className="text-emerald-600 text-lg font-black">{dailySales}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="100"
                                        value={dailySales}
                                        onChange={(e) => setDailySales(Number(e.target.value))}
                                        className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                    />
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                                        <span>5/day</span><span>50/day</span><span>100/day</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-emerald-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Daily</p>
                                        <p className="text-lg font-black text-emerald-600">₦{dailyProfit.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-emerald-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Monthly</p>
                                        <p className="text-lg font-black text-emerald-600">₦{monthlyProfit.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-emerald-100">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Yearly</p>
                                        <p className="text-lg font-black text-emerald-600">₦{yearlyProfit.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 mb-8">
                                <div className="flex flex-col items-center text-center gap-2 p-3 bg-gray-50 rounded-xl">
                                    <Zap size={20} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-gray-600">Instant<br />Activation</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 p-3 bg-gray-50 rounded-xl">
                                    <Shield size={20} className="text-blue-500" />
                                    <span className="text-[10px] font-bold text-gray-600">No Monthly<br />Fees</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 p-3 bg-gray-50 rounded-xl">
                                    <Users size={20} className="text-purple-500" />
                                    <span className="text-[10px] font-bold text-gray-600">10k+ Resellers<br />Trust Us</span>
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => {
                                    if (!user || user.balance < UPGRADE_FEE) {
                                        alert(`You need at least ₦${UPGRADE_FEE.toLocaleString()} in your wallet. Current balance: ₦${user?.balance.toLocaleString() || 0}`);
                                        return;
                                    }
                                    setStep('pin');
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-3 text-lg mb-4"
                            >
                                <Crown size={22} /> Upgrade Now — ₦{UPGRADE_FEE.toLocaleString()}
                            </button>
                            <p className="text-center text-[10px] text-gray-400 font-medium">
                                Amount will be deducted from your wallet balance.
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 2: PIN VERIFICATION */}
                {step === 'pin' && (
                    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] animate-in slide-in-from-bottom-8 duration-300">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 border border-emerald-100">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Upgrade</h2>
                        <p className="text-sm text-gray-500 text-center mb-2 px-4">
                            Enter your 4-digit PIN to pay <strong className="text-gray-800">₦{UPGRADE_FEE.toLocaleString()}</strong>
                        </p>
                        <p className="text-xs text-gray-400 mb-8">and activate Reseller status permanently.</p>

                        <PinInput
                            pin={transactionPin}
                            setPin={setTransactionPin}
                            onComplete={handleUpgrade}
                            disabled={isProcessing}
                        />

                        <button
                            onClick={handleUpgrade}
                            disabled={isProcessing || transactionPin.join('').length !== 4}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 mt-4"
                        >
                            {isProcessing ? (
                                <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
                            ) : (
                                'Confirm Payment'
                            )}
                        </button>
                        <button onClick={() => setStep('info')} className="mt-4 text-sm font-bold text-gray-500 hover:text-gray-800 py-2">
                            Go Back
                        </button>
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 'success' && (
                    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] animate-in zoom-in-95 duration-500">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                                <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>
                                <Crown size={48} className="text-emerald-600 relative z-10" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome, Reseller! 🎉</h2>
                        <p className="text-gray-500 text-center mb-8 max-w-sm leading-relaxed">
                            Your account has been upgraded. You now have access to wholesale prices, commission tracking, and all premium features.
                        </p>

                        <div className="w-full bg-emerald-50 rounded-2xl p-5 border border-emerald-100 mb-8 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Account Type</span>
                                <span className="font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full text-xs uppercase tracking-wider">Reseller Pro</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Upgrade Cost</span>
                                <span className="font-bold text-gray-900">₦{UPGRADE_FEE.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Validity</span>
                                <span className="font-bold text-gray-900">Lifetime ♾️</span>
                            </div>
                        </div>

                        <button
                            onClick={onSuccess}
                            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                            Go to Dashboard <ArrowRight size={18} />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
