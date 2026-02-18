import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { tradeAPI, dashboardAPI } from '../services/api';
import OrderForm from '../components/OrderForm';

const Trade = () => {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [cashBalance, setCashBalance] = useState(0);

  const fetchOrders = async () => {
    try {
      const data = await tradeAPI.getOrders(filter !== 'all' ? filter : null);
      setOrders(data);
      setError('');
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashBalance = async () => {
  try {
    const data = await dashboardAPI.getCashBalance();
    setCashBalance(data.cash_balance);
  } catch (err) {
    console.error('Error fetching balance:', err);
  }
};

  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchCashBalance();
      const interval = setInterval(() => {
        fetchOrders();
        fetchCashBalance();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleOrderPlaced = () => {
    setRefreshing(true);
    fetchOrders();
    fetchCashBalance();
    setRefreshing(false);
  };

  const executeOrder = async (orderId) => {
    try {
      await tradeAPI.executeOrder(orderId);
      fetchOrders();
      fetchCashBalance();
    } catch (err) {
      alert('Error executing order');
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm('Cancel this order?')) {
      try {
        await tradeAPI.cancelOrder(orderId);
        fetchOrders();
        fetchCashBalance();
      } catch (err) {
        alert('Error cancelling order');
      }
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-8">Trade</h1>

      {/* Cash Balance */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <p className="text-gray-400 text-sm">Available Cash</p>
        <p className="text-3xl font-bold text-emerald-400">${cashBalance.toFixed(2)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-1">
          <OrderForm token={token} onOrderPlaced={handleOrderPlaced} cashBalance={cashBalance} />
        </div>

        {/* Orders List */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Orders</h2>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading orders...</p>
              </div>
            ) : error ? (
              <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No {filter === 'all' ? '' : filter} orders yet</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {order.type === 'buy' ? '📈' : '📉'} {order.type.toUpperCase()} {order.symbol}
                        </h3>
                        <p className="text-gray-400 text-sm">{order.quantity.toFixed(8)} @ ${order.price.toFixed(8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${order.total_value.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          order.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                          order.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-3">
                      {new Date(order.created_at).toLocaleString()}
                    </p>

                    {order.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => executeOrder(order.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                        >
                          Execute
                        </button>
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;