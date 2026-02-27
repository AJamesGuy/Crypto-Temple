import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI } from '../services/api'
import SearchBar from '../components/SearchBar/SearchBar'
import CoinCard from '../components/CoinCard/CoinCard'
import "../styles/Dashboard.css"

const Dashboard = () => {
  const { user, token } = useAuth()
  const [cryptos, setCryptos] = useState([])
  const [marketData, setMarketData] = useState([])
  const [cashBalance, setCashBalance] = useState(0)
  const [cryptosLoading, setCryptosLoading] = useState(true)
  const [marketLoading, setMarketLoading] = useState(true)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [selectedCrypto, setSelectedCrypto] = useState(null)

  useEffect(() => {
    if (!user?.id || !token) return

    // Fetch all cryptos
    const fetchCryptos = async () => {
      try {
        const data = await dashboardAPI.getCryptos()
        setCryptos(data || [])
      } catch (err) {
        console.error('Error fetching cryptos:', err)
      } finally {
        setCryptosLoading(false)
      }
    }

    // Fetch market data
    const fetchMarketData = async () => {
      try {
        const data = await dashboardAPI.getMarketData()
        setMarketData(data || [])
      } catch (err) {
        console.error('Error fetching market data:', err)
      } finally {
        setMarketLoading(false)
      }
    }

    // Fetch cash balance
    const fetchCashBalance = async () => {
      try {
        const data = await dashboardAPI.getCashBalance(user.id)
        setCashBalance(data.cash_balance || 0)
      } catch (err) {
        console.error('Error fetching cash balance:', err)
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchCryptos()
    fetchMarketData()
    fetchCashBalance()

    // Set intervals for auto-refresh
    const cryptoInterval = setInterval(fetchCryptos, 300000) // 5 minutes
    const marketInterval = setInterval(fetchMarketData, 60000) // 1 minute
    const balanceInterval = setInterval(fetchCashBalance, 60000) // 1 minute

    return () => {
      clearInterval(cryptoInterval)
      clearInterval(marketInterval)
      clearInterval(balanceInterval)
    }
  }, [user?.id, token])

  const handleCryptoSelect = (crypto) => {
    setSelectedCrypto(crypto)
  }

  const handleSearch = async (crypto) => {
    try {
      const marketData = await dashboardAPI.getCryptoMarketData(crypto.id)
      setSelectedCrypto(marketData)
    } catch (err) {
      console.error('Error fetching market data for crypto:', err)
      setSelectedCrypto(crypto) // Fallback to crypto object if market data fetch fails
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user?.username || 'Guest'}!</h1>
          <div className="balance-display">
            <h2>Cash Balance</h2>
            {balanceLoading ? (
              <p>Loading...</p>
            ) : (
              <span className="cash-amount">${cashBalance.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="search-section">
        <SearchBar onSearch={handleSearch} token={token} />
      </div>

      {selectedCrypto && (
        <div className="selected-crypto-section">
          <div className="selected-crypto-header">
            <h2>Selected: {selectedCrypto.symbol}</h2>
            <button onClick={() => setSelectedCrypto(null)}>Close</button>
          </div>
          <CoinCard crypto={selectedCrypto} onSelect={() => {}} />
        </div>
      )}

      <div className="cryptos-section">
        <h2>Top Cryptocurrencies</h2>
        {cryptosLoading || marketLoading ? (
          <p>Loading cryptocurrencies...</p>
        ) : (
          <div className="cryptos-grid">
            {(marketData || cryptos).slice(0, 12).map((crypto) => (
              <div
                key={crypto.id}
                className="crypto-item"
                onClick={() => handleCryptoSelect(crypto)}
              >
                <CoinCard crypto={crypto} onSelect={handleCryptoSelect} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard