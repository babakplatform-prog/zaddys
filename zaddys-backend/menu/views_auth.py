import random
from rest_framework import status, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import CustomerProfile
from .utils import send_welcome_email
import resend
from django.conf import settings

# Make sure you have your Resend utility setup correctly
resend.api_key = getattr(settings, 'RESEND_API_KEY', 're_your_test_key_here')

def send_otp_email(user_email, otp_code):
    try:
        resend.Emails.send({
            "from": "Zaddys Creamery & Grills <onboarding@zaddys.ng>",
            "to": [user_email],
            "subject": "Your Zaddys Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 12px; text-align: center;">
                <h1 style="color: #E31B23;">ZADDYS</h1>
                <p style="font-size: 16px; color: #ccc;">Your secure login code is:</p>
                <h2 style="font-size: 32px; letter-spacing: 5px; color: #fff; background: #222; padding: 15px; border-radius: 10px; display: inline-block;">{otp_code}</h2>
                <p style="font-size: 12px; color: #777; margin-top: 20px;">This code expires in 10 minutes. Do not share it with anyone.</p>
            </div>
            """
        })
    except Exception as e:
        print("OTP Email Error:", e)

class RegisterView(views.APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        phone = request.data.get('phone', '')

        if not email or not password:
            return Response({"error": "Email and password required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"error": "Account exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username or email, email=email, password=password)
        profile = CustomerProfile.objects.create(user=user, phone=phone, is_verified=True) # Auto-verify on fresh signup
        
        send_welcome_email(email, username or "Foodie")
        return Response({"message": "Registered successfully!"}, status=status.HTTP_201_CREATED)

class LoginView(views.APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        # In Django, authenticate usually expects 'username'. We look up the username by email.
        try:
            user_obj = User.objects.get(email=email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None

        if user is not None:
            profile = CustomerProfile.objects.get(user=user)
            # Generate 6-digit OTP
            otp = str(random.randint(100000, 999999))
            profile.otp_code = otp
            profile.save()
            
            # Send OTP via Resend
            send_otp_email(user.email, otp)
            
            return Response({"message": "OTP sent to email", "email": email}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class VerifyOTPView(views.APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        try:
            user = User.objects.get(email=email)
            profile = CustomerProfile.objects.get(user=user)
            
            if profile.otp_code == otp:
                profile.is_verified = True
                profile.otp_code = "" # Clear it after use
                profile.save()
                return Response({"message": "Verification successful"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)