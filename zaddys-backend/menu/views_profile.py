from rest_framework import views, status
from rest_framework.response import Response
from .models import Order, CustomerProfile
from django.contrib.auth.models import User

class UserProfileView(views.APIView):
    def get(self, request, email):
        try:
            # Find the user and their profile
            user = User.objects.get(email=email)
            profile = CustomerProfile.objects.get(user=user)
            
            # Get their order history (matching by phone for now)
            orders = Order.objects.filter(phone=profile.phone).order_by('-id').values(
                'id', 'total_price', 'status', 'delivery_address'
            )
            
            return Response({
                "name": user.username,
                "email": user.email,
                "phone": profile.phone,
                "referral_code": profile.referral_code,
                "points": getattr(profile, 'points', 0), # Fallback to 0 if points aren't set
                "orders": list(orders)
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except CustomerProfile.DoesNotExist:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)