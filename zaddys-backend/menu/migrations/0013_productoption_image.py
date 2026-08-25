from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('menu', '0012_customerprofile_otp_expiry'),
    ]

    operations = [
        migrations.AddField(
            model_name='productoption',
            name='image',
            field=models.URLField(blank=True, null=True),
        ),
    ]