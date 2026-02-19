import { useNavigate } from 'react-router-dom';

const CoinCard = ({ coin }) => {
  const navigate = useNavigate();
  
  const isPositive24h = coin.change_24h >= 0;
  
  const formatPrice = (price) => {
    if (price > 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(8)}`;
  };

  return (
    <div
      onClick={() => navigate(`/trade?coin=${coin.crypto_id}`)}
      className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={coin.image} 
            alt={coin.symbol} 
            className="w-10 h-10 rounded-full"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=?'; }}
          />
          <div>
            <h3 className="font-bold text-white">{coin.symbol.toUpperCase()}</h3>
            <p className="text-gray-400 text-xs">{coin.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-400">{formatPrice(coin.price)}</p>
          <p className={`text-sm font-semibold ${isPositive24h ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive24h ? '+' : ''}{coin.change_24h?.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500 text-xs">Market Cap</p>
          <p className="text-white font-semibold">
            {coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B` : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">24h High</p>
          <p className="text-green-400 font-semibold">
            {coin.high ? formatPrice(coin.high) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">24h Low</p>
          <p className="text-red-400 font-semibold">
            {coin.low ? formatPrice(coin.low) : 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Rank</p>
          <p className="text-white font-semibold">{coin.market_cap_rank || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default CoinCard;