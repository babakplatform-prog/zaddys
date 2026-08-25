from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, DeliveryZoneViewSet, ValidateCouponView, SupportConversationView
from .views_auth import RegisterView, LoginView, VerifyOTPView, ResendOTPView
from .views_order import CreateOrderView, OrderTrackingView
from .views_profile import UserProfileView
from .views_webhook import PaystackWebhookView, ResendWebhookView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'delivery-zones', DeliveryZoneViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register-api'),
    path('auth/login/', LoginView.as_view(), name='login-api'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp-api'),
    path('auth/resend-otp/', ResendOTPView.as_view(), name='resend-otp-api'),
    
    # Orders & Profile Endpoints
    path('orders/create/', CreateOrderView.as_view(), name='create-order'),
    path('orders/<str:order_number>/', OrderTrackingView.as_view(), name='order-tracking'),
    path('coupons/validate/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('support/conversation/', SupportConversationView.as_view(), name='support-conversation'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('webhooks/paystack/', PaystackWebhookView.as_view(), name='paystack-webhook'),
    path('webhooks/resend/', ResendWebhookView.as_view(), name='resend-webhook'),
]