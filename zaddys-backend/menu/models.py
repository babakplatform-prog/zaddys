from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Product(models.Model):
    INVENTORY_STATUS_CHOICES = [
        ('available', 'Available'),
        ('out_of_stock', 'Out of stock'),
        ('hidden', 'Hidden'),
    ]
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    description = models.TextField(blank=True, null=True)
    image = models.URLField(blank=True, null=True)
    image_upload = models.ImageField(upload_to='products/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    inventory_status = models.CharField(max_length=20, choices=INVENTORY_STATUS_CHOICES, default='available')
    is_custom_quote = models.BooleanField(default=False) # For Custom Celebration Cakes

    def __str__(self):
        return self.name

class ProductOptionGroup(models.Model):
    """E.g., 'Noodle Type', 'Wing Quantity', 'Sauce Options'"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='option_groups')
    name = models.CharField(max_length=100)
    is_required = models.BooleanField(default=False)
    is_multiple = models.BooleanField(default=False) # True for checkboxes, False for radio

    def __str__(self):
        return f"{self.product.name} - {self.name}"

class ProductOption(models.Model):
    """E.g., 'Egg Noodles', '6 Pieces', 'Extra Beef (+₦1500)'"""
    group = models.ForeignKey(ProductOptionGroup, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=100)
    price_extra = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.URLField(blank=True, null=True)
    image_upload = models.ImageField(upload_to='product-options/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} (+₦{self.price_extra})"

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    referral_code = models.CharField(max_length=50, blank=True, null=True)
    points = models.IntegerField(default=0)
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)
    otp_attempts = models.PositiveSmallIntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.referral_code:
            import secrets
            self.referral_code = f'ZD-{secrets.token_hex(4).upper()}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user.email

class CustomerAddress(models.Model):
    profile = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=80, default='Home')
    address = models.TextField()
    landmark = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.profile} - {self.label}'

class SupportConversation(models.Model):
    STATUS_CHOICES = [('open', 'Open'), ('closed', 'Closed')]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_conversations')
    subject = models.CharField(max_length=160, default='Talk to ZADDY')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email} - {self.subject}'

class SupportMessage(models.Model):
    conversation = models.ForeignKey(SupportConversation, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.TextField()
    is_staff_reply = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.author} - {self.created_at:%Y-%m-%d %H:%M}'

class ResendWebhookEvent(models.Model):
    event_id = models.CharField(max_length=255, unique=True)
    event_type = models.CharField(max_length=100)
    email_id = models.CharField(max_length=255, blank=True)
    payload = models.JSONField()
    received_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.event_type} - {self.event_id}'

class Coupon(models.Model):
    DISCOUNT_TYPES = [('percentage', 'Percentage'), ('fixed', 'Fixed amount')]
    code = models.CharField(max_length=40, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    active = models.BooleanField(default=False)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_count = models.PositiveIntegerField(default=0)

    def is_valid(self):
        now = timezone.now()
        return (
            self.active
            and (self.starts_at is None or self.starts_at <= now)
            and (self.ends_at is None or self.ends_at >= now)
            and (self.usage_limit is None or self.usage_count < self.usage_limit)
        )

    def __str__(self):
        return self.code

class DeliveryZone(models.Model):
    name = models.CharField(max_length=100, unique=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.name} - ₦{self.fee}'

class LoyaltyTransaction(models.Model):
    profile = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='loyalty_transactions')
    points_delta = models.IntegerField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.profile} {self.points_delta:+d} points'

class ReferralRecord(models.Model):
    referrer = models.ForeignKey(CustomerProfile, on_delete=models.CASCADE, related_name='referrals_sent')
    referred_customer = models.OneToOneField(CustomerProfile, on_delete=models.CASCADE, related_name='referral_record')
    points_awarded = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.referrer} referred {self.referred_customer}'

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='orders', null=True, blank=True)
    order_number = models.CharField(max_length=32, unique=True, blank=True, null=True)
    customer_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    delivery_address = models.TextField()
    landmark = models.CharField(max_length=200, blank=True)
    city = models.CharField(max_length=100, blank=True)
    delivery_notes = models.TextField(blank=True)
    preferred_delivery_time = models.CharField(max_length=100, blank=True)
    delivery_zone = models.ForeignKey('DeliveryZone', on_delete=models.PROTECT, null=True, blank=True, related_name='orders')
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=40, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Pending')
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        previous_status = None
        if self.pk:
            previous_status = Order.objects.filter(pk=self.pk).values_list('status', flat=True).first()
        if not self.order_number:
            from django.utils import timezone
            prefix = timezone.localdate().strftime('ZD-%Y%m%d')
            last_order = Order.objects.select_for_update().filter(order_number__startswith=prefix).order_by('-id').first()
            sequence = int(last_order.order_number.rsplit('-', 1)[-1]) + 1 if last_order else 1
            self.order_number = f'{prefix}-{sequence:04d}'
        super().save(*args, **kwargs)
        if previous_status is not None and previous_status != self.status and self.email:
            from .utils import send_order_status_email
            send_order_status_email(self.email, self.customer_name or 'there', self.order_number, self.status)

    def __str__(self):
        return f"Order #{self.id} - ₦{self.total_price}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    selected_options = models.TextField(blank=True, null=True) # Summary of options chosen

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"