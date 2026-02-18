from flask import Flask
from .blueprints import login_bp, dashboard_bp, portfolio_bp, trade_bp, settings_bp, admin_bp
from .extensions import ma, limiter, cache
from .models import db

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
    app.register_blueprint(login_bp, url_prefix="/auth")
    app.register_blueprint(dashboard_bp, url_prefix="/dash")
    app.register_blueprint(trade_bp, url_prefix="/trade")
    app.register_blueprint(portfolio_bp, url_prefix="/portfolio")
    app.register_blueprint(settings_bp, url_prefix="/settings")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    return app
