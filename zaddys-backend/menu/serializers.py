from rest_framework import serializers
from .models import Product, ProductOptionGroup, ProductOption, DeliveryZone

class ProductOptionSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductOption
        fields = ['id', 'name', 'price_extra', 'image']

    def get_image(self, obj):
        if obj.image_upload:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image_upload.url) if request else obj.image_upload.url
        return obj.image

class ProductOptionGroupSerializer(serializers.ModelSerializer):
    options = ProductOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ProductOptionGroup
        fields = ['id', 'name', 'is_required', 'is_multiple', 'options']

class ProductSerializer(serializers.ModelSerializer):
    optionGroups = ProductOptionGroupSerializer(source='option_groups', many=True, read_only=True)
    option_groups = ProductOptionGroupSerializer(many=True, read_only=True)
    category = serializers.StringRelatedField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'category', 'category_name', 'name', 'description', 'price', 'image', 'is_available', 'inventory_status', 'is_custom_quote', 'optionGroups', 'option_groups']

    def get_image(self, obj):
        if obj.image_upload:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image_upload.url) if request else obj.image_upload.url
        return obj.image

class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'fee']
