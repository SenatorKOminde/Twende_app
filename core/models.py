from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    ROLE_CHOICES = [
        ('RIDER', 'Rider'),
        ('DRIVER', 'Driver'),
        ('ADMIN', 'Admin'),
        ('CORP_ADMIN', 'Corporate Admin'),
        ('DISPATCHER', 'Dispatcher'),
    ]
    
    # Remove username field and use email as primary identifier
    username = None
    email = models.EmailField(unique=True)
    
    # Phone number with validation for Kenyan format
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+254XXXXXXXXX'. Up to 15 digits allowed."
    )
    phone = models.CharField(
        validators=[phone_regex],
        max_length=17,
        unique=True,
        help_text="Phone number in format: +254XXXXXXXXX"
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='RIDER')
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class Profile(models.Model):
    """
    Extended user profile information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.URLField(blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=[
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    ], blank=True, null=True)
    
    # Emergency contact
    emergency_contact_name = models.CharField(max_length=255, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=17, blank=True, null=True)
    
    # Driver specific fields
    license_number = models.CharField(max_length=50, blank=True, null=True)
    license_expiry = models.DateField(blank=True, null=True)
    
    # Corporate user fields
    company = models.ForeignKey('CorporateAccount', null=True, blank=True, on_delete=models.SET_NULL)
    employee_id = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'profiles'
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
    
    def __str__(self):
        return f"Profile for {self.user.email}"


class Vehicle(models.Model):
    """
    Vehicle information for the fleet
    """
    VEHICLE_TYPE_CHOICES = [
        ('BUS', 'Bus'),
        ('MINIBUS', 'Minibus'),
        ('VAN', 'Van'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('MAINTENANCE', 'Maintenance'),
        ('INACTIVE', 'Inactive'),
    ]
    
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, default='BUS')
    capacity = models.IntegerField(default=50)
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    color = models.CharField(max_length=50)
    
    # Ownership information
    owner = models.CharField(max_length=255)  # owner info or partner id
    owner_contact = models.CharField(max_length=255, blank=True, null=True)
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    active = models.BooleanField(default=True)
    
    # Insurance and documentation
    insurance_expiry = models.DateField(blank=True, null=True)
    inspection_expiry = models.DateField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vehicles'
        verbose_name = 'Vehicle'
        verbose_name_plural = 'Vehicles'
    
    def __str__(self):
        return f"{self.plate_number} - {self.make} {self.model}"


class Route(models.Model):
    """
    Route information between locations
    """
    name = models.CharField(max_length=255)
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    
    # Route geometry (encoded polyline)
    polyline = models.TextField(null=True, blank=True)
    distance_km = models.FloatField(default=0.0)
    estimated_duration_mins = models.IntegerField()
    
    # Pricing
    base_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Status
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'routes'
        verbose_name = 'Route'
        verbose_name_plural = 'Routes'
    
    def __str__(self):
        return f"{self.origin} → {self.destination}"


class RouteStop(models.Model):
    """
    Individual stops along a route
    """
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='stops')
    name = models.CharField(max_length=255)
    latitude = models.FloatField()
    longitude = models.FloatField()
    sequence_order = models.IntegerField()
    
    class Meta:
        db_table = 'route_stops'
        verbose_name = 'Route Stop'
        verbose_name_plural = 'Route Stops'
        unique_together = ['route', 'sequence_order']
    
    def __str__(self):
        return f"{self.route.name} - {self.name}"


class Schedule(models.Model):
    """
    Scheduled runs of routes with specific vehicles and times
    """
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('BOARDING', 'Boarding'),
        ('DEPARTED', 'Departed'),
        ('ARRIVED', 'Arrived'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='schedules')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.SET_NULL, null=True, blank=True)
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'DRIVER'})
    
    departure_time = models.DateTimeField()
    estimated_arrival_time = models.DateTimeField()
    
    # Capacity management
    seats_total = models.IntegerField()
    seats_booked = models.IntegerField(default=0)
    seats_available = models.IntegerField(default=0)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    
    # Pricing override (optional)
    fare_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'schedules'
        verbose_name = 'Schedule'
        verbose_name_plural = 'Schedules'
        indexes = [
            models.Index(fields=['departure_time', 'route']),
            models.Index(fields=['status', 'departure_time']),
        ]
    
    def __str__(self):
        return f"{self.route} - {self.departure_time.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        # Calculate available seats
        self.seats_available = self.seats_total - self.seats_booked
        super().save(*args, **kwargs)
    
    def is_full(self):
        return self.seats_booked >= self.seats_total
    
    def has_available_seats(self):
        return self.seats_booked < self.seats_total


class SubscriptionPlan(models.Model):
    """
    Available subscription plans
    """
    PLAN_TYPE_CHOICES = [
        ('DAILY', 'Daily'),
        ('WEEKLY', 'Weekly'),
        ('MONTHLY', 'Monthly'),
    ]
    
    code = models.CharField(max_length=50, unique=True)  # e.g. DAILY, WEEKLY, MONTHLY
    name = models.CharField(max_length=128)
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES)
    price = models.IntegerField()  # in KSh cents
    duration_days = models.IntegerField()  # 1, 7, 30
    rides_limit = models.IntegerField(null=True, blank=True)  # null = unlimited
    allow_rollover = models.BooleanField(default=True)
    max_rollover_percentage = models.IntegerField(default=20)  # max 20% rollover
    
    # Status
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_plans'
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'
    
    def __str__(self):
        return f"{self.name} - KSh {self.price/100:.2f}"


class Subscription(models.Model):
    """
    User subscriptions to plans
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    rides_remaining = models.IntegerField(default=0)
    rollover_credits = models.IntegerField(default=0)  # unused rides from previous period
    
    # Status
    active = models.BooleanField(default=True)
    auto_renew = models.BooleanField(default=False)
    
    # Corporate subscription
    corporate = models.ForeignKey('CorporateAccount', null=True, blank=True, on_delete=models.SET_NULL)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        indexes = [
            models.Index(fields=['user', 'active']),
            models.Index(fields=['end_date', 'active']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"
    
    def is_expired(self):
        return timezone.now() > self.end_date
    
    def has_rides_available(self):
        return self.rides_remaining > 0 or self.plan.rides_limit is None


class CorporateAccount(models.Model):
    """
    Corporate accounts for company subscriptions
    """
    name = models.CharField(max_length=255)
    registration_number = models.CharField(max_length=100, unique=True)
    
    # Contact information
    billing_contact = models.CharField(max_length=255)
    billing_email = models.EmailField()
    billing_phone = models.CharField(max_length=20)
    billing_address = models.TextField()
    
    # Financial
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=10000.0)
    
    # Status
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'corporate_accounts'
        verbose_name = 'Corporate Account'
        verbose_name_plural = 'Corporate Accounts'
    
    def __str__(self):
        return self.name


class DriverLocation(models.Model):
    """
    Real-time driver location tracking
    """
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    latitude = models.FloatField()
    longitude = models.FloatField()
    bearing = models.FloatField(null=True, blank=True)  # direction in degrees
    speed = models.FloatField(null=True, blank=True)  # km/h
    accuracy = models.FloatField(null=True, blank=True)  # location accuracy in meters
    
    timestamp = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'driver_locations'
        verbose_name = 'Driver Location'
        verbose_name_plural = 'Driver Locations'
        indexes = [
            models.Index(fields=['driver', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.driver.email} - {self.timestamp}"


class NotificationPreferences(models.Model):
    """
    User notification preferences
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Push notifications
    push_enabled = models.BooleanField(default=True)
    push_booking_confirmations = models.BooleanField(default=True)
    push_reminders = models.BooleanField(default=True)
    push_delays = models.BooleanField(default=True)
    push_promotions = models.BooleanField(default=False)
    
    # Email notifications
    email_enabled = models.BooleanField(default=True)
    email_booking_confirmations = models.BooleanField(default=True)
    email_receipts = models.BooleanField(default=True)
    email_promotions = models.BooleanField(default=False)
    
    # SMS notifications
    sms_enabled = models.BooleanField(default=True)
    sms_booking_confirmations = models.BooleanField(default=True)
    sms_reminders = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preferences'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"