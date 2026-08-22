import json
from decimal import Decimal
import requests
from django.conf import settings
from django.db import transaction
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Coupon, Order, OrderItem, Product, DeliveryZone, LoyaltyTransaction

class OrderTrackingView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_number):
        order = Order.objects.filter(order_number=order_number, user=request.user).first()
        if not order:
            return Response({'error': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            'order_number': order.order_number,
            'status': order.status,
            'is_paid': order.is_paid,
            'total_price': order.total_price,
            'delivery_fee': order.delivery_fee,
            'created_at': order.created_at,
        })

class CreateOrderView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        reference = data.get('transaction_ref')
        cart_items = data.get('cart', [])
        zone_id = data.get('delivery_zone_id')
        if not reference or not cart_items or not zone_id:
            return Response({'error': 'Payment reference and cart are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            existing_order = Order.objects.filter(payment_reference=reference, user=request.user).first()
            if existing_order:
                return Response({
                    'message': 'Order already created.',
                    'order_id': existing_order.id,
                    'order_number': existing_order.order_number,
                }, status=status.HTTP_200_OK)

            verification = requests.get(
                f'https://api.paystack.co/transaction/verify/{reference}',
                headers={'Authorization': f'Bearer {settings.PAYSTACK_SECRET_KEY}'},
                timeout=10,
            )
            verification.raise_for_status()
            payment = verification.json().get('data', {})
            if payment.get('status') != 'success':
                return Response({'error': 'Paystack did not confirm this payment.'}, status=status.HTTP_400_BAD_REQUEST)

            products = []
            total = Decimal('0')
            delivery_zone = DeliveryZone.objects.get(id=zone_id, is_active=True)
            for item in cart_items:
                product = Product.objects.get(id=item['id'])
                quantity = int(item['quantity'])
                if quantity < 1 or not product.is_available:
                    return Response({'error': f'{product.name} is unavailable.'}, status=status.HTTP_400_BAD_REQUEST)
                option_ids = item.get('selected_option_ids', [])
                options = list(product.option_groups.filter(options__id__in=option_ids).values_list('options__price_extra', flat=True)) if option_ids else []
                unit_price = product.price + sum(options, Decimal('0'))
                products.append((product, quantity, option_ids, unit_price))
                total += unit_price * quantity

            total += delivery_zone.fee
            discount = Decimal('0')
            coupon_code = str(data.get('coupon_code', '')).strip().upper()
            coupon = Coupon.objects.filter(code=coupon_code).first() if coupon_code else None
            if coupon_code and (not coupon or not coupon.is_valid() or total < coupon.minimum_order):
                return Response({'error': 'This coupon is invalid or no longer available.'}, status=status.HTTP_400_BAD_REQUEST)
            if coupon:
                discount = total * coupon.discount_value / 100 if coupon.discount_type == 'percentage' else coupon.discount_value
                discount = min(discount, total)
                total -= discount
            expected_amount = int(total * 100)
            if payment.get('amount') != expected_amount or payment.get('customer', {}).get('email') != data.get('email'):
                return Response({'error': 'Payment amount or customer does not match this order.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                order = Order.objects.create(
                    user=request.user,
                    customer_name=data.get('customer_name', request.user.get_full_name() or request.user.username),
                    email=data.get('email'),
                    phone=data.get('phone'),
                    delivery_address=data.get('delivery_address'),
                    landmark=data.get('landmark'),
                    city=data.get('city'),
                    delivery_notes=data.get('delivery_notes', ''),
                    preferred_delivery_time=data.get('preferred_delivery_time'),
                    delivery_zone=delivery_zone,
                    delivery_fee=delivery_zone.fee,
                    coupon_code=coupon.code if coupon else '',
                    discount_amount=discount,
                    payment_reference=reference,
                    transaction_id=str(payment.get('id', '')),
                    payment_method=payment.get('channel', ''),
                    total_price=total,
                    is_paid=True,
                    status='Pending Confirmation',
                )
                for product, quantity, option_ids, unit_price in products:
                    OrderItem.objects.create(order=order, product=product, quantity=quantity, price=unit_price, selected_options=json.dumps(option_ids))
                if coupon:
                    coupon.usage_count += 1
                    coupon.save(update_fields=['usage_count'])
                points = int(total // 1000)
                if points:
                    profile = request.user.profile
                    profile.points += points
                    profile.save(update_fields=['points'])
                    LoyaltyTransaction.objects.create(profile=profile, points_delta=points, reason=f'Order {order.order_number}')

            return Response({
                'message': 'Order created securely!',
                'order_id': order.id,
                'order_number': order.order_number,
            }, status=status.HTTP_201_CREATED)
        except requests.RequestException:
            return Response({'error': 'Unable to verify payment right now.'}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            return Response({'error': 'Unable to create this order.'}, status=status.HTTP_400_BAD_REQUEST)