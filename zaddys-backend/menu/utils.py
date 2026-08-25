import resend
from django.conf import settings

# This safely gets the key or defaults to a string so it doesn't crash if missing
resend.api_key = getattr(settings, 'RESEND_API_KEY', '')

def send_welcome_email(user_email, user_name):
    if settings.E2E_TEST_MODE:
        return None
    try:
        r = resend.Emails.send({
            "from": f"Zaddys Creamery & Grills <{settings.DEFAULT_FROM_EMAIL}>",
            "to": [user_email],
            "subject": "Welcome to Zaddys, " + user_name + "! 🍦",
            "html": f"""
            <div style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px; border-radius: 12px;">
                <h1 style="color: #E31B23;">ZADDYS</h1>
                <p>Welcome to the ultimate gourmet experience, {user_name}!</p>
            </div>
            """
        })
        return r
    except Exception as e:
        print("Resend Email Error:", e)
        return None

def send_order_confirmation_email(user_email, user_name, order_number, total):
    if settings.E2E_TEST_MODE:
        return None
    try:
        return resend.Emails.send({
            "from": f"Zaddys Creamery & Grills <{settings.DEFAULT_FROM_EMAIL}>",
            "to": [user_email],
            "subject": f"Order {order_number} is confirmed",
            "html": f"""
            <div style="margin:0 auto;max-width:600px;padding:40px;font-family:Arial,sans-serif;color:#181818;background:#fff;border:1px solid #eee">
              <img src="https://zaddys.ng/zaddys-logo.jpg" alt="Zaddy's Creamery and Grills" style="width:180px;max-width:100%;height:auto">
              <p style="font-size:16px">Dear {user_name},</p>
              <h1 style="color:#e31b23;font-size:26px">Your order is confirmed</h1>
              <p>We have received order <strong>{order_number}</strong> for <strong>₦{total}</strong>.</p>
              <p style="text-align:center;margin:32px 0"><a href="https://zaddys.ng/track/{order_number}" style="background:#e31b23;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Track your order</a></p>
              <p style="font-size:13px;color:#666">We will keep you updated as your order moves through preparation and delivery.</p>
            </div>
            """,
        })
    except Exception as e:
        print("Resend Email Error:", e)
        return None

def send_order_status_email(user_email, user_name, order_number, status):
    if settings.E2E_TEST_MODE:
        return None
    try:
        return resend.Emails.send({
            "from": f"Zaddys Creamery & Grills <{settings.DEFAULT_FROM_EMAIL}>",
            "to": [user_email],
            "subject": f"Order {order_number} is {status}",
            "html": f"""
            <div style="margin:0 auto;max-width:600px;padding:40px;font-family:Arial,sans-serif;color:#181818;background:#fff;border:1px solid #eee">
              <h1 style="color:#e31b23;font-size:30px">ZADDYS</h1>
              <p style="font-size:16px">Dear {user_name},</p>
              <p style="font-size:16px;line-height:1.6">Your order <strong>{order_number}</strong> is now <strong>{status}</strong>.</p>
              <p style="text-align:center;margin:32px 0"><a href="{settings.APP_URL}/track/{order_number}" style="background:#e31b23;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Track your order</a></p>
            </div>
            """,
        })
    except Exception as e:
        print("Resend Email Error:", e)
        return None