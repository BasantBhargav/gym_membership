// API Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Update if backend URL is different

// Helper function for API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API Error');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
const AuthAPI = {
  register: (data) =>
    apiCall('/owner/auth/register', 'POST', data),
  
  login: (data) =>
    apiCall('/owner/auth/login', 'POST', data),
};

// Members API
const MembersAPI = {
  getAll: () =>
    apiCall('/owner/members', 'GET'),
  
  create: (data) =>
    apiCall('/owner/members', 'POST', data),
  
  update: (id, data) =>
    apiCall(`/owner/members/${id}`, 'PUT', data),
  
  delete: (id) =>
    apiCall(`/owner/members/${id}`, 'DELETE'),
};

// Payments API
const PaymentsAPI = {
  getAll: () =>
    apiCall('/owner/payments', 'GET'),
  
  create: (data) =>
    apiCall('/owner/payments', 'POST', data),
  
  getById: (id) =>
    apiCall(`/owner/payments/${id}`, 'GET'),
};

// Dashboard API
const DashboardAPI = {
  getStats: () =>
    apiCall('/owner/dashboard', 'GET'),
};

// Local Storage Management
const StorageManager = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  
  setOwnerInfo: (info) => localStorage.setItem('ownerInfo', JSON.stringify(info)),
  getOwnerInfo: () => {
    const info = localStorage.getItem('ownerInfo');
    return info ? JSON.parse(info) : null;
  },
  removeOwnerInfo: () => localStorage.removeItem('ownerInfo'),
  
  logout: () => {
    StorageManager.removeToken();
    StorageManager.removeOwnerInfo();
  },
};
