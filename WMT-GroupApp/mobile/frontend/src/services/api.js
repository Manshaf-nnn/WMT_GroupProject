import axios from 'axios';
import { API_URL } from './config';
import { getToken, clearToken, clearUser } from './storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      const url = error?.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        await clearToken(); await clearUser();
        if (onUnauthorized) onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export const friendlyError = (err, fallback = 'Something went wrong.') => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message?.includes('Network')) return 'No connection. Check your Wi-Fi.';
  return err?.message || fallback;
};

// ----- Auth
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  profile: () => api.get('/auth/profile').then((r) => r.data),
  updateProfile: (payload) => api.put('/auth/profile', payload).then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
  deleteAccount: () => api.delete('/auth/account').then((r) => r.data),
  toggleFavorite: (restaurantId) =>
    api.post('/auth/favorites/toggle', { restaurantId }).then((r) => r.data),
  // addresses
  listAddresses: () => api.get('/auth/addresses').then((r) => r.data),
  addAddress: (payload) => api.post('/auth/addresses', payload).then((r) => r.data),
  updateAddress: (id, payload) => api.put(`/auth/addresses/${id}`, payload).then((r) => r.data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`).then((r) => r.data),
  // admin
  adminListUsers: () => api.get('/auth/users').then((r) => r.data),
  adminToggleSuspend: (id) => api.patch(`/auth/users/${id}/suspend`).then((r) => r.data),
  adminDeleteUser: (id) => api.delete(`/auth/users/${id}`).then((r) => r.data)
};

// ----- Restaurants
export const restaurantApi = {
  list: (params) => api.get('/restaurants', { params }).then((r) => r.data),
  cuisines: () => api.get('/restaurants/cuisines').then((r) => r.data),
  get: (id) => api.get(`/restaurants/${id}`).then((r) => r.data),
  create: (payload) => api.post('/restaurants', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/restaurants/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/restaurants/${id}`).then((r) => r.data)
};

// ----- Bookings
export const bookingApi = {
  myBookings: () => api.get('/bookings/my').then((r) => r.data),
  get: (id) => api.get(`/bookings/${id}`).then((r) => r.data),
  create: (payload) => api.post('/bookings', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/bookings/${id}`, payload).then((r) => r.data),
  cancel: (id) => api.delete(`/bookings/${id}`).then((r) => r.data),
  checkIn: (id) => api.post(`/bookings/${id}/check-in`).then((r) => r.data),
  // admin
  all: () => api.get('/bookings').then((r) => r.data),
  adminUpdate: (id, payload) => api.patch(`/bookings/${id}`, payload).then((r) => r.data)
};

// ----- Reviews
export const reviewApi = {
  list: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`).then((r) => r.data),
  mine: () => api.get('/reviews/my').then((r) => r.data),
  create: (payload) => api.post('/reviews', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/reviews/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
  helpful: (id) => api.post(`/reviews/${id}/helpful`).then((r) => r.data),
  report: (id) => api.post(`/reviews/${id}/report`).then((r) => r.data),
  // admin
  all: () => api.get('/reviews/all').then((r) => r.data),
  hide: (id) => api.patch(`/reviews/${id}/hide`).then((r) => r.data)
};

// ----- Payments
export const paymentApi = {
  pay: (payload) => api.post('/payments', payload).then((r) => r.data),
  history: () => api.get('/payments/my').then((r) => r.data),
  get: (id) => api.get(`/payments/${id}`).then((r) => r.data),
  refund: (id) => api.post(`/payments/${id}/refund`).then((r) => r.data),
  methods: () => api.get('/payments/methods').then((r) => r.data),
  addMethod: (payload) => api.post('/payments/methods', payload).then((r) => r.data),
  setDefault: (id) => api.patch(`/payments/methods/${id}/default`).then((r) => r.data),
  removeMethod: (id) => api.delete(`/payments/methods/${id}`).then((r) => r.data)
};

// ----- Admin / AI
export const adminApi = {
  analytics: () => api.get('/admin/analytics').then((r) => r.data)
};
export const aiApi = {
  recommend: (payload) => api.post('/ai/recommend', payload).then((r) => r.data)
};

export default api;
