from django.contrib import admin
from .models import User, Address, DeliveryZone, Category, Product, OptionGroup, OptionItem, Order, OrderItem, Payment, Coupon

# Customize the Admin Headers
admin.site.site_header = "ZADDYS Creamery & Grills Admin"
admin.site.site_title = "ZADDYS Portal"
admin.site.index_title = "Welcome to the Kitchen"

# Register all models
admin.site.register(User)
admin.site.register(Address)
admin.site.register(DeliveryZone)
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(OptionGroup)
admin.site.register(OptionItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)
admin.site.register(Coupon)
