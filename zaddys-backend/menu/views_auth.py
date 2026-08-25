import random
from datetime import timedelta
from django.utils import timezone
from rest_framework import status, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import CustomerProfile, ReferralRecord, LoyaltyTransaction
from .utils import send_welcome_email
import resend
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

# Make sure you have your Resend utility setup correctly
resend.api_key = getattr(settings, 'RESEND_API_KEY', '')

def send_otp_email(user_email, otp_code, user_name='there'):
    try:
        resend.Emails.send({
                "from": f"Zaddys Creamery & Grills <{settings.DEFAULT_FROM_EMAIL}>",
            "to": [user_email],
            "subject": "Your Zaddys Verification Code",
            "html": f"""
            <div style="margin:0 auto;max-width:600px;padding:40px;font-family:Arial,sans-serif;color:#181818;background:#fff;border:1px solid #eee">
                <h1 style="color:#e31b23;font-size:30px;margin:0 0 28px">ZADDYS</h1>
                <p style="font-size:16px">Dear {user_name},</p>
                <p style="font-size:16px;line-height:1.6">Use this secure code to verify your Zaddy&apos;s account:</p>
                <p style="margin:28px 0;text-align:center;font-size:34px;letter-spacing:8px;font-weight:bold;color:#e31b23">{otp_code}</p>
                <p style="text-align:center;margin:32px 0"><a href="{settings.APP_URL}/auth/verify" style="background:#e31b23;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Verify Zaddy&apos;s</a></p>
                <p style="font-size:13px;color:#666">This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
            </div>
            """
        })
    except Exception as e:
        print("OTP Email Error:", e)

def issue_otp(profile):
    otp = str(random.randint(100000, 999999))
    profile.otp_code = otp
    profile.otp_expires_at = timezone.now() + timedelta(minutes=10)
    profile.otp_attempts = 0
    profile.save(update_fields=['otp_code', 'otp_expires_at', 'otp_attempts'])
    send_otp_email(profile.user.email, otp, profile.user.get_full_name() or profile.user.username)

class RegisterView(views.APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        phone = request.data.get('phone', '')
        referral_code = request.data.get('referralCode', '').strip()

        if not email or not password:
            return Response({"error": "Email and password required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"error": "Account exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username or email, email=email, password=password)
        profile = CustomerProfile.objects.create(user=user, phone=phone, is_verified=False)

        issue_otp(profile)

        if referral_code:
            referrer = CustomerProfile.objects.filter(referral_code=referral_code).first()
            if referrer and referrer != profile:
                referral_points = 100
                ReferralRecord.objects.create(referrer=referrer, referred_customer=profile, points_awarded=referral_points)
                referrer.points += referral_points
                referrer.save(update_fields=['points'])
                LoyaltyTransaction.objects.create(profile=referrer, points_delta=referral_points, reason=f'Referral of {profile.user.email}')
        
        return Response({
            "message": "Account created. Check your email for a verification code.",
            "email": email,
        }, status=status.HTTP_201_CREATED)

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
            issue_otp(profile)
            
            return Response({"message": "OTP sent to email", "email": email}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class ResendOTPView(views.APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            profile = CustomerProfile.objects.get(user=user)
            if profile.is_verified:
                return Response({"error": "This account is already verified."}, status=status.HTTP_400_BAD_REQUEST)
            issue_otp(profile)
            return Response({"message": "A new verification code was sent.", "email": email}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class VerifyOTPView(views.APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        
        try:
            user = User.objects.get(email=email)
            profile = CustomerProfile.objects.get(user=user)
            
            if profile.otp_attempts >= 5:
                return Response({"error": "Too many attempts. Request a new code."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            if not profile.otp_expires_at or profile.otp_expires_at <= timezone.now():
                return Response({"error": "This code has expired. Request a new code."}, status=status.HTTP_400_BAD_REQUEST)
            if profile.otp_code == otp:
                profile.is_verified = True
                profile.otp_code = "" # Clear it after use
                profile.otp_expires_at = None
                profile.otp_attempts = 0
                profile.save(update_fields=['is_verified', 'otp_code', 'otp_expires_at', 'otp_attempts'])
                send_welcome_email(user.email, user.get_full_name() or user.username)
                refresh = RefreshToken.for_user(user)
                return Response({
                    "message": "Verification successful",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "name": user.get_full_name() or user.username,
                        "email": user.email,
                    },
                }, status=status.HTTP_200_OK)
            else:
                profile.otp_attempts += 1
                profile.save(update_fields=['otp_attempts'])
                return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)