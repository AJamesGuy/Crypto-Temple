from apscheduler.schedulers.background import BackgroundScheduler
from .services.coingecko_service import update_market_data
import logging
from apscheduler.events import EVENT_JOB_ERROR, EVENT_JOB_EXECUTED

logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def start_scheduler(app):
    """Initialize and start the background scheduler for market data updates"""
    
    # Add job to update market data every 15 minutes
    # scheduler.add_job(
    #     func=update_market_data,
    #     trigger="interval",
    #     minutes=1,
    #     id="update_market_data",
    #     name="Update CoinGecko Market Data",
    #     replace_existing=True,
    #     kwargs={'limit': 200}
    # )

    # def handle_job_error(event):
    #     if event.exception:
    #         logger.error(f"Error in scheduled job '{event.job_id}': {event.exception}")
    #     else:
    #         logger.info(f"Scheduled job '{event.job_id}' completed successfully")
    
    # scheduler.add_listener(handle_job_error, EVENT_JOB_ERROR | EVENT_JOB_EXECUTED)
    # scheduler.start()

    update_market_data(limit=200)
    logger.info("Background scheduler started - market data will update every 15 minutes")