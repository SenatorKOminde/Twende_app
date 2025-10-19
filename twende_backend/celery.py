import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'twende_backend.settings')

app = Celery('twende_backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat schedule for periodic tasks
app.conf.beat_schedule = {
    'send-booking-reminders': {
        'task': 'notifications.tasks.send_booking_reminders',
        'schedule': 300.0,  # Run every 5 minutes
    },
    'process-credit-rollover': {
        'task': 'payments.tasks.process_credit_rollover',
        'schedule': 86400.0,  # Run daily
    },
    'cleanup-expired-bookings': {
        'task': 'bookings.tasks.cleanup_expired_bookings',
        'schedule': 3600.0,  # Run hourly
    },
    'generate-daily-metrics': {
        'task': 'analytics.tasks.generate_daily_metrics',
        'schedule': 86400.0,  # Run daily
    },
    'check-vehicle-maintenance': {
        'task': 'core.tasks.check_vehicle_maintenance',
        'schedule': 86400.0,  # Run daily
    },
}

app.conf.timezone = 'Africa/Nairobi'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
