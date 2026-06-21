import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { api } from './api';

export const initPushNotifications = (onNavigate: (view: any) => void) => {
  // Only initialize on native platforms (iOS/Android)
  if (Capacitor.getPlatform() === 'web') {
    console.log('Push notifications are not supported on web platform.');
    return;
  }

  // Request permissions and register
  const registerPush = async () => {
    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission denied by user.');
        return;
      }

      await PushNotifications.register();
    } catch (err) {
      console.error('Error during push notification setup:', err);
    }
  };

  // Set up listeners
  PushNotifications.addListener('registration', (token) => {
    console.log('FCM Registration Token:', token.value);
    // Store token locally so it can be viewed/copied from the Profile screen or localStorage
    localStorage.setItem('saukiglobal_fcm_token', token.value);
    
    // Sync to backend database
    api.updateFcmToken(token.value)
      .then(res => {
        console.log('FCM token sent to backend successfully:', res);
      })
      .catch(err => {
        console.error('Failed to send FCM token to backend:', err);
      });
  });

  PushNotifications.addListener('registrationError', (error) => {
    console.error('FCM Registration Error:', JSON.stringify(error));
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Foreground Push Notification Received:', notification);
    // Foreground display is handled natively by the presentationOptions in capacitor.config.ts
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push Notification Clicked / Action Performed:', notification);
    // Navigate user to the notifications screen when they tap a notification
    onNavigate('notifications');
  });

  // Trigger permission request and registration flow
  registerPush();
};

export const getFcmToken = () => {
  return localStorage.getItem('saukiglobal_fcm_token') || null;
};
