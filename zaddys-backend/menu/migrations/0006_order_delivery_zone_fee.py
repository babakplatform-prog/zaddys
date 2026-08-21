from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [('menu', '0005_deliveryzone_loyalty_referral')]

    operations = [
        migrations.AddField(
            model_name='order', name='delivery_fee',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name='order', name='delivery_zone',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='orders', to='menu.deliveryzone'),
        ),
    ]