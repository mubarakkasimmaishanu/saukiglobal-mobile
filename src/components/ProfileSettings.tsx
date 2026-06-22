import React, { useState } from 'react';
import {
  Shield,
  Lock,
  ChevronRight,
  MessageCircle,
  LogOut,
  Award,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Trash2
} from 'lucide-react';
import SecurityPassword from './profile/SecurityPassword';
import TransactionPinSettings from './profile/TransactionPinSettings';
import DeleteAccount from './profile/DeleteAccount';
import PrivacyTerms from './PrivacyTerms';
import { useUser } from '../context/UserContext';

interface ProfileSettingsProps {
  onBack: () => void;
  onLogout: () => void;
  onViewPricing: () => void;
  onViewSupport: () => void;
}

type ProfileView = 'main' | 'personal' | 'password' | 'pin' | 'privacy' | 'terms' | 'delete';

export default function ProfileSettings({ onBack, onLogout, onViewPricing, onViewSupport }: ProfileSettingsProps) {
  const { user, loading, logout } = useUser();
  const [currentView, setCurrentView] = useState<ProfileView>('main');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111415] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isReseller = user?.isReseller ?? false;

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

  if (currentView === 'password') {
    return <SecurityPassword onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'pin') {
    return <TransactionPinSettings onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'privacy') {
    return <PrivacyTerms mode="privacy" onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'terms') {
    return <PrivacyTerms mode="terms" onBack={() => setCurrentView('main')} />;
  }

  if (currentView === 'delete') {
    return (
      <DeleteAccount
        onBack={() => setCurrentView('main')}
        onDeleted={() => {
          logout();
          onLogout();
        }}
      />
    );
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
          {isReseller && (
            <div className="absolute top-0 right-0 p-4">
              <div className="inline-flex items-center gap-1 bg-[#66df75]/20 text-[#66df75] border-[#66df75]/30 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border">
                <Award size={10} />
                Reseller Pro
              </div>
            </div>
          )}
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



        {/* Settings Groups */}
        <SettingsGroup title="Account settings">
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

        {isReseller && (
          <SettingsGroup title="Business & Rates">
            <SettingsItem
              icon={Award}
              title="Reseller Account Status"
              subtitle="Active — Lifetime Access"
              bg="bg-yellow-500/10" color="text-yellow-400"
              isLast={true}
            />
          </SettingsGroup>
        )}

        <SettingsGroup title="Helpdesk & Support">
          <SettingsItem
            icon={MessageCircle}
            title="WhatsApp Support"
            subtitle="Chat with us directly on WhatsApp"
            bg="bg-emerald-500/10" color="text-emerald-400"
            isLast={true}
            onClick={() => window.open('https://wa.me/2349068500544', '_blank')}
          />
        </SettingsGroup>

        <SettingsGroup title="Legal">
          <SettingsItem
            icon={Shield}
            title="Privacy Policy"
            subtitle="How we collect and use your data"
            bg="bg-emerald-500/10" color="text-emerald-400"
            onClick={() => setCurrentView('privacy')}
          />
          <SettingsItem
            icon={FileText}
            title="Terms of Service"
            subtitle="Rules and guidelines for using SaukiGlobal"
            bg="bg-blue-500/10" color="text-blue-400"
            isLast={true}
            onClick={() => setCurrentView('terms')}
          />
        </SettingsGroup>

        <SettingsGroup title="Danger Zone">
          <SettingsItem
            icon={Trash2}
            title="Delete Account"
            subtitle="Permanently remove your account and data"
            bg="bg-red-500/10" color="text-red-400"
            isLast={true}
            onClick={() => setCurrentView('delete')}
          />
        </SettingsGroup>

        {/* Developer / Debug Info */}
        {localStorage.getItem('saukiglobal_fcm_token') && (
          <SettingsGroup title="Developer / Debug Info">
            <div className="p-4 text-xs font-mono break-all select-all text-white/50 bg-black/35 rounded-2xl border border-white/5 space-y-2">
              <div className="text-[9px] font-black uppercase text-[#66df75] tracking-widest">FCM Device Token</div>
              <div className="text-[10px] select-all leading-normal text-white/70">{localStorage.getItem('saukiglobal_fcm_token')}</div>
              <button 
                onClick={() => {
                  const token = localStorage.getItem('saukiglobal_fcm_token') || '';
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(token).then(() => alert('FCM Token copied to clipboard!'));
                  } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = token;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert('FCM Token copied to clipboard!');
                  }
                }}
                className="text-[10px] text-[#66df75] hover:text-[#52c860] active:scale-95 transition-all underline uppercase tracking-widest font-black pt-1 block"
              >
                Copy Token
              </button>
            </div>
          </SettingsGroup>
        )}

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
          SaukiGlobal v1.0 • Crafted in Nigeria
        </p>

      </div>
    </div>
  );
}
