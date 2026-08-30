import json
import math
from decimal import Decimal
import requests
from django.conf import settings
from django.db import transaction
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Coupon, Order, OrderItem, Product, DeliveryZone, LoyaltyTransaction
from .utils import send_order_confirmation_email

def distance_based_delivery_fee(latitude, longitude):
    origin_lat = math.radians(settings.DELIVERY_ORIGIN_LAT)
    origin_lng = math.radians(settings.DELIVERY_ORIGIN_LNG)
    target_lat = math.radians(float(latitude))
    target_lng = math.radians(float(longitude))
    delta_lat = target_lat - origin_lat
    delta_lng = target_lng - origin_lng
    haversine = math.sin(delta_lat / 2) ** 2 + math.cos(origin_lat) * math.cos(target_lat) * math.sin(delta_lng / 2) ** 2
    distance_km = 6371 * 2 * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine))
    return round(settings.DELIVERY_BASE_FEE + distance_km * settings.DELIVERY_RATE_PER_KM, 2), distance_km

class DeliveryQuoteView(views.APIView):
    permission_classes = []

    def post(self, request):
        try:
            fee, distance_km = distance_based_delivery_fee(request.data['latitude'], request.data['longitude'])
        except (KeyError, TypeError, ValueError):
            return Response({'error': 'A valid delivery location is required.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'fee': fee, 'distance_km': round(distance_km, 2)})

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
        if not reference or not cart_items:
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
            try:
                delivery_fee, _ = distance_based_delivery_fee(data['delivery_latitude'], data['delivery_longitude'])
            except (KeyError, TypeError, ValueError):
                return Response({'error': 'A valid delivery location is required.'}, status=status.HTTP_400_BAD_REQUEST)
            for item in cart_items:
                product = Product.objects.get(id=item['id'])
                quantity = int(item['quantity'])
                if quantity < 1 or not product.is_available:
                    return Response({'error': f'{product.name} is unavailable.'}, status=status.HTTP_400_BAD_REQUEST)
                option_ids = [int(option_id) for option_id in item.get('selected_option_ids', [])]
                option_prices = dict(product.option_groups.filter(options__id__in=option_ids).values_list('options__id', 'options__price_extra')) if option_ids else {}
                if len(option_prices) != len(set(option_ids)):
                    return Response({'error': f'Invalid options for {product.name}.'}, status=status.HTTP_400_BAD_REQUEST)
                unit_price = product.price + sum((option_prices[option_id] for option_id in option_ids), Decimal('0'))
                products.append((product, quantity, option_ids, unit_price))
                total += unit_price * quantity

            total += Decimal(str(delivery_fee))
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
                    delivery_zone=None,
                    delivery_fee=delivery_fee,
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

                    send_order_confirmation_email(order.email, order.customer_name or request.user.username, order.order_number, order.total_price)

            return Response({
                'message': 'Order created securely!',
                'order_id': order.id,
                'order_number': order.order_number,
            }, status=status.HTTP_201_CREATED)
        except requests.RequestException:
            return Response({'error': 'Unable to verify payment right now.'}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            return Response({'error': 'Unable to create this order.'}, status=status.HTTP_400_BAD_REQUEST)