"""Serves the SPA's index.html with per-page share tags, since link-preview crawlers don't run JS."""

import json
from decimal import Decimal

from django.conf import settings
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe

from .models import Recipe

SITE_NAME = "Chez Arnaud"
SITE_DESCRIPTION = "Les recettes et la carte de la maison d'Arnaud."
DEFAULT_IMAGE = "/images/me_cook.png"
AUTHOR = "Arnaud Etienne"

# Mirrors frontend/src/formatters/ingredient.ts
FRACTIONS = {Decimal("0.25"): "¼", Decimal("0.5"): "½", Decimal("0.75"): "¾"}


def absolute_url(request, path):
    return settings.SITE_URL + path if settings.SITE_URL else request.build_absolute_uri(path)


def format_count(count):
    if count is None:
        return ""
    return FRACTIONS.get(count) or format(count.normalize(), "f")


def format_ingredient_line(item):
    quantity = " ".join(filter(None, [format_count(item.count), item.unit]))
    base = item.prefix + " ".join(filter(None, [quantity, item.label]))
    return f"{base} — {item.note}" if item.note else base


def recipe_json_ld(request, recipe):
    """schema.org Recipe: https://developers.google.com/search/docs/appearance/structured-data/recipe"""
    data = {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": recipe.title,
        "author": {"@type": "Person", "name": AUTHOR},
        "datePublished": recipe.published_at.date().isoformat(),
        "recipeIngredient": [
            format_ingredient_line(item) for group in recipe.ingredient_groups.all() for item in group.items.all()
        ],
        "recipeInstructions": [{"@type": "HowToStep", "text": step.text} for step in recipe.steps.all()],
    }
    if recipe.image:
        data["image"] = [absolute_url(request, recipe.image.url)]
    if recipe.description:
        data["description"] = recipe.description
    if recipe.servings:
        data["recipeYield"] = recipe.servings
    # Escape like Django's json_script so recipe text can't close the <script> tag
    text = json.dumps(data, ensure_ascii=False)
    return mark_safe(text.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026"))


def page_meta(request, path):
    """(meta, status) for a URL path; meta keys feed content/head.html."""
    meta = {"title": SITE_NAME, "description": SITE_DESCRIPTION, "image": DEFAULT_IMAGE, "type": "website"}

    if path == "/":
        meta["title"] = f"{SITE_NAME} — Recettes"
    elif path.rstrip("/") == "/menu":
        meta["title"] = f"{SITE_NAME} — Menu"
    elif path.startswith("/recettes/"):
        slug = path.removeprefix("/recettes/").strip("/")
        recipe = (
            Recipe.objects.filter(slug=slug, published_at__isnull=False)
            .prefetch_related("ingredient_groups__items", "steps")
            .first()
        )
        if not recipe:
            return {**meta, "title": f"{SITE_NAME} — Recette", "noindex": True}, 404
        meta.update(title=f"{SITE_NAME} — {recipe.title}", type="article", json_ld=recipe_json_ld(request, recipe))
        if recipe.description:
            meta["description"] = recipe.description
        if recipe.image:
            meta["image"] = recipe.image.url
    elif path.startswith("/admin"):
        meta["noindex"] = True

    return meta, 200


def spa(request):
    meta, status = page_meta(request, request.path)
    meta.update(
        url=absolute_url(request, request.path),
        image=absolute_url(request, meta["image"]),
        site_name=SITE_NAME,
    )
    head = render_to_string("content/head.html", meta)
    html = (settings.FRONTEND_DIST / "index.html").read_text()
    return HttpResponse(html.replace("</head>", head + "</head>", 1), status=status)
