import resend
from django.conf import settings

# This safely gets the key or defaults to a string so it doesn't crash if missing
resend.api_key = getattr(settings, 'RESEND_API_KEY', 're_your_test_key_here')

def send_welcome_email(user_email, user_name):
    try:
        r = resend.Emails.send({
            "from": "Zaddys Creamery & Grills <onboarding@zaddys.ng>",
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