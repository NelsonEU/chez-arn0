from django.db import migrations, models
from django.utils import timezone


def backfill_published_at(apps, schema_editor):
    # Existing recipes are already live on the public site — without this,
    # they'd all become invisible drafts the moment this migration runs.
    # Only recipes created after this point default to draft (NULL).
    Recipe = apps.get_model("content", "Recipe")
    Recipe.objects.filter(published_at__isnull=True).update(published_at=timezone.now())


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("content", "0005_create_admin_user"),
    ]

    operations = [
        migrations.AddField(
            model_name="recipe",
            name="published_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(backfill_published_at, noop),
    ]
