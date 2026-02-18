import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import CoinCard from '../components/CoinCard';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cashBalance, setCashBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // all, gainers, losers

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getMarketData();
      setCoins(data);
      setFilteredCoins(data);
      setError(null);
    } catch (err) {
      setError('Error fetching market data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashBalance = async () => {
    try {
      const data = await dashboardAPI.getCashBalance();
      setCashBalance(data.cash_balance);
    } catch (err) {
      console.error('Error fetching cash balance:', err);
    }
  };

  const fetchGainers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/cryptos/gainers?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCoins(data.data || []);
        setFilteredCoins(data.data || []);
      }
    } catch (err) {
      setError('Error fetching gainers');
    } finally {
      setLoading(false);
    }
  };

  const fetchLosers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/admin/cryptos/losers?limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCoins(data.data || []);
        setFilteredCoins(data.data || []);
      }
    } catch (err) {
      setError('Error fetching losers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMarketData();
      fetchCashBalance();
      const interval = setInterval(() => {
        fetchMarketData();
        fetchCashBalance();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch('');
    if (tab === 'gainers') {
      fetchGainers();
    } else if (tab === 'losers') {
      fetchLosers();
    } else {
      fetchMarketData();
    }
  };

  const handleSearch = async (value) => {
    setSearch(value);
    if (value.trim() === '') {
      setFilteredCoins(coins);
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/admin/cryptos/search?q=${value}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFilteredCoins(data.results || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Market Overview</h1>
          <p className="text-gray-400">Welcome, {user?.username}!</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Available Balance</p>
          <p className="text-2xl font-bold text-emerald-400">${cashBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => handleTabChange('all')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'all'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          All Cryptos
        </button>
        <button
          onClick={() => handleTabChange('gainers')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'gainers'
              ? 'border-b-2 border-green-500 text-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Top Gainers
        </button>
        <button
          onClick={() => handleTabChange('losers')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'losers'
              ? 'border-b-2 border-red-500 text-red-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Top Losers
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-8 max-w-md">
        <input
          type="text"
          placeholder="Search by name or symbol (e.g. bitcoin, btc)"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-500"
        />
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading market data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredCoins.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              {search ? `No coins found matching "${search}"` : 'No coins available'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCoins.map((coin) => (
                <CoinCard key={coin.id || coin.symbol} coin={coin} />
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-center text-gray-500 text-sm mt-10">
        Data updates every 60 seconds • Prices in USD
      </p>
    </div>
  );
};

export default Dashboard;