import { authApi } from './api';
import { saveToken, saveUser, getUser, clearToken, clearUser, getToken } from './storage';

export const login = async (email, password) => {
  const data = await authApi.login(email, password);
  const { token, ...user } = data;
  await saveToken(token);
  await saveUser(user);
  return user;
};

export const register = async (payload) => {
  const data = await authApi.register(payload);
  const { token, ...user } = data;
  await saveToken(token);
  await saveUser(user);
  return user;
};

export const logout = async () => {
  await clearToken();
  await clearUser();
};

export const getCurrentUser = async () => {
  const token = await getToken();
  if (!token) return null;
  try {
    const fresh = await authApi.profile();
    await saveUser(fresh);
    return fresh;
  } catch {
    return getUser();
  }
};

export const refreshUser = async () => {
  const fresh = await authApi.profile();
  await saveUser(fresh);
  return fresh;
};
