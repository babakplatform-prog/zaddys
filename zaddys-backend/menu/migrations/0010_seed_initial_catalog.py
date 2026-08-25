from django.db import migrations


def seed_catalog(apps, schema_editor):
    from django.core.management import call_command

    option_columns = {
        column.name
        for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(), 'menu_productoption'
        )
    }
    if 'image' not in option_columns:
        return

    call_command('seed_menu', verbosity=0)
    call_command('seed_delivery_zones', verbosity=0)


class Migration(migrations.Migration):
    dependencies = [
        ('menu', '0009_order_user_set_null'),
    ]

    operations = [migrations.RunPython(seed_catalog, migrations.RunPython.noop)]