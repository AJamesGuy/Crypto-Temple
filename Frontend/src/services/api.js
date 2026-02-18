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

  getProfile: async () => {
    const response = await authenticatedFetch('/auth/profile', {
      method: 'GET',
    });
    return response.json();
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getCryptos: async () => {
    const response = await authenticatedFetch('/dash/cryptos');
    return response.json();
  },

  getMarketData: async () => {
    const response = await authenticatedFetch('/dash/market-data');
    return response.json();
  },

  searchCryptos: async (query) => {
    const response = await authenticatedFetch(`/dash/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  getCryptoMarketData: async (cryptoId) => {
    const response = await authenticatedFetch(`/dash/crypto/${cryptoId}/market-data`);
    return response.json();
  },

  getCashBalance: async () => {
    const response = await authenticatedFetch('/dash/cash-balance');
    return response.json();
  },
};

// Trade APIs
export const tradeAPI = {
  placeOrder: async (cryptoId, orderType, quantity, price) => {
    const response = await authenticatedFetch('/trade/place-order', {
      method: 'POST',
      body: JSON.stringify({
        crypto_id: cryptoId,
        order_type: orderType,
        quantity,
        price,
      }),
    });
    return response.json();
  },

  getOrders: async (status = null) => {
    let endpoint = '/trade/orders';
    if (status) {
      endpoint += `?status=${status}`;
    }
    const response = await authenticatedFetch(endpoint);
    return response.json();
  },

  getOrder: async (orderId) => {
    const response = await authenticatedFetch(`/trade/orders/${orderId}`);
    return response.json();
  },

  executeOrder: async (orderId) => {
    const response = await authenticatedFetch(`/trade/orders/${orderId}/execute`, {
      method: 'POST',
    });
    return response.json();
  },

  cancelOrder: async (orderId) => {
    const response = await authenticatedFetch(`/trade/orders/${orderId}/cancel`, {
      method: 'POST',
    });
    return response.json();
  },
};

// Portfolio APIs
export const portfolioAPI = {
  getPortfolio: async () => {
    const response = await authenticatedFetch('/portfolio');
    return response.json();
  },

  getHoldings: async () => {
    const response = await authenticatedFetch('/portfolio/holdings');
    return response.json();
  },

  getPerformance: async () => {
    const response = await authenticatedFetch('/portfolio/performance');
    return response.json();
  },

  getBreakdown: async () => {
    const response = await authenticatedFetch('/portfolio/breakdown');
    return response.json();
  },

  getAsset: async (assetId) => {
    const response = await authenticatedFetch(`/portfolio/assets/${assetId}`);
    return response.json();
  },
};

// Settings APIs
export const settingsAPI = {
  getProfile: async () => {
    const response = await authenticatedFetch('/settings/profile');
    return response.json();
  },

  updateProfile: async (username, email) => {
    const response = await authenticatedFetch('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify({ username, email }),
    });
    return response.json();
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await authenticatedFetch('/settings/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
    return response.json();
  },

  resetBalance: async () => {
    const response = await authenticatedFetch('/settings/reset-balance', {
      method: 'POST',
      body: JSON.stringify({ confirm: true }),
    });
    return response.json();
  },

  deleteAccount: async (password) => {
    const response = await authenticatedFetch('/settings/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password, confirm: true }),
    });
    return response.json();
  },
};

// Admin APIs (for market data)
export const adminAPI = {
  updateMarketData: async () => {
    const response = await authenticatedFetch('/admin/update-market-data', {
      method: 'POST',
    });
    return response.json();
  },

  getMarketStats: async () => {
    const response = await authenticatedFetch('/admin/market-stats');
    return response.json();
  },
};