import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

export type View =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'profile'
  | 'notifications'
  | 'pricing'
  | 'support'
  | 'airtime'
  | 'history'
  | 'exams'
  | 'fund'
  | 'data'
  | 'transfer'
  | 'cable'
  | 'electricity'
  | 'nin'
  | 'requests'
  | 'alpha'
  | 'kirani'
  | 'smile'
  | 'a2c'
  | 'esim'
  | 'cac'
  | 'intl'
  | 'ratel'
  | 'privacy'
  | 'terms'
  | 'reseller-upgrade'
  | 'referrals';

interface NavigationContextType {
  currentView: View;
  navigateTo: (view: View, options?: { resetStack?: boolean }) => void;
  goBack: () => void;
  registerBackHandler: (handler: () => boolean) => () => void;
  canGoBack: boolean;
  historyStack: View[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Determine initial view based on stored API key
  const [historyStack, setHistoryStack] = useState<View[]>(() => {
    const apiKey = localStorage.getItem('saukiglobal_api_key');
    return [apiKey ? 'dashboard' : 'landing'];
  });

  const currentView = historyStack[historyStack.length - 1] || 'landing';

  // Registry of custom back handlers (for modals, sub-views, etc.)
  const customBackHandlersRef = useRef<Array<() => boolean>>([]);

  const registerBackHandler = (handler: () => boolean) => {
    customBackHandlersRef.current.push(handler);
    return () => {
      customBackHandlersRef.current = customBackHandlersRef.current.filter((h) => h !== handler);
    };
  };

  const navigateTo = (view: View, options?: { resetStack?: boolean }) => {
    setHistoryStack((prevStack) => {
      if (options?.resetStack) {
        return [view];
      }

      const current = prevStack[prevStack.length - 1];
      if (current === view) {
        return prevStack;
      }

      // Check if target view is already in history stack (e.g. returning to parent or dashboard)
      const existingIndex = prevStack.lastIndexOf(view);
      if (existingIndex !== -1) {
        // Unwind history stack to that existing entry
        return prevStack.slice(0, existingIndex + 1);
      }

      // Otherwise push new view onto stack
      return [...prevStack, view];
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    // 1. Try running registered custom back handlers first (most recent first)
    const handlers = customBackHandlersRef.current;
    for (let i = handlers.length - 1; i >= 0; i--) {
      const handled = handlers[i]();
      if (handled) {
        return; // Handled by modal or sub-view component
      }
    }

    // 2. Main view history stack navigation
    setHistoryStack((prevStack) => {
      if (prevStack.length > 1) {
        const nextStack = prevStack.slice(0, -1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return nextStack;
      }

      // 3. Root screen reached (no previous history)
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.exitApp();
      }
      return prevStack;
    });
  };

  // Synchronize native Android back button event listener
  useEffect(() => {
    let listenerHandle: any = null;

    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('backButton', () => {
        goBack();
      }).then((handle) => {
        listenerHandle = handle;
      });
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      goBack();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        navigateTo,
        goBack,
        registerBackHandler,
        canGoBack: historyStack.length > 1,
        historyStack,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
