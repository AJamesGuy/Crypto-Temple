from flask import Flask
from app.models import db
from app.extensions import ma, limiter, cache

# Import blueprints
from app.blueprints.auth import auth_bp
from app.blueprints.dashboard import dashboard_bp
from app.blueprints.trade import trade_bp
from app.blueprints.portfolio import portfolio_bp
from app.blueprints.settings import settings_bp

def create_app(config_name):
    """
    Flask app factory
    """
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name}')

    # Initialize extensions
    db.init_app(app)
    ma.init_app(app)
    limiter.init_app(app)
    cache.init_app(app)

    # Register blueprints with URL prefixes
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(trade_bp, url_prefix="/api/trade")
    app.register_blueprint(portfolio_bp, url_prefix="/api/portfolio")
    app.register_blueprint(settings_bp, url_prefix="/api/settings")

    return app
