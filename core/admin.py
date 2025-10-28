from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import (
    User, Profile, Vehicle, Route, RouteStop, Schedule, 
    SubscriptionPlan, Subscription, CorporateAccount, 
    DriverLocation, NotificationPreferences
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom User admin with role-based fields
    """
    list_display = ('email', 'phone', 'role', 'first_name', 'last_name', 'is_active', 'is_verified', 'date_joined')
    list_filter = ('role', 'is_active', 'is_verified', 'date_joined')
    search_fields = ('email', 'phone', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return ['date_joined']
        return []


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """
    Profile admin
    """
    list_display = ('user', 'company', 'employee_id', 'license_number', 'license_expiry')
    list_filter = ('company', 'gender')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'employee_id', 'license_number')
    raw_id_fields = ('user', 'company')


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    """
    Vehicle admin
    """
    list_display = ('plate_number', 'vehicle_type', 'make', 'model', 'year', 'capacity', 'status', 'active')
    list_filter = ('vehicle_type', 'status', 'active', 'year')
    search_fields = ('plate_number', 'make', 'model', 'owner')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Vehicle Information', {
            'fields': ('plate_number', 'vehicle_type', 'make', 'model', 'year', 'color', 'capacity')
        }),
        ('Ownership', {
            'fields': ('owner', 'owner_contact')
        }),
        ('Status', {
            'fields': ('status', 'active')
        }),
        ('Documentation', {
            'fields': ('insurance_expiry', 'inspection_expiry')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


class RouteStopInline(admin.TabularInline):
    """
    Inline admin for route stops
    """
    model = RouteStop
    extra = 1
    ordering = ('sequence_order',)


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    """
    Route admin
    """
    list_display = ('name', 'origin', 'destination', 'distance_km', 'estimated_duration_mins', 'base_fare', 'active')
    list_filter = ('active',)
    search_fields = ('name', 'origin', 'destination')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [RouteStopInline]
    
    fieldsets = (
        ('Route Information', {
            'fields': ('name', 'origin', 'destination', 'active')
        }),
        ('Route Details', {
            'fields': ('polyline', 'distance_km', 'estimated_duration_mins', 'base_fare')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    """
    Schedule admin
    """
    list_display = ('route', 'departure_time', 'vehicle', 'driver', 'seats_booked', 'seats_total', 'status')
    list_filter = ('status', 'departure_time', 'route')
    search_fields = ('route__name', 'vehicle__plate_number', 'driver__email')
    readonly_fields = ('seats_available', 'created_at', 'updated_at')
    raw_id_fields = ('route', 'vehicle', 'driver')
    
    fieldsets = (
        ('Schedule Information', {
            'fields': ('route', 'vehicle', 'driver', 'departure_time', 'estimated_arrival_time')
        }),
        ('Capacity', {
            'fields': ('seats_total', 'seats_booked', 'seats_available')
        }),
        ('Status & Pricing', {
            'fields': ('status', 'fare_override')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('route', 'vehicle', 'driver')


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    """
    Subscription Plan admin
    """
    list_display = ('name', 'plan_type', 'price_display', 'duration_days', 'rides_limit', 'active')
    list_filter = ('plan_type', 'active')
    search_fields = ('name', 'code')
    readonly_fields = ('created_at', 'updated_at')
    
    def price_display(self, obj):
        return f"KSh {obj.price/100:.2f}"
    price_display.short_description = 'Price'
    
    fieldsets = (
        ('Plan Information', {
            'fields': ('code', 'name', 'plan_type', 'price', 'duration_days')
        }),
        ('Ride Limits', {
            'fields': ('rides_limit', 'allow_rollover', 'max_rollover_percentage')
        }),
        ('Status', {
            'fields': ('active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    """
    Subscription admin
    """
    list_display = ('user', 'plan', 'start_date', 'end_date', 'rides_remaining', 'active')
    list_filter = ('active', 'plan__plan_type', 'start_date', 'end_date')
    search_fields = ('user__email', 'plan__name')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('user', 'plan', 'corporate')
    
    fieldsets = (
        ('Subscription Information', {
            'fields': ('user', 'plan', 'start_date', 'end_date')
        }),
        ('Rides & Credits', {
            'fields': ('rides_remaining', 'rollover_credits')
        }),
        ('Status & Renewal', {
            'fields': ('active', 'auto_renew')
        }),
        ('Corporate', {
            'fields': ('corporate',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'plan', 'corporate')


@admin.register(CorporateAccount)
class CorporateAccountAdmin(admin.ModelAdmin):
    """
    Corporate Account admin
    """
    list_display = ('name', 'registration_number', 'billing_contact', 'balance', 'credit_limit', 'active')
    list_filter = ('active',)
    search_fields = ('name', 'registration_number', 'billing_contact', 'billing_email')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Company Information', {
            'fields': ('name', 'registration_number', 'active')
        }),
        ('Billing Contact', {
            'fields': ('billing_contact', 'billing_email', 'billing_phone', 'billing_address')
        }),
        ('Financial', {
            'fields': ('balance', 'credit_limit')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DriverLocation)
class DriverLocationAdmin(admin.ModelAdmin):
    """
    Driver Location admin
    """
    list_display = ('driver', 'latitude', 'longitude', 'speed', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('driver__email', 'driver__first_name', 'driver__last_name')
    readonly_fields = ('timestamp',)
    raw_id_fields = ('driver',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('driver')


@admin.register(NotificationPreferences)
class NotificationPreferencesAdmin(admin.ModelAdmin):
    """
    Notification Preferences admin
    """
    list_display = ('user', 'push_enabled', 'email_enabled', 'sms_enabled')
    list_filter = ('push_enabled', 'email_enabled', 'sms_enabled')
    search_fields = ('user__email',)
    raw_id_fields = ('user',)
    
    fieldsets = (
        ('Push Notifications', {
            'fields': ('push_enabled', 'push_booking_confirmations', 'push_reminders', 'push_delays', 'push_promotions')
        }),
        ('Email Notifications', {
            'fields': ('email_enabled', 'email_booking_confirmations', 'email_receipts', 'email_promotions')
        }),
        ('SMS Notifications', {
            'fields': ('sms_enabled', 'sms_booking_confirmations', 'sms_reminders')
        }),
    )


# Register RouteStop separately for better management
@admin.register(RouteStop)
class RouteStopAdmin(admin.ModelAdmin):
    """
    Route Stop admin
    """
    list_display = ('route', 'name', 'sequence_order', 'latitude', 'longitude')
    list_filter = ('route',)
    search_fields = ('name', 'route__name')
    raw_id_fields = ('route',)
    ordering = ('route', 'sequence_order')