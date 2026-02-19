import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { tradeAPI } from '../services/api';

const OrderForm = ({ onOrderPlaced, userCashBalance }) => {
  const { token } = useContext(AuthContext);
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    crypto_id: '',
    order_type: 'buy',
    quantity: ''
  });

  useEffect(() => {
    fetchCryptos();
  }, []);

  const fetchCryptos = async () => {
    try {
      const data = await dashboardAPI.getCryptos();
      setCryptos(data);
    } catch (err) {
      console.error('Error fetching cryptos:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const selectedCrypto = cryptos.find(c => c.id === parseInt(form.crypto_id));
      const price = selectedCrypto.current_price; // Assume current_price in crypto data
      const total = parseFloat(form.quantity) * price;
      
      if (form.order_type === 'buy' && total > userCashBalance) {
        setError(`Insufficient balance. You have $${userCashBalance.toFixed(2)}, but this order requires $${total.toFixed(2)}`);
        setLoading(false);
        return;
      }

      const data = await tradeAPI.placeOrder(form.crypto_id, form.order_type, form.quantity, price);
      setSuccess(`Order placed successfully! Order ID: ${data.order.id}`);
      setForm({
        crypto_id: '',
        order_type: 'buy',
        quantity: ''
      });
      if (onOrderPlaced) {
        onOrderPlaced();
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCrypto = cryptos.find(c => c.id === parseInt(form.crypto_id));
  const price = selectedCrypto ? selectedCrypto.current_price : 0;
  const total = form.quantity ? (parseFloat(form.quantity) * price).toFixed(2) : '0.00';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Place Order</h2>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crypto Selection */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Cryptocurrency</label>
            <select
              name="crypto_id"
              value={form.crypto_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a cryptocurrency</option>
              {cryptos.map(crypto => (
                <option key={crypto.id} value={crypto.id}>
                  {crypto.symbol.toUpperCase()} - {crypto.description}
                </option>
              ))}
            </select>
            {selectedCrypto && (
              <p className="text-gray-400 text-sm mt-2">
                Current Price: ${price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Order Type</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="order_type"
                  value="buy"
                  checked={form.order_type === 'buy'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-green-400">Buy</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="order_type"
                  value="sell"
                  checked={form.order_type === 'sell'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-red-400">Sell</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quantity */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="0.00"
              step="0.0001"
              min="0"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Price (read-only) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Price per Unit</label>
            <input
              type="number"
              value={price}
              readOnly
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Subtotal:</span>
            <span className="text-white font-semibold">${total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={form.order_type === 'buy' ? 'text-red-400' : 'text-green-400'}>
              {form.order_type === 'buy' ? 'Cost:' : 'Proceeds:'}
            </span>
            <span className={form.order_type === 'buy' ? 'text-red-400 font-semibold' : 'text-green-400 font-semibold'}>
              ${total}
            </span>
          </div>
          {form.order_type === 'buy' && (
            <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Remaining Balance:</span>
              <span className={parseFloat(total) > userCashBalance ? 'text-red-400' : 'text-green-400'}>
                ${(userCashBalance - parseFloat(total)).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !form.crypto_id || !form.quantity}
          className={`w-full py-3 px-6 font-semibold rounded-lg transition ${
            form.order_type === 'buy'
              ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white'
          }`}
        >
          {loading ? 'Placing Order...' : `${form.order_type === 'buy' ? 'Buy' : 'Sell'} Now`}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;