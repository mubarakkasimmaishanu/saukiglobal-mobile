import React, { useState } from 'react';
import { ChevronLeft, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

interface SecurityPasswordProps {
  onBack: () => void;
}

export default function SecurityPassword({ onBack }: SecurityPasswordProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }
    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    api.changePassword(formData.currentPassword, formData.newPassword)
      .then((res) => {
        setIsSaving(false);
        if (res.success) {
          setMessage({ type: 'success', text: res.message || 'Password updated successfully!' });
          setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
          setMessage({ type: 'error', text: res.message || 'Failed to update password.' });
        }
      })
      .catch((err) => {
        setIsSaving(false);
        setMessage({ type: 'error', text: err.message || 'An error occurred. Please try again.' });
      });
  };

  const toggleVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords({...showPasswords, [field]: !showPasswords[field]});
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans pb-12 mesh-gradient animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="py-8 flex items-center gap-4 bg-transparent">
          <button onClick={onBack} className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Security & Password</h1>
        </header>

        <div className="glass-panel p-4 flex gap-3 border-white/5 mb-6">
          <ShieldCheck size={20} className="text-[#66df75] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#e1e3e4]/60 leading-relaxed font-bold uppercase tracking-wider">
            Choose a strong password containing at least 8 characters, with letters and numbers for maximum security.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl flex gap-3 items-center border ${
              message.type === 'success' ? 'bg-[#66df75]/10 border-[#66df75]/20 text-[#66df75]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
            } text-xs font-bold animate-in zoom-in-95`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <p>{message.text}</p>
            </div>
          )}

          <div className="glass-panel p-6 border-white/5 space-y-5">
            <div>
              <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                  <Lock size={16} />
                </div>
                <input 
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60"
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="h-px bg-white/5 my-2"></div>

            <div>
              <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                  <Lock size={16} />
                </div>
                <input 
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60"
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                  <Lock size={16} />
                </div>
                <input 
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
                <button 
                  type="button"
                  onClick={() => toggleVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/30 hover:text-white/60"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full btn-primary py-4.5 flex justify-center items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all mt-4"
          >
            {isSaving ? (
              <RefreshCw size={18} className="animate-spin text-[#111415]" />
            ) : (
              <span className="uppercase font-black text-xs tracking-wider">Update Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
