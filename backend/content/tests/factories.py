"""Plain object-creation helpers for tests — not pytest fixtures, just
shorthand for building the model graph a given test needs. No factory_boy:
the model set is small enough that an extra dependency isn't worth it."""

from django.core.files.uploadedfile import SimpleUploadedFile

from content.models import Ingredient, IngredientGroup, Recipe, RecipeStep


def make_recipe(**overrides):
    defaults = {"slug": "test-recipe", "title": "Test Recipe"}
    defaults.update(overrides)
    return Recipe.objects.create(**defaults)


def make_complete_recipe(**overrides):
    """A recipe satisfying every AdminRecipeViewSet.publish() requirement:
    a description, an image, at least one ingredient, at least one step."""
    defaults = {
        "description": "A tasty test recipe.",
        "image": SimpleUploadedFile("test.png", b"fake-image-bytes", content_type="image/png"),
    }
    defaults.update(overrides)
    recipe = make_recipe(**defaults)
    group = IngredientGroup.objects.create(recipe=recipe, name="")
    Ingredient.objects.create(group=group, label="Flour")
    RecipeStep.objects.create(recipe=recipe, text="Mix it.")
    return recipe
