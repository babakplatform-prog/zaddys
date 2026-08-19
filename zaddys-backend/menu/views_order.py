from rest_framework import status, views
from rest_framework.response import Response
from .models import Order, OrderItem, Product
from django.contrib.auth.models import User

class CreateOrderView(views.APIView):
    def post(self, request):
        data = request.data
        try:
            # We assume successful Paystack payment if this endpoint is hit
            order = Order.objects.create(
                phone=data.get('phone'),
                delivery_address=data.get('delivery_address'),
                total_price=data.get('cartTotal'),
                is_paid=True, 
                status='Pending'
            )
            
            # Loop through the cart and save individual items
            cart_items = data.get('cart', [])
            for item in cart_items:
                product = Product.objects.get(id=item['id'])
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item['quantity'],
                    price=item['price']
                )
            
            # (Optional) Here is where we will eventually trigger Resend for the Receipt!
            
            return Response({
                "message": "Order created securely!", 
                "order_id": order.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)