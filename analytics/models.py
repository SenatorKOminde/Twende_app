from django.db import models
from django.utils import timezone
from django.conf import settings


class AnalyticsEvent(models.Model):
    """
    Track user events and actions for analytics
    """
    EVENT_TYPE_CHOICES = [
        ('USER_REGISTRATION', 'User Registration'),
        ('USER_LOGIN', 'User Login'),
        ('BOOKING_CREATED', 'Booking Created'),
        ('BOOKING_CANCELLED', 'Booking Cancelled'),
        ('PAYMENT_INITIATED', 'Payment Initiated'),
        ('PAYMENT_COMPLETED', 'Payment Completed'),
        ('SUBSCRIPTION_PURCHASED', 'Subscription Purchased'),
        ('ROUTE_VIEWED', 'Route Viewed'),
        ('SCHEDULE_VIEWED', 'Schedule Viewed'),
        ('APP_OPENED', 'App Opened'),
        ('NOTIFICATION_RECEIVED', 'Notification Received'),
        ('NOTIFICATION_CLICKED', 'Notification Clicked'),
    ]
    
    # Event details
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    event_type = models.CharField(max_length=30, choices=EVENT_TYPE_CHOICES)
    
    # Related objects
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True)
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True)
    subscription = models.ForeignKey('core.Subscription', on_delete=models.SET_NULL, null=True, blank=True)
    route = models.ForeignKey('core.Route', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Event data
    properties = models.JSONField(default=dict, blank=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Device and platform info
    platform = models.CharField(max_length=20, blank=True, null=True)  # ios, android, web
    device_id = models.CharField(max_length=255, blank=True, null=True)
    app_version = models.CharField(max_length=20, blank=True, null=True)
    
    # Location (if available)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'analytics_events'
        verbose_name = 'Analytics Event'
        verbose_name_plural = 'Analytics Events'
        indexes = [
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.user.email if self.user else 'Anonymous'}"


class DailyMetrics(models.Model):
    """
    Daily aggregated metrics for reporting
    """
    date = models.DateField()
    
    # User metrics
    new_users = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    total_users = models.IntegerField(default=0)
    
    # Booking metrics
    bookings_created = models.IntegerField(default=0)
    bookings_cancelled = models.IntegerField(default=0)
    bookings_completed = models.IntegerField(default=0)
    no_shows = models.IntegerField(default=0)
    
    # Revenue metrics
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    subscription_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    booking_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    refunds_issued = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Route metrics
    routes_active = models.IntegerField(default=0)
    schedules_operated = models.IntegerField(default=0)
    average_capacity_utilization = models.FloatField(default=0.0)
    
    # Vehicle metrics
    vehicles_active = models.IntegerField(default=0)
    vehicles_in_maintenance = models.IntegerField(default=0)
    
    # Payment metrics
    payments_successful = models.IntegerField(default=0)
    payments_failed = models.IntegerField(default=0)
    mpesa_payments = models.IntegerField(default=0)
    stripe_payments = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'daily_metrics'
        verbose_name = 'Daily Metrics'
        verbose_name_plural = 'Daily Metrics'
        unique_together = ['date']
        indexes = [
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"Metrics for {self.date}"


class RouteMetrics(models.Model):
    """
    Route-specific metrics for performance analysis
    """
    route = models.ForeignKey('core.Route', on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    
    # Booking metrics
    bookings_count = models.IntegerField(default=0)
    cancellations_count = models.IntegerField(default=0)
    no_shows_count = models.IntegerField(default=0)
    
    # Capacity metrics
    total_seats_offered = models.IntegerField(default=0)
    seats_occupied = models.IntegerField(default=0)
    capacity_utilization = models.FloatField(default=0.0)
    
    # Revenue metrics
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    average_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Performance metrics
    average_delay_minutes = models.FloatField(default=0.0)
    on_time_percentage = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'route_metrics'
        verbose_name = 'Route Metrics'
        verbose_name_plural = 'Route Metrics'
        unique_together = ['route', 'date']
        indexes = [
            models.Index(fields=['route', 'date']),
            models.Index(fields=['date', 'capacity_utilization']),
        ]
    
    def __str__(self):
        return f"{self.route.name} - {self.date}"


class UserMetrics(models.Model):
    """
    User-specific metrics for behavior analysis
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    
    # Activity metrics
    bookings_made = models.IntegerField(default=0)
    cancellations_made = models.IntegerField(default=0)
    no_shows = models.IntegerField(default=0)
    
    # Spending metrics
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    subscription_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    booking_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Route preferences
    favorite_routes = models.JSONField(default=list, blank=True)
    routes_used = models.IntegerField(default=0)
    
    # App usage
    app_sessions = models.IntegerField(default=0)
    total_session_duration = models.IntegerField(default=0)  # in seconds
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_metrics'
        verbose_name = 'User Metrics'
        verbose_name_plural = 'User Metrics'
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['date', 'total_spent']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.date}"


class CorporateMetrics(models.Model):
    """
    Corporate account metrics
    """
    corporate_account = models.ForeignKey('core.CorporateAccount', on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    
    # Employee metrics
    active_employees = models.IntegerField(default=0)
    new_employees = models.IntegerField(default=0)
    
    # Usage metrics
    total_bookings = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    average_booking_per_employee = models.FloatField(default=0.0)
    
    # Popular routes
    most_used_routes = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'corporate_metrics'
        verbose_name = 'Corporate Metrics'
        verbose_name_plural = 'Corporate Metrics'
        unique_together = ['corporate_account', 'date']
        indexes = [
            models.Index(fields=['corporate_account', 'date']),
        ]
    
    def __str__(self):
        return f"{self.corporate_account.name} - {self.date}"


class PerformanceAlert(models.Model):
    """
    System performance alerts and thresholds
    """
    ALERT_TYPE_CHOICES = [
        ('LOW_CAPACITY', 'Low Capacity Utilization'),
        ('HIGH_CANCELLATION', 'High Cancellation Rate'),
        ('PAYMENT_FAILURE', 'High Payment Failure Rate'),
        ('SYSTEM_ERROR', 'System Error'),
        ('ROUTE_DELAY', 'Route Delay'),
        ('VEHICLE_MAINTENANCE', 'Vehicle Maintenance Due'),
    ]
    
    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]
    
    alert_type = models.CharField(max_length=30, choices=ALERT_TYPE_CHOICES)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES)
    
    # Alert details
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Related objects
    route = models.ForeignKey('core.Route', on_delete=models.SET_NULL, null=True, blank=True)
    vehicle = models.ForeignKey('core.Vehicle', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Threshold data
    threshold_value = models.FloatField(null=True, blank=True)
    actual_value = models.FloatField(null=True, blank=True)
    
    # Status
    resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'performance_alerts'
        verbose_name = 'Performance Alert'
        verbose_name_plural = 'Performance Alerts'
        indexes = [
            models.Index(fields=['alert_type', 'severity']),
            models.Index(fields=['resolved', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_severity_display()} {self.get_alert_type_display()}: {self.title}"
    
    def resolve(self, resolved_by, notes=None):
        """Mark alert as resolved"""
        self.resolved = True
        self.resolved_by = resolved_by
        self.resolved_at = timezone.now()
        if notes:
            self.resolution_notes = notes
        self.save()