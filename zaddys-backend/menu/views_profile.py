from rest_framework import views, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, CustomerProfile
from django.contrib.auth.models import User

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            
            # Get their order history (matching by phone for now)
            orders = Order.objects.filter(user=user).order_by('-id').values(
                'id', 'order_number', 'total_price', 'status', 'delivery_address', 'created_at'
            )
            
            return Response({
                "name": user.get_full_name() or user.username,
                "email": user.email,
                "phone": profile.phone,
                "referral_code": profile.referral_code,
                "points": getattr(profile, 'points', 0), # Fallback to 0 if points aren't set
                "addresses": list(profile.addresses.values('id', 'label', 'address', 'landmark', 'city', 'is_default')),
                "orders": list(orders)
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except CustomerProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)