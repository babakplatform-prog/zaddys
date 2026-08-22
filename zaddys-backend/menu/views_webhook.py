import hashlib
import hmac
import json

from django.conf import settings
from rest_framework import status, views
from rest_framework.response import Response

from .models import Order


class PaystackWebhookView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        signature = request.headers.get('x-paystack-signature', '')
        expected = hmac.new(
            settings.PAYSTACK_SECRET_KEY.encode(),
            request.body,
            hashlib.sha512,
        ).hexdigest()
        if not signature or not hmac.compare_digest(signature, expected):
            return Response({'error': 'Invalid signature.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = json.loads(request.body)
        except (TypeError, ValueError):
            return Response({'error': 'Invalid payload.'}, status=status.HTTP_400_BAD_REQUEST)

        if payload.get('event') != 'charge.success':
            return Response(status=status.HTTP_200_OK)

        data = payload.get('data', {})
        reference = data.get('reference')
        order = Order.objects.filter(payment_reference=reference).first()
        if order and not order.is_paid:
            order.is_paid = True
            order.transaction_id = str(data.get('id', order.transaction_id))
            order.payment_method = data.get('channel', order.payment_method)
            order.save(update_fields=['is_paid', 'transaction_id', 'payment_method'])

        return Response(status=status.HTTP_200_OK)