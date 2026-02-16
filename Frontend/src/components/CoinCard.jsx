import { useNavigate } from 'react-router-dom';

const CoinCard = ({ coin }) => {
  const navigate = useNavigate();
  
  const isPositive24h = coin.price_change_percentage_24h >= 0;
  const isPositive7d  = coin.price_change_percentage_7d_in_currency >= 0;

  return (
    <div
      onClick={() => navigate(`/trade?coin=${coin.id}`)}
      className="bg-gray-800 rounded-xl p-5 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer border border-gray-700"
    >
      <div className="flex items-center gap-3 mb-4">
        <img 
          src={coin.image} 
          alt={coin.name} 
          className="w-10 h-10 rounded-full"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=?'; }}
        />
        <div>
          <h3 className="font-bold text-lg">{coin.name}</h3>
          <p className="text-gray-400 text-sm uppercase">{coin.symbol}</p>
        </div>
      </div>

      <div className="text-2xl font-bold mb-4">
        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-400">24h</p>
          <p className={isPositive24h ? 'text-emerald-400' : 'text-red-400'}>
            {isPositive24h ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-gray-400">7d</p>
          <p className={isPositive7d ? 'text-emerald-400' : 'text-red-400'}>
            {isPositive7d ? '+' : ''}{coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">Market Cap</p>
          <p>${(coin.market_cap / 1e9).toFixed(2)}B</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-400">24h Volume</p>
          <p>${(coin.total_volume / 1e9).toFixed(2)}B</p>
        </div>
      </div>
    </div>
  );
};

export default CoinCard;