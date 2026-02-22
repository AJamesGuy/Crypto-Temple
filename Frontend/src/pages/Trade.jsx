import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI, tradeAPI } from '../services/api'
import OrderForm from '../components/OrderForm'
import CoinCard from '../components/CoinCard'

const Trade = () => {
  const { user, token } = useAuth()
  const [cryptos, setCryptos] = useState([])
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [page, setPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)

  useEffect(() => {
    if (!user?.id || !token) return

    // Fetch all cryptos for dropdown
    const fetchCryptos = async () => {
      try {
        const data = await dashboardAPI.getCryptos()
        setCryptos(data || [])
      } catch (err) {
        console.error('Error fetching cryptos:', err)
      }
    }

    // Fetch orders
    const fetchOrders = async () => {
      try {
        const data = await tradeAPI.getOrders(user.id, page, 10)
        setOrders(data.orders || [])
        setTotalOrders(data.total || 0)
      } catch (err) {
        console.error('Error fetching orders:', err)
      }
    }

    fetchCryptos()
    fetchOrders()
  }, [user?.id, token, page])

  const handleCryptoSelect = async (cryptoId) => {
    try {
      const data = await dashboardAPI.getCryptoMarketData(cryptoId)
      setSelectedCrypto(data)
      setMessage('')
    } catch (err) {
      setMessage('Error fetching crypto details')
    }
  }

  const handlePlaceOrder = async (formData) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await tradeAPI.placeOrder(user.id, formData)
      setMessage('Order placed successfully!')
      setSelectedCrypto(null)

      // Refresh orders list
      const data = await tradeAPI.getOrders(user.id, 1, 10)
      setOrders(data.orders || [])
      setPage(1)
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteOrder = async (orderId) => {
    setLoading(true)
    try {
      await tradeAPI.executeOrder(user.id, orderId)
      setMessage('Order executed successfully!')
      
      // Refresh orders
      const data = await tradeAPI.getOrders(user.id, page, 10)
      setOrders(data.orders || [])
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return
    }

    setLoading(true)
    try {
      await tradeAPI.cancelOrder(user.id, orderId)
      setMessage('Order cancelled successfully!')
      
      // Refresh orders
      const data = await tradeAPI.getOrders(user.id, page, 10)
      setOrders(data.orders || [])
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="trade-container">
      <h1>Trade</h1>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="trade-form-section">
        <div className="crypto-selector">
          <h2>Select Cryptocurrency</h2>
          <select onChange={(e) => handleCryptoSelect(e.target.value)}>
            <option value="">Choose a cryptocurrency...</option>
            {cryptos.map((crypto) => (
              <option key={crypto.id} value={crypto.id}>
                {crypto.name} ({crypto.symbol?.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {selectedCrypto && (
          <div className="order-section">
            <div className="crypto-detail">
              <CoinCard crypto={selectedCrypto} />
            </div>
            <div className="order-form-wrapper">
              <OrderForm
                cryptoDetail={selectedCrypto}
                onSubmit={handlePlaceOrder}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      <div className="orders-section">
        <h2>Order History</h2>
        {orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Crypto</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.crypto_name}</td>
                    <td className={order.order_type}>{order.order_type.toUpperCase()}</td>
                    <td>{order.quantity}</td>
                    <td>${order.price?.toFixed(2)}</td>
                    <td>${(order.quantity * order.price)?.toFixed(2)}</td>
                    <td className={`status-${order.status}`}>{order.status}</td>
                    <td className="actions">
                      {order.status === 'pending' && (
                        <>
                          <button
                            className="execute-btn"
                            onClick={() => handleExecuteOrder(order.id)}
                            disabled={loading}
                          >
                            Execute
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {Math.ceil(totalOrders / 10)}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * 10 >= totalOrders}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Trade