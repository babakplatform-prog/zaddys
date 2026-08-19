from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, PromoBannerViewSet
from .views_auth import RegisterView, LoginView, VerifyOTPView
from .views_order import CreateOrderView
from .views_profile import UserProfileView

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'banners', PromoBannerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth Endpoints
    path('auth/register/', RegisterView.as_view(), name='register-api'),
    path('auth/login/', LoginView.as_view(), name='login-api'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp-api'),
    
    # Orders & Profile Endpoints
    path('orders/create/', CreateOrderView.as_view(), name='create-order'),
    path('profile/<str:email>/', UserProfileView.as_view(), name='user-profile'),
]