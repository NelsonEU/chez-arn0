import json
from decimal import Decimal
from pathlib import Path

from django.core.files import File
from django.db import migrations

SEED_DIR = Path(__file__).resolve().parent / "seed_data"


def seed_data(apps, schema_editor):
    Category = apps.get_model("content", "Category")
    MenuItem = apps.get_model("content", "MenuItem")
    Recipe = apps.get_model("content", "Recipe")
    IngredientGroup = apps.get_model("content", "IngredientGroup")
    Ingredient = apps.get_model("content", "Ingredient")
    RecipeStep = apps.get_model("content", "RecipeStep")

    menu = json.loads((SEED_DIR / "menu.json").read_text(encoding="utf-8"))
    for cat_order, cat_data in enumerate(menu["categories"]):
        category = Category.objects.create(name=cat_data["name"], order=cat_order)
        for item_order, label in enumerate(cat_data["items"]):
            MenuItem.objects.create(category=category, label=label, order=item_order)

    recipes = json.loads((SEED_DIR / "recipes.json").read_text(encoding="utf-8"))
    for recipe_order, recipe_data in enumerate(recipes["recipes"]):
        recipe = Recipe(
            slug=recipe_data["slug"],
            title=recipe_data["title"],
            servings=recipe_data.get("servings", ""),
            description=recipe_data.get("description", ""),
            note=recipe_data.get("note", ""),
            order=recipe_order,
        )

        image_path = recipe_data.get("image")
        if image_path:
            image_file = SEED_DIR / "images" / Path(image_path).name
            if image_file.exists():
                with image_file.open("rb") as f:
                    recipe.image.save(image_file.name, File(f), save=False)

        recipe.save()

        for group_order, group_data in enumerate(recipe_data.get("ingredients", [])):
            group = IngredientGroup.objects.create(
                recipe=recipe, name=group_data.get("name", ""), order=group_order
            )
            for item_order, item_data in enumerate(group_data.get("items", [])):
                count = item_data.get("count")
                Ingredient.objects.create(
                    group=group,
                    count=Decimal(str(count)) if count is not None else None,
                    unit=item_data.get("unit", ""),
                    prefix=item_data.get("prefix", ""),
                    label=item_data["label"],
                    note=item_data.get("note", ""),
                    order=item_order,
                )

        for step_order, step_text in enumerate(recipe_data.get("steps", [])):
            RecipeStep.objects.create(recipe=recipe, text=step_text, order=step_order)


def remove_data(apps, schema_editor):
    apps.get_model("content", "Category").objects.all().delete()
    apps.get_model("content", "Recipe").objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_data, remove_data),
    ]
