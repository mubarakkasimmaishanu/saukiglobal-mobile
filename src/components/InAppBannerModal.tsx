import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Download, Sparkles, Rocket } from 'lucide-react';
import { View } from '../context/NavigationContext';

export interface AnnouncementBanner {
  id?: string;
  enabled: boolean;
  title: string;
  message: string;
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

export default function InAppBannerModal({
  banners,
  currentAppVersion = '1.0.0',
  onNavigate
}: InAppBannerModalProps) {
  const [activeModal, setActiveModal] = useState<'update' | 'announcement' | null>(null);

  useEffect(() => {
    if (!banners) return;

    // 1. Check Force Update first
    const update = banners.force_update;
    if (update && update.enabled) {
      const isVersionLower = isAppOutdated(currentAppVersion, update.min_version || update.latest_version || '1.0.0');
      if (isVersionLower || update.is_mandatory) {
        setActiveModal('update');
        return;
      }
    }

    // 2. Check Announcement Banner
    const ann = banners.announcement;
    if (ann && ann.enabled && ann.title) {
      const bannerKey = `saukiglobal_banner_dismissed_${ann.id || 'default'}`;
      const dismissedAt = localStorage.getItem(bannerKey);
      if (!dismissedAt || (Date.now() - parseInt(dismissedAt, 10)) > 24 * 60 * 60 * 1000) {
        setActiveModal('announcement');
      }
    }
  }, [banners, currentAppVersion]);

  const isAppOutdated = (current: string, target: string): boolean => {
    try {
      const cParts = current.split('.').map(n => parseInt(n, 10) || 0);
      const tParts = target.split('.').map(n => parseInt(n, 10) || 0);
      for (let i = 0; i < Math.max(cParts.length, tParts.length); i++) {
        const c = cParts[i] || 0;
        const t = tParts[i] || 0;
        if (c < t) return true;
        if (c > t) return false;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleDismissAnnouncement = () => {
    if (banners?.announcement) {
      const bannerKey = `saukiglobal_banner_dismissed_${banners.announcement.id || 'default'}`;
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
  // FORCE UPDATE MODAL
  // -------------------------------------------------------------
  if (activeModal === 'update' && banners?.force_update) {
    const update = banners.force_update;
    const isMandatory = update.is_mandatory !== false;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-sm bg-[#181b1c] border border-amber-500/30 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-in zoom-in-95 duration-300 overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 blur-3xl pointer-events-none rounded-full"></div>

          {update.image_url ? (
            <div className="w-full h-36 -mt-6 -mx-6 mb-5 overflow-hidden rounded-t-3xl border-b border-white/5">
              <img src={update.image_url} alt="Update Banner" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-400">
              <Rocket size={32} />
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-3">
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
            <div className="flex items-center justify-center gap-4 py-2.5 px-4 rounded-xl bg-white/5 border border-white/5 mb-6 text-xs">
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-[#e1e3e4]/40 font-bold">Your Version</p>
                <p className="text-white font-mono font-bold">v{currentAppVersion}</p>
              </div>
              <ArrowRight size={14} className="text-[#e1e3e4]/30" />
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Latest</p>
                <p className="text-amber-400 font-mono font-bold">v{update.latest_version}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleUpdateAction}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Download size={16} />
              <span>{update.action_text || 'Update App Now'}</span>
            </button>

            {!isMandatory && (
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-3 text-xs font-bold text-[#e1e3e4]/50 hover:text-white transition-colors"
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
  // ANNOUNCEMENT POPUP BANNER MODAL
  // -------------------------------------------------------------
  if (activeModal === 'announcement' && banners?.announcement) {
    const ann = banners.announcement;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="relative w-full max-w-sm bg-[#181b1c] border border-[#66df75]/25 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(102,223,117,0.15)] animate-in zoom-in-95 duration-300">
          {ann.is_dismissible !== false && (
            <button
              onClick={handleDismissAnnouncement}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-[#e1e3e4]/80 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}

          {ann.image_url && (
            <div className="w-full h-44 overflow-hidden border-b border-white/10 relative bg-[#111415]">
              <img
                src={ann.image_url}
                alt={ann.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181b1c] via-transparent to-transparent"></div>
            </div>
          )}

          <div className={`p-6 ${ann.image_url ? 'pt-2' : 'pt-6'} text-center`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#66df75]/10 border border-[#66df75]/20 text-[#66df75] text-[10px] font-black uppercase tracking-widest mb-3">
              <Sparkles size={12} />
              {ann.badge || 'Announcement'}
            </div>

            <h3 className="text-xl font-black text-white mb-2 leading-snug">
              {ann.title}
            </h3>

            <p className="text-xs text-[#e1e3e4]/70 leading-relaxed mb-6 whitespace-pre-line font-medium">
              {ann.message}
            </p>

            <div className="space-y-2.5">
              {ann.action_text && (
                <button
                  onClick={handleAnnouncementAction}
                  className="w-full btn-primary py-4 px-6 flex items-center justify-center gap-2 uppercase tracking-wider font-black text-xs shadow-[0_4px_25px_rgba(102,223,117,0.3)]"
                >
                  <span>{ann.action_text}</span>
                  <ArrowRight size={16} />
                </button>
              )}

              {ann.is_dismissible !== false && (
                <button
                  onClick={handleDismissAnnouncement}
                  className="w-full py-2.5 text-xs font-bold text-[#e1e3e4]/40 hover:text-white transition-colors"
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