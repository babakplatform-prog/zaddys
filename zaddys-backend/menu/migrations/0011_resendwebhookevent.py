from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('menu', '0010_seed_initial_catalog'),
    ]

    operations = [
        migrations.CreateModel(
            name='ResendWebhookEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.CharField(max_length=255, unique=True)),
                ('event_type', models.CharField(max_length=100)),
                ('email_id', models.CharField(blank=True, max_length=255)),
                ('payload', models.JSONField()),
                ('received_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
    ]