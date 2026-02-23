import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProfileSettings from './components/ProfileSettings';
import Notifications from './components/Notifications';
import UserDashboard from './components/UserDashboard';
import PricingList from './components/PricingList';
import HelpSupport from './components/HelpSupport';
import BuyAirtime from './components/BuyAirtime';
import TransactionHistory from './components/TransactionHistory';
import ResultChecker from './components/ResultChecker';
import ReferAndEarn from './components/ReferAndEarn';
import FundWallet from './components/FundWallet';
import BuyData from './components/BuyData';
import WalletTransfer from './components/WalletTransfer';
import JambServices from './components/JambServices';
import JambPins from './components/JambPins';
import CableTV from './components/CableTV';
import ElectricityBill from './components/ElectricityBill';
import NINPrint from './components/NINPrint';
import RequestedServices from './components/RequestedServices';
import UpgradeToReseller from './components/UpgradeToReseller';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'profile' | 'notifications' | 'pricing' | 'support' | 'airtime' | 'history' | 'exams' | 'referral' | 'fund' | 'data' | 'transfer' | 'jamb' | 'jamb-pins' | 'cable' | 'electricity' | 'nin' | 'requests' | 'upgrade';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');

  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {currentView === 'landing' && (
        <LandingPage
          onGetStarted={() => navigateTo('signup')}
          onSignIn={() => navigateTo('login')}
        />
      )}

      {(currentView === 'login' || currentView === 'signup') && (
        <AuthPage
          initialMode={currentView === 'login' ? 'login' : 'signup'}
          onBack={() => navigateTo('landing')}
          onSuccess={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'dashboard' && (
        <UserDashboard onNavigate={navigateTo} />
      )}

      {currentView === 'profile' && (
        <ProfileSettings
          onBack={() => navigateTo('dashboard')}
          onLogout={() => navigateTo('landing')}
          onViewPricing={() => navigateTo('pricing')}
          onViewSupport={() => navigateTo('support')}
          onViewReferrals={() => navigateTo('referral')}
          onUpgrade={() => navigateTo('upgrade')}
        />
      )}

      {currentView === 'notifications' && (
        <Notifications
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'pricing' && (
        <PricingList
          onBack={() => navigateTo('profile')}
        />
      )}

      {currentView === 'support' && (
        <HelpSupport
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'airtime' && (
        <BuyAirtime
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'history' && (
        <TransactionHistory
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'exams' && (
        <ResultChecker
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'referral' && (
        <ReferAndEarn
          onBack={() => navigateTo('profile')}
        />
      )}

      {currentView === 'fund' && (
        <FundWallet
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'data' && (
        <BuyData
          onBack={() => navigateTo('dashboard')}
          onFund={() => navigateTo('fund')}
        />
      )}

      {currentView === 'transfer' && (
        <WalletTransfer
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'jamb' && (
        <JambServices
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'jamb-pins' && (
        <JambPins
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'cable' && (
        <CableTV
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'electricity' && (
        <ElectricityBill
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'nin' && (
        <NINPrint
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'requests' && (
        <RequestedServices
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'upgrade' && (
        <UpgradeToReseller
          onBack={() => navigateTo('dashboard')}
          onSuccess={() => navigateTo('dashboard')}
        />
      )}
    </div>
  );
}
