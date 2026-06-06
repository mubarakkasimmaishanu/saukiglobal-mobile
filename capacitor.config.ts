import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.saukiglobal.app',
  appName: 'SaukiGlobal',
  webDir: 'dist',
  server: {
    url: 'http://192.168.43.99:3000',
    cleartext: true
  }
};

export default config;
