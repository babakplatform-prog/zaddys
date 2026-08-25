import hashlib
import hmac
import json
import base64
import binascii
import time

from django.conf import settings
from django.db import IntegrityError
from rest_framework import status, views
from rest_framework.response import Response

from .models import Order, ResendWebhookEvent


class PaystackWebhookView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        secret = settings.PAYSTACK_WEBHOOK_SECRET or settings.PAYSTACK_SECRET_KEY
        signature = request.headers.get('x-paystack-signature', '')
        expected = hmac.new(
            secret.encode(),
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


class ResendWebhookView(views.APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        secret = settings.RESEND_WEBHOOK_SECRET
        if not secret:
            return Response({'error': 'Webhook is not configured.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        webhook_id = request.headers.get('svix-id', '')
        timestamp = request.headers.get('svix-timestamp', '')
        signatures = request.headers.get('svix-signature', '')
        if not webhook_id or not timestamp or not signatures:
            return Response({'error': 'Missing webhook signature.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            timestamp_value = int(timestamp)
            if abs(time.time() - timestamp_value) > 300:
                return Response({'error': 'Expired webhook.'}, status=status.HTTP_401_UNAUTHORIZED)
            secret_bytes = base64.b64decode(secret.removeprefix('whsec_'))
        except (ValueError, binascii.Error):
            return Response({'error': 'Invalid webhook configuration.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        signed_content = f'{webhook_id}.{timestamp}.'.encode() + request.body
        expected = base64.b64encode(hmac.new(secret_bytes, signed_content, hashlib.sha256).digest()).decode()
        valid_signatures = []
        for value in signatures.split(' '):
            if value.startswith('v1,'):
                valid_signatures.append(value[3:])
            elif value.startswith('v1-'):
                valid_signatures.append(value[3:])
        if not any(hmac.compare_digest(expected, signature) for signature in valid_signatures):
            return Response({'error': 'Invalid signature.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            payload = json.loads(request.body)
            data = payload.get('data', {})
            event, created = ResendWebhookEvent.objects.get_or_create(
                event_id=webhook_id,
                defaults={
                    'event_type': payload.get('type', 'unknown'),
                    'email_id': data.get('email_id', ''),
                    'payload': payload,
                },
            )
        except (TypeError, ValueError):
            return Response({'error': 'Invalid payload.'}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            created = False

        return Response({'received': True, 'duplicate': not created}, status=status.HTTP_200_OK)