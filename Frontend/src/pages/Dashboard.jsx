import { useState, useEffect } from 'react';
import { getTopCoins } from "../services/coingecko";
import CoinCard from '../components/CoinCard';

const Dashboard = () => {
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCoins = async () => {
      setLoading(true)
      const data = await getTopCoins(20);
        if (data.length > 0) {
          setCoins(data);
          setFilteredCoins(data);
          setError(null);
        } else {
          setError('No coins found');
        }
        setLoading(false);
      };
  useEffect(() => {
    fetchCoins();
    
    const interval = setInterval(fetchCoins, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredCoins(coins);
    } else {
      const term = search.toLowerCase();
      const results = coins.filter(coin => coin.name.toLowerCase().includes(term) || coin.symbol.toLowerCase().toLowerCase().includes(term));
      setFilteredCoins(results);
  }
}, [search, coins]);

return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-2">Market Overview</h1>
      <p className="text-gray-400 mb-8">Top cryptocurrencies by market cap (live data from CoinGecko)</p>

      {/* Search bar */}
      <div className="mb-8 max-w-md">
        <input
          type="text"
          placeholder="Search by name or symbol (e.g. bitcoin, btc)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              No coins found matching "{search}"
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCoins.map((coin) => (
                <CoinCard key={coin.id} coin={coin} />
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