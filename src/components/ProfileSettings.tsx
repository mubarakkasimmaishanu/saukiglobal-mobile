import React, { useState } from 'react';
import {
  User,
  Shield,
  Lock,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  LogOut,
  Award,
  Gift,
  Copy,
  CheckCircle2,
  FileText,
  ChevronLeft
} from 'lucide-react';
import PersonalInfo from './profile/PersonalInfo';
import SecurityPassword from './profile/SecurityPassword';
import TransactionPinSettings from './profile/TransactionPinSettings';
import { useUser } from '../context/UserContext';

interface ProfileSettingsProps {
  onBack: () => void;
  onLogout: () => void;
  onViewPricing: () => void;
  onViewSupport: () => void;
  onViewReferrals: () => void;
}

type ProfileView = 'main' | 'personal' | 'password' | 'pin';

export default function ProfileSettings({ onBack, onLogout, onViewPricing, onViewSupport, onViewReferrals }: ProfileSettingsProps) {
  const { user, loading, logout } = useUser();
  const [currentView, setCurrentView] = useState<ProfileView>('main');
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111415] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isReseller = user?.isReseller ?? false;
  const referralCode = user?.referralCode || 'SAUKI' + (user?.id || 'GLOBAL');

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const SettingsGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 className="text-[10px] font-black text-[#66df75] uppercase tracking-[0.2em] mb-4 px-1">{title}</h3>
      <div className="glass-panel overflow-hidden border border-white/5 shadow-xl">
        {children}
      </div>
    </div>
  );

  const SettingsItem = ({
    icon: Icon,
    title,
    subtitle,
    color = "text-[#e1e3e4]",
    bg = "bg-white/5",
    isLast = false,
    onClick
  }: {
    icon: any,
    title: string,
    subtitle?: string,
    color?: string,
    bg?: string,
    isLast?: boolean,
    onClick?: () => void
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 active:bg-white/10 transition-colors text-left ${!isLast ? 'border-b border-white/5' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${bg} ${color} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">{title}</h4>
          {subtitle && <p className="text-xs text-[#e1e3e4]/40 mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={16} className="text-white/20" />
    </button>
  );

  if (currentView === 'personal') {
    return <PersonalInfo onBack={() => setCurrentView('main')} user={user} />;
  }

  if (currentView === 'password') {
    return <SecurityPassword onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'pin') {
    return <TransactionPinSettings onBack={() => setCurrentView('main')} />;
  }

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans pb-24 mesh-gradient">
      <div className="max-w-md mx-auto relative px-6">

        {/* Header */}
        <header className="py-8 flex justify-between items-center bg-transparent">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Profile Settings</h1>
          </div>
          <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(102,223,117,0.2)]" />
        </header>

        {/* User Card */}
        <div className="glass-panel p-5 border-white/5 mb-6 flex items-center gap-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className={`inline-flex items-center gap-1 ${isReseller ? 'bg-[#66df75]/20 text-[#66df75] border-[#66df75]/30' : 'bg-white/5 text-[#e1e3e4]/60 border-white/10'} px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border`}>
              <Award size={10} />
              {isReseller ? 'Reseller Pro' : 'Basic Account'}
            </div>
          </div>
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#66df75] to-[#4ade80] rounded-full flex items-center justify-center text-[#111415] font-black text-xl shadow-lg">
              {user?.firstName?.charAt(0) || 'U'}
            </div>
            <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#66df75] border-2 border-[#111415] rounded-full flex items-center justify-center">
              <CheckCircle2 size={10} className="text-[#111415]" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">{user?.firstName} {user?.lastName}</h2>
            <p className="text-xs text-[#e1e3e4]/50 font-medium mt-1">{user?.phone}</p>
          </div>
        </div>

        {/* Commission & Referral Card */}
        <div className="card-mesh rounded-3xl p-6 shadow-2xl mb-8 border border-white/5 relative overflow-hidden">
          <Gift size={80} className="absolute -right-4 -bottom-4 text-[#66df75] opacity-5 animate-pulse" />

          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-[#e1e3e4]/40 text-[10px] font-black uppercase tracking-widest mb-1.5">Commission Balance</p>
              <p className="text-2xl font-black text-white">₦{(user?.commissionBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <button
              onClick={() => {
                const commission = user?.commissionBalance || 0;
                if (commission <= 0) {
                  alert('No commission balance to withdraw.');
                  return;
                }
                alert(`₦${commission.toLocaleString()} has been moved to your main wallet. This is a demo action.`);
              }}
              className="bg-[#66df75] hover:bg-[#66df75]/95 text-[#111415] text-xs font-black px-4 py-2.5 rounded-xl transition-colors uppercase tracking-wider shadow-md"
            >
              Withdraw
            </button>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[#e1e3e4]/30 text-[9px] font-black uppercase tracking-wider mb-1">Referral Code</p>
              <p className="text-sm font-bold tracking-widest text-[#66df75] font-mono">{referralCode}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onViewReferrals}
                className="px-3 py-2 rounded-xl bg-white/5 text-[#e1e3e4]/70 hover:bg-white/10 text-[10px] font-black uppercase tracking-wider transition-colors border border-white/10"
              >
                Details
              </button>
              <button
                onClick={handleCopyReferral}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                  copied 
                    ? 'bg-[#66df75] text-[#111415]' 
                    : 'bg-white/5 text-[#e1e3e4]/70 hover:bg-white/10 border border-white/10'
                }`}
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Settings Groups */}
        <SettingsGroup title="Account settings">
          <SettingsItem
            icon={User}
            title="Personal Information"
            subtitle="Update name and basic info"
            bg="bg-blue-500/10" color="text-blue-400"
            onClick={() => setCurrentView('personal')}
          />
          <SettingsItem
            icon={Lock}
            title="Transaction PIN"
            subtitle="Reset or change your 4-digit PIN"
            bg="bg-orange-500/10" color="text-orange-400"
            onClick={() => setCurrentView('pin')}
          />
          <SettingsItem
            icon={Shield}
            title="Security & Password"
            subtitle="Change your login password"
            bg="bg-purple-500/10" color="text-purple-400"
            isLast={true}
            onClick={() => setCurrentView('password')}
          />
        </SettingsGroup>

        <SettingsGroup title="Business & Rates">
          {isReseller && (
            <SettingsItem
              icon={Award}
              title="Reseller Account Status"
              subtitle="Active — Lifetime Access"
              bg="bg-yellow-500/10" color="text-yellow-400"
            />
          )}
          <SettingsItem
            icon={FileText}
            title="My Pricing Matrix"
            subtitle="View your current discount rates"
            bg="bg-[#66df75]/10" color="text-[#66df75]"
            isLast={true}
            onClick={onViewPricing}
          />
        </SettingsGroup>

        <SettingsGroup title="Helpdesk & Support">
          <SettingsItem
            icon={MessageCircle}
            title="WhatsApp Support Hub"
            subtitle="Chat with us directly on WhatsApp"
            bg="bg-emerald-500/10" color="text-emerald-400"
            onClick={() => window.open('https://wa.me/2349068500544', '_blank')}
          />
          <SettingsItem
            icon={HelpCircle}
            title="Ecosystem FAQs"
            subtitle="Learn how to use SaukiGlobal"
            bg="bg-teal-500/10" color="text-teal-400"
            isLast={true}
            onClick={onViewSupport}
          />
        </SettingsGroup>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            onLogout();
          }}
          className="w-full bg-red-950/10 hover:bg-red-950/20 text-red-400 hover:text-red-300 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 border border-red-500/10 transition-all active:scale-95 mb-8"
        >
          <LogOut size={18} />
          <span className="uppercase font-black text-xs tracking-wider">Secure Logout</span>
        </button>

        <p className="text-center text-[10px] font-black text-[#e1e3e4]/20 uppercase tracking-[0.2em] mb-4">
          SaukiGlobal v2.0.1 • Crafted in Nigeria
        </p>

      </div>
    </div>
  );
}
