from marshmallow import Schema, fields, validate
from app.extensions import ma
from app.models import Cryptocurrency, MarketData, CryptoMarket


class CryptoSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Cryptocurrency
        load_instance = True
    
    id = fields.Int(dump_only=True)
    symbol = fields.Str()
    description = fields.Str()
    is_active = fields.Bool()
    created_at = fields.DateTime()


class MarketDataSchema(ma.SQLAlchemySchema):
    class Meta:
        model = MarketData
        load_instance = True
    
    id = fields.Int(dump_only=True)
    crypto_id = fields.Int()
    timestamp = fields.DateTime()
    price = fields.Float()
    open = fields.Float(allow_none=True)
    high = fields.Float(allow_none=True)
    low = fields.Float(allow_none=True)
    close = fields.Float(allow_none=True)
    volume = fields.Float(allow_none=True)
    market_cap = fields.Float(allow_none=True)
    change_24h = fields.Float(allow_none=True)
    change_7d = fields.Float(allow_none=True)


class CryptoMarketSchema(ma.SQLAlchemySchema):
    class Meta:
        model = CryptoMarket
        load_instance = True
    
    id = fields.Str(dump_only=True)
    symbol = fields.Str()
    name = fields.Str()
    image = fields.Str(allow_none=True)
    current_price = fields.Float(allow_none=True)
    market_cap = fields.Float(allow_none=True)
    market_cap_rank = fields.Int(allow_none=True)
    total_volume = fields.Float(allow_none=True)
    high_24h = fields.Float(allow_none=True)
    low_24h = fields.Float(allow_none=True)
    price_change_24h = fields.Float(allow_none=True)
    price_change_percentage_24h = fields.Float(allow_none=True)
    circulating_supply = fields.Float(allow_none=True)
    total_supply = fields.Float(allow_none=True)
    ath = fields.Float(allow_none=True)
    ath_date = fields.DateTime(allow_none=True)
    last_updated = fields.DateTime()


class SearchQuerySchema(Schema):
    q = fields.Str(required=True, validate=validate.Length(min=1))
    limit = fields.Int(missing=10, validate=validate.Range(min=1, max=50))


crypto_schema = CryptoSchema()
cryptos_schema = CryptoSchema(many=True)
market_data_schema = MarketDataSchema()
market_data_list_schema = MarketDataSchema(many=True)
crypto_market_schema = CryptoMarketSchema()
crypto_markets_schema = CryptoMarketSchema(many=True)
search_query_schema = SearchQuerySchema()
