from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_admin_user(apps, schema_editor):
    # apps.get_model() returns a "historical" model with fields only, not the
    # real User class — so set_unusable_password() isn't available here; use
    # the underlying plain function it wraps instead.
    User = apps.get_model("auth", "User")
    User.objects.update_or_create(
        username="admin",
        defaults={"is_staff": True, "is_superuser": True, "password": make_password(None)},
    )


def remove_admin_user(apps, schema_editor):
    apps.get_model("auth", "User").objects.filter(username="admin").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0004_link_menu_items_to_recipes"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunPython(create_admin_user, remove_admin_user),
    ]
