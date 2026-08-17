from django.contrib import admin
from .models import Category, Product, OptionGroup, OptionItem, PromoBanner, Order, OrderItem, CustomerProfile

class OptionItemInline(admin.TabularInline):
    model = OptionItem
    extra = 1

class OptionGroupInline(admin.TabularInline):
    model = OptionGroup
    extra = 1

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price', 'customizations']

class ProductAdmin(admin.ModelAdmin):
    inlines = [OptionGroupInline]
    list_display = ['name', 'price', 'is_custom_quote', 'is_available']
    list_editable = ['price', 'is_custom_quote', 'is_available']
    prepopulated_fields = {'slug': ('name',)}

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ['id', 'customer_name', 'total_amount', 'status', 'delivery_pin', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer_name', 'customer_phone', 'paystack_reference']

class CustomerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'loyalty_points', 'referral_code', 'referred_by']
    search_fields = ['user__email', 'user__username', 'phone', 'referral_code']

admin.site.register(Product, ProductAdmin)
admin.site.register(Category)
admin.site.register(PromoBanner)
admin.site.register(Order, OrderAdmin)
admin.site.register(CustomerProfile, CustomerProfileAdmin)
