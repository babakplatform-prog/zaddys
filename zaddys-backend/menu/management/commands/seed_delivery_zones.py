from django.core.management.base import BaseCommand
from menu.models import DeliveryZone


class Command(BaseCommand):
    help = 'Create or update Zaddys delivery zones without touching products.'

    zones = {
        'Ilorin GRA': 1500,
        'Tanke': 1500,
        'Fate': 2000,
        'Adewole': 1500,
        'University Road': 2000,
    }

    def handle(self, *args, **options):
        for name, fee in self.zones.items():
            zone, created = DeliveryZone.objects.update_or_create(
                name=name,
                defaults={'fee': fee, 'is_active': True},
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'{action} {zone.name}: N{zone.fee}')
        self.stdout.write(self.style.SUCCESS('Delivery zones are ready.'))
