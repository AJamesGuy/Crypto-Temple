from marshmallow import fields
from app.extensions import ma
from app.models import User

class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
    

login_schema = UserSchema(exclude=['created_at', 'last_login', 'is_active'])