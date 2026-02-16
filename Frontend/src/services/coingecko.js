import axios from 'axios';

const API = 'https://api.coingecko.com/api/v3';

export const getTopCoins = async (perPage = 20) => {
    try{
        const response = await axios.get(`${API}/coins/markets`, {
            params: {
                vs_currency: 'usd',
                order: 'market_cap_desc',
                per_page: perPage,
                page: 1,
                sparkline: false,
                price_change_percentage: '24h,7d',
                locale: `en`
            }
        });
  return response.data;
    } catch (error) {
        console.error('Error fetching top coins:', error);
        return [];
    }
};

