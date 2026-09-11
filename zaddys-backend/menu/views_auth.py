import random
import secrets
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
    if settings.E2E_TEST_MODE:
        return
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
    otp = str(secrets.randbelow(900000) + 100000)
    profile.otp_code = otp
    profile.otp_expires_at = timezone.now() + timedelta(minutes=10)
    profile.otp_attempts = 0
    profile.save(update_fields=['otp_code', 'otp_expires_at', 'otp_attempts'])
    send_otp_email(profile.user.email, otp, profile.user.get_full_name() or profile.user.username)

def send_password_reset_email(user_email, user_name, token):
    if settings.E2E_TEST_MODE:
        return
    resend.Emails.send({
        "from": f"Zaddys Creamery & Grills <{settings.DEFAULT_FROM_EMAIL}>",
        "to": [user_email],
        "subject": "Reset your Zaddys password",
        "html": f"""
        <div style="max-width:600px;margin:auto;padding:40px;font-family:Arial,sans-serif">
          <h1 style="color:#e31b23">ZADDYS</h1>
          <p>Hi {user_name or 'there'},</p>
          <p>Use the button below to reset your password. This link expires in 30 minutes.</p>
          <p><a href="{settings.APP_URL}/forgot-password?token={token}" style="background:#e31b23;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none">Reset password</a></p>
        </div>
        """
    })

class RegisterView(views.APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        phone = request.data.get('phone', '')
        referral_code = request.data.get('referralCode', '').strip()
        full_name = request.data.get('fullName', '').strip()

        if not email or not password:
            return Response({"error": "Email and password required."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"error": "Account exists."}, status=status.HTTP_400_BAD_REQUEST)

        login_username = username or email
        if User.objects.filter(username=login_username).exists():
            login_username = f'{login_username}-{random.randint(1000, 9999)}'
        user = User.objects.create_user(username=login_username, email=email, password=password)
        name_parts = full_name.split(' ', 1)
        user.first_name = name_parts[0] if name_parts else ''
        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        user.save(update_fields=['first_name', 'last_name'])
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

class ForgotPasswordView(views.APIView):
    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.filter(email__iexact=email).first()
        if user:
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            token = secrets.token_urlsafe(48)
            profile.password_reset_token = token
            profile.password_reset_expires_at = timezone.now() + timedelta(minutes=30)
            profile.save(update_fields=['password_reset_token', 'password_reset_expires_at'])
            send_password_reset_email(user.email, user.get_full_name() or user.username, token)
        return Response({"message": "If an account exists for that email, a reset link has been sent."})

class ResetPasswordView(views.APIView):
    def post(self, request):
        token = request.data.get('token', '')
        password = request.data.get('password', '')
        if not token or len(password) < 8:
            return Response({"error": "A valid reset link and password of at least 8 characters are required."}, status=status.HTTP_400_BAD_REQUEST)
        profile = CustomerProfile.objects.filter(
            password_reset_token=token,
            password_reset_expires_at__gt=timezone.now(),
        ).select_related('user').first()
        if not profile:
            return Response({"error": "This reset link is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)
        profile.user.set_password(password)
        profile.user.save(update_fields=['password'])
        profile.password_reset_token = None
        profile.password_reset_expires_at = None
        profile.save(update_fields=['password_reset_token', 'password_reset_expires_at'])
        return Response({"message": "Password reset successful."})

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

class SocialLoginView(views.APIView):
    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name', '')
        # Simple shared secret to authenticate the Next.js backend calling this
        secret = request.data.get('secret')
        
        expected_secret = getattr(settings, 'SOCIAL_LOGIN_SECRET', '')
        if not expected_secret or secret != expected_secret:
            return Response({"error": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.filter(email=email).first()
        if not user:
            import random
            username = email.split('@')[0]
            if User.objects.filter(username=username).exists():
                username = f"{username}-{random.randint(1000, 9999)}"
            user = User.objects.create_user(username=username, email=email)
            parts = name.strip().split(' ', 1)
            user.first_name = parts[0] if parts else ''
            if len(parts) > 1:
                user.last_name = parts[1]
            user.save()
            
            CustomerProfile.objects.create(user=user, is_verified=True)
        else:
            profile, _ = CustomerProfile.objects.get_or_create(user=user)
            if name and not user.get_full_name():
                parts = name.strip().split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ''
                user.save(update_fields=['first_name', 'last_name'])
            if not profile.is_verified:
                profile.is_verified = True
                profile.save(update_fields=['is_verified'])

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "name": user.get_full_name() or user.username,
                "email": user.email,
            },
        }, status=status.HTTP_200_OK)