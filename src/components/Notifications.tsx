import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Wallet, 
  AlertCircle, 
  Clock,
  ChevronLeft,
  Megaphone,
  Info,
  RefreshCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

interface NotificationsProps {
  onBack: () => void;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  upload_path: string | null;
  created_at: string;
  isRead: boolean;
}

export default function Notifications({ onBack }: NotificationsProps) {
  const { refreshUser } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getNotifications();
      if (res.success && res.data && Array.isArray(res.data.notifications)) {
        // Read read list from localStorage
        const readIdsStr = localStorage.getItem('saukiglobal_read_notifs') || '[]';
        const readIds = JSON.parse(readIdsStr) as number[];

        const mappedNotifs: NotificationItem[] = res.data.notifications.map((n: any) => ({
          id: Number(n.id),
          title: n.title || 'Broadcast Update',
          message: n.message || '',
          upload_path: n.upload_path || null,
          created_at: n.created_at || '',
          isRead: readIds.includes(Number(n.id))
        }));

        setNotifications(mappedNotifs);
      } else {
        setError(res.message || 'Failed to fetch broadcast messages.');
      }
    } catch (err) {
      setError('Connection to notification gateway lost.');
    } finally {
      setIsLoading(false);
    }
  };

  const getReadIds = (): number[] => {
    try {
      return JSON.parse(localStorage.getItem('saukiglobal_read_notifs') || '[]') as number[];
    } catch {
      return [];
    }
  };

  const saveReadIds = (ids: number[]) => {
    localStorage.setItem('saukiglobal_read_notifs', JSON.stringify(ids));
  };

  // Mark single notification as read
  const markAsRead = (id: number) => {
    const readIds = getReadIds();
    if (!readIds.includes(id)) {
      const updatedIds = [...readIds, id];
      saveReadIds(updatedIds);
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    }
  };

  // Mark all currently loaded notifications as read
  const markAllAsRead = () => {
    const readIds = getReadIds();
    const loadedUnreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.id);

    if (loadedUnreadIds.length > 0) {
      const updatedIds = [...new Set([...readIds, ...loadedUnreadIds])];
      saveReadIds(updatedIds);
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    }
  };

  // Dynamic unread count calculation
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    return true;
  });

  // Dynamically map appropriate icon & branding depending on content
  const getIconAndColor = (title: string, message: string) => {
    const t = (title + ' ' + message).toLowerCase();
    if (t.includes('wallet') || t.includes('fund') || t.includes('credit') || t.includes('transfer') || t.includes('bonus') || t.includes('commission') || t.includes('credited')) {
      return { icon: Wallet, color: 'text-[#66df75]', bg: 'bg-[#66df75]/10' };
    }
    if (t.includes('downtime') || t.includes('offline') || t.includes('maintenance') || t.includes('delay') || t.includes('issue') || t.includes('error') || t.includes('lock')) {
      return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    }
    if (t.includes('promo') || t.includes('slash') || t.includes('gift') || t.includes('bonus') || t.includes('free')) {
      return { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' };
    }
    return { icon: Megaphone, color: 'text-blue-500', bg: 'bg-blue-500/10' };
  };

  // Convert MySQL DATETIME to client relative timestamp string
  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr.replace(/-/g, '/'));
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 30) return `${diffDays}d ago`;

      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Clean and map attached banner upload_path to absolute web src URLs
  const getImageUrl = (path: string | null) => {
    if (!path) return '';
    let cleanPath = path.replace(/^\/+/, '');
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
  };

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] font-sans mesh-gradient pb-12">
      <div className="max-w-md mx-auto relative px-6">
        
        {/* Header */}
        <header className="pt-8 pb-4 bg-[#111415]/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10"
              >
                <ChevronLeft size={20} />
              </button>
              <h1 className="text-lg font-bold tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-[#ef4444] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
            <button
              onClick={fetchNotifications}
              disabled={isLoading}
              className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-white/10 text-[#66df75] disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Tab Selection */}
          <div className="flex p-1 bg-white/5 border border-white/5 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-[#66df75] text-[#111415] shadow-lg' : 'text-[#e1e3e4]/60 hover:text-white'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex justify-center items-center gap-1.5 ${
                activeTab === 'unread' ? 'bg-[#66df75] text-[#111415] shadow-lg' : 'text-[#e1e3e4]/60 hover:text-white'
              }`}
            >
              Unread
              {unreadCount > 0 && activeTab !== 'unread' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
              )}
            </button>
          </div>
        </header>

        {/* Action Bar */}
        {unreadCount > 0 && activeTab === 'all' && (
          <div className="py-3 flex justify-end">
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-black text-[#66df75] hover:text-[#66df75]/80 flex items-center gap-1 uppercase tracking-widest bg-[#66df75]/10 border border-[#66df75]/20 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            >
              <CheckCheck size={12} /> Mark all as read
            </button>
          </div>
        )}

        {/* Notifications list or states */}
        <div className="mt-4 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCcw size={28} className="animate-spin text-[#66df75]" />
              <p className="text-xs text-[#e1e3e4]/40 font-bold uppercase tracking-widest">Retrieving Broadcasts...</p>
            </div>
          ) : error ? (
            <div className="p-5 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl flex flex-col items-center text-center gap-3">
              <AlertCircle size={24} />
              <p>{error}</p>
              <button 
                onClick={fetchNotifications}
                className="bg-red-500/10 border border-red-500/30 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-red-500/20"
              >
                Retry Request
              </button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const config = getIconAndColor(notification.title, notification.message);
                const Icon = config.icon;
                return (
                  <div 
                    key={notification.id} 
                    className={`glass-panel p-5 flex gap-4 transition-all relative overflow-hidden ${
                      !notification.isRead 
                        ? 'border-[#66df75]/20 bg-white/[0.03]' 
                        : 'border-white/5 opacity-60'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {/* Glowing highlight for unread */}
                    {!notification.isRead && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#66df75]"></div>
                    )}
                    
                    {/* Icon container */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
                      <Icon size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className={`text-sm tracking-tight truncate ${!notification.isRead ? 'font-black text-white' : 'font-bold text-[#e1e3e4]/80'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#66df75] mt-1.5 flex-shrink-0 shadow-[0_0_6px_#66df75]"></span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed mb-3 break-words whitespace-pre-wrap ${!notification.isRead ? 'text-[#e1e3e4]' : 'text-[#e1e3e4]/65'}`}>
                        {notification.message}
                      </p>

                      {/* Display image attachments */}
                      {notification.upload_path && (
                        <div className="mb-3 rounded-2xl overflow-hidden border border-white/5 bg-black/20 max-h-48 flex items-center justify-center">
                          <img 
                            src={getImageUrl(notification.upload_path)} 
                            alt="Broadcast attachment" 
                            className="object-cover w-full h-full"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#e1e3e4]/45 uppercase tracking-wider">
                        <Clock size={11} /> {formatRelativeTime(notification.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-panel p-10 flex flex-col items-center justify-center text-center gap-4 border-white/5 bg-white/[0.01]">
              <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center text-[#e1e3e4]/20 shadow-inner">
                <Bell size={26} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">No Alerts Available</h3>
                <p className="text-xs text-[#e1e3e4]/40 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  You are all caught up! There are no {activeTab === 'unread' ? 'unread' : ''} messages broadcasted.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
