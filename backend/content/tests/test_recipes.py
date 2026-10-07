import pytest
from django.utils import timezone

from content.models import Category, Ingredient, IngredientGroup, MenuItem, RecipeStep

from .factories import make_complete_recipe, make_recipe

pytestmark = pytest.mark.django_db


# --- ordering (ingredients within a group, scoped so one group's reorder
# doesn't leak into another's) ---


def test_ingredient_reorder_is_scoped_to_its_group(auth_client):
    recipe_1 = make_recipe(slug="r1", title="R1")
    recipe_2 = make_recipe(slug="r2", title="R2")
    group_1 = IngredientGroup.objects.create(recipe=recipe_1, name="")
    group_2 = IngredientGroup.objects.create(recipe=recipe_2, name="")
    i1 = Ingredient.objects.create(group=group_1, label="a", order=0)
    i2 = Ingredient.objects.create(group=group_1, label="b", order=1)
    other = Ingredient.objects.create(group=group_2, label="c", order=0)

    response = auth_client.post(
        f"/api/admin/ingredients/reorder/?group={group_1.id}", {"ids": [i2.id, i1.id]}, format="json"
    )

    assert response.status_code == 204
    i1.refresh_from_db()
    i2.refresh_from_db()
    other.refresh_from_db()
    assert (i2.order, i1.order) == (0, 1)
    assert other.order == 0  # a different group's ordering must be untouched


# --- publish validation ---


def test_publish_rejects_an_incomplete_recipe(auth_client):
    recipe = make_recipe(title="Bare")

    response = auth_client.post(f"/api/admin/recipes/{recipe.id}/publish/")

    assert response.status_code == 400
    for expected in ["description", "photo", "ingrédient", "étape"]:
        assert expected in response.data["detail"]
    recipe.refresh_from_db()
    assert recipe.published_at is None


def test_publish_lists_only_the_missing_fields(auth_client):
    recipe = make_recipe(title="Almost", description="Has a description")
    group = IngredientGroup.objects.create(recipe=recipe, name="")
    Ingredient.objects.create(group=group, label="Flour")
    RecipeStep.objects.create(recipe=recipe, text="Mix it.")
    # No image — everything else is present.

    response = auth_client.post(f"/api/admin/recipes/{recipe.id}/publish/")

    assert response.status_code == 400
    assert response.data["detail"] == "Il manque : une photo."


def test_publish_succeeds_once_the_recipe_is_complete(auth_client):
    recipe = make_complete_recipe()

    response = auth_client.post(f"/api/admin/recipes/{recipe.id}/publish/")

    assert response.status_code == 200
    recipe.refresh_from_db()
    assert recipe.published_at is not None


def test_publish_is_idempotent(auth_client):
    recipe = make_complete_recipe()
    auth_client.post(f"/api/admin/recipes/{recipe.id}/publish/")
    recipe.refresh_from_db()
    first_timestamp = recipe.published_at

    response = auth_client.post(f"/api/admin/recipes/{recipe.id}/publish/")

    assert response.status_code == 200
    recipe.refresh_from_db()
    assert recipe.published_at == first_timestamp


# --- public visibility ---


def test_draft_recipe_excluded_from_public_list(api_client):
    draft = make_recipe(slug="a-draft-recipe", title="Draft")

    response = api_client.get("/api/recipes/")

    assert response.status_code == 200
    slugs = [r["slug"] for r in response.data["recipes"]]
    assert draft.slug not in slugs


def test_published_recipe_appears_on_public_list(api_client):
    recipe = make_complete_recipe(slug="a-published-recipe", title="Published")
    recipe.published_at = timezone.now()
    recipe.save(update_fields=["published_at"])

    response = api_client.get("/api/recipes/")

    slugs = [r["slug"] for r in response.data["recipes"]]
    assert recipe.slug in slugs


def test_draft_recipe_detail_404s_publicly(api_client):
    recipe = make_recipe(title="Draft")

    response = api_client.get(f"/api/recipes/{recipe.id}/")

    assert response.status_code == 404


# --- admin picker filtering ---


def test_unlinked_filter_excludes_recipes_already_linked_to_a_menu_item(auth_client):
    category = Category.objects.create(name="Test Category")
    linked = make_recipe(slug="linked", title="Linked")
    unlinked = make_recipe(slug="unlinked", title="Unlinked")
    MenuItem.objects.create(category=category, label="A test dish", recipe=linked)

    response = auth_client.get("/api/admin/recipes/?unlinked=true")

    slugs = [r["slug"] for r in response.data]
    assert unlinked.slug in slugs
    assert linked.slug not in slugs
