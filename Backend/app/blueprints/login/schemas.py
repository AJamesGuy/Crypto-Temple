from marshmallow import Schema, fields, validate, post_load
from app.extensions import ma
from app.models import User


class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True
    
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8), load_only=True)
    cash_balance = fields.Float(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    last_login = fields.DateTime(dump_only=True)
    is_active = fields.Bool(dump_only=True)


class LoginSchema(Schema):
    username = fields.Str(allow_none=True)
    email = fields.Email(allow_none=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))


class SignupSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    password_confirm = fields.Str(required=True, validate=validate.Length(min=8))
    
    @post_load
    def validate_passwords(self, data, **kwargs):
        if data['password'] != data['password_confirm']:
            raise ValueError("Passwords do not match")
        return data


user_schema = UserSchema()
users_schema = UserSchema(many=True)
login_schema = LoginSchema()
signup_schema = SignupSchema()