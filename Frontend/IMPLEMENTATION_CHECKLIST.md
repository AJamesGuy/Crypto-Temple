# CryptoTemple Frontend Implementation Checklist

## Overview
This checklist provides step-by-step guidance for implementing all backend routes into your React frontend using the API utilities. Each section includes endpoint mappings, implementation examples, and component requirements.

---

## PART 1: AUTHENTICATION PAGES

### Login Page (Login.jsx)

#### ✅ Task 1.1: Implement POST /auth/login
**Endpoint:** `POST /auth/login`
**Route Parameter:** None
**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Implementation Example:**
```javascript
// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPortal from '../components/LoginPortal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user info in context
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <LoginPortal 
        onSubmit={handleLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        error={error}
        loading={loading}
      />
    </div>
  );
}
```

**Component Update (LoginPortal.jsx):**
```javascript
// components/LoginPortal.jsx
export default function LoginPortal({ 
  onSubmit, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  error, 
  loading 
}) {
  return (
    <form onSubmit={onSubmit} className="login-form">
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

**AuthContext Integration (context/AuthContext.jsx):**
```javascript
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

---

### Signup Page (Signup.jsx)

#### ✅ Task 1.2: Implement POST /auth/signup
**Endpoint:** `POST /auth/signup`
**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "password_confirm": "securepassword123"
}
```

**Implementation Example:**
```javascript
// Signup.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SignUpForm from '../components/SignUpForm';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Redirect to login
      navigate('/login', { 
        state: { message: 'Account created! Please login.' } 
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div>
      <SignUpForm
        formData={formData}
        onChange={handleChange}
        onSubmit={handleSignup}
        error={error}
        loading={loading}
      />
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
```

**Component Update (SignUpForm.jsx):**
```javascript
// components/SignUpForm.jsx
export default function SignUpForm({ 
  formData, 
  onChange, 
  onSubmit, 
  error, 
  loading 
}) {
  return (
    <form onSubmit={onSubmit} className="signup-form">
      <div>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          name="username"
          type="text"
          value={formData.username}
          onChange={onChange}
          minLength="3"
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={onChange}
          minLength="8"
          required
        />
      </div>
      <div>
        <label htmlFor="password_confirm">Confirm Password:</label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          value={formData.password_confirm}
          onChange={onChange}
          minLength="8"
          required
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

---

## PART 2: DASHBOARD PAGE

### Dashboard Page (Dashboard.jsx)

#### ✅ Task 2.1: Implement GET /dash/cryptos
**Endpoint:** `GET /dash/cryptos`
**Purpose:** Get list of all active cryptocurrencies
**Response:** Array of crypto objects with id, symbol, description, image

**Implementation Example:**
```javascript
// Add to Dashboard.jsx
const [cryptos, setCryptos] = useState([]);
const [cryptosLoading, setCryptosLoading] = useState(true);
const { token, user } = useAuth();

useEffect(() => {
  const fetchCryptos = async () => {
    try {
      const response = await fetch(`http://localhost:5000/dash/cryptos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch cryptos');
      const data = await response.json();
      setCryptos(data);
    } catch (err) {
      console.error('Error fetching cryptos:', err);
    } finally {
      setCryptosLoading(false);
    }
  };

  fetchCryptos();
  const interval = setInterval(fetchCryptos, 300000); // Refresh every 5 minutes
  return () => clearInterval(interval);
}, [token]);
```

#### ✅ Task 2.2: Implement GET /dash/market-data
**Endpoint:** `GET /dash/market-data`
**Purpose:** Get latest market data for all cryptocurrencies with rankings
**Response:** Array with price, market_cap, 24h changes, market_cap_rank

**Implementation Example:**
```javascript
// Add to Dashboard.jsx
const [marketData, setMarketData] = useState([]);
const [marketLoading, setMarketLoading] = useState(true);

useEffect(() => {
  const fetchMarketData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/dash/market-data`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch market data');
      const data = await response.json();
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market data:', err);
    } finally {
      setMarketLoading(false);
    }
  };

  fetchMarketData();
  const interval = setInterval(fetchMarketData, 60000); // Refresh every 1 minute
  return () => clearInterval(interval);
}, [token]);
```

#### ✅ Task 2.3: Implement GET /dash/search
**Endpoint:** `GET /dash/search`
**Query Parameters:** `query` (required), `limit` (optional, default 50)
**Purpose:** Search cryptocurrencies by symbol or name

**Implementation Example:**
```javascript
// Add SearchBar component
// components/SearchBar.jsx
import { useState } from 'react';

export default function SearchBar({ onSearch, token }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async (e) => {
    const searchTerm = e.target.value;
    setQuery(searchTerm);

    if (searchTerm.length < 1) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/dash/search?query=${encodeURIComponent(searchTerm)}&limit=10`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search cryptocurrencies..."
        value={query}
        onChange={handleSearch}
        className="search-input"
      />
      {loading && <p>Searching...</p>}
      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map(crypto => (
            <div key={crypto.id} className="search-result-item">
              <span>{crypto.symbol.toUpperCase()}</span>
              <span>{crypto.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Add to Dashboard.jsx
<SearchBar token={token} onSearch={handleSearch} />
```

#### ✅ Task 2.4: Implement GET /dash/market-data/{crypto_id}
**Endpoint:** `GET /dash/market-data/{crypto_id}`
**Purpose:** Get detailed market data for specific cryptocurrency

**Implementation Example:**
```javascript
// Add to Dashboard.jsx or CoinCard component
const [selectedCrypto, setSelectedCrypto] = useState(null);
const [cryptoDetail, setCryptoDetail] = useState(null);

const fetchCryptoDetail = async (cryptoId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/dash/market-data/${cryptoId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    if (!response.ok) throw new Error('Failed to fetch crypto details');
    const data = await response.json();
    setCryptoDetail(data);
    setSelectedCrypto(cryptoId);
  } catch (err) {
    console.error('Error fetching crypto detail:', err);
  }
};

// Update CoinCard to use this
// components/CoinCard.jsx
export default function CoinCard({ crypto, onSelect }) {
  return (
    <div 
      className="coin-card"
      onClick={() => onSelect(crypto.id)}
    >
      <div className="coin-header">
        <img src={crypto.image} alt={crypto.symbol} />
        <h3>{crypto.symbol.toUpperCase()}</h3>
      </div>
      <p className="coin-name">{crypto.description}</p>
    </div>
  );
}
```

#### ✅ Task 2.5: Implement GET /dash/{user_id}/cash-balance
**Endpoint:** `GET /dash/{user_id}/cash-balance`
**Purpose:** Get user's current cash balance

**Implementation Example:**
```javascript
// Add to Dashboard.jsx
const [cashBalance, setCashBalance] = useState(0);

useEffect(() => {
  if (!user?.id || !token) return;

  const fetchCashBalance = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/dash/${user.id}/cash-balance`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error('Failed to fetch cash balance');
      const data = await response.json();
      setCashBalance(data.cash_balance);
    } catch (err) {
      console.error('Error fetching cash balance:', err);
    }
  };

  fetchCashBalance();
  const interval = setInterval(fetchCashBalance, 60000); // Refresh every minute
  return () => clearInterval(interval);
}, [user?.id, token]);

// Display in dashboard header
<div className="dashboard-header">
  <h1>Welcome, {user?.username}!</h1>
  <div className="cash-display">
    <span>Cash Balance: ${cashBalance.toFixed(2)}</span>
  </div>
</div>
```

---

## PART 3: TRADE PAGE

### Trade Page (Trade.jsx)

#### ✅ Task 3.1: Implement POST /trade/{user_id}/order
**Endpoint:** `POST /trade/{user_id}/order`
**Request Body:**
```json
{
  "crypto_id": 1,
  "order_type": "buy",
  "quantity": 0.5,
  "price": 45000.00
}
```

**Implementation Example:**
```javascript
// Trade.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import OrderForm from '../components/OrderForm';

export default function Trade() {
  const { user, token } = useAuth();
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [cryptoDetail, setCryptoDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch all cryptos for dropdown
    const fetchCryptos = async () => {
      try {
        const response = await fetch(`http://localhost:5000/dash/cryptos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setCryptos(data);
      } catch (err) {
        console.error('Error fetching cryptos:', err);
      }
    };

    fetchCryptos();
  }, [token]);

  const handleCryptoSelect = async (cryptoId) => {
    setSelectedCrypto(cryptoId);
    
    // Fetch market data for selected crypto
    try {
      const response = await fetch(
        `http://localhost:5000/dash/market-data/${cryptoId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const data = await response.json();
      setCryptoDetail(data);
    } catch (err) {
      console.error('Error fetching crypto detail:', err);
    }
  };

  const handlePlaceOrder = async (formData) => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/trade/${user.id}/order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            crypto_id: selectedCrypto,
            order_type: formData.orderType,
            quantity: parseFloat(formData.quantity),
            price: parseFloat(formData.price)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      setMessage(`✓ Order placed successfully! New cash balance: $${data.new_cash_balance.toFixed(2)}`);
      // Refresh orders list
      fetchOrders();
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-container">
      <h1>Trading</h1>
      
      <div className="trade-layout">
        <div className="crypto-selector">
          <h3>Select Cryptocurrency</h3>
          <select onChange={(e) => handleCryptoSelect(e.target.value)}>
            <option value="">-- Select --</option>
            {cryptos.map(crypto => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.symbol.toUpperCase()} - {crypto.description}
              </option>
            ))}
          </select>
        </div>

        {cryptoDetail && (
          <>
            <div className="crypto-info">
              <h2>{cryptoDetail.name} ({cryptoDetail.symbol})</h2>
              <p>Current Price: ${cryptoDetail.price.toFixed(2)}</p>
              <p>24h Change: {cryptoDetail.change_24h}%</p>
            </div>

            <OrderForm
              cryptoDetail={cryptoDetail}
              onSubmit={handlePlaceOrder}
              loading={loading}
            />
          </>
        )}

        {message && <p className="message">{message}</p>}
      </div>

      <div className="orders-section">
        <OrderHistory user={user} token={token} />
      </div>
    </div>
  );
}
```

**Component Update (OrderForm.jsx):**
```javascript
// components/OrderForm.jsx
import { useState } from 'react';

export default function OrderForm({ cryptoDetail, onSubmit, loading }) {
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(cryptoDetail?.price || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      orderType,
      quantity,
      price
    });
    setQuantity('');
  };

  const totalValue = (parseFloat(quantity) || 0) * (parseFloat(price) || 0);

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <div className="form-group">
        <label htmlFor="order-type">Order Type:</label>
        <select
          id="order-type"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          step="0.00000001"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price per Unit:</label>
        <input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          disabled
        />
      </div>

      <div className="total-value">
        <h3>Total Value: ${totalValue.toFixed(2)}</h3>
      </div>

      <button type="submit" disabled={loading || !quantity}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}
```

#### ✅ Task 3.2: Implement GET /trade/{user_id}/orders
**Endpoint:** `GET /trade/{user_id}/orders`
**Query Parameters:** `page` (default 1), `per_page` (default 10), `status` (optional)
**Purpose:** Get paginated list of user's orders

**Implementation Example:**
```javascript
// Create OrderHistory component
// components/OrderHistory.jsx
import { useState, useEffect } from 'react';

export default function OrderHistory({ user, token }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const perPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [page, status, user.id, token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/trade/${user.id}/orders?page=${page}&per_page=${perPage}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-history">
      <h2>Order History</h2>

      <div className="filter-controls">
        <select value={status} onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length > 0 ? (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.symbol}</td>
                <td>{order.type.toUpperCase()}</td>
                <td>{order.quantity}</td>
                <td>${order.price.toFixed(2)}</td>
                <td>${order.total_value.toFixed(2)}</td>
                <td className={`status-${order.status}`}>{order.status}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <OrderActions 
                    order={order} 
                    user={user} 
                    token={token}
                    onRefresh={fetchOrders}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found</p>
      )}

      {total > perPage && (
        <div className="pagination">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil(total / perPage)}</span>
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / perPage)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

#### ✅ Task 3.3: Implement GET /trade/{user_id}/order/{order_id}
**Endpoint:** `GET /trade/{user_id}/order/{order_id}`
**Purpose:** Get details of specific order

**Implementation Example:**
```javascript
// Add to OrderHistory or create OrderDetail modal
const fetchOrderDetail = async (orderId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/trade/${user.id}/order/${orderId}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error('Failed to fetch order');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching order detail:', err);
  }
};

// Show in modal or detail view
const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);

const handleViewDetail = async (orderId) => {
  const detail = await fetchOrderDetail(orderId);
  setSelectedOrderDetail(detail);
};
```

#### ✅ Task 3.4: Implement POST /trade/{user_id}/order/{order_id}/execute
**Endpoint:** `POST /trade/{user_id}/order/{order_id}/execute`
**Purpose:** Execute a pending order

**Implementation Example:**
```javascript
// Add to OrderActions component
const handleExecuteOrder = async (orderId) => {
  try {
    const response = await fetch(
      `http://localhost:5000/trade/${user.id}/order/${orderId}/execute`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to execute order');
    }

    alert('Order executed successfully!');
    onRefresh(); // Refresh orders list
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};

// OrderActions component
function OrderActions({ order, user, token, onRefresh }) {
  return (
    <div className="actions">
      {order.status === 'pending' && (
        <>
          <button onClick={() => handleExecuteOrder(order.id)}>
            Execute
          </button>
          <button onClick={() => handleCancelOrder(order.id)}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
```

#### ✅ Task 3.5: Implement POST /trade/{user_id}/order/{order_id}/cancel
**Endpoint:** `POST /trade/{user_id}/order/{order_id}/cancel`
**Purpose:** Cancel a pending order

**Implementation Example:**
```javascript
// Add to OrderActions component
const handleCancelOrder = async (orderId) => {
  if (!window.confirm('Are you sure you want to cancel this order?')) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/trade/${user.id}/order/${orderId}/cancel`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to cancel order');
    }

    alert('Order cancelled successfully!');
    onRefresh(); // Refresh orders list
  } catch (err) {
    alert(`Error: ${err.message}`);
  }
};
```

---

## PART 4: PORTFOLIO PAGE

### Portfolio Page (Portfolio.jsx)

#### ✅ Task 4.1: Implement GET /portfolio/{user_id}
**Endpoint:** `GET /portfolio/{user_id}`
**Purpose:** Get complete portfolio with holdings and calculations

**Implementation Example:**
```javascript
// Portfolio.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Portfolio() {
  const { user, token } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchPortfolio = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/portfolio/${user.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch portfolio');
        const data = await response.json();
        setPortfolio(data);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user?.id, token]);

  if (loading) return <p>Loading portfolio...</p>;
  if (!portfolio) return <p>No portfolio data</p>;

  return (
    <div className="portfolio-container">
      <h1>Your Portfolio</h1>

      <div className="portfolio-summary">
        <div className="metric">
          <label>Total Portfolio Value</label>
          <h2>${portfolio.total_portfolio_value.toFixed(2)}</h2>
        </div>
        <div className="metric">
          <label>Total Invested</label>
          <p>${portfolio.total_invested.toFixed(2)}</p>
        </div>
        <div className="metric">
          <label>Current Value</label>
          <p>${portfolio.total_current_value.toFixed(2)}</p>
        </div>
        <div className="metric">
          <label>Cash Balance</label>
          <p>${portfolio.cash_balance.toFixed(2)}</p>
        </div>
        <div className="metric">
          <label>Overall Gain/Loss</label>
          <p className={portfolio.overall_gain_loss >= 0 ? 'gain' : 'loss'}>
            ${portfolio.overall_gain_loss.toFixed(2)} 
            ({portfolio.overall_gain_loss_percent.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="portfolio-assets">
        <h2>Holdings</h2>
        {portfolio.assets.length > 0 ? (
          <table className="assets-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Quantity</th>
                <th>Avg Buy Price</th>
                <th>Current Price</th>
                <th>Invested Value</th>
                <th>Current Value</th>
                <th>Gain/Loss</th>
                <th>Gain/Loss %</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.assets.map(asset => (
                <tr key={asset.id}>
                  <td>{asset.symbol}</td>
                  <td>{asset.quantity.toFixed(8)}</td>
                  <td>${asset.avg_buy_price.toFixed(2)}</td>
                  <td>${asset.current_price.toFixed(2)}</td>
                  <td>${asset.invested_value.toFixed(2)}</td>
                  <td>${asset.current_value.toFixed(2)}</td>
                  <td className={asset.gain_loss >= 0 ? 'gain' : 'loss'}>
                    ${asset.gain_loss.toFixed(2)}
                  </td>
                  <td className={asset.gain_loss_percent >= 0 ? 'gain' : 'loss'}>
                    {asset.gain_loss_percent.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No holdings yet</p>
        )}
      </div>
    </div>
  );
}
```

#### ✅ Task 4.2: Implement GET /portfolio/{user_id}/holdings
**Endpoint:** `GET /portfolio/{user_id}/holdings`
**Purpose:** Get cryptocurrency holdings only

**Implementation Example:**
```javascript
// Add to Portfolio.jsx for holdings-only view
const [holdings, setHoldings] = useState([]);

useEffect(() => {
  if (!user?.id || !token) return;

  const fetchHoldings = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/portfolio/${user.id}/holdings`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch holdings');
      const data = await response.json();
      setHoldings(data);
    } catch (err) {
      console.error('Error fetching holdings:', err);
    }
  };

  fetchHoldings();
}, [user?.id, token]);

// Display holdings in card format
<div className="holdings-grid">
  {holdings.map(holding => (
    <div key={holding.id} className="holding-card">
      <h3>{holding.symbol}</h3>
      <p>Quantity: {holding.quantity.toFixed(8)}</p>
      <p>Current Price: ${holding.current_price.toFixed(2)}</p>
      <p>Value: ${holding.current_value.toFixed(2)}</p>
    </div>
  ))}
</div>
```

#### ✅ Task 4.3: Implement GET /portfolio/{user_id}/performance
**Endpoint:** `GET /portfolio/{user_id}/performance`
**Purpose:** Get performance data for charts

**Implementation Example:**
```javascript
// Add to Portfolio.jsx
const [performanceData, setPerformanceData] = useState(null);

useEffect(() => {
  if (!user?.id || !token) return;

  const fetchPerformance = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/portfolio/${user.id}/performance`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch performance');
      const data = await response.json();
      setPerformanceData(data);
    } catch (err) {
      console.error('Error fetching performance:', err);
    }
  };

  fetchPerformance();
}, [user?.id, token]);

// Use with TradeChart component
{performanceData && <TradeChart data={performanceData} />}
```

**TradeChart Update:**
```javascript
// components/TradeChart.jsx - Update to handle performance data
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function TradeChart({ data }) {
  // Transform performance data for chart
  const chartData = data.assets.map(asset => ({
    symbol: asset.symbol,
    value: asset.value,
    percentage: asset.percentage
  }));

  return (
    <div className="chart-container">
      <h2>Portfolio Performance</h2>
      <BarChart width={800} height={400} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="symbol" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
      <p>Total Value: ${data.total_value.toFixed(2)}</p>
    </div>
  );
}
```

#### ✅ Task 4.4: Implement GET /portfolio/{user_id}/breakdown
**Endpoint:** `GET /portfolio/{user_id}/breakdown`
**Purpose:** Get asset allocation breakdown including cash

**Implementation Example:**
```javascript
// Add to Portfolio.jsx
const [breakdown, setBreakdown] = useState(null);

useEffect(() => {
  if (!user?.id || !token) return;

  const fetchBreakdown = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/portfolio/${user.id}/breakdown`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch breakdown');
      const data = await response.json();
      setBreakdown(data);
    } catch (err) {
      console.error('Error fetching breakdown:', err);
    }
  };

  fetchBreakdown();
}, [user?.id, token]);

// Create pie chart component
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

{breakdown && (
  <div className="breakdown-container">
    <h2>Asset Allocation</h2>
    <PieChart width={400} height={400}>
      <Pie
        data={breakdown.breakdown}
        dataKey="value"
        nameKey="symbol"
        cx={200}
        cy={200}
        outerRadius={100}
      >
        {breakdown.breakdown.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
      <Legend />
    </PieChart>
  </div>
)}
```

#### ✅ Task 4.5: Implement GET /portfolio/{user_id}/asset/{asset_id}
**Endpoint:** `GET /portfolio/{user_id}/asset/{asset_id}`
**Purpose:** Get detailed information for specific asset

**Implementation Example:**
```javascript
// Create AssetDetail modal or page
// components/AssetDetail.jsx
import { useState, useEffect } from 'react';

export default function AssetDetail({ assetId, user, token, onClose }) {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/portfolio/${user.id}/asset/${assetId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch asset');
        const data = await response.json();
        setAsset(data);
      } catch (err) {
        console.error('Error fetching asset:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [assetId, user.id, token]);

  if (loading) return <p>Loading...</p>;
  if (!asset) return <p>Asset not found</p>;

  return (
    <div className="asset-detail-modal">
      <button onClick={onClose} className="close-btn">×</button>
      
      <h2>{asset.symbol}</h2>
      
      <div className="asset-stats">
        <div className="stat">
          <label>Quantity</label>
          <p>{asset.quantity.toFixed(8)}</p>
        </div>
        <div className="stat">
          <label>Average Buy Price</label>
          <p>${asset.avg_buy_price.toFixed(2)}</p>
        </div>
        <div className="stat">
          <label>Current Price</label>
          <p>${asset.current_price.toFixed(2)}</p>
        </div>
        <div className="stat">
          <label>Invested Value</label>
          <p>${asset.invested_value.toFixed(2)}</p>
        </div>
        <div className="stat">
          <label>Current Value</label>
          <p>${asset.current_value.toFixed(2)}</p>
        </div>
        <div className="stat">
          <label>Gain/Loss</label>
          <p className={asset.gain_loss >= 0 ? 'gain' : 'loss'}>
            ${asset.gain_loss.toFixed(2)}
          </p>
        </div>
        <div className="stat">
          <label>Gain/Loss %</label>
          <p className={asset.gain_loss_percent >= 0 ? 'gain' : 'loss'}>
            {asset.gain_loss_percent.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}

// Add click handler in Portfolio.jsx
const [selectedAssetId, setSelectedAssetId] = useState(null);

<table>
  {/* ... */}
  <tr onClick={() => setSelectedAssetId(asset.id)}>
    {/* ... */}
  </tr>
</table>

{selectedAssetId && (
  <AssetDetail 
    assetId={selectedAssetId}
    user={user}
    token={token}
    onClose={() => setSelectedAssetId(null)}
  />
)}
```

#### ✅ Task 4.6: Implement GET /portfolio/{user_id}/assets
**Endpoint:** `GET /portfolio/{user_id}/assets`
**Purpose:** Get all assets with their IDs for user

**Implementation Example:**
```javascript
// Use this to get all asset IDs for reference
const [assetIds, setAssetIds] = useState([]);

useEffect(() => {
  if (!user?.id || !token) return;

  const fetchAssets = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/portfolio/${user.id}/assets`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch assets');
      const data = await response.json();
      setAssetIds(data.asset_ids);
    } catch (err) {
      console.error('Error fetching assets:', err);
    }
  };

  fetchAssets();
}, [user?.id, token]);
```

---

## PART 5: SETTINGS PAGE

### Settings Page (Settings.jsx)

#### ✅ Task 5.1: Implement GET /auth/{user_id}/profile
**Endpoint:** `GET /auth/{user_id}/profile`
**Purpose:** Get user profile information

**Implementation Example:**
```javascript
// Settings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !token) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/auth/${user.id}/profile`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, token]);

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Profile not found</p>;

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      <div className="profile-section">
        <h2>Profile Information</h2>
        <div className="profile-info">
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Cash Balance:</strong> ${profile.cash_balance.toFixed(2)}</p>
          <p><strong>Account Status:</strong> {profile.is_active ? 'Active' : 'Inactive'}</p>
          <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
          {profile.last_login && (
            <p><strong>Last Login:</strong> {new Date(profile.last_login).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <ProfileUpdateForm user={user} token={token} />
      <PasswordChangeForm user={user} token={token} />
      <ResetBalanceForm user={user} token={token} />
      <DeleteAccountForm user={user} token={token} />
    </div>
  );
}
```

#### ✅ Task 5.2: Implement PUT /settings/{user_id}/profile
**Endpoint:** `PUT /settings/{user_id}/profile`
**Request Body:**
```json
{
  "username": "new_username",
  "email": "newemail@example.com"
}
```

**Implementation Example:**
```javascript
// components/ProfileUpdateForm.jsx
import { useState } from 'react';

export default function ProfileUpdateForm({ user, token }) {
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/settings/${user.id}/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setMessage('✓ Profile updated successfully!');
      setFormData({ username: '', email: '' });
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-profile-section">
      <h3>Update Profile</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">New Username (optional):</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="Leave blank to keep current"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">New Email (optional):</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Leave blank to keep current"
          />
        </div>

        {message && <p className="message">{message}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
```

#### ✅ Task 5.3: Implement POST /settings/{user_id}/change-password
**Endpoint:** `POST /settings/{user_id}/change-password`
**Request Body:**
```json
{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

**Implementation Example:**
```javascript
// components/PasswordChangeForm.jsx
import { useState } from 'react';

export default function PasswordChangeForm({ user, token }) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/settings/${user.id}/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      setMessage('✓ Password changed successfully!');
      setFormData({ current_password: '', new_password: '' });
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-section">
      <h3>Change Password</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="current_password">Current Password:</label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            value={formData.current_password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="new_password">New Password:</label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            value={formData.new_password}
            onChange={handleChange}
            minLength="8"
            required
          />
        </div>

        {message && <p className="message">{message}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
```

#### ✅ Task 5.4: Implement POST /settings/{user_id}/reset-balance
**Endpoint:** `POST /settings/{user_id}/reset-balance`
**Request Body:**
```json
{
  "confirm": true
}
```

**Implementation Example:**
```javascript
// components/ResetBalanceForm.jsx
import { useState } from 'react';

export default function ResetBalanceForm({ user, token }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/settings/${user.id}/reset-balance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ confirm: true })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset balance');
      }

      setMessage(`✓ ${data.message}`);
      setShowConfirm(false);
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-balance-section">
      <h3>Reset Balance</h3>
      <p>This will reset your cash balance to $10,000 and clear all holdings.</p>
      
      {!showConfirm ? (
        <button onClick={() => setShowConfirm(true)} className="warning-btn">
          Reset Balance
        </button>
      ) : (
        <div className="confirmation-dialog">
          <p className="warning">Are you sure? This action cannot be undone!</p>
          <div className="button-group">
            <button 
              onClick={handleReset} 
              disabled={loading}
              className="danger-btn"
            >
              {loading ? 'Resetting...' : 'Yes, Reset'}
            </button>
            <button 
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}
```

#### ✅ Task 5.5: Implement DELETE /settings/{user_id}/delete-account
**Endpoint:** `DELETE /settings/{user_id}/delete-account`
**Request Body:**
```json
{
  "password": "userpassword",
  "confirm": true
}
```

**Implementation Example:**
```javascript
// components/DeleteAccountForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DeleteAccountForm({ user, token }) {
  const [password, setPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDelete = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:5000/settings/${user.id}/delete-account`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            password,
            confirm: true 
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      setMessage('Account deleted successfully. Logging out...');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setMessage(`✗ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-account-section danger-zone">
      <h3>Delete Account</h3>
      <p className="warning">
        ⚠️ Deleting your account is permanent and cannot be undone. 
        All your data will be permanently removed.
      </p>
      
      {!showConfirm ? (
        <button onClick={() => setShowConfirm(true)} className="danger-btn">
          Delete My Account
        </button>
      ) : (
        <div className="confirmation-dialog">
          <div className="form-group">
            <label htmlFor="delete_password">Enter your password to confirm:</label>
            <input
              id="delete_password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <p className="warning">
            This action CANNOT be undone. All your portfolio data, orders, and account 
            information will be permanently deleted.
          </p>

          <div className="button-group">
            <button 
              onClick={handleDelete} 
              disabled={loading || !password}
              className="danger-btn"
            >
              {loading ? 'Deleting...' : 'Yes, Delete Everything'}
            </button>
            <button 
              onClick={() => {
                setShowConfirm(false);
                setPassword('');
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  );
}
```

#### ✅ Task 5.6: Implement GET /settings/{user_id}
**Endpoint:** `GET /settings/{user_id}`
**Purpose:** Get all user settings

**Implementation Example:**
```javascript
// Add to Settings.jsx
const [allSettings, setAllSettings] = useState(null);

useEffect(() => {
  if (!user?.id || !token) return;

  const fetchAllSettings = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/settings/${user.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setAllSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  fetchAllSettings();
}, [user?.id, token]);

// Display settings overview
{allSettings && (
  <div className="settings-overview">
    <h3>Account Overview</h3>
    <div className="settings-grid">
      <div className="setting-card">
        <h4>Profile</h4>
        <p>Username: {allSettings.profile.username}</p>
        <p>Email: {allSettings.profile.email}</p>
      </div>
      <div className="setting-card">
        <h4>Account Status</h4>
        <p>Active: {allSettings.account.is_active ? 'Yes' : 'No'}</p>
        <p>Created: {new Date(allSettings.account.created_at).toLocaleDateString()}</p>
      </div>
      <div className="setting-card">
        <h4>Trading</h4>
        <p>Cash Balance: ${allSettings.trading.cash_balance.toFixed(2)}</p>
      </div>
    </div>
  </div>
)}
```

#### ✅ Task 5.7: Implement GET /settings/{user_id}/security
**Endpoint:** `GET /settings/{user_id}/security`
**Purpose:** Get security-related information

**Implementation Example:**
```javascript
// components/SecuritySettings.jsx
import { useState, useEffect } from 'react';

export default function SecuritySettings({ user, token }) {
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/settings/${user.id}/security`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch security settings');
        const data = await response.json();
        setSecurity(data);
      } catch (err) {
        console.error('Error fetching security:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurity();
  }, [user.id, token]);

  if (loading) return <p>Loading security settings...</p>;
  if (!security) return <p>Security data not available</p>;

  return (
    <div className="security-settings-section">
      <h3>Security Settings</h3>
      
      <div className="security-info">
        <div className="info-card">
          <h4>Account Active</h4>
          <p>{security.account_security.account_active ? '✓ Yes' : '✗ No'}</p>
        </div>
        
        <div className="info-card">
          <h4>Last Login</h4>
          <p>
            {security.account_security.last_login 
              ? new Date(security.account_security.last_login).toLocaleDateString()
              : 'Never'}
          </p>
        </div>

        <div className="info-card">
          <h4>Account Created</h4>
          <p>{new Date(security.account_security.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="available-actions">
        <h4>Available Actions</h4>
        <ul>
          {security.available_actions.map((action, idx) => (
            <li key={idx}>
              {action.replace('_', ' ').toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Add to Settings.jsx
<SecuritySettings user={user} token={token} />
```

---

## PART 6: API UTILITIES (OPTIONAL - For Cleaner Code)

### Create Centralized API Utility (services/api.js)

```javascript
// services/api.js
const API_BASE = 'http://localhost:5000';

// Auth endpoints
export const authAPI = {
  signup: (data) => 
    fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  login: (data) => 
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }),

  getProfile: (userId, token) =>
    fetch(`${API_BASE}/auth/${userId}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// Dashboard endpoints
export const dashboardAPI = {
  getCryptos: (token) =>
    fetch(`${API_BASE}/dash/cryptos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getMarketData: (token) =>
    fetch(`${API_BASE}/dash/market-data`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  searchCryptos: (query, limit, token) =>
    fetch(`${API_BASE}/dash/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getCryptoMarketData: (cryptoId, token) =>
    fetch(`${API_BASE}/dash/market-data/${cryptoId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getCashBalance: (userId, token) =>
    fetch(`${API_BASE}/dash/${userId}/cash-balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// Trade endpoints
export const tradeAPI = {
  placeOrder: (userId, data, token) =>
    fetch(`${API_BASE}/trade/${userId}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  getOrders: (userId, page = 1, perPage = 10, status = '', token) => {
    let url = `${API_BASE}/trade/${userId}/orders?page=${page}&per_page=${perPage}`;
    if (status) url += `&status=${status}`;
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  getOrder: (userId, orderId, token) =>
    fetch(`${API_BASE}/trade/${userId}/order/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  executeOrder: (userId, orderId, token) =>
    fetch(`${API_BASE}/trade/${userId}/order/${orderId}/execute`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  cancelOrder: (userId, orderId, token) =>
    fetch(`${API_BASE}/trade/${userId}/order/${orderId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// Portfolio endpoints
export const portfolioAPI = {
  getPortfolio: (userId, token) =>
    fetch(`${API_BASE}/portfolio/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getHoldings: (userId, token) =>
    fetch(`${API_BASE}/portfolio/${userId}/holdings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getPerformance: (userId, token) =>
    fetch(`${API_BASE}/portfolio/${userId}/performance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getBreakdown: (userId, token) =>
    fetch(`${API_BASE}/portfolio/${userId}/breakdown`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getAsset: (userId, assetId, token) =>
    fetch(`${API_BASE}/portfolio/${userId}/asset/${assetId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getAssets: (userId, token) =>
    fetch(`${API_BASE}/portfolio/${userId}/assets`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};

// Settings endpoints
export const settingsAPI = {
  updateProfile: (userId, data, token) =>
    fetch(`${API_BASE}/settings/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  changePassword: (userId, data, token) =>
    fetch(`${API_BASE}/settings/${userId}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  resetBalance: (userId, token) =>
    fetch(`${API_BASE}/settings/${userId}/reset-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ confirm: true })
    }),

  deleteAccount: (userId, data, token) =>
    fetch(`${API_BASE}/settings/${userId}/delete-account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }),

  getSettings: (userId, token) =>
    fetch(`${API_BASE}/settings/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),

  getSecurity: (userId, token) =>
    fetch(`${API_BASE}/settings/${userId}/security`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
};
```

---

## CHECKLIST SUMMARY

### Phase 1: Authentication ✅
- [ ] Implement POST /auth/signup
- [ ] Implement POST /auth/login
- [ ] Implement GET /auth/{user_id}/profile
- [ ] Create AuthContext for state management

### Phase 2: Dashboard ✅
- [ ] Implement GET /dash/cryptos
- [ ] Implement GET /dash/market-data
- [ ] Implement GET /dash/search
- [ ] Implement GET /dash/market-data/{crypto_id}
- [ ] Implement GET /dash/{user_id}/cash-balance

### Phase 3: Trade ✅
- [ ] Implement POST /trade/{user_id}/order
- [ ] Implement GET /trade/{user_id}/orders
- [ ] Implement GET /trade/{user_id}/order/{order_id}
- [ ] Implement POST /trade/{user_id}/order/{order_id}/execute
- [ ] Implement POST /trade/{user_id}/order/{order_id}/cancel

### Phase 4: Portfolio ✅
- [ ] Implement GET /portfolio/{user_id}
- [ ] Implement GET /portfolio/{user_id}/holdings
- [ ] Implement GET /portfolio/{user_id}/performance
- [ ] Implement GET /portfolio/{user_id}/breakdown
- [ ] Implement GET /portfolio/{user_id}/asset/{asset_id}
- [ ] Implement GET /portfolio/{user_id}/assets

### Phase 5: Settings ✅
- [ ] Implement GET /auth/{user_id}/profile (view in settings)
- [ ] Implement PUT /settings/{user_id}/profile
- [ ] Implement POST /settings/{user_id}/change-password
- [ ] Implement POST /settings/{user_id}/reset-balance
- [ ] Implement DELETE /settings/{user_id}/delete-account
- [ ] Implement GET /settings/{user_id}
- [ ] Implement GET /settings/{user_id}/security

### Phase 6: Optimization (Optional)
- [ ] Create centralized API utility file
- [ ] Add error handling/loading states globally
- [ ] Implement auto-refresh intervals
- [ ] Add toast notifications
- [ ] Implement caching strategy

---

## TESTING GUIDE

### Test Order (Recommended)
1. **Create Account** → Test signup
2. **Login** → Test login and token storage
3. **View Dashboard** → Test crypto list and market data
4. **Search** → Test search functionality
5. **Check Balance** → Verify cash balance display
6. **Place Order** → Create pending order
7. **View Orders** → List with pagination
8. **Execute Order** → Complete transaction
9. **View Portfolio** → Check holdings and balances
10. **Update Profile** → Test settings updates
11. **Change Password** → Verify security
12. **Reset Balance** → Test confirmation dialogs

---

End of Implementation Checklist
