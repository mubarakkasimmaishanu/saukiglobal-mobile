import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { api } from './services/api';
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
import PrivacyTerms from './components/PrivacyTerms';

type View = 'landing' | 'login' | 'signup' | 'dashboard' | 'profile' | 'notifications' | 'pricing' | 'support' | 'airtime' | 'history' | 'exams' | 'fund' | 'data' | 'transfer' | 'cable' | 'electricity' | 'nin' | 'requests' | 'alpha' | 'kirani' | 'smile' | 'a2c' | 'esim' | 'cac' | 'intl' | 'ratel' | 'privacy' | 'terms';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isInitializing, setIsInitializing] = useState(true);
  const [appConfig, setAppConfig] = useState<any>(null);

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

  useEffect(() => {
    const fetchConfig = async () => {
      const apiKey = localStorage.getItem('saukiglobal_api_key');
      if (apiKey) {
        try {
          const res = await api.getAppConfig();
          if (res.success) {
            setAppConfig(res.data);
          }
        } catch (err) {
          console.error('Failed to fetch app config', err);
        }
      }
    };
    if (currentView !== 'landing' && currentView !== 'login' && currentView !== 'signup' && !isInitializing) {
      fetchConfig();
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
          onPrivacy={() => navigateTo('privacy')}
          onTerms={() => navigateTo('terms')}
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
          appConfig={appConfig}
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

      {currentView === 'privacy' && (
        <PrivacyTerms
          mode="privacy"
          onBack={() => {
            const apiKey = localStorage.getItem('saukiglobal_api_key');
            navigateTo(apiKey ? 'profile' : 'landing');
          }}
        />
      )}

      {currentView === 'terms' && (
        <PrivacyTerms
          mode="terms"
          onBack={() => {
            const apiKey = localStorage.getItem('saukiglobal_api_key');
            navigateTo(apiKey ? 'profile' : 'landing');
          }}
        />
      )}

      {/* Floating WhatsApp Support Button */}
      {currentView !== 'landing' && currentView !== 'login' && currentView !== 'signup' && (
        <button
          onClick={() => {
            const whatsappNumber = appConfig?.whatsapp || '2349031384954';
            const cleanWhatsappNumber = whatsappNumber.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanWhatsappNumber}`, '_blank');
          }}
          className={`fixed ${
            currentView === 'dashboard' ? 'bottom-28' : 'bottom-6'
          } right-6 w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#25D366]/20 hover:scale-105 active:scale-95 transition-all z-[9999] hover:bg-[#20ba56] cursor-pointer`}
          title="Chat with WhatsApp Support"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.13-1.347a9.96 9.96 0 0 0 4.88 1.272h.005c5.505 0 9.99-4.478 9.99-9.985 0-2.667-1.037-5.176-2.924-7.062C17.194 3.037 14.683 2 12.012 2zm5.72 14.106c-.252.712-1.461 1.306-2.01 1.392-.5.077-1.15.142-3.32-.727-2.775-1.112-4.545-3.957-4.684-4.144-.139-.187-1.127-1.503-1.127-2.868 0-1.366.711-2.034.966-2.304.254-.27.55-.337.734-.337.184 0 .368.002.527.009.167.008.39-.063.612.48.227.556.776 1.905.843 2.043.067.137.112.298.02.482-.09.186-.137.3-.272.464-.136.163-.284.364-.407.49-.138.14-.28.293-.12.571.16.278.71 1.173 1.523 1.9.998.892 1.84 1.168 2.099 1.277.26.11.411.092.565-.083.153-.175.656-.764.832-1.026.175-.262.35-.22.589-.13.24.088 1.523.719 1.787.85.263.13.439.197.503.31.064.11.064.643-.188 1.355z"/>
          </svg>
        </button>
      )}
    </div>
  );
}


