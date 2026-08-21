from decimal import Decimal
from rest_framework import status, viewsets, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Coupon, Product, DeliveryZone, SupportConversation, SupportMessage
from .serializers import ProductSerializer, DeliveryZoneSerializer

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True, inventory_status='available')
    serializer_class = ProductSerializer

class DeliveryZoneViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DeliveryZone.objects.filter(is_active=True).order_by('name')
    serializer_class = DeliveryZoneSerializer

class ValidateCouponView(views.APIView):
    def post(self, request):
        code = str(request.data.get('code', '')).strip().upper()
        subtotal = Decimal(str(request.data.get('subtotal', '0')))
        coupon = Coupon.objects.filter(code=code).first()
        if not coupon or not coupon.is_valid() or subtotal < coupon.minimum_order:
            return Response({'error': 'This coupon is invalid or unavailable.'}, status=status.HTTP_400_BAD_REQUEST)
        discount = subtotal * coupon.discount_value / 100 if coupon.discount_type == 'percentage' else coupon.discount_value
        return Response({'code': coupon.code, 'discount': min(discount, subtotal)})

class SupportConversationView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        conversation = SupportConversation.objects.filter(user=request.user).first()
        if not conversation:
            return Response({'conversation': None, 'messages': []})
        messages = conversation.messages.select_related('author').order_by('created_at')
        return Response({
            'conversation': {'id': conversation.id, 'subject': conversation.subject, 'status': conversation.status},
            'messages': [{'id': message.id, 'body': message.body, 'is_staff_reply': message.is_staff_reply, 'created_at': message.created_at} for message in messages],
        })

    def post(self, request):
        body = str(request.data.get('body', '')).strip()
        if not body:
            return Response({'error': 'Message is required.'}, status=status.HTTP_400_BAD_REQUEST)
        conversation, _ = SupportConversation.objects.get_or_create(user=request.user)
        message = SupportMessage.objects.create(conversation=conversation, author=request.user, body=body)
        return Response({'id': message.id, 'body': message.body, 'is_staff_reply': False, 'created_at': message.created_at}, status=status.HTTP_201_CREATED)
