import pytest

from content.models import Category, MenuItem

from .factories import make_recipe

pytestmark = pytest.mark.django_db


def test_menu_item_linked_to_draft_recipe_has_no_recipe_slug(api_client):
    category = Category.objects.create(name="Test Category")
    recipe = make_recipe(title="Draft")
    MenuItem.objects.create(category=category, label="A test dish", recipe=recipe)

    response = api_client.get("/api/menu/")

    items = [item for cat in response.data["categories"] for item in cat["items"]]
    item = next(i for i in items if i["label"] == "A test dish")
    assert item["recipe_slug"] is None
