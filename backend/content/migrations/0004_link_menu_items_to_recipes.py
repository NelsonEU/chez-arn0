from django.db import migrations

# Menu item labels that happen to correspond to an existing written recipe,
# by label -> recipe slug.
KNOWN_MATCHES = {
    "kleftiko": "kleftiko",
    "vol au vent": "vol-au-vent",
    "fondue glareyarde": "fondue-glareyarde",
}


def link_matches(apps, schema_editor):
    MenuItem = apps.get_model("content", "MenuItem")
    Recipe = apps.get_model("content", "Recipe")

    for label, slug in KNOWN_MATCHES.items():
        recipe = Recipe.objects.filter(slug=slug).first()
        if not recipe:
            continue
        MenuItem.objects.filter(label=label).update(recipe=recipe)


def unlink_matches(apps, schema_editor):
    MenuItem = apps.get_model("content", "MenuItem")
    MenuItem.objects.filter(label__in=KNOWN_MATCHES.keys()).update(recipe=None)


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0003_menuitem_recipe"),
    ]

    operations = [
        migrations.RunPython(link_matches, unlink_matches),
    ]
