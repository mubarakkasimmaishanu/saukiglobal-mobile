import React, { useState } from 'react';
import { ChevronLeft, AlertTriangle, Trash2, Lock, Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface DeleteAccountProps {
  onBack: () => void;
  onDeleted: () => void;
}

export default function DeleteAccount({ onBack, onDeleted }: DeleteAccountProps) {
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setMessage({ type: 'error', text: 'Please enter your password to confirm.' });
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const res = await api.deleteAccount(password);
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Account deletion request submitted. Your account will be removed within 30 days.' });
        setTimeout(() => {
          onDeleted();
        }, 3000);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to process deletion request. Please try again.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred. Please try again.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans pb-12 mesh-gradient animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="max-w-md mx-auto relative px-6">

        {/* Header */}
        <header className="py-8 flex items-center gap-4 bg-transparent">
          <button onClick={onBack} className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <Trash2 size={18} />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Delete Account</h1>
          </div>
        </header>

        {step === 'warning' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Warning Banner */}
            <div className="glass-panel p-5 border border-red-500/20 shadow-xl">
              <div className="flex gap-3 mb-4">
                <AlertTriangle size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-red-400">This action is permanent</h3>
                  <p className="text-[10px] text-[#e1e3e4]/50 font-bold mt-1 uppercase tracking-wider">Please read carefully before proceeding</p>
                </div>
              </div>
            </div>

            {/* Consequences */}
            <div className="glass-panel p-5 border-white/5 shadow-xl space-y-4">
              <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">What happens when you delete your account</h3>

              <div className="space-y-3">
                {[
                  'Your wallet balance will be forfeited. Please withdraw all funds before proceeding.',
                  'All transaction history and records will be permanently deleted.',
                  'Your personal information (name, email, phone, BVN/NIN) will be removed.',
                  'Any active subscriptions or pending transactions will be cancelled.',
                  'You will not be able to recover your account after deletion.',
                  'Deletion is processed within 30 days of the request.'
                ].map((text, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-1.5 flex-shrink-0"></div>
                    <p className="text-xs text-[#e1e3e4]/60 leading-relaxed font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => setStep('confirm')}
              className="w-full bg-red-950/20 hover:bg-red-950/30 text-red-400 hover:text-red-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-red-500/15 transition-all active:scale-95"
            >
              <span className="uppercase font-black text-xs tracking-wider">I understand, continue</span>
            </button>

            <button
              onClick={onBack}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
            >
              <span className="uppercase font-black text-xs tracking-wider">Cancel — Keep my account</span>
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <form onSubmit={handleDelete} className="space-y-6 animate-in fade-in duration-300">
            {message && (
              <div className={`p-4 rounded-2xl flex gap-3 items-center border ${
                message.type === 'success' ? 'bg-[#66df75]/10 border-[#66df75]/20 text-[#66df75]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
              } text-xs font-bold animate-in zoom-in-95`}>
                {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <p>{message.text}</p>
              </div>
            )}

            <div className="glass-panel p-5 border-white/5 shadow-xl">
              <h3 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-4">Confirm your identity</h3>
              <p className="text-xs text-[#e1e3e4]/50 font-medium mb-5 leading-relaxed">
                Enter your account password to confirm that you want to permanently delete your SaukiGlobal account and all associated data.
              </p>

              <div>
                <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">Account Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isDeleting || !password}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              {isDeleting ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <Trash2 size={16} />
                  <span className="uppercase font-black text-xs tracking-wider">Permanently Delete Account</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('warning')}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95"
            >
              <span className="uppercase font-black text-xs tracking-wider">Go Back</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
