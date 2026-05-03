import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  if (response.data.token) {
    await AsyncStorage.setItem('userToken', response.data.token);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('userToken');
  await AsyncStorage.removeItem('userData');
};

export const getCurrentUser = async () => {
  const userData = await AsyncStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};
