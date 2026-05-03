import Constants from 'expo-constants';

const fromEnv = process.env.EXPO_PUBLIC_API_URL;
const fromExtra = Constants?.expoConfig?.extra?.apiUrl;

const fallbackHost = (() => {
  const debuggerHost = Constants?.expoGoConfig?.debuggerHost
    || Constants?.expoConfig?.hostUri
    || Constants?.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') return `http://${host}:5001/api`;
  }
  return 'http://172.20.10.2:5001/api';
})();

export const API_URL = fromEnv || fromExtra || fallbackHost;
export const APP_NAME = 'Maison';
export const CITY = 'New York';
export const CURRENCY = 'USD';
