from flask import request, jsonify
from app.extensions import limiter, cache
from marshmallow import ValidationError
from . import trade_bp
from app.models import db, Order, User, Cryptocurrency, MarketData, PortfolioAsset, Portfolio
from datetime import datetime
from app.util.auth import token_required


# Place a new order (buy or sell)
@trade_bp.route('/order', methods=['POST'])
@limiter.limit("20 per minute")
@token_required
def place_order(user_id):
    """Place a buy or sell order"""
    try:
        data = request.get_json()
    except:
        return jsonify({"message": "Invalid JSON"}), 400
    
    # Validate required fields
    required_fields = ['crypto_id', 'order_type', 'quantity']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400
    
    # Validate order type
    if data['order_type'] not in ['buy', 'sell']:
        return jsonify({"message": "Order type must be 'buy' or 'sell'"}), 400
    
    try:
        crypto_id = int(data['crypto_id'])
        order_type = data['order_type'].lower()
        quantity = float(data['quantity'])
    except ValueError:
        return jsonify({"message": "Invalid data types"}), 400
    
    if quantity <= 0:
        return jsonify({"message": "Quantity must be greater than 0"}), 400
    
    # Check if cryptocurrency exists
    crypto = Cryptocurrency.query.get(crypto_id)
    if not crypto:
        return jsonify({"message": "Cryptocurrency not found"}), 404
    
    # Get latest market price
    market_data = MarketData.query.filter_by(crypto_id=crypto_id).order_by(
        MarketData.timestamp.desc()
    ).first()
    
    if not market_data:
        return jsonify({"message": "Market data not available for this cryptocurrency"}), 404
    
    price = float(market_data.price)
    total_value = quantity * price
    user = User.query.get(user_id)
    
    if order_type == 'buy':
        # Check if user has enough cash balance
        if user.cash_balance < total_value:
            return jsonify({
                "message": "Insufficient cash balance",
                "required": total_value,
                "available": float(user.cash_balance)
            }), 400
        
        # Deduct cash balance
        user.cash_balance -= total_value
    
    elif order_type == 'sell':
        # Check if user owns the cryptocurrency
        portfolio = Portfolio.query.filter_by(user_id=user_id).first()
        if not portfolio:
            return jsonify({"message": "Portfolio not found"}), 404
        
        portfolio_asset = PortfolioAsset.query.filter_by(
            portfolio_id=portfolio.portfolio_id,
            crypto_id=crypto_id
        ).first()
        
        if not portfolio_asset or portfolio_asset.quantity < quantity:
            available = portfolio_asset.quantity if portfolio_asset else 0
            return jsonify({
                "message": "Insufficient cryptocurrency holdings",
                "requested": quantity,
                "available": float(available)
            }), 400
        
        # Add cash balance from sale
        user.cash_balance += total_value
    
    # Create order
    new_order = Order(
        user_id=user_id,
        crypto_id=crypto_id,
        order_type=order_type,
        price=price,
        quantity=quantity,
        total_value=total_value,
        status='pending'
    )
    
    db.session.add(new_order)
    db.session.commit()
    
    return jsonify({
        "message": "Order placed successfully",
        "order": {
            "id": new_order.id,
            "type": new_order.order_type,
            "symbol": crypto.symbol,
            "quantity": float(new_order.quantity),
            "price": float(new_order.price),
            "total_value": float(new_order.total_value),
            "status": new_order.status,
            "created_at": new_order.created_at.isoformat()
        },
        "new_cash_balance": float(user.cash_balance)
    }), 201


# Execute an order
@trade_bp.route('/order/<int:order_id>/execute', methods=['POST'])
@limiter.limit("20 per minute")
@token_required
def execute_order(user_id, order_id):
    """Execute a pending order"""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    if order.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    if order.status != 'pending':
        return jsonify({"message": f"Order is already {order.status}"}), 400
    
    # Get or create portfolio asset
    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return jsonify({"message": "Portfolio not found"}), 404
    
    portfolio_asset = PortfolioAsset.query.filter_by(
        portfolio_id=portfolio.portfolio_id,
        crypto_id=order.crypto_id
    ).first()
    
    if order.order_type == 'buy':
        if portfolio_asset:
            # Update existing holding
            total_cost = (portfolio_asset.quantity * portfolio_asset.avg_buy_price) + order.total_value
            portfolio_asset.quantity += order.quantity
            portfolio_asset.avg_buy_price = total_cost / portfolio_asset.quantity
            portfolio_asset.current_value = portfolio_asset.quantity * float(order.price)
        else:
            # Create new holding
            portfolio_asset = PortfolioAsset(
                portfolio_id=portfolio.portfolio_id,
                crypto_id=order.crypto_id,
                quantity=order.quantity,
                avg_buy_price=order.price,
                current_value=order.total_value
            )
            db.session.add(portfolio_asset)
    
    elif order.order_type == 'sell':
        if portfolio_asset:
            portfolio_asset.quantity -= order.quantity
            if portfolio_asset.quantity > 0:
                portfolio_asset.current_value = portfolio_asset.quantity * float(order.price)
            else:
                db.session.delete(portfolio_asset)
    
    # Update portfolio total value
    total_portfolio_value = sum(
        float(asset.current_value) for asset in PortfolioAsset.query.filter_by(
            portfolio_id=portfolio.portfolio_id
        ).all()
    )
    portfolio.total_value = total_portfolio_value + float(User.query.get(user_id).cash_balance)
    
    # Mark order as completed
    order.status = 'completed'
    order.executed_at = datetime.utcnow()
    
    db.session.commit()
    
    return jsonify({
        "message": "Order executed successfully",
        "order": {
            "id": order.id,
            "status": order.status,
            "executed_at": order.executed_at.isoformat()
        }
    }), 200


# Get user's orders
@trade_bp.route('/orders', methods=['GET'])
@limiter.limit("20 per minute")
@token_required
def get_orders(user_id):
    """Get all orders for the user"""
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    
    return jsonify([{
        "id": order.id,
        "crypto_id": order.crypto_id,
        "symbol": Cryptocurrency.query.get(order.crypto_id).symbol,
        "type": order.order_type,
        "quantity": float(order.quantity),
        "price": float(order.price),
        "total_value": float(order.total_value),
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "executed_at": order.executed_at.isoformat() if order.executed_at else None
    } for order in orders]), 200


# Get specific order
@trade_bp.route('/order/<int:order_id>', methods=['GET'])
@limiter.limit("20 per minute")
@token_required
def get_order(user_id, order_id):
    """Get details of a specific order"""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    if order.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    crypto = Cryptocurrency.query.get(order.crypto_id)
    
    return jsonify({
        "id": order.id,
        "crypto_id": order.crypto_id,
        "symbol": crypto.symbol,
        "type": order.order_type,
        "quantity": float(order.quantity),
        "price": float(order.price),
        "total_value": float(order.total_value),
        "status": order.status,
        "created_at": order.created_at.isoformat(),
        "executed_at": order.executed_at.isoformat() if order.executed_at else None
    }), 200


# Cancel order
@trade_bp.route('/order/<int:order_id>/cancel', methods=['POST'])
@limiter.limit("20 per minute")
@token_required
def cancel_order(user_id, order_id):
    """Cancel a pending order"""
    order = Order.query.get(order_id)
    
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    if order.user_id != user_id:
        return jsonify({"message": "Unauthorized"}), 403
    
    if order.status != 'pending':
        return jsonify({"message": f"Cannot cancel a {order.status} order"}), 400
    
    # Refund cash balance if it was a buy order
    if order.order_type == 'buy':
        user = User.query.get(user_id)
        user.cash_balance += order.total_value
    
    order.status = 'cancelled'
    db.session.commit()
    
    return jsonify({"message": "Order cancelled successfully"}), 200
