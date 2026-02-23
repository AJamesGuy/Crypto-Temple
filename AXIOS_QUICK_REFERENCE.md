# Axios API Quick Reference

## 🚀 Installation (Already Included)
```json
"axios": "^1.13.5"
```

## ⚙️ Configuration
```javascript
// Automatically configured in src/services/api.js
// Base URL: http://127.0.0.1:5000 (or VITE_API_URL env var)
// Headers: Content-Type: application/json
// Token: Automatically injected from localStorage
```

---

## 📡 API Usage Patterns

### Import
```javascript
import { authAPI, dashboardAPI, tradeAPI, portfolioAPI, settingsAPI } from '../services/api';
```

### Call Pattern
```javascript
try {
  const result = await apiService.method(args);
  // Use result
} catch (error) {
  // Error is error.response?.data or error.message
}
```

---

## 🔑 Authentication

```javascript
// Sign Up
await authAPI.signup(username, email, password, confirmPassword);
// Response: { message, user, token }

// Login
await authAPI.login(username, password);
// Response: { message, token, user }

// Get Profile
await authAPI.getProfile(userId);
// Response: { id, username, email, cash_balance, ... }
```

---

## 📊 Dashboard

```javascript
// Get all cryptos
await dashboardAPI.getCryptos();
// Response: Array of cryptos

// Get market data
await dashboardAPI.getMarketData();
// Response: Array with prices, market caps

// Search
await dashboardAPI.searchCryptos(query, limit);
// Response: Array of matching cryptos
// Example: searchCryptos('bitcoin', 10)

// Get market data for specific crypto
await dashboardAPI.getCryptoMarketData(cryptoId);
// Response: { price, market_cap, volume, change_24h, ... }

// Get cash balance
await dashboardAPI.getCashBalance(userId);
// Response: { cash_balance, user_id }
```

---

## 💱 Trade

```javascript
// Place order (PRICE NOT SENT - backend calculates)
await tradeAPI.placeOrder(userId, {
  crypto_id: 1,
  order_type: 'buy',  // or 'sell'
  quantity: 0.5
});
// Response: { message, order }

// Get orders
await tradeAPI.getOrders(userId, page, perPage, status);
// Params: page=1, per_page=10, status='pending'|'completed'
// Response: { orders: [...], total, pages }

// Get specific order
await tradeAPI.getOrder(userId, orderId);
// Response: Order object

// Execute order
await tradeAPI.executeOrder(userId, orderId);
// Response: { message, order }

// Cancel order
await tradeAPI.cancelOrder(userId, orderId);
// Response: { message, order }
```

---

## 💼 Portfolio

```javascript
// Get portfolio
await portfolioAPI.getPortfolio(userId);
// Response: { portfolio_id, total_value, assets: [...] }

// Get holdings
await portfolioAPI.getHoldings(userId);
// Response: Array of held assets

// Get performance
await portfolioAPI.getPerformance(userId);
// Response: Array of performance data

// Get breakdown
await portfolioAPI.getBreakdown(userId);
// Response: Array with allocations

// Get specific asset
await portfolioAPI.getAsset(userId, assetId);
// Response: Asset object

// Get all assets
await portfolioAPI.getAssets(userId);
// Response: Array of all assets
```

---

## ⚙️ Settings

```javascript
// Update profile
await settingsAPI.updateProfile(userId, { username, email });
// Response: { message, user }

// Change password
await settingsAPI.changePassword(userId, {
  currentPassword: 'old',
  newPassword: 'new',
  confirmPassword: 'new'
});
// Response: { message }

// Reset balance
await settingsAPI.resetBalance(userId);
// Response: { message }

// Delete account
await settingsAPI.deleteAccount(userId, { password, confirm: true });
// Response: { message }

// Get settings
await settingsAPI.getSettings(userId);
// Response: User settings object

// Get security
await settingsAPI.getSecurity(userId);
// Response: Security info
```

---

## 🎯 Error Handling

```javascript
// Pattern 1: Simple error message
try {
  await apiService.method();
} catch (error) {
  console.error(error.message);
}

// Pattern 2: Backend error from response
try {
  await apiService.method();
} catch (error) {
  const message = error.response?.data?.message || 'Error occurred';
  console.error(message);
}

// Pattern 3: Full error object
try {
  await apiService.method();
} catch (error) {
  if (error.response?.status === 400) {
    // Bad request
  } else if (error.response?.status === 401) {
    // Unauthorized (auto-redirects to login)
  } else if (error.message) {
    // Network error
  }
}
```

---

## 🔐 Token Management

### Automatic
```javascript
// Token automatically:
// 1. Read from localStorage with key 'token'
// 2. Injected into Authorization header
// 3. Sent on every request via interceptor
// 4. Removed on 401 response
// 5. Redirects to /login on 401
```

### Manual Token Storage
```javascript
// On login success, store token:
localStorage.setItem('token', data.token);

// On logout:
localStorage.removeItem('token');
```

---

## 🐛 Debugging

### Check Request
```javascript
// Open DevTools → Network tab
// Filter: Fetch/XHR
// Look at:
// - Headers (Authorization: Bearer xxx)
// - Request body (JSON being sent)
// - Response status
```

### Log Requests (Add to api.js)
```javascript
axiosInstance.interceptors.request.use((config) => {
  console.log('🚀', config.method?.toUpperCase(), config.url, config.data);
  return config;
});
```

### Log Responses (Add to api.js)
```javascript
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

---

## 📌 Common Mistakes

❌ **Wrong:**
```javascript
// Don't send price to backend
await tradeAPI.placeOrder(userId, {
  crypto_id: 1,
  order_type: 'buy',
  quantity: 0.5,
  price: 50000  // ❌ WRONG
});
```

✅ **Right:**
```javascript
// Backend fetches current price
await tradeAPI.placeOrder(userId, {
  crypto_id: 1,
  order_type: 'buy',
  quantity: 0.5  // Only quantity!
});
```

---

❌ **Wrong:**
```javascript
// Don't await if no try/catch
const data = await authAPI.login(user, pass);
```

✅ **Right:**
```javascript
// Always handle errors
try {
  const data = await authAPI.login(user, pass);
} catch (error) {
  setError(error.message);
}
```

---

❌ **Wrong:**
```javascript
// Don't hardcode token
const headers = {
  'Authorization': 'Bearer token123'
};
```

✅ **Right:**
```javascript
// Store in localStorage, interceptor handles it
localStorage.setItem('token', data.token);
// That's it! Interceptor does the rest
```

---

## ✅ Status Codes

| Code | Meaning | Handling |
|------|---------|----------|
| 200 | OK | Success |
| 201 | Created | Success (resource created) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Auto-redirect to login |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource missing |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Backend error |

---

## 🎓 Best Practices

1. **Always wrap API calls in try/catch**
2. **Store token in localStorage**
3. **Never pass price to placeOrder**
4. **Use consistent error handling**
5. **Log errors for debugging**
6. **Check DevTools Network tab**
7. **Test with backend running**
8. **Use environment variables for API URL**

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 errors | Check endpoint path, backend running |
| 401 errors | Check localStorage token, verify login works |
| CORS errors | Backend needs CORS enabled |
| Network errors | Check backend server, internet |
| Blank responses | Check DevTools console for parse errors |
| Token not sent | Check localStorage has 'token' key |
| Always redirecting | Token expired or invalid, login again |

---

## 🚀 Ready to Go!

Your API is configured and ready. Just:

1. **Start backend:** `cd Backend && python run.py`
2. **Start frontend:** `cd Frontend && npm run dev`
3. **Start coding!** Import from `../services/api`

**Happy coding! 🎉**

