import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Download, Sparkles, Rocket } from 'lucide-react';
import { View } from '../context/NavigationContext';

export interface AnnouncementBanner {
  id?: string;
  enabled: boolean;
  title?: string;
  message?: string;
  image_url?: string;
  action_text?: string;
  action_url?: string;
  is_dismissible?: boolean;
  badge?: string;
}

export interface ForceUpdateBanner {
  enabled: boolean;
  title: string;
  message: string;
  min_version?: string;
  latest_version?: string;
  is_mandatory?: boolean;
  update_url?: string;
  image_url?: string;
  action_text?: string;
}

export interface AppBannersData {
  announcement?: AnnouncementBanner;
  force_update?: ForceUpdateBanner;
}

interface InAppBannerModalProps {
  banners: AppBannersData | null;
  currentAppVersion?: string;
  onNavigate: (view: View) => void;
}

/**
 * Resolves relative image URLs (e.g. uploads/ads/..., /vtu/...) to absolute CDN / server URLs.
 */
export function resolveBannerImageUrl(path: string | null | undefined): string | undefined {
  if (!path || typeof path !== 'string' || !path.trim()) return undefined;
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  let cleanPath = clean.replace(/^\/+/, '');
  cleanPath = cleanPath.replace(/saukiglobal\/vtu\//gi, '');
  cleanPath = cleanPath.replace(/vtu\//gi, '');
  cleanPath = cleanPath.replace(/saukiglobal\//gi, '');

  if (!cleanPath.startsWith('uploads/') && !cleanPath.startsWith('assets/')) {
    if (cleanPath.startsWith('ads/')) {
      cleanPath = 'uploads/' + cleanPath;
    } else {
      cleanPath = 'uploads/ads/' + cleanPath;
    }
  }
  return `https://saukiglobal.com/${cleanPath}`;
}

/**
 * Normalizes backend banner responses from various API schemas into standard AppBannersData.
 */
export function normalizeBannerData(rawData: any): AppBannersData | null {
  if (!rawData) return null;

  let data = rawData;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  // Handle nested wraps: { status: true, data: ... } or { banners: ... }
  if (data.data && (typeof data.data === 'object' || Array.isArray(data.data))) {
    data = data.data;
  }
  if (data.banners && typeof data.banners === 'object') {
    data = data.banners;
  }

  const result: AppBannersData = {};

  // Case 1: Array of banners (e.g. from MySQL table)
  if (Array.isArray(data)) {
    const activeItem = data.find((item: any) => {
      const isEnabled = item.enabled === true || item.enabled === 1 || item.enabled === '1' || item.enabled === 'true'
        || item.status === 'On' || item.status === 'active' || item.status === 1 || item.status === '1' || item.status === true
        || item.is_active === 1 || item.is_active === true || item.is_active === '1';
      return isEnabled && (item.title || item.banner_title || item.message || item.body || item.image || item.image_url);
    }) || data[0];

    if (activeItem) {
      result.announcement = normalizeAnnouncement(activeItem);
    }
    return result;
  }

  // Case 2: Object with announcement / popup_banner / popup keys
  if (data.announcement || data.popup_banner || data.popup || data.banner) {
    const ann = data.announcement || data.popup_banner || data.popup || data.banner;
    result.announcement = normalizeAnnouncement(ann);
  } else if (data.title || data.banner_title || data.message || data.body || data.image_url || data.image) {
    // Data is directly the announcement banner object
    result.announcement = normalizeAnnouncement(data);
  }

  if (data.force_update || data.update || data.app_update) {
    const upd = data.force_update || data.update || data.app_update;
    result.force_update = normalizeForceUpdate(upd);
  }

  return Object.keys(result).length > 0 ? result : null;
}

function normalizeAnnouncement(item: any): AnnouncementBanner | undefined {
  if (!item || typeof item !== 'object') return undefined;

  const isEnabled = item.enabled === true || item.enabled === 1 || item.enabled === '1' || item.enabled === 'true'
    || item.status === 'On' || item.status === 'active' || item.status === 1 || item.status === '1' || item.status === true
    || item.is_active === 1 || item.is_active === true || item.active === true || item.active === 1
    || (item.enabled === undefined && item.status === undefined);

  const title = item.title || item.banner_title || item.heading || item.subject || '';
  const message = item.message || item.body || item.content || item.description || item.text || '';
  const rawImage = item.image_url || item.image || item.img || item.banner_img || item.photo || item.upload_path || item.banner_image || '';
  const imageUrl = resolveBannerImageUrl(rawImage);
  const actionText = item.action_text || item.button_text || item.btn_text || item.action || (item.action_url || item.link ? 'View Details' : undefined);
  const actionUrl = item.action_url || item.link || item.button_link || item.target_url || item.url || '';
  const isDismissible = item.is_dismissible !== false && item.dismissible !== false && item.can_dismiss !== false;
  const badge = item.badge || item.tag || item.category || 'Announcement';

  return {
    id: item.id ? String(item.id) : undefined,
    enabled: !!isEnabled,
    title,
    message,
    image_url: imageUrl,
    action_text: actionText,
    action_url: actionUrl,
    is_dismissible: isDismissible,
    badge
  };
}

function normalizeForceUpdate(item: any): ForceUpdateBanner | undefined {
  if (!item || typeof item !== 'object') return undefined;

  const isEnabled = item.enabled === true || item.enabled === 1 || item.enabled === '1' || item.enabled === 'true'
    || item.status === 'On' || item.status === 'active' || item.status === 1 || item.status === '1' || item.status === true;

  const title = item.title || 'New Version Available';
  const message = item.message || item.body || item.description || 'Please update your SaukiGlobal app to continue enjoying seamless automated VTU services and security improvements.';
  const minVersion = item.min_version || item.minVersion || '1.0.0';
  const latestVersion = item.latest_version || item.latestVersion || item.version || '1.0.1';
  const isMandatory = item.is_mandatory === true || item.is_mandatory === 1 || item.is_mandatory === '1' || item.mandatory === true;
  const updateUrl = item.update_url || item.url || item.playstore_url || 'https://play.google.com/store/apps/details?id=com.saukiglobal.app';
  const rawImage = item.image_url || item.image || item.banner_img || '';
  const imageUrl = resolveBannerImageUrl(rawImage);
  const actionText = item.action_text || item.button_text || 'Update App Now';

  return {
    enabled: !!isEnabled,
    title,
    message,
    min_version: minVersion,
    latest_version: latestVersion,
    is_mandatory: isMandatory,
    update_url: updateUrl,
    image_url: imageUrl,
    action_text: actionText
  };
}

/**
 * Strict SemVer comparison: returns true if currentVersion < targetVersion.
 * Examples:
 * isAppOutdated('1.0.10', '1.0.1')  -> false (1.0.10 is newer than 1.0.1)
 * isAppOutdated('1.0.1', '1.0.10')  -> true  (1.0.1 is older than 1.0.10)
 * isAppOutdated('1.0.10', '1.0.11') -> true
 */
export const isAppOutdated = (current: string, target: string): boolean => {
  try {
    const cleanC = (current || '1.0.0').replace(/[^0-9.]/g, '');
    const cleanT = (target || '1.0.0').replace(/[^0-9.]/g, '');

    const cParts = cleanC.split('.').map(n => parseInt(n, 10) || 0);
    const tParts = cleanT.split('.').map(n => parseInt(n, 10) || 0);

    const maxLen = Math.max(cParts.length, tParts.length);
    for (let i = 0; i < maxLen; i++) {
      const c = cParts[i] !== undefined ? cParts[i] : 0;
      const t = tParts[i] !== undefined ? tParts[i] : 0;
      if (c < t) return true;
      if (c > t) return false;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export default function InAppBannerModal({
  banners,
  currentAppVersion = '1.0.10',
  onNavigate
}: InAppBannerModalProps) {
  const [activeModal, setActiveModal] = useState<'update' | 'announcement' | null>(null);

  useEffect(() => {
    if (!banners) return;

    // 1. Check Force Update first
    const update = banners.force_update;
    if (update && update.enabled) {
      const targetVersion = update.is_mandatory
        ? (update.min_version || update.latest_version || '1.0.0')
        : (update.latest_version || update.min_version || '1.0.0');

      const isVersionLower = isAppOutdated(currentAppVersion, targetVersion);
      if (isVersionLower) {
        setActiveModal('update');
        return;
      }
    }

    // 2. Check Announcement Banner
    const ann = banners.announcement;
    if (ann && ann.enabled && (ann.title || ann.message || ann.image_url)) {
      // Dynamic dismissal key based on id and content so new admin updates display automatically
      const idPart = ann.id || 'banner';
      const contentPart = (ann.title || ann.message || ann.image_url || 'promo').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      const bannerKey = `saukiglobal_banner_dismissed_${idPart}_${contentPart}`;
      const dismissedAt = localStorage.getItem(bannerKey);

      if (!dismissedAt || (Date.now() - parseInt(dismissedAt, 10)) > 24 * 60 * 60 * 1000) {
        setActiveModal('announcement');
      }
    }
  }, [banners, currentAppVersion]);

  const handleDismissAnnouncement = () => {
    if (banners?.announcement) {
      const ann = banners.announcement;
      const idPart = ann.id || 'banner';
      const contentPart = (ann.title || ann.message || ann.image_url || 'promo').replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
      const bannerKey = `saukiglobal_banner_dismissed_${idPart}_${contentPart}`;
      localStorage.setItem(bannerKey, Date.now().toString());
    }
    setActiveModal(null);
  };

  const handleAnnouncementAction = () => {
    const ann = banners?.announcement;
    if (!ann) return;

    handleDismissAnnouncement();

    if (!ann.action_url) return;

    if (ann.action_url.startsWith('view:')) {
      const viewName = ann.action_url.replace('view:', '').trim() as View;
      onNavigate(viewName);
    } else if (ann.action_url.startsWith('http://') || ann.action_url.startsWith('https://')) {
      window.open(ann.action_url, '_blank');
    } else {
      onNavigate(ann.action_url as View);
    }
  };

  const handleUpdateAction = () => {
    const update = banners?.force_update;
    const url = update?.update_url || 'https://play.google.com/store/apps/details?id=com.saukiglobal.app';
    window.open(url, '_blank');
  };

  if (!activeModal) return null;

  // -------------------------------------------------------------
  // FORCE UPDATE MODAL (System Unique Brand Palette - #66df75)
  // -------------------------------------------------------------
  if (activeModal === 'update' && banners?.force_update) {
    const update = banners.force_update;
    const isMandatory = update.is_mandatory === true;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-sm bg-[#181b1c] border border-[#66df75]/30 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(102,223,117,0.25)] animate-in zoom-in-95 duration-300 overflow-hidden">
          {/* Spotlight Emerald Glow Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#66df75]/15 blur-3xl pointer-events-none rounded-full"></div>

          {update.image_url ? (
            <div className="w-full h-36 -mt-6 -mx-6 mb-5 overflow-hidden rounded-t-3xl border-b border-white/5 bg-[#111415] relative">
              <img src={update.image_url} alt="Update Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181b1c] via-transparent to-transparent pointer-events-none"></div>
            </div>
          ) : (
            <div className="w-16 h-16 bg-[#66df75]/10 border border-[#66df75]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#66df75] shadow-[0_0_20px_rgba(102,223,117,0.2)]">
              <Rocket size={32} />
            </div>
          )}

          {/* System Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#66df75]/10 border border-[#66df75]/25 text-[#66df75] text-[10px] font-black uppercase tracking-widest mb-3 shadow-[0_0_10px_rgba(102,223,117,0.15)]">
            <Sparkles size={12} />
            {isMandatory ? 'Critical Update Required' : 'Update Available'}
          </div>

          <h3 className="text-xl font-black text-white mb-2 leading-tight">
            {update.title || 'New Version Available'}
          </h3>

          <p className="text-xs text-[#e1e3e4]/70 leading-relaxed mb-6 font-medium">
            {update.message || 'Please update your SaukiGlobal app to continue enjoying seamless automated VTU services and security improvements.'}
          </p>

          {update.latest_version && (
            <div className="flex items-center justify-center gap-4 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-xs">
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-[#e1e3e4]/40 font-bold">Your Version</p>
                <p className="text-white font-mono font-bold">v{currentAppVersion}</p>
              </div>
              <ArrowRight size={14} className="text-[#e1e3e4]/30" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-[#66df75] font-bold">Latest</p>
                <p className="text-[#66df75] font-mono font-bold">v{update.latest_version}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleUpdateAction}
              className="w-full btn-primary py-4 px-6 flex items-center justify-center gap-2 uppercase tracking-wider font-black text-xs shadow-[0_4px_25px_rgba(102,223,117,0.35)] cursor-pointer"
            >
              <Download size={16} />
              <span>{update.action_text || 'Update App Now'}</span>
            </button>

            {!isMandatory && (
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 text-xs font-bold text-[#e1e3e4]/40 hover:text-white transition-colors cursor-pointer"
              >
                Remind Me Later
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ANNOUNCEMENT POPUP BANNER MODAL (System Unique Brand Palette - #66df75)
  // -------------------------------------------------------------
  if (activeModal === 'announcement' && banners?.announcement) {
    const ann = banners.announcement;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-sm bg-[#181b1c] border border-[#66df75]/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(102,223,117,0.25)] animate-in zoom-in-95 duration-300">
          {/* Spotlight Emerald Glow Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#66df75]/15 blur-3xl pointer-events-none rounded-full"></div>

          {ann.is_dismissible !== false && (
            <button
              onClick={handleDismissAnnouncement}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-[#e1e3e4]/80 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}

          {ann.image_url && (
            <div className="w-full max-h-56 overflow-hidden border-b border-white/10 relative bg-[#111415] flex items-center justify-center">
              <img
                src={ann.image_url}
                alt={ann.title || 'Announcement'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181b1c] via-transparent to-transparent pointer-events-none"></div>
            </div>
          )}

          <div className={`p-6 ${ann.image_url ? 'pt-4' : 'pt-6'} text-center relative z-10`}>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#66df75]/10 border border-[#66df75]/25 text-[#66df75] text-[10px] font-black uppercase tracking-widest mb-3 shadow-[0_0_10px_rgba(102,223,117,0.15)]">
              <Sparkles size={12} />
              {ann.badge || 'Announcement'}
            </div>

            {ann.title && (
              <h3 className="text-xl font-black text-white mb-2 leading-snug">
                {ann.title}
              </h3>
            )}

            {ann.message && (
              <p className="text-xs text-[#e1e3e4]/70 leading-relaxed mb-6 whitespace-pre-line font-medium">
                {ann.message}
              </p>
            )}

            <div className="space-y-2.5">
              {ann.action_text && (
                <button
                  onClick={handleAnnouncementAction}
                  className="w-full btn-primary py-4 px-6 flex items-center justify-center gap-2 uppercase tracking-wider font-black text-xs shadow-[0_4px_25px_rgba(102,223,117,0.35)] cursor-pointer"
                >
                  <span>{ann.action_text}</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {ann.is_dismissible !== false && (
                <button
                  onClick={handleDismissAnnouncement}
                  className="w-full py-2.5 text-xs font-bold text-[#e1e3e4]/40 hover:text-white transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}