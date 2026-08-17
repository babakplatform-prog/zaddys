import uuid
import random
from django.db import models
from django.contrib.auth.models import User

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    loyalty_points = models.PositiveIntegerField(default=0)
    referral_code = models.CharField(max_length=10, unique=True, blank=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='referrals')

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4()).replace('-', '')[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self): return self.user.username

class PromoBanner(models.Model):
    title = models.CharField(max_length=255)
    promo_text = models.CharField(max_length=255, blank=True)
    badge = models.CharField(max_length=50, blank=True, help_text="e.g., 'HOT 🔥', '-20%'")
    image = models.ImageField(upload_to='banners/')
    is_active = models.BooleanField(default=True)

    def __str__(self): return self.title

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    def __str__(self): return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.ImageField(upload_to='products/')
    is_available = models.BooleanField(default=True)
    is_custom_quote = models.BooleanField(default=False)

    def __str__(self): return self.name

class OptionGroup(models.Model):
    product = models.ForeignKey(Product, related_name='option_groups', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    is_required = models.BooleanField(default=False)
    is_multiple = models.BooleanField(default=False)

    def __str__(self): return f"{self.product.name} - {self.name}"

class OptionItem(models.Model):
    group = models.ForeignKey(OptionGroup, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self): return self.name

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer_name = models.CharField(max_length=255, blank=True)
    customer_email = models.EmailField(blank=True, null=True)
    customer_phone = models.CharField(max_length=50)
    delivery_address = models.TextField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Pending')
    paystack_reference = models.CharField(max_length=100, blank=True)
    delivery_pin = models.CharField(max_length=4, blank=True, help_text="4-digit pin for secure handoff")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.delivery_pin:
            self.delivery_pin = str(random.randint(1000, 9999))
        super().save(*args, **kwargs)

    def __str__(self): return f"Order {self.id} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    customizations = models.TextField(blank=True)
