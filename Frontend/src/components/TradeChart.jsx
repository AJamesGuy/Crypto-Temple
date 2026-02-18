import React from 'react';

const TradeChart = ({ cryptoData }) => {
  // Simple sparkline-style visualization using CSS
  if (!cryptoData || !cryptoData.performance || cryptoData.performance.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <p className="text-gray-400">No chart data available</p>
      </div>
    );
  }

  const performance = cryptoData.performance;
  const maxPrice = Math.max(...performance.map(p => p.price));
  const minPrice = Math.min(...performance.map(p => p.price));
  const priceRange = maxPrice - minPrice;

  // Normalize prices to 0-100 scale for visualization
  const normalizedPrices = performance.map(p => {
    if (priceRange === 0) return 50;
    return ((p.price - minPrice) / priceRange) * 100;
  });

  const isPositive = performance[performance.length - 1].price >= performance[0].price;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{cryptoData.name} Price Chart</h3>
        <div className="flex items-center gap-2">
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            ${performance[performance.length - 1].price.toFixed(2)}
          </p>
          <p className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{((performance[performance.length - 1].price / performance[0].price - 1) * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="h-24 flex items-end gap-1">
        {normalizedPrices.map((normalizedPrice, idx) => {
          const isNegative = normalizedPrice < normalizedPrices[0];
          return (
            <div
              key={idx}
              className={`flex-1 rounded-t ${isNegative ? 'bg-red-500/50' : 'bg-green-500/50'} hover:opacity-80 transition`}
              style={{ height: `${normalizedPrice}%` }}
              title={`${performance[idx].date}: $${performance[idx].price.toFixed(2)}`}
            />
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div>
          <p className="text-gray-500 text-sm">High</p>
          <p className="text-green-400 font-semibold">${maxPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Low</p>
          <p className="text-red-400 font-semibold">${minPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Change</p>
          <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            ${(performance[performance.length - 1].price - performance[0].price).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Period</p>
          <p className="text-white font-semibold">{performance.length} days</p>
        </div>
      </div>
    </div>
  );
};

export default TradeChart;
