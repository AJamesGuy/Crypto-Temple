"""
Admin management endpoints for data updates and maintenance
"""

from flask import Blueprint, jsonify, request
from app.extensions import limiter
from app.services.coingecko_service import update_market_data, search_cryptos, get_crypto_data, get_top_gainers, get_top_losers
from app.util.auth import token_required
from datetime import datetime
import logging
from . import admin_bp

logger = logging.getLogger(__name__)


@admin_bp.route('/update-market-data', methods=['POST'])
@limiter.limit("5 per hour")
@token_required
def admin_update_market_data(user_id):
    """
    Update cryptocurrency market data from CoinGecko
    Limited to 5 updates per hour
    """
    try:
        # Get optional parameters
        limit = request.args.get('limit', 100, type=int)
        currency = request.args.get('currency', 'usd', type=str)
        
        # Validate parameters
        if limit < 1 or limit > 250:
            return jsonify({"message": "Limit must be between 1 and 250"}), 400
        
        logger.info(f"User {user_id} triggered market data update (limit: {limit})")
        
        # Fetch and update data
        result = update_market_data(limit=limit, vs_currency=currency)
        
        return jsonify({
            "status": result['status'],
            "message": result['message'],
            "updated_at": datetime.utcnow().isoformat(),
            "total_updated": result.get('total_updated', 0)
        }), 200 if result['status'] == 'success' else 500
    
    except Exception as e:
        logger.error(f"Error updating market data: {str(e)}")
        return jsonify({
            "message": "Error updating market data",
            "error": str(e)
        }), 500


@admin_bp.route('/cryptos/search', methods=['GET'])
@limiter.limit("30 per minute")
@token_required
def admin_search_crypto(user_id):
    """Search cryptocurrencies"""
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', 10, type=int)
    
    if not query:
        return jsonify({"message": "Search query is required"}), 400
    
    if len(query) < 1:
        return jsonify({"message": "Search query must be at least 1 character"}), 400
    
    results = search_cryptos(query, limit=min(limit, 50))
    
    return jsonify({
        "query": query,
        "results_count": len(results),
        "results": results
    }), 200


@admin_bp.route('/cryptos/<int:crypto_id>', methods=['GET'])
@limiter.limit("30 per minute")
@token_required
def admin_get_crypto(user_id, crypto_id):
    """Get specific cryptocurrency data"""
    crypto = get_crypto_data(crypto_id)
    
    if not crypto:
        return jsonify({"message": "Cryptocurrency not found"}), 404
    
    return jsonify(crypto), 200


@admin_bp.route('/cryptos/gainers', methods=['GET'])
@limiter.limit("20 per minute")
@token_required
def admin_get_gainers(user_id):
    """Get top gaining cryptocurrencies"""
    limit = request.args.get('limit', 10, type=int)
    
    gainers = get_top_gainers(limit=min(limit, 50))
    
    return jsonify({
        "type": "gainers",
        "count": len(gainers),
        "data": gainers
    }), 200


@admin_bp.route('/cryptos/losers', methods=['GET'])
@limiter.limit("20 per minute")
@token_required
def admin_get_losers(user_id):
    """Get top losing cryptocurrencies"""
    limit = request.args.get('limit', 10, type=int)
    
    losers = get_top_losers(limit=min(limit, 50))
    
    return jsonify({
        "type": "losers",
        "count": len(losers),
        "data": losers
    }), 200


@admin_bp.route('/system/stats', methods=['GET'])
@limiter.limit("10 per minute")
@token_required
def admin_get_stats(user_id):
    """Get system statistics"""
    from app.models import Cryptocurrency, User, Order, Portfolio
    
    try:
        total_cryptos = Cryptocurrency.query.count()
        total_users = User.query.count()
        total_orders = Order.query.count()
        total_portfolios = Portfolio.query.count()
        
        return jsonify({
            "statistics": {
                "total_cryptocurrencies": total_cryptos,
                "total_users": total_users,
                "total_orders": total_orders,
                "total_portfolios": total_portfolios
            },
            "timestamp": datetime.utcnow().isoformat()
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting system stats: {str(e)}")
        return jsonify({"message": "Error retrieving statistics"}), 500