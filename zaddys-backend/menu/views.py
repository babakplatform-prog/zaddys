from rest_framework import viewsets
from .models import Product, PromoBanner
from .serializers import ProductSerializer, PromoBannerSerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductSerializer

class PromoBannerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PromoBanner.objects.filter(is_active=True)
    serializer_class = PromoBannerSerializer
