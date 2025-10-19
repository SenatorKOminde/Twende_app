from django.db import models
from django.utils import timezone
from django.conf import settings


class Notification(models.Model):
    """
    System notifications for users
    """
    NOTIFICATION_TYPE_CHOICES = [
        ('BOOKING_CONFIRMATION', 'Booking Confirmation'),
        ('BOOKING_REMINDER', 'Booking Reminder'),
        ('BOOKING_CANCELLATION', 'Booking Cancellation'),
        ('ROUTE_DELAY', 'Route Delay'),
        ('ROUTE_CANCELLATION', 'Route Cancellation'),
        ('PAYMENT_SUCCESS', 'Payment Success'),
        ('PAYMENT_FAILED', 'Payment Failed'),
        ('SUBSCRIPTION_RENEWAL', 'Subscription Renewal'),
        ('SUBSCRIPTION_EXPIRED', 'Subscription Expired'),
        ('PROMOTION', 'Promotion'),
        ('SYSTEM_UPDATE', 'System Update'),
    ]
    
    CHANNEL_CHOICES = [
        ('PUSH', 'Push Notification'),
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('IN_APP', 'In-App'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
        ('READ', 'Read'),
    ]
    
    # Recipient and content
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES)
    
    # Content
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related objects
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True)
    payment = models.ForeignKey('payments.Payment', on_delete=models.SET_NULL, null=True, blank=True)
    subscription = models.ForeignKey('core.Subscription', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status and delivery
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    external_message_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        indexes = [
            models.Index(fields=['user', 'status', 'created_at']),
            models.Index(fields=['notification_type', 'channel']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} - {self.user.email}"
    
    def mark_as_sent(self):
        """Mark notification as sent"""
        self.status = 'SENT'
        self.sent_at = timezone.now()
        self.save()
    
    def mark_as_delivered(self):
        """Mark notification as delivered"""
        self.status = 'DELIVERED'
        self.save()
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.status = 'READ'
        self.read_at = timezone.now()
        self.save()


class NotificationTemplate(models.Model):
    """
    Templates for different types of notifications
    """
    NOTIFICATION_TYPE_CHOICES = [
        ('BOOKING_CONFIRMATION', 'Booking Confirmation'),
        ('BOOKING_REMINDER', 'Booking Reminder'),
        ('BOOKING_CANCELLATION', 'Booking Cancellation'),
        ('ROUTE_DELAY', 'Route Delay'),
        ('ROUTE_CANCELLATION', 'Route Cancellation'),
        ('PAYMENT_SUCCESS', 'Payment Success'),
        ('PAYMENT_FAILED', 'Payment Failed'),
        ('SUBSCRIPTION_RENEWAL', 'Subscription Renewal'),
        ('SUBSCRIPTION_EXPIRED', 'Subscription Expired'),
        ('PROMOTION', 'Promotion'),
        ('SYSTEM_UPDATE', 'System Update'),
    ]
    
    CHANNEL_CHOICES = [
        ('PUSH', 'Push Notification'),
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('IN_APP', 'In-App'),
    ]
    
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPE_CHOICES)
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES)
    
    # Template content
    title_template = models.CharField(max_length=255)
    message_template = models.TextField()
    
    # Template variables documentation
    variables = models.JSONField(default=dict, blank=True, help_text="Documentation of available template variables")
    
    # Status
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_templates'
        verbose_name = 'Notification Template'
        verbose_name_plural = 'Notification Templates'
        unique_together = ['notification_type', 'channel']
    
    def __str__(self):
        return f"{self.get_notification_type_display()} - {self.get_channel_display()}"




class DeviceToken(models.Model):
    """
    Device tokens for push notifications
    """
    PLATFORM_CHOICES = [
        ('IOS', 'iOS'),
        ('ANDROID', 'Android'),
        ('WEB', 'Web'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='device_tokens')
    token = models.CharField(max_length=255)
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES)
    device_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Status
    active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'device_tokens'
        verbose_name = 'Device Token'
        verbose_name_plural = 'Device Tokens'
        unique_together = ['user', 'token']
        indexes = [
            models.Index(fields=['user', 'platform']),
            models.Index(fields=['active', 'platform']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.platform}"