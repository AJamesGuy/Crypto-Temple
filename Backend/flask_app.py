from app.models import db
from app import create_app
from app.scheduler import start_scheduler

app = create_app('ProductionConfig')

with app.app_context():
    # db.drop_all()
    db.create_all()
    start_scheduler(app)  # Start the background scheduler for market data updates