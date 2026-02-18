from marshmallow import Schema, fields, validate
from app.extensions import ma
from app.models import User


class UserProfileSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True
    
    id = fields.Int(dump_only=True)
    username = fields.Str(validate=validate.Length(min=3, max=100))
    email = fields.Email()
    cash_balance = fields.Float(dump_only=True)
    is_active = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    last_login = fields.DateTime(dump_only=True, allow_none=True)


class UpdateProfileSchema(Schema):
    username = fields.Str(allow_none=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(allow_none=True)


class ChangePasswordSchema(Schema):
    current_password = fields.Str(required=True, validate=validate.Length(min=8))
    new_password = fields.Str(required=True, validate=validate.Length(min=8))
    confirm_password = fields.Str(required=True, validate=validate.Length(min=8))
    
    def load(self, *args, **kwargs):
        data = super().load(*args, **kwargs)
        if data.get('new_password') != data.get('confirm_password'):
            raise ValueError("Passwords do not match")
        return data


class ResetBalanceSchema(Schema):
    confirm = fields.Bool(required=True)


class DeleteAccountSchema(Schema):
    password = fields.Str(required=True, validate=validate.Length(min=8))
    confirm = fields.Bool(required=True)


class SettingsSummarySchema(Schema):
    profile = fields.Dict()
    account = fields.Dict()
    trading = fields.Dict()


user_profile_schema = UserProfileSchema()
update_profile_schema = UpdateProfileSchema()
change_password_schema = ChangePasswordSchema()
reset_balance_schema = ResetBalanceSchema()
delete_account_schema = DeleteAccountSchema()
settings_summary_schema = SettingsSummarySchema()
