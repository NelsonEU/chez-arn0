import json
from decimal import Decimal

import pytest
from django.utils import timezone

from content.models import Ingredient, IngredientGroup

from .factories import make_complete_recipe

pytestmark = pytest.mark.django_db

INDEX_HTML = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"></head><body><div id=\"root\"></div></body></html>"


@pytest.fixture(autouse=True)
def frontend_dist(settings, tmp_path):
    (tmp_path / "index.html").write_text(INDEX_HTML)
    settings.FRONTEND_DIST = tmp_path
    settings.SITE_URL = "https://chez.example"


def published_recipe(**overrides):
    recipe = make_complete_recipe(**overrides)
    recipe.published_at = timezone.now()
    recipe.save(update_fields=["published_at"])
    return recipe


def test_home_gets_site_defaults(client):
    response = client.get("/")

    html = response.content.decode()
    assert response.status_code == 200
    assert "<title>Chez Arnaud — Recettes</title>" in html
    assert '<meta property="og:image" content="https://chez.example/images/me_cook.png" />' in html
    assert '<link rel="canonical" href="https://chez.example/" />' in html
    assert '<div id="root"></div>' in html


def test_recipe_page_gets_its_own_share_tags(client):
    recipe = published_recipe(slug="fondue", title="Fondue", description="Bœuf & bouillon.")

    response = client.get("/recettes/fondue")

    html = response.content.decode()
    assert response.status_code == 200
    assert "<title>Chez Arnaud — Fondue</title>" in html
    assert '<meta property="og:description" content="Bœuf &amp; bouillon." />' in html
    assert f'<meta property="og:image" content="https://chez.example{recipe.image.url}" />' in html
    assert '<meta property="og:type" content="article" />' in html


def json_ld(html):
    start = html.index('<script type="application/ld+json">') + len('<script type="application/ld+json">')
    return json.loads(html[start : html.index("</script>", start)])


def test_recipe_page_has_recipe_structured_data(client):
    recipe = published_recipe(slug="fondue", title="Fondue", servings="4 personnes")
    group = IngredientGroup.objects.create(recipe=recipe, name="Marinade", order=1)
    Ingredient.objects.create(group=group, prefix="Jus d'", count=Decimal("0.50"), label="citron", order=1)
    Ingredient.objects.create(group=group, count=Decimal("800.00"), unit="g", label="de bœuf", note="filet", order=2)
    Ingredient.objects.create(group=group, label="Sel, poivre", order=3)

    data = json_ld(client.get("/recettes/fondue").content.decode())

    assert data["@type"] == "Recipe"
    assert data["name"] == "Fondue"
    assert data["recipeYield"] == "4 personnes"
    assert data["datePublished"] == recipe.published_at.date().isoformat()
    assert data["image"] == [f"https://chez.example{recipe.image.url}"]
    # make_complete_recipe adds "Flour" in its own (first) group
    assert data["recipeIngredient"] == ["Flour", "Jus d'½ citron", "800 g de bœuf — filet", "Sel, poivre"]
    assert data["recipeInstructions"] == [{"@type": "HowToStep", "text": "Mix it."}]


def test_structured_data_cannot_close_its_script_tag(client):
    published_recipe(slug="evil", title="</script><script>alert(1)</script>")

    html = client.get("/recettes/evil").content.decode()

    assert "<script>alert(1)" not in html
    assert json_ld(html)["name"] == "</script><script>alert(1)</script>"


def test_draft_recipe_page_404s_without_leaking_it(client):
    make_complete_recipe(slug="secret", title="Secret dish")

    response = client.get("/recettes/secret")

    html = response.content.decode()
    assert response.status_code == 404
    assert "Secret dish" not in html
    assert '<meta name="robots" content="noindex" />' in html


def test_admin_pages_are_noindex(client):
    response = client.get("/admin")

    assert '<meta name="robots" content="noindex" />' in response.content.decode()
