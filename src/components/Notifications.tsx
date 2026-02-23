import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Gift, 
  Wallet, 
  AlertCircle, 
  Clock,
  Settings,
  ChevronLeft
} from 'lucide-react';

interface NotificationsProps {
  onBack: () => void;
}

export default function Notifications({ onBack }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  // Mock Notifications Data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'wallet',
      title: 'Wallet Funded Successfully',
      message: 'Your dedicated account was credited with ₦5,000.00 via Wema Bank.',
      time: '10 mins ago',
      isRead: false,
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    },
    {
      id: 2,
      type: 'task',
      title: 'NIN Slip Ready for Download',
      message: 'Your NIN Slip processing is complete. Click here to view and download your PDF.',
      time: '2 hours ago',
      isRead: false,
      icon: CheckCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      id: 3,
      type: 'promo',
      title: 'Weekend Data Slash! 📉',
      message: 'Get MTN 1GB for just ₦240 this weekend only. Upgrade to Reseller to enjoy this rate.',
      time: 'Yesterday',
      isRead: true,
      icon: Gift,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      id: 4,
      type: 'system',
      title: 'Airtel Network Downtime',
      message: 'Airtel VTU is currently experiencing delays. Please hold on transactions until resolved.',
      time: 'Feb 18',
      isRead: true,
      icon: AlertCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      id: 5,
      type: 'wallet',
      title: 'Referral Bonus Received',
      message: 'You just earned ₦500 commission from Fatima Umar\'s recent transaction.',
      time: 'Feb 15',
      isRead: true,
      icon: Wallet,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:py-8">
      <div className="max-w-md mx-auto bg-white min-h-screen md:min-h-[auto] md:rounded-3xl md:shadow-xl overflow-hidden relative flex flex-col">
        
        {/* Header */}
        <header className="px-5 pt-6 pb-4 bg-white sticky top-0 z-20 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <button 
                onClick={onBack}
                className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-700" />
              </button>
              <h1 className="text-lg font-bold text-gray-900 ml-2">Notifications</h1>
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full">
              <Settings size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1 ${
                activeTab === 'unread' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
              {unreadCount > 0 && activeTab !== 'unread' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1"></span>
              )}
            </button>
          </div>
        </header>

        {/* Mark All Read Action */}
        {unreadCount > 0 && activeTab === 'all' && (
          <div className="px-5 py-3 bg-gray-50 flex justify-end border-b border-gray-100">
            <button 
              onClick={markAllAsRead}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <CheckCheck size={14} /> Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-5 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50/30' : 'bg-white'}`}
                  onClick={() => {
                    // Mark as read when clicked
                    setNotifications(notifications.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
                  }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${notification.bg} ${notification.color}`}>
                    <notification.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm ${!notification.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed mb-2 ${!notification.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <Clock size={12} /> {notification.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Bell size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">All Caught Up!</h3>
              <p className="text-sm text-gray-500">You don't have any {activeTab === 'unread' ? 'unread' : ''} notifications at the moment.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
