import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { isWebPortal, getInitialWebStack, fullWebPath, goToWebsiteHome } from '../services/webRouting';

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
  // Web portal build (saukiglobal.com): URL-driven, never shows the mobile landing page.
  const isWeb = isWebPortal();

  // Determine initial view based on stored API key (native) or the routed URL (web)
  const [historyStack, setHistoryStack] = useState<View[]>(() => {
    if (isWeb) {
      return getInitialWebStack();
    }
    const apiKey = localStorage.getItem('saukiglobal_api_key');
    return [apiKey ? 'dashboard' : 'landing'];
  });

  const currentView = historyStack[historyStack.length - 1] || 'landing';

  // Latest values for event listeners registered once
  const historyStackRef = useRef<View[]>(historyStack);
  historyStackRef.current = historyStack;
  // How the next view change should be reflected in the browser URL (web only)
  const urlModeRef = useRef<'push' | 'replace'>('replace');
  const isFirstUrlSyncRef = useRef(true);

  // Web: keep the browser address bar in sync with the active view
  useEffect(() => {
    if (!isWeb) return;
    const target = fullWebPath(currentView);
    if (window.location.pathname !== target) {
      // Preserve query params (referral codes, payment callbacks) on the first render only
      const search = isFirstUrlSyncRef.current ? window.location.search : '';
      const url = target + search;
      if (urlModeRef.current === 'push') {
        window.history.pushState({ view: currentView }, '', url);
      } else {
        window.history.replaceState({ view: currentView }, '', url);
      }
    }
    isFirstUrlSyncRef.current = false;
    urlModeRef.current = 'replace';
  }, [currentView, isWeb]);

  // Registry of custom back handlers (for modals, sub-views, etc.)
  const customBackHandlersRef = useRef<Array<() => boolean>>([]);

  const registerBackHandler = (handler: () => boolean) => {
    customBackHandlersRef.current.push(handler);
    return () => {
      customBackHandlersRef.current = customBackHandlersRef.current.filter((h) => h !== handler);
    };
  };

  const navigateTo = (view: View, options?: { resetStack?: boolean }) => {
    if (isWeb && view === 'landing') {
      // On the web the landing page is the regular PHP website
      goToWebsiteHome();
      return;
    }
    urlModeRef.current = options?.resetStack ? 'replace' : 'push';

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

    // 2. Web root screen: auth/public screens return to the website, dashboard stays
    if (isWeb && historyStackRef.current.length <= 1) {
      const root = historyStackRef.current[0];
      if (root !== 'dashboard') {
        goToWebsiteHome();
      }
      return;
    }
    urlModeRef.current = 'replace';

    // 3. Main view history stack navigation
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
      if (isWeb) {
        // If a modal consumed the back press the view did not change; restore its URL
        setTimeout(() => {
          const stack = historyStackRef.current;
          const target = fullWebPath(stack[stack.length - 1] || 'dashboard');
          if (window.location.pathname !== target) {
            window.history.replaceState(null, '', target);
          }
        }, 0);
      }
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
