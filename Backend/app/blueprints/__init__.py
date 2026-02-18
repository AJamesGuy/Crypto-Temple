# app/blueprints/__init__.py  (optional — nice for cleaner imports elsewhere)
from .login import login_bp
from .dashboard import dashboard_bp
from .portfolio import portfolio_bp
from .trade import trade_bp
from .settings import settings_bp
from .admin import admin_bp

__all__ = [
    'login_bp',
    'dashboard_bp',
    'portfolio_bp',
    'trade_bp',
    'settings_bp',
    'admin_bp',
]