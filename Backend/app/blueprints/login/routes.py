#CRUD operations for user login and registration

from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, db
from app.blueprints.login import login_bp

