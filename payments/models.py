from django.db import models
from django.utils import timezone
from django.conf import settings


class Payment(models.Model):
    """
    Payment records for subscriptions and individual bookings
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('MPESA', 'M-Pesa'),
        ('STRIPE', 'Stripe'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CASH', 'Cash'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('SUBSCRIPTION', 'Subscription'),
        ('BOOKING', 'Booking'),
        ('REFUND', 'Refund'),
    ]
    
    # User and payment details
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='KES')
    
    # Payment method and type
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # External payment system references
    external_transaction_id = models.CharField(max_length=255, blank=True, null=True)
    external_reference = models.CharField(max_length=255, blank=True, null=True)
    
    # Related objects
    subscription = models.ForeignKey('core.Subscription', on_delete=models.SET_NULL, null=True, blank=True)
    booking = models.ForeignKey('bookings.Booking', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'payments'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['status', 'payment_method']),
            models.Index(fields=['external_transaction_id']),
        ]
    
    def __str__(self):
        return f"Payment {self.id} - {self.user.email} - {self.amount} {self.currency}"
    
    def mark_as_successful(self):
        """Mark payment as successful"""
        self.status = 'SUCCESS'
        self.processed_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, reason=None):
        """Mark payment as failed"""
        self.status = 'FAILED'
        if reason:
            self.metadata['failure_reason'] = reason
        self.save()


class MPesaPayment(models.Model):
    """
    M-Pesa specific payment information
    """
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='mpesa_payment')
    
    # M-Pesa specific fields
    phone_number = models.CharField(max_length=15)
    account_reference = models.CharField(max_length=255)
    transaction_desc = models.CharField(max_length=255)
    
    # M-Pesa response data
    checkout_request_id = models.CharField(max_length=255, blank=True, null=True)
    merchant_request_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Callback data
    result_code = models.IntegerField(null=True, blank=True)
    result_desc = models.CharField(max_length=255, blank=True, null=True)
    mpesa_receipt_number = models.CharField(max_length=255, blank=True, null=True)
    transaction_date = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'mpesa_payments'
        verbose_name = 'M-Pesa Payment'
        verbose_name_plural = 'M-Pesa Payments'
    
    def __str__(self):
        return f"M-Pesa Payment {self.payment.id} - {self.phone_number}"


class StripePayment(models.Model):
    """
    Stripe specific payment information
    """
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='stripe_payment')
    
    # Stripe specific fields
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Payment method details
    payment_method_type = models.CharField(max_length=50, blank=True, null=True)  # card, bank_transfer, etc.
    last4 = models.CharField(max_length=4, blank=True, null=True)
    brand = models.CharField(max_length=20, blank=True, null=True)  # visa, mastercard, etc.
    
    # Stripe metadata
    stripe_metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stripe_payments'
        verbose_name = 'Stripe Payment'
        verbose_name_plural = 'Stripe Payments'
    
    def __str__(self):
        return f"Stripe Payment {self.payment.id} - {self.stripe_payment_intent_id}"


class Refund(models.Model):
    """
    Refund records for cancelled bookings or subscription cancellations
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]
    
    # Related payment and booking
    original_payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    booking = models.ForeignKey('bookings.Booking', on_delete=models.CASCADE, related_name='refunds', null=True, blank=True)
    
    # Refund details
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # External refund references
    external_refund_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Processing information
    processed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'refunds'
        verbose_name = 'Refund'
        verbose_name_plural = 'Refunds'
        indexes = [
            models.Index(fields=['original_payment', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Refund {self.id} - {self.amount} for Payment {self.original_payment.id}"

