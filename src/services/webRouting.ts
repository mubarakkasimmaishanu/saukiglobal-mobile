/**
 * Web integration layer (same approach as the eData web portal).
 *
 * The exact same React code ships in two places:
 *   1. Capacitor native app (Android/iOS)  -> unchanged, view-stack navigation only.
 *   2. saukiglobal.com web portal          -> `npm run build:web` deploys this build to
 *      `<web root>/webapp`, and the web server routes the auth + dashboard URLs to it.
 *
 * On the web the marketing landing page is the PHP site (index.php), NOT the mobile
 * LandingPage component. The SPA only owns these URLs:
 *   /auth, /login            -> login
 *   /register, /signup       -> signup  (also /auth#register)
 *   /app                     -> dashboard
 *   /app/<view>              -> any post-auth view (legacy PHP page names are aliased)
 *
 * Keep the slug lists here in sync with the "Mobile Web App" block in the web
 * root `.htaccess` (and `nginx.template.conf`).
 */
import { Capacitor } from '@capacitor/core';
import type { View } from '../context/NavigationContext';

const API_KEY_KEY = 'saukiglobal_api_key';
const POST_AUTH_VIEW_KEY = 'saukiglobal_post_auth_view';

/**
 * True only for the web-portal build (`vite build --mode portal`, see `npm run build:web`).
 * The Capacitor app, `npm run dev` and the standalone Vercel PWA keep their original
 * behaviour (mobile landing page + in-memory view stack).
 */
export const isWebPortal = (): boolean =>
  typeof window !== 'undefined' &&
  !Capacitor.isNativePlatform() &&
  import.meta.env.MODE === 'portal';

/** Supports a local XAMPP sub-folder install (http://localhost/saukiglobal/...). */
export const getWebPrefix = (): string => {
  if (typeof window === 'undefined') return '';
  const m = window.location.pathname.match(/^\/saukiglobal(?=\/|$)/i);
  return m ? m[0] : '';
};

const AUTH_PATHS: Record<string, View> = {
  auth: 'login',
  login: 'login',
  register: 'signup',
  signup: 'signup',
};

/** /app/<slug> -> view. Includes legacy PHP dashboard page names so old links keep working. */
const APP_SLUGS: Record<string, View> = {
  '': 'dashboard',
  index: 'dashboard',
  dashboard: 'dashboard',
  services: 'dashboard',
  profile: 'profile',
  notifications: 'notifications',
  pricing: 'pricing',
  support: 'support',
  airtime: 'airtime',
  history: 'history',
  transactions: 'history',
  exams: 'exams',
  exam: 'exams',
  fund: 'fund',
  wallet: 'fund',
  data: 'data',
  'data-bundle': 'data',
  transfer: 'transfer',
  cable: 'cable',
  cables: 'cable',
  electricity: 'electricity',
  nin: 'nin',
  requests: 'requests',
  alpha: 'alpha',
  'alpha-topup': 'alpha',
  kirani: 'kirani',
  smile: 'smile',
  a2c: 'a2c',
  'airtime-to-cash': 'a2c',
  esim: 'esim',
  cac: 'cac',
  intl: 'intl',
  ratel: 'ratel',
  'ratel-call': 'ratel',
  'retel-call': 'ratel',
  privacy: 'privacy',
  terms: 'terms',
  'reseller-upgrade': 'reseller-upgrade',
  referrals: 'referrals',
};

const PUBLIC_VIEWS: View[] = ['privacy', 'terms', 'pricing'];

/** Canonical web URL for a view (without the local prefix). */
export const webPathForView = (view: View): string => {
  switch (view) {
    case 'landing':
      return '/';
    case 'login':
      return '/auth';
    case 'signup':
      return '/register';
    case 'dashboard':
      return '/app/';
    default:
      return `/app/${view}`;
  }
};

export const fullWebPath = (view: View): string => {
  const p = getWebPrefix() + webPathForView(view);
  return p === '' ? '/' : p;
};

/** Leave the SPA and go back to the normal PHP website (landing page). */
export const goToWebsiteHome = (): void => {
  window.location.assign(getWebPrefix() + '/');
};

export const rememberPostAuthView = (view: View) => {
  try { sessionStorage.setItem(POST_AUTH_VIEW_KEY, view); } catch { /* ignore */ }
};

export const consumePostAuthView = (): View | null => {
  try {
    const v = sessionStorage.getItem(POST_AUTH_VIEW_KEY) as View | null;
    sessionStorage.removeItem(POST_AUTH_VIEW_KEY);
    return v && v !== 'dashboard' && v !== 'login' && v !== 'signup' && v !== 'landing' ? v : null;
  } catch {
    return null;
  }
};

/** Initial navigation stack for the web portal, derived from the URL the server routed here. */
export const getInitialWebStack = (): View[] => {
  const hasKey = !!localStorage.getItem(API_KEY_KEY);
  const path = window.location.pathname
    .slice(getWebPrefix().length)
    .replace(/\.php$/i, '')
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
  const hash = window.location.hash.replace('#', '').toLowerCase();

  // Auth routes
  if (path in AUTH_PATHS) {
    if (hasKey) return ['dashboard'];
    if (hash === 'register' || hash === 'signup') return ['signup'];
    return [AUTH_PATHS[path]];
  }

  // Dashboard routes
  if (path === 'app' || path.startsWith('app/')) {
    const slug = path === 'app' ? '' : path.slice(4);
    const view = APP_SLUGS[slug] ?? 'dashboard';
    if (!hasKey) {
      if (PUBLIC_VIEWS.includes(view)) return [view];
      rememberPostAuthView(view);
      return ['login'];
    }
    return view === 'dashboard' ? ['dashboard'] : ['dashboard', view];
  }

  return [hasKey ? 'dashboard' : 'login'];
};
