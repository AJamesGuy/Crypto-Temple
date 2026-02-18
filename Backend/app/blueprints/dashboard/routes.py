from flask import request, jsonify
from app.extensions import limiter, cache
from marshmallow import ValidationError
from . import dashboard_bp
from app.models import db, Cryptocurrency, MarketData, User
from .schemas import crypto_schema, cryptos_schema, market_data_schema, market_data_list_schema
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from app.util.auth import encode_token, token_required


# Get all cryptocurrencies
@dashboard_bp.route('/cryptos', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=300)  # Cache for 5 minutes
@token_required
def get_cryptos(user_id):
    """Get all available cryptocurrencies"""
    cryptos = Cryptocurrency.query.filter_by(is_active=True).all()
    return jsonify([{
        "id": c.id,
        "symbol": c.symbol,
        "description": c.description,
        "is_active": c.is_active
    } for c in cryptos]), 200


# Get market data for all cryptocurrencies
@dashboard_bp.route('/market-data', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=60)  # Cache for 1 minute
@token_required
def get_market_data(user_id):
    """Get latest market data for all cryptocurrencies"""
    market_data = db.session.query(MarketData).order_by(MarketData.timestamp.desc()).all()
    
    # Group by crypto_id to get latest for each
    latest_data = {}
    for data in market_data:
        if data.crypto_id not in latest_data:
            latest_data[data.crypto_id] = data
    
    return jsonify([{
        "crypto_id": md.crypto_id,
        "price": float(md.price),
        "high": float(md.high) if md.high else None,
        "low": float(md.low) if md.low else None,
        "volume": float(md.volume) if md.volume else None,
        "market_cap": float(md.market_cap) if md.market_cap else None,
        "change_24h": float(md.change_24h) if md.change_24h else None,
        "change_7d": float(md.change_7d) if md.change_7d else None,
        "timestamp": md.timestamp.isoformat()
    } for md in latest_data.values()]), 200


# Search cryptocurrencies
@dashboard_bp.route('/search', methods=['GET'])
@limiter.limit("20 per minute")
@cache.cached(timeout=300)
@token_required
def search_cryptos(user_id):
    """Search cryptocurrencies by symbol or name"""
    query = request.args.get('q', '').lower()
    
    if not query or len(query) < 1:
        return jsonify({"message": "Search query must be at least 1 character"}), 400
    
    cryptos = Cryptocurrency.query.filter_by(is_active=True).filter(
        Cryptocurrency.symbol.ilike(f"%{query}%")
    ).all()
    
    return jsonify([{
        "id": c.id,
        "symbol": c.symbol,
        "description": c.description
    } for c in cryptos]), 200


# Get market data for specific cryptocurrency
@dashboard_bp.route('/market-data/<int:crypto_id>', methods=['GET'])
@limiter.limit("20 per minute")
@cache.cached(timeout=60)
@token_required
def get_crypto_market_data(user_id, crypto_id):
    """Get market data for a specific cryptocurrency"""
    crypto = Cryptocurrency.query.get(crypto_id)
    if not crypto:
        return jsonify({"message": "Cryptocurrency not found"}), 404
    
    market_data = MarketData.query.filter_by(crypto_id=crypto_id).order_by(
        MarketData.timestamp.desc()
    ).first()
    
    if not market_data:
        return jsonify({"message": "Market data not available"}), 404
    
    return jsonify({
        "crypto_id": market_data.crypto_id,
        "symbol": crypto.symbol,
        "price": float(market_data.price),
        "open": float(market_data.open) if market_data.open else None,
        "high": float(market_data.high) if market_data.high else None,
        "low": float(market_data.low) if market_data.low else None,
        "close": float(market_data.close) if market_data.close else None,
        "volume": float(market_data.volume) if market_data.volume else None,
        "market_cap": float(market_data.market_cap) if market_data.market_cap else None,
        "change_24h": float(market_data.change_24h) if market_data.change_24h else None,
        "change_7d": float(market_data.change_7d) if market_data.change_7d else None,
        "timestamp": market_data.timestamp.isoformat()
    }), 200


# Get user's current cash balance
@dashboard_bp.route('/cash-balance', methods=['GET'])
@limiter.limit("30 per minute")
@token_required
def get_cash_balance(user_id):
    """Get user's cash balance"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    return jsonify({
        "cash_balance": float(user.cash_balance),
        "user_id": user_id
    }), 200
