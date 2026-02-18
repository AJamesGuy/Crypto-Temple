from flask import request, jsonify
from app.extensions import limiter, cache
from . import portfolio_bp
from app.models import db, Portfolio, PortfolioAsset, User, Cryptocurrency, MarketData
from app.util.auth import token_required


# Get user's portfolio
@portfolio_bp.route('/', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=60)
@token_required
def get_portfolio(user_id):
    """Get user's portfolio with all holdings"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return jsonify({"message": "Portfolio not found"}), 404
    
    # Get all assets in portfolio
    assets = PortfolioAsset.query.filter_by(portfolio_id=portfolio.portfolio_id).all()
    
    assets_data = []
    total_invested = 0
    total_current_value = 0
    
    for asset in assets:
        crypto = Cryptocurrency.query.get(asset.crypto_id)
        market_data = MarketData.query.filter_by(crypto_id=asset.crypto_id).order_by(
            MarketData.timestamp.desc()
        ).first()
        
        current_price = float(market_data.price) if market_data else 0
        current_value = asset.quantity * current_price
        invested_value = asset.quantity * asset.avg_buy_price
        gain_loss = current_value - invested_value
        gain_loss_percent = (gain_loss / invested_value * 100) if invested_value > 0 else 0
        
        total_invested += invested_value
        total_current_value += current_value
        
        assets_data.append({
            "id": asset.id,
            "crypto_id": asset.crypto_id,
            "symbol": crypto.symbol,
            "quantity": float(asset.quantity),
            "avg_buy_price": float(asset.avg_buy_price),
            "current_price": current_price,
            "invested_value": invested_value,
            "current_value": current_value,
            "gain_loss": gain_loss,
            "gain_loss_percent": gain_loss_percent
        })
    
    total_cash = float(user.cash_balance)
    total_portfolio_value = total_current_value + total_cash
    
    return jsonify({
        "portfolio_id": portfolio.portfolio_id,
        "assets": assets_data,
        "cash_balance": total_cash,
        "total_invested": total_invested,
        "total_current_value": total_current_value,
        "total_portfolio_value": total_portfolio_value,
        "overall_gain_loss": total_current_value - total_invested,
        "overall_gain_loss_percent": ((total_current_value - total_invested) / total_invested * 100) if total_invested > 0 else 0
    }), 200


# Get portfolio holdings (just the assets)
@portfolio_bp.route('/holdings', methods=['GET'])
@limiter.limit("30 per minute")
@cache.cached(timeout=60)
@token_required
def get_holdings(user_id):
    """Get user's cryptocurrency holdings"""
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return jsonify({"message": "Portfolio not found"}), 404
    
    assets = PortfolioAsset.query.filter_by(portfolio_id=portfolio.portfolio_id).all()
    
    holdings = []
    for asset in assets:
        crypto = Cryptocurrency.query.get(asset.crypto_id)
        market_data = MarketData.query.filter_by(crypto_id=asset.crypto_id).order_by(
            MarketData.timestamp.desc()
        ).first()
        
        current_price = float(market_data.price) if market_data else 0
        current_value = asset.quantity * current_price
        
        holdings.append({
            "id": asset.id,
            "symbol": crypto.symbol,
            "quantity": float(asset.quantity),
            "current_price": current_price,
            "current_value": current_value
        })
    
    return jsonify(holdings), 200


# Get portfolio performance chart data
@portfolio_bp.route('/performance', methods=['GET'])
@limiter.limit("20 per minute")
@cache.cached(timeout=300)
@token_required
def get_portfolio_performance(user_id):
    """Get portfolio performance data for charts"""
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return jsonify({"message": "Portfolio not found"}), 404
    
    assets = PortfolioAsset.query.filter_by(portfolio_id=portfolio.portfolio_id).all()
    
    performance_data = []
    total_value = 0
    
    for asset in assets:
        crypto = Cryptocurrency.query.get(asset.crypto_id)
        market_data = MarketData.query.filter_by(crypto_id=asset.crypto_id).order_by(
            MarketData.timestamp.desc()
        ).first()
        
        current_price = float(market_data.price) if market_data else 0
        current_value = asset.quantity * current_price
        total_value += current_value
        
        performance_data.append({
            "symbol": crypto.symbol,
            "value": current_value,
            "quantity": float(asset.quantity),
            "percentage": 0  # Will be calculated below
        })
    
    # Calculate percentages
    if total_value > 0:
        for data in performance_data:
            data['percentage'] = (data['value'] / total_value) * 100
    
    return jsonify({
        "total_value": total_value,
        "assets": performance_data
    }), 200


# Get asset breakdown (allocation)
@portfolio_bp.route('/breakdown', methods=['GET'])
@limiter.limit("20 per minute")
@cache.cached(timeout=300)
@token_required
def get_asset_breakdown(user_id):
    """Get portfolio asset breakdown by allocation"""
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return jsonify({"message": "Portfolio not found"}), 404
    
    user = User.query.get(user_id)
    assets = PortfolioAsset.query.filter_by(portfolio_id=portfolio.portfolio_id).all()
    
    breakdown = []
    total_value = 0
    
    # Add crypto holdings
    for asset in assets:
        crypto = Cryptocurrency.query.get(asset.crypto_id)
        market_data = MarketData.query.filter_by(crypto_id=asset.crypto_id).order_by(
            MarketData.timestamp.desc()
        ).first()
        
        current_price = float(market_data.price) if market_data else 0
        current_value = asset.quantity * current_price
        total_value += current_value
        
        breakdown.append({
            "type": "crypto",
            "symbol": crypto.symbol,
            "value": current_value
        })
    
    # Add cash
    cash_value = float(user.cash_balance)
    total_value += cash_value
    breakdown.append({
        "type": "cash",
        "symbol": "USD",
        "value": cash_value
    })
    
    # Calculate percentages
    for item in breakdown:
        item['percentage'] = (item['value'] / total_value * 100) if total_value > 0 else 0
    
    return jsonify({
        "total_value": total_value,
        "breakdown": breakdown
    }), 200


# Get specific asset details
@portfolio_bp.route('/asset/<int:asset_id>', methods=['GET'])
@limiter.limit("20 per minute")
@token_required
def get_asset(user_id, asset_id):
    """Get details of a specific portfolio asset"""
    asset = PortfolioAsset.query.get(asset_id)
    if not asset:
        return jsonify({"message": "Asset not found"}), 404
    
    # Check if asset belongs to user's portfolio
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio or asset.portfolio_id != portfolio.portfolio_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    crypto = Cryptocurrency.query.get(asset.crypto_id)
    market_data = MarketData.query.filter_by(crypto_id=asset.crypto_id).order_by(
        MarketData.timestamp.desc()
    ).first()
    
    current_price = float(market_data.price) if market_data else 0
    current_value = asset.quantity * current_price
    invested_value = asset.quantity * asset.avg_buy_price
    gain_loss = current_value - invested_value
    gain_loss_percent = (gain_loss / invested_value * 100) if invested_value > 0 else 0
    
    return jsonify({
        "id": asset.id,
        "symbol": crypto.symbol,
        "quantity": float(asset.quantity),
        "avg_buy_price": float(asset.avg_buy_price),
        "current_price": current_price,
        "invested_value": invested_value,
        "current_value": current_value,
        "gain_loss": gain_loss,
        "gain_loss_percent": gain_loss_percent
    }), 200
