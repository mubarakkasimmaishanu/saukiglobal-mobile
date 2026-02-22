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
  const { user, loading } = useUser();
  const [currentView, setCurrentView] = useState<ProfileView>('main');
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Mock Referral Data (could be in user object later)
  const referralData = {
    package: "Reseller",
    commissionBalance: 4550,
    referralCode: "MUB-8921"
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralData.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const SettingsGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">{title}</h3>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );

  const SettingsItem = ({
    icon: Icon,
    title,
    subtitle,
    color = "text-gray-700",
    bg = "bg-gray-50",
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
      className={`w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-left ${!isLast ? 'border-b border-gray-100' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">{title}</h4>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-400" />
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
    <div className="min-h-screen bg-gray-50 font-sans pb-24 md:py-8">
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen md:min-h-[auto] md:rounded-3xl overflow-hidden relative">

        {/* Header */}
        <header className="px-5 pt-8 pb-4 sticky top-0 z-20 flex items-center gap-4 bg-gray-50">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-black text-gray-900">Profile</h1>
        </header>

        <div className="px-5">

          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle2 size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-gray-500 mb-1">{user?.phone}</p>
              <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                <Award size={12} />
                {referralData.package} Level
              </div>
            </div>
          </div>

          {/* Commissions & Referral Card */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 shadow-lg mb-8 text-white relative overflow-hidden">
            <Gift size={100} className="absolute -right-6 -bottom-6 text-white opacity-5" />

            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-gray-400 text-xs font-medium mb-1">Commission Balance</p>
                <p className="text-2xl font-bold">₦{referralData.commissionBalance.toLocaleString()}</p>
              </div>
              <button className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                Withdraw
              </button>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">Referral Code</p>
                <p className="text-sm font-bold tracking-widest text-green-400">{referralData.referralCode}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onViewReferrals}
                  className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs font-bold transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={handleCopyReferral}
                  className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Settings Groups */}
          <SettingsGroup title="Account Settings">
            <SettingsItem
              icon={User}
              title="Personal Information"
              subtitle="Update email, phone, and name"
              bg="bg-blue-50" color="text-blue-600"
              onClick={() => setCurrentView('personal')}
            />
            <SettingsItem
              icon={Lock}
              title="Transaction PIN"
              subtitle="Reset or change your 4-digit PIN"
              bg="bg-orange-50" color="text-orange-600"
              onClick={() => setCurrentView('pin')}
            />
            <SettingsItem
              icon={Shield}
              title="Security & Password"
              subtitle="Change your login password"
              bg="bg-purple-50" color="text-purple-600"
              isLast={true}
              onClick={() => setCurrentView('password')}
            />
          </SettingsGroup>

          <SettingsGroup title="Business & Pricing">
            <SettingsItem
              icon={Award}
              title="Upgrade Package"
              subtitle="Get cheaper rates for VTU & Data"
              bg="bg-yellow-50" color="text-yellow-600"
            />
            <SettingsItem
              icon={FileText}
              title="My Pricing List"
              subtitle="View your current discount rates"
              bg="bg-emerald-50" color="text-emerald-600"
              isLast={true}
              onClick={onViewPricing}
            />
          </SettingsGroup>

          <SettingsGroup title="Help & Support">
            <SettingsItem
              icon={MessageCircle}
              title="WhatsApp Support"
              subtitle="Chat with us directly on WhatsApp"
              bg="bg-green-50" color="text-green-600"
              onClick={onViewSupport}
            />
            <SettingsItem
              icon={HelpCircle}
              title="FAQs & Guides"
              subtitle="Learn how to use BuyDigital"
              bg="bg-gray-100" color="text-gray-600"
              isLast={true}
              onClick={onViewSupport}
            />
          </SettingsGroup>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors mb-6"
          >
            <LogOut size={20} />
            Secure Logout
          </button>

          <p className="text-center text-xs text-gray-400 font-medium mb-4">
            BuyDigital v2.0.1 • Made in Nigeria
          </p>

        </div>
      </div>
    </div>
  );
}
