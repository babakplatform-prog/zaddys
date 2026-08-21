from django.contrib import admin
from .models import Category, Product, ProductOptionGroup, ProductOption, Order, OrderItem, CustomerProfile, CustomerAddress, Coupon, DeliveryZone, LoyaltyTransaction, ReferralRecord, SupportConversation, SupportMessage

class ProductOptionGroupInline(admin.TabularInline):
    model = ProductOptionGroup
    show_change_link = True
    extra = 1

class ProductOptionInline(admin.TabularInline):
    model = ProductOption
    extra = 1

class ProductOptionGroupAdmin(admin.ModelAdmin):
    inlines = [ProductOptionInline]
    list_display = ['product', 'name', 'is_required', 'is_multiple']
    list_filter = ['is_required', 'is_multiple']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price', 'selected_options']

class CustomerAddressInline(admin.TabularInline):
    model = CustomerAddress
    extra = 0

class ProductAdmin(admin.ModelAdmin):
    inlines = [ProductOptionGroupInline]
    list_display = ['name', 'category', 'price', 'inventory_status', 'is_custom_quote', 'is_available']
    list_editable = ['price', 'is_custom_quote', 'is_available']
    list_filter = ['category', 'inventory_status', 'is_available']
    search_fields = ['name', 'category__name']

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ['order_number', 'customer_name', 'phone', 'total_price', 'discount_amount', 'status', 'is_paid', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order_number', 'customer_name', 'phone', 'email', 'delivery_address']

    actions = ['mark_preparing', 'mark_ready', 'mark_dispatched', 'mark_delivered', 'mark_cancelled']

    def _set_status(self, request, queryset, status_value):
        queryset.update(status=status_value)

    @admin.action(description='Mark selected orders as Preparing')
    def mark_preparing(self, request, queryset): self._set_status(request, queryset, 'Preparing')

    @admin.action(description='Mark selected orders as Ready for Dispatch')
    def mark_ready(self, request, queryset): self._set_status(request, queryset, 'Ready for Dispatch')

    @admin.action(description='Mark selected orders as Dispatched')
    def mark_dispatched(self, request, queryset): self._set_status(request, queryset, 'Dispatched')

    @admin.action(description='Mark selected orders as Delivered')
    def mark_delivered(self, request, queryset): self._set_status(request, queryset, 'Delivered')

    @admin.action(description='Cancel selected orders')
    def mark_cancelled(self, request, queryset): self._set_status(request, queryset, 'Cancelled')

class CustomerProfileAdmin(admin.ModelAdmin):
    inlines = [CustomerAddressInline]
    list_display = ['user', 'phone', 'points', 'referral_code', 'is_verified']
    search_fields = ['user__email', 'user__username', 'phone', 'referral_code']

class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ['profile', 'label', 'city', 'is_default', 'created_at']
    list_filter = ['city', 'is_default']
    search_fields = ['profile__user__email', 'address', 'landmark']

class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'active', 'usage_count', 'usage_limit', 'ends_at']
    list_filter = ['active', 'discount_type']
    search_fields = ['code']
    list_editable = ['active']

class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ['profile', 'points_delta', 'reason', 'created_at']
    list_filter = ['created_at']
    search_fields = ['profile__user__email', 'reason']

class ReferralRecordAdmin(admin.ModelAdmin):
    list_display = ['referrer', 'referred_customer', 'points_awarded', 'created_at']
    search_fields = ['referrer__user__email', 'referred_customer__user__email']

class SupportMessageInline(admin.TabularInline):
    model = SupportMessage
    extra = 1
    fields = ['author', 'body', 'is_staff_reply', 'created_at']
    readonly_fields = ['created_at']

class SupportConversationAdmin(admin.ModelAdmin):
    inlines = [SupportMessageInline]
    list_display = ['user', 'subject', 'status', 'updated_at']
    list_filter = ['status', 'updated_at']
    search_fields = ['user__email', 'subject', 'messages__body']

admin.site.register(Product, ProductAdmin)
admin.site.register(Category)
admin.site.register(Order, OrderAdmin)
admin.site.register(CustomerProfile, CustomerProfileAdmin)
admin.site.register(CustomerAddress, CustomerAddressAdmin)
admin.site.register(Coupon, CouponAdmin)
admin.site.register(ProductOptionGroup, ProductOptionGroupAdmin)
admin.site.register(DeliveryZone)
admin.site.register(LoyaltyTransaction, LoyaltyTransactionAdmin)
admin.site.register(ReferralRecord, ReferralRecordAdmin)
admin.site.register(SupportConversation, SupportConversationAdmin)
