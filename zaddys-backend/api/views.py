from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True).order_by('sort_order')
    serializer_class = CategorySerializer
    permission_classes = [AllowAny] 

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(status='AVAILABLE')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
