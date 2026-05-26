import React, { useState } from 'react';
import { ChevronLeft, User, Mail, Phone, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { useUser } from '../../context/UserContext';

interface PersonalInfoProps {
  onBack: () => void;
  user: any;
}

export default function PersonalInfo({ onBack, user }: PersonalInfoProps) {
  const { refreshUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      setMessage({ type: 'error', text: 'First name and last name are required.' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await api.updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      if (res.success) {
        await refreshUser();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update profile changes.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
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
          <h1 className="text-lg font-bold tracking-tight">Personal Details</h1>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-2xl flex gap-3 items-center border ${
              message.type === 'success' ? 'bg-[#66df75]/10 border-[#66df75]/20 text-[#66df75]' : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
            } text-xs font-bold animate-in zoom-in-95`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <p>{message.text}</p>
            </div>
          )}

          {/* Personal Info Box */}
          <div className="glass-panel p-6 border-white/5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#66df75]/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-bold text-white/40 cursor-not-allowed"
                />
              </div>
              <p className="text-[8px] text-[#e1e3e4]/30 font-bold uppercase tracking-wider mt-1.5 ml-1">Email is locked for security</p>
            </div>

            <div>
              <label className="block text-[9px] font-black text-[#66df75] uppercase tracking-wider mb-2 ml-1">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/20">
                  <Phone size={16} />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-bold text-white/40 cursor-not-allowed"
                />
              </div>
              <p className="text-[8px] text-[#e1e3e4]/30 font-bold uppercase tracking-wider mt-1.5 ml-1">Phone number is locked for compliance</p>
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
              <span className="uppercase font-black text-xs tracking-wider">Save Profile Changes</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
