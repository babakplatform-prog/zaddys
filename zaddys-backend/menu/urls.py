from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, PromoBannerViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'banners', PromoBannerViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
