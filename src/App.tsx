import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProfileSettings from './components/ProfileSettings';
import Notifications from './components/Notifications';
import UserDashboard from './components/UserDashboard';
import PricingList from './components/PricingList';
import HelpSupport from './components/HelpSupport';
import BuyAirtime from './components/BuyAirtime';
import TransactionHistory from './components/TransactionHistory';
import ExamPins from './components/ExamPins';
import FundWallet from './components/FundWallet';
import BuyData from './components/BuyData';
import WalletTransfer from './components/WalletTransfer';
import CableTV from './components/CableTV';
import ElectricityBill from './components/ElectricityBill';
import NINPrint from './components/NINPrint';
import RequestedServices from './components/RequestedServices';
import AlphaTopup from './components/AlphaTopup';
import KiraniService from './components/KiraniService';
import SmileServices from './components/SmileServices';
import AirtimeToCash from './components/AirtimeToCash';
import ESimServices from './components/ESimServices';
import CACRegistration from './components/CACRegistration';
import IntlTopup from './components/IntlTopup';
import RatelCall from './components/RatelCall';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'profile' | 'notifications' | 'pricing' | 'support' | 'airtime' | 'history' | 'exams' | 'fund' | 'data' | 'transfer' | 'cable' | 'electricity' | 'nin' | 'requests' | 'alpha' | 'kirani' | 'smile' | 'a2c' | 'esim' | 'cac' | 'intl' | 'ratel';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if API key exists to auto-login
    const apiKey = localStorage.getItem('saukiglobal_api_key');
    if (apiKey) {
      setCurrentView('dashboard');
    }
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (currentView !== 'landing' && currentView !== 'login' && currentView !== 'signup' && !isInitializing) {
      import('./services/pushNotifications').then(({ initPushNotifications }) => {
        initPushNotifications(navigateTo);
      });
    }
  }, [currentView, isInitializing]);

  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#111415] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <img src="/saukilogo.png" alt="SaukiGlobal Logo" className="w-20 h-20 object-contain animate-pulse drop-shadow-[0_0_20px_rgba(102,223,117,0.3)]" />
          <div className="w-8 h-8 border-4 border-[#66df75] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111415] selection:bg-[#66df75] selection:text-[#111415]">
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
          onLogout={() => {
            localStorage.removeItem('saukiglobal_api_key');
            navigateTo('landing');
          }}
          onViewPricing={() => navigateTo('pricing')}
          onViewSupport={() => navigateTo('support')}
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
        <ExamPins
          onBack={() => navigateTo('dashboard')}
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

      {currentView === 'alpha' && (
        <AlphaTopup
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'kirani' && (
        <KiraniService
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'smile' && (
        <SmileServices
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'a2c' && (
        <AirtimeToCash
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

      {currentView === 'esim' && (
        <ESimServices
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'cac' && (
        <CACRegistration
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'intl' && (
        <IntlTopup
          onBack={() => navigateTo('dashboard')}
        />
      )}

      {currentView === 'ratel' && (
        <RatelCall
          onBack={() => navigateTo('dashboard')}
        />
      )}
    </div>
  );
}


