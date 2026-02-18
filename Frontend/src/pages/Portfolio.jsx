import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { portfolioAPI } from '../services/api';

const Portfolio = () => {
  const { token } = useContext(AuthContext);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [breakdown, setBreakdown] = useState(null);
  const [activeTab, setActiveTab] = useState('holdings');

  const fetchPortfolio = async () => {
    try {
      const data = await portfolioAPI.getPortfolio();
      setPortfolio(data);
      setError('');
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBreakdown = async () => {
  try {
    const data = await portfolioAPI.getBreakdown();
    setBreakdown(data);
  } catch (err) {
    console.error('Error fetching breakdown:', err);
  }
};

  useEffect(() => {
    if (token) {
      fetchPortfolio();
      fetchBreakdown();
      const interval = setInterval(() => {
        fetchPortfolio();
        fetchBreakdown();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-200 px-6 py-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!portfolio) {
    return <div className="text-gray-400">No portfolio data available</div>;
  }

  const overallPercentage = portfolio.total_invested > 0 
    ? ((portfolio.overall_gain_loss / portfolio.total_invested) * 100).toFixed(2)
    : 0;

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Portfolio</h1>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-2">Total Value</p>
          <p className="text-2xl font-bold text-emerald-400">${portfolio.total_portfolio_value.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-2">Cash Balance</p>
          <p className="text-2xl font-bold text-white">${portfolio.cash_balance.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-2">Invested</p>
          <p className="text-2xl font-bold text-white">${portfolio.total_invested.toFixed(2)}</p>
        </div>
        <div className={`bg-gray-900 border border-gray-800 rounded-lg p-6`}>
          <p className="text-gray-400 text-sm mb-2">Gain/Loss</p>
          <p className={`text-2xl font-bold ${portfolio.overall_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${portfolio.overall_gain_loss.toFixed(2)}
          </p>
          <p className={`text-sm ${portfolio.overall_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {overallPercentage}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('holdings')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'holdings'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Holdings
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`pb-3 px-4 font-semibold transition ${
            activeTab === 'breakdown'
              ? 'border-b-2 border-emerald-500 text-emerald-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Allocation
        </button>
      </div>

      {/* Holdings Tab */}
      {activeTab === 'holdings' && (
        <div>
          {portfolio.assets && portfolio.assets.length > 0 ? (
            <div className="space-y-4">
              {portfolio.assets.map((asset) => (
                <div key={asset.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{asset.symbol}</h3>
                      <p className="text-gray-400 text-sm">{asset.quantity.toFixed(8)} coins</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">${asset.current_value.toFixed(2)}</p>
                      <p className={`text-sm ${asset.gain_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.gain_loss >= 0 ? '+' : ''}{asset.gain_loss.toFixed(2)} ({asset.gain_loss_percent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Avg Buy Price</p>
                      <p className="text-white">${asset.avg_buy_price.toFixed(8)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Current Price</p>
                      <p className="text-white">${asset.current_price.toFixed(8)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No holdings yet. Start trading!</p>
          )}
        </div>
      )}

      {/* Allocation Tab */}
      {activeTab === 'breakdown' && breakdown && (
        <div className="space-y-4">
          {breakdown.breakdown && breakdown.breakdown.map((item, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.symbol}</h3>
                  <p className="text-gray-400 text-sm">{item.type === 'cash' ? 'Cash Balance' : 'Cryptocurrency'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">${item.value.toFixed(2)}</p>
                </div>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.type === 'cash' ? 'bg-blue-500' : 'bg-emerald-500'}`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-sm mt-2">{item.percentage.toFixed(2)}% of portfolio</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Portfolio;