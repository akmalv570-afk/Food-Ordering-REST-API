import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),
  register: (username, password, phone) =>
    api.post('/auth/register/', { username, password, phone }),
  refresh: (refresh) =>
    api.post('/auth/refresh/', { refresh }),
  // Get current user info (if endpoint exists)
  getCurrentUser: () =>
    api.get('/auth/me/'),
};

// Foods API
export const foodsAPI = {
  getFoods: (params = {}) =>
    api.get('/foods/foods/', { params }),
  // Admin endpoints
  getAdminFoods: (params = {}) =>
    api.get('/foods/admin/foods/', { params }),
  createFood: (data) => {
    // FormData will be handled by the interceptor
    return api.post('/foods/admin/foods/', data);
  },
  updateFood: (id, data) => {
    // FormData will be handled by the interceptor
    return api.patch(`/foods/admin/foods/${id}/`, data);
  },
  deleteFood: (id) =>
    api.delete(`/foods/admin/foods/${id}/`),
};

// Orders API
export const ordersAPI = {
  createOrder: (data) =>
    api.post('/orders/create/', data),
  getMyOrders: () =>
    api.get('/orders/my/'),
  getOrderDetail: (id) =>
    api.get(`/orders/${id}/`),
  // Admin endpoints
  updateOrderStatus: (id, status) =>
    api.patch(`/orders/admin/orders/${id}/status/`, { status }),
  // Note: You may need to add this endpoint to your backend
  // For now, we'll try to use it but handle errors gracefully
  getAllOrders: () =>
    api.get('/orders/admin/orders/'),
};

export default api;

