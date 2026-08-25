from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('menu', '0011_resendwebhookevent')]

    operations = [
        migrations.AddField(
            model_name='customerprofile', name='otp_expires_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='customerprofile', name='otp_attempts',
            field=models.PositiveSmallIntegerField(default=0),
        ),
    ]