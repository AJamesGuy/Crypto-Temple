const API_BASE = 'http://localhost:5000';

// Helper function to make authenticated requests
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};

// Authentication APIs
export const authAPI = {
  signup: async (username, email, password, confirmPassword) => {
    const response = await authenticatedFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, confirm_password: confirmPassword }),
    });
    return response.json();
  },

  login: async (username, password) => {
    const response = await authenticatedFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  getProfile: async (userId) => {
    const response = await authenticatedFetch(`/auth/${userId}/profile`, {
      method: 'GET',
    });
    return response.json();
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getCryptos: async () => {
    const response = await authenticatedFetch('/dash/cryptos', {
      method: 'GET',
    });
    return response.json();
  },

  getMarketData: async () => {
    const response = await authenticatedFetch('/dash/market-data', {
      method: 'GET',
    });
    return response.json();
  },

  searchCryptos: async (query, limit = 50) => {
    const response = await authenticatedFetch(`/dash/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
      method: 'GET',
    });
    return response.json();
  },

  getCryptoMarketData: async (cryptoId) => {
    const response = await authenticatedFetch(`/dash/market-data/${cryptoId}`, {
      method: 'GET',
    });
    return response.json();
  },

  getCashBalance: async (userId) => {
    const response = await authenticatedFetch(`/dash/${userId}/cash-balance`, {
      method: 'GET',
    });
    return response.json();
  },
};

// Trade APIs
export const tradeAPI = {
  placeOrder: async (userId, data) => {
    const response = await authenticatedFetch(`/trade/${userId}/order`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getOrders: async (userId, page = 1, perPage = 10, status = '') => {
    let url = `/trade/${userId}/orders?page=${page}&per_page=${perPage}`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await authenticatedFetch(url, {
      method: 'GET',
    });
    return response.json();
  },

  getOrder: async (userId, orderId) => {
    const response = await authenticatedFetch(`/trade/${userId}/order/${orderId}`, {
      method: 'GET',
    });
    return response.json();
  },

  executeOrder: async (userId, orderId) => {
    const response = await authenticatedFetch(`/trade/${userId}/order/${orderId}/execute`, {
      method: 'POST',
    });
    return response.json();
  },

  cancelOrder: async (userId, orderId) => {
    const response = await authenticatedFetch(`/trade/${userId}/order/${orderId}/cancel`, {
      method: 'POST',
    });
    return response.json();
  },
};

// Portfolio APIs
export const portfolioAPI = {
  getPortfolio: async (userId) => {
    const response = await authenticatedFetch(`/portfolio/${userId}`, {
      method: 'GET',
    });
    return response.json();
  },

  getHoldings: async (userId) => {
    const response = await authenticatedFetch(`/portfolio/${userId}/holdings`, {
      method: 'GET',
    });
    return response.json();
  },

  getPerformance: async (userId) => {
    const response = await authenticatedFetch(`/portfolio/${userId}/performance`, {
      method: 'GET',
    });
    return response.json();
  },

  getBreakdown: async (userId) => {
    const response = await authenticatedFetch(`/portfolio/${userId}/breakdown`, {
      method: 'GET',
    });
    return response.json();
  },

  getAsset: async (userId, assetId) => {
    const response = await authenticatedFetch(`/portfolio/${userId}/asset/${assetId}`, {
      method: 'GET',
    });
    return response.json();
  },

  getAssets: async (userId) => {
    const response = await authenticatedFetch(`/portfolio/${userId}/assets`, {
      method: 'GET',
    });
    return response.json();
  },
};

// Settings APIs
export const settingsAPI = {
  updateProfile: async (userId, data) => {
    const response = await authenticatedFetch(`/settings/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  changePassword: async (userId, data) => {
    const response = await authenticatedFetch(`/settings/${userId}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  resetBalance: async (userId) => {
    const response = await authenticatedFetch(`/settings/${userId}/reset-balance`, {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
    return response.json();
  },

  deleteAccount: async (userId, data) => {
    const response = await authenticatedFetch(`/settings/${userId}/delete-account`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getSettings: async (userId) => {
    const response = await authenticatedFetch(`/settings/${userId}`, {
      method: 'GET',
    });
    return response.json();
  },

  getSecurity: async (userId) => {
    const response = await authenticatedFetch(`/settings/${userId}/security`, {
      method: 'GET',
    });
    return response.json();
  },
};
