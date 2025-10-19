from django.db import models
from django.utils import timezone
from django.conf import settings
import secrets


class Booking(models.Model):
    """
    Individual seat bookings for scheduled trips
    """
    STATUS_CHOICES = [
        ('RESERVED', 'Reserved'),
        ('CHECKED_IN', 'Checked In'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show'),
        ('COMPLETED', 'Completed'),
    ]
    
    rider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookings')
    schedule = models.ForeignKey('core.Schedule', on_delete=models.CASCADE, related_name='bookings')
    
    # Seat information
    seat_number = models.IntegerField(null=True, blank=True)
    pickup_stop = models.ForeignKey('core.RouteStop', on_delete=models.SET_NULL, null=True, blank=True)
    dropoff_stop = models.ForeignKey('core.RouteStop', on_delete=models.SET_NULL, null=True, blank=True, related_name='dropoff_bookings')
    
    # Booking details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='RESERVED')
    qr_code = models.CharField(max_length=255, unique=True, blank=True)
    
    # Pricing
    fare_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=[
        ('SUBSCRIPTION', 'Subscription'),
        ('CARD', 'Card'),
        ('MPESA', 'M-Pesa'),
        ('CASH', 'Cash'),
    ])
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Cancellation
    cancellation_reason = models.TextField(blank=True, null=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        indexes = [
            models.Index(fields=['rider', 'created_at']),
            models.Index(fields=['schedule', 'status']),
            models.Index(fields=['qr_code']),
        ]
    
    def __str__(self):
        return f"Booking {self.id} - {self.rider.email} on {self.schedule}"
    
    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = self.generate_qr_code()
        super().save(*args, **kwargs)
    
    def generate_qr_code(self):
        """Generate a unique QR code for the booking"""
        return secrets.token_urlsafe(32)
    
    def can_cancel(self):
        """Check if booking can be cancelled"""
        if self.status in ['CANCELLED', 'COMPLETED']:
            return False
        
        # Allow cancellation up to 30 minutes before departure
        cutoff_time = self.schedule.departure_time - timezone.timedelta(minutes=30)
        return timezone.now() < cutoff_time
    
    def calculate_refund(self):
        """Calculate refund amount based on cancellation time"""
        if not self.can_cancel():
            return 0.00
        
        # Full refund if cancelled more than 2 hours before departure
        cutoff_2h = self.schedule.departure_time - timezone.timedelta(hours=2)
        if timezone.now() < cutoff_2h:
            return self.fare_amount
        
        # 50% refund if cancelled between 2 hours and 30 minutes before departure
        cutoff_30m = self.schedule.departure_time - timezone.timedelta(minutes=30)
        if timezone.now() < cutoff_30m:
            return self.fare_amount * 0.5
        
        # No refund if cancelled less than 30 minutes before departure
        return 0.00


class BookingHistory(models.Model):
    """
    Track booking status changes for audit purposes
    """
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='history')
    previous_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'booking_history'
        verbose_name = 'Booking History'
        verbose_name_plural = 'Booking History'
        indexes = [
            models.Index(fields=['booking', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.booking} - {self.previous_status} → {self.new_status}"