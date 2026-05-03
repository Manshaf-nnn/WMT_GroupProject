import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'maison.auth.token';
const USER_KEY = 'maison.auth.user';
const ONBOARD_KEY = 'maison.onboarded';

const isSecureStoreAvailable = async () => {
  try { return await SecureStore.isAvailableAsync(); }
  catch { return false; }
};

export const saveToken = async (token) => {
  if (!token) return;
  if (await isSecureStoreAvailable()) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = async () => {
  if (await isSecureStoreAvailable()) {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const getUser = async () => {
  const v = await AsyncStorage.getItem(USER_KEY);
  return v ? JSON.parse(v) : null;
};
export const clearUser = async () => AsyncStorage.removeItem(USER_KEY);

export const setOnboarded = async () => AsyncStorage.setItem(ONBOARD_KEY, '1');
export const hasOnboarded = async () => (await AsyncStorage.getItem(ONBOARD_KEY)) === '1';
