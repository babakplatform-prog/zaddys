from rest_framework import serializers
from .models import Product, OptionGroup, OptionItem, PromoBanner, Category

class PromoBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoBanner
        fields = '__all__'

class OptionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OptionItem
        fields = ['id', 'name', 'price']

class OptionGroupSerializer(serializers.ModelSerializer):
    items = OptionItemSerializer(many=True, read_only=True)
    class Meta:
        model = OptionGroup
        fields = ['id', 'name', 'is_required', 'is_multiple', 'items']

class ProductSerializer(serializers.ModelSerializer):
    optionGroups = OptionGroupSerializer(source='option_groups', many=True, read_only=True)
    category = serializers.StringRelatedField()
    
    class Meta:
        model = Product
        fields = ['id', 'category', 'name', 'slug', 'description', 'price', 'image', 'is_available', 'is_custom_quote', 'optionGroups']
