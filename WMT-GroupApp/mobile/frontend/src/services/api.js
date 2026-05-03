import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Expo Go on physical device: Use your computer's local IP address (e.g., 192.168.1.10)
// For Android Emulator: http://10.0.2.2:5001/api
// For iOS Simulator: http://localhost:5001/api
const API_URL = 'https://wmt-groupproject.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
