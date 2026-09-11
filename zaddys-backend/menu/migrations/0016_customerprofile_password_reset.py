from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("menu", "0015_audit_fixes"),
    ]

    operations = [
        migrations.AddField(
            model_name="customerprofile",
            name="password_reset_token",
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name="customerprofile",
            name="password_reset_expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
