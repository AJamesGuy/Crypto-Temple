"""
CoinGecko API Service
Fetches cryptocurrency market data from CoinGecko API and upserts to database
"""

from pycoingecko import CoinGecko
from app.models import db, CryptoMarket
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

cg = CoinGecko()


def update_crypto_data(vs_currency='usd', per_page=100, page=1):
    """
    Fetch cryptocurrency market data from CoinGecko API and upsert to database
    
    Args:
        vs_currency (str): Target currency (default: 'usd')
        per_page (int): Number of cryptocurrencies to fetch per page (default: 100, max: 250)
        page (int): Page number (default: 1)
    
    Returns:
        dict: Status information about the update operation
    """
    try:
        logger.info(f"Fetching cryptocurrency data from CoinGecko (page {page})...")
        
        # Fetch data from CoinGecko
        data = cg.get_markets(
            vs_currency=vs_currency,
            order='market_cap_desc',
            per_page=per_page,
            page=page,
            sparkline=False,
            locale='en'
        )
        
        if not data:
            logger.warning("No data returned from CoinGecko API")
            return {
                "status": "error",
                "message": "No data returned from CoinGecko API",
                "updated_count": 0
            }
        
        updated_count = 0
        error_count = 0
        
        # Upsert data into database
        for item in data:
            try:
                # Parse dates
                ath_date = None
                if item.get('ath_date'):
                    try:
                        ath_date_str = item['ath_date']
                        # Handle ISO format with Z or timezone
                        if isinstance(ath_date_str, str):
                            ath_date_str = ath_date_str.replace('Z', '+00:00')
                            ath_date = datetime.fromisoformat(ath_date_str)
                    except (ValueError, TypeError):
                        ath_date = None
                
                # Check if cryptocurrency exists
                crypto = CryptoMarket.query.get(item['id'])
                
                if not crypto:
                    crypto = CryptoMarket(id=item['id'])
                
                # Update/set all fields
                crypto.symbol = item.get('symbol', '').upper()
                crypto.name = item.get('name', '')
                crypto.image = item.get('image', '')
                crypto.current_price = item.get('current_price')
                crypto.market_cap = item.get('market_cap')
                crypto.market_cap_rank = item.get('market_cap_rank')
                crypto.total_volume = item.get('total_volume')
                crypto.high_24h = item.get('high_24h')
                crypto.low_24h = item.get('low_24h')
                crypto.price_change_24h = item.get('price_change_24h')
                crypto.price_change_percentage_24h = item.get('price_change_percentage_24h')
                crypto.circulating_supply = item.get('circulating_supply')
                crypto.total_supply = item.get('total_supply')
                crypto.ath = item.get('ath')
                crypto.ath_date = ath_date
                crypto.last_updated = datetime.utcnow()
                
                db.session.add(crypto)
                updated_count += 1
                
            except Exception as e:
                error_count += 1
                logger.error(f"Error processing cryptocurrency {item.get('id', 'unknown')}: {str(e)}")
        
        # Commit all changes
        db.session.commit()
        
        logger.info(f"Successfully updated {updated_count} cryptocurrencies with {error_count} errors")
        
        return {
            "status": "success",
            "message": f"Updated {updated_count} cryptocurrencies",
            "updated_count": updated_count,
            "error_count": error_count
        }
    
    except Exception as e:
        logger.error(f"Error updating crypto data: {str(e)}")
        return {
            "status": "error",
            "message": f"Error updating crypto data: {str(e)}",
            "updated_count": 0
        }


def get_top_cryptos(limit=100, vs_currency='usd'):
    """
    Get top cryptocurrencies by market cap from CoinGecko
    
    Args:
        limit (int): Number of cryptocurrencies to fetch (max 250 per request)
        vs_currency (str): Target currency
    
    Returns:
        dict: Status and cryptocurrency data
    """
    try:
        total_updated = 0
        pages_needed = (limit + 99) // 100  # Calculate number of pages needed
        
        for page in range(1, pages_needed + 1):
            per_page = min(100, limit - (page - 1) * 100)
            result = update_crypto_data(vs_currency=vs_currency, per_page=per_page, page=page)
            
            if result['status'] == 'success':
                total_updated += result['updated_count']
            else:
                logger.warning(f"Error fetching page {page}: {result['message']}")
        
        return {
            "status": "success",
            "message": f"Fetched and updated {total_updated} cryptocurrencies",
            "total_updated": total_updated
        }
    
    except Exception as e:
        logger.error(f"Error fetching top cryptos: {str(e)}")
        return {
            "status": "error",
            "message": f"Error fetching top cryptos: {str(e)}"
        }


def get_crypto_by_id(crypto_id):
    """
    Get specific cryptocurrency market data from database
    
    Args:
        crypto_id (str): CoinGecko cryptocurrency ID
    
    Returns:
        dict: Cryptocurrency market data or None if not found
    """
    crypto = CryptoMarket.query.get(crypto_id)
    
    if not crypto:
        return None
    
    return {
        "id": crypto.id,
        "symbol": crypto.symbol,
        "name": crypto.name,
        "image": crypto.image,
        "current_price": float(crypto.current_price) if crypto.current_price else None,
        "market_cap": float(crypto.market_cap) if crypto.market_cap else None,
        "market_cap_rank": crypto.market_cap_rank,
        "total_volume": float(crypto.total_volume) if crypto.total_volume else None,
        "high_24h": float(crypto.high_24h) if crypto.high_24h else None,
        "low_24h": float(crypto.low_24h) if crypto.low_24h else None,
        "price_change_24h": float(crypto.price_change_24h) if crypto.price_change_24h else None,
        "price_change_percentage_24h": float(crypto.price_change_percentage_24h) if crypto.price_change_percentage_24h else None,
        "circulating_supply": float(crypto.circulating_supply) if crypto.circulating_supply else None,
        "total_supply": float(crypto.total_supply) if crypto.total_supply else None,
        "ath": float(crypto.ath) if crypto.ath else None,
        "ath_date": crypto.ath_date.isoformat() if crypto.ath_date else None,
        "last_updated": crypto.last_updated.isoformat()
    }


def search_cryptos(query, limit=10):
    """
    Search cryptocurrencies by symbol or name
    
    Args:
        query (str): Search query
        limit (int): Max results to return
    
    Returns:
        list: List of matching cryptocurrencies
    """
    search_term = f"%{query.lower()}%"
    cryptos = CryptoMarket.query.filter(
        (CryptoMarket.symbol.ilike(search_term)) | 
        (CryptoMarket.name.ilike(search_term))
    ).limit(limit).all()
    
    return [{
        "id": crypto.id,
        "symbol": crypto.symbol,
        "name": crypto.name,
        "image": crypto.image,
        "current_price": float(crypto.current_price) if crypto.current_price else None,
        "market_cap_rank": crypto.market_cap_rank
    } for crypto in cryptos]


def get_top_gainers(limit=10):
    """
    Get top gaining cryptocurrencies (highest positive change in 24h)
    
    Args:
        limit (int): Max results to return
    
    Returns:
        list: Top gaining cryptocurrencies
    """
    cryptos = CryptoMarket.query.filter(
        CryptoMarket.price_change_percentage_24h.isnot(None)
    ).order_by(
        CryptoMarket.price_change_percentage_24h.desc()
    ).limit(limit).all()
    
    return [{
        "id": crypto.id,
        "symbol": crypto.symbol,
        "name": crypto.name,
        "current_price": float(crypto.current_price) if crypto.current_price else None,
        "price_change_percentage_24h": float(crypto.price_change_percentage_24h) if crypto.price_change_percentage_24h else None
    } for crypto in cryptos]


def get_top_losers(limit=10):
    """
    Get top losing cryptocurrencies (highest negative change in 24h)
    
    Args:
        limit (int): Max results to return
    
    Returns:
        list: Top losing cryptocurrencies
    """
    cryptos = CryptoMarket.query.filter(
        CryptoMarket.price_change_percentage_24h.isnot(None)
    ).order_by(
        CryptoMarket.price_change_percentage_24h.asc()
    ).limit(limit).all()
    
    return [{
        "id": crypto.id,
        "symbol": crypto.symbol,
        "name": crypto.name,
        "current_price": float(crypto.current_price) if crypto.current_price else None,
        "price_change_percentage_24h": float(crypto.price_change_percentage_24h) if crypto.price_change_percentage_24h else None
    } for crypto in cryptos]