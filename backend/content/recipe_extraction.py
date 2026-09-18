import json
from typing import NotRequired, TypedDict

from django.conf import settings
from google import genai

# Shape matches the admin create serializers, minus title (already set on the recipe).


class ExtractedIngredient(TypedDict):
    prefix: str
    count: float | None
    unit: str
    label: str
    note: NotRequired[str]


class ExtractedIngredientGroup(TypedDict):
    name: str
    ingredients: list[ExtractedIngredient]


class ExtractedRecipe(TypedDict):
    description: str
    servings: str
    note: NotRequired[str]
    ingredient_groups: list[ExtractedIngredientGroup]
    steps: list[str]


# --- Few-shot examples, built from the 3 real recipes already in the DB ---

VOL_AU_VENT_TEXT = """
Vol au Vent (2 à 3 personnes)

Poulet effiloché, boulettes maison et champignons, enrobés d'une béchamel
au bouillon de poule et au citron.

Ingrédients:
- 50g de farine
- 50g de beurre
- 50cl de bouillon de poule
- Jus d'un demi citron
- 200g de viande hachée (porc/veau)
- 250g de poulet
- 100g de champignons

Préparation:
1. Préparer une casserole d'eau avec un peu de bouillon pour cuire le filet de poulet. Avec un poulet rôti déjà cuit, passer directement à la troisième étape.
2. Saisir le poulet 30 secondes de chaque côté à feu vif, puis le laisser cuire 15 à 20 minutes dans le bouillon à petit feu.
3. Effilocher le poulet et le réserver.
4. Dans la même eau, cuire les boulettes.
5. Faire revenir les champignons dans la poêle qui a servi à saisir le poulet.
6. Préparer le bouillon de poule.
7. Faire fondre le beurre dans une autre casserole, puis ajouter la farine d'un coup. Remuer doucement pour faire un roux sans grumeaux, puis ajouter le bouillon petit à petit en remuant constamment. Ajouter le jus de citron, saler et poivrer.
8. Ajouter le poulet, les boulettes et les champignons dans la béchamel.
9. Optionnel: ajouter un peu de crème légère (ou un peu d'eau si c'est trop épais).
"""

VOL_AU_VENT_JSON: ExtractedRecipe = {
    "description": "Poulet effiloché, boulettes maison et champignons, enrobés d'une béchamel au bouillon de poule et au citron.",
    "servings": "2 à 3 personnes",
    "ingredient_groups": [
        {
            "name": "",
            "ingredients": [
                {"prefix": "", "count": 50, "unit": "g", "label": "de farine"},
                {"prefix": "", "count": 50, "unit": "g", "label": "de beurre"},
                {"prefix": "", "count": 50, "unit": "cl", "label": "de bouillon de poule"},
                {"prefix": "Jus d'", "count": 0.5, "unit": "", "label": "citron"},
                {"prefix": "", "count": 200, "unit": "g", "label": "de viande hachée (porc/veau)"},
                {"prefix": "", "count": 250, "unit": "g", "label": "de poulet"},
                {"prefix": "", "count": 100, "unit": "g", "label": "de champignons"},
            ],
        }
    ],
    "steps": [
        "Préparer une casserole d'eau avec un peu de bouillon pour cuire le filet de poulet. Avec un poulet rôti déjà cuit, passer directement à la troisième étape.",
        "Saisir le poulet 30 secondes de chaque côté à feu vif, puis le laisser cuire 15 à 20 minutes dans le bouillon à petit feu.",
        "Effilocher le poulet et le réserver.",
        "Dans la même eau, cuire les boulettes.",
        "Faire revenir les champignons dans la poêle qui a servi à saisir le poulet.",
        "Préparer le bouillon de poule.",
        "Faire fondre le beurre dans une autre casserole, puis ajouter la farine d'un coup. Remuer doucement pour faire un roux sans grumeaux, puis ajouter le bouillon petit à petit en remuant constamment. Ajouter le jus de citron, saler et poivrer.",
        "Ajouter le poulet, les boulettes et les champignons dans la béchamel.",
        "Optionnel: ajouter un peu de crème légère (ou un peu d'eau si c'est trop épais).",
    ],
}

FONDUE_TEXT = """
Fondue Glareyarde (3 à 4 personnes)

Bœuf mariné au vin rouge et aux herbes, cuit à table dans un bouillon au
vin blanc et à l'oignon clouté. Servi avec frites maison et sauces.

Note: choisissez une viande de bœuf de première qualité, bien tendre. Le
secret de la glareyarde, c'est la marinade: n'hésitez pas à laisser mariner
jusqu'à 24 heures pour un goût plus prononcé.

Pour la viande et la marinade:
- 800g de bœuf (filet ou rumsteck)
- 100ml de vin rouge (un vin du Valais, comme un Humagne Rouge ou un Pinot Noir)
- 2 c. à s. d'herbes de Provence
- 1 c. à c. de paprika fumé (pour le petit goût de viande séchée)
- 1 c. à c. de mélange 5 baies (fraîchement moulu)
- 1 gousse d'ail (hachée finement)
- 1 pincée de sel

Pour le bouillon:
- 1L de bouillon de bœuf
- 250ml de vin blanc sec (un Fendant du Valais)
- 1 oignon (piqué d'un clou de girofle)
- 1 feuille de laurier
- Sel, poivre

Accompagnements suggérés:
- Frites maison
- Salade
- Sauces béarnaise, poivre, choron

Préparation:
1. Mélanger le bœuf coupé en petits morceaux rectangulaires avec le vin rouge, l'ail, les herbes de Provence, le paprika fumé et le mélange 5 baies. Saler légèrement.
2. Couvrer et laisser mariner au réfrigérateur au moins 4 heures, idéalement toute une nuit.
3. Préparer les frites maison et la salade.
4. Verser le bouillon de bœuf et le vin blanc dans le caquelon. Ajouter l'oignon clouté et la feuille de laurier. Porter à frémissement, saler, poivrer.
5. Poser le caquelon sur le réchaud allumé, au centre de la table. Disposer la viande marinée, les frites et les sauces autour.
"""

FONDUE_JSON: ExtractedRecipe = {
    "description": "Bœuf mariné au vin rouge et aux herbes, cuit à table dans un bouillon au vin blanc et à l'oignon clouté. Servi avec frites maison et sauces.",
    "servings": "3 à 4 personnes",
    "note": "Choisissez une viande de bœuf de première qualité, bien tendre. Le secret de la glareyarde, c'est la marinade: n'hésitez pas à laisser mariner jusqu'à 24 heures pour un goût plus prononcé.",
    "ingredient_groups": [
        {
            "name": "Pour la viande et la marinade",
            "ingredients": [
                {"prefix": "", "count": 800, "unit": "g", "label": "de bœuf (filet ou rumsteck)"},
                {"prefix": "", "count": 100, "unit": "ml", "label": "de vin rouge", "note": "Un vin du Valais, comme un Humagne Rouge ou un Pinot Noir"},
                {"prefix": "", "count": 2, "unit": "c. à s.", "label": "d'herbes de Provence"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "de paprika fumé", "note": "Pour le petit goût de viande séchée"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "de mélange 5 baies", "note": "Fraîchement moulu"},
                {"prefix": "", "count": 1, "unit": "gousse", "label": "d'ail", "note": "Hachée finement"},
                {"prefix": "", "count": 1, "unit": "pincée", "label": "de sel"},
            ],
        },
        {
            "name": "Pour le bouillon",
            "ingredients": [
                {"prefix": "", "count": 1, "unit": "L", "label": "de bouillon de bœuf"},
                {"prefix": "", "count": 250, "unit": "ml", "label": "de vin blanc sec", "note": "Un Fendant du Valais"},
                {"prefix": "", "count": 1, "unit": "", "label": "oignon", "note": "Piqué d'un clou de girofle"},
                {"prefix": "", "count": 1, "unit": "feuille", "label": "de laurier"},
                {"prefix": "", "count": None, "unit": "", "label": "Sel, poivre"},
            ],
        },
        {
            "name": "Accompagnements suggérés",
            "ingredients": [
                {"prefix": "", "count": None, "unit": "", "label": "Frites maison"},
                {"prefix": "", "count": None, "unit": "", "label": "Salade"},
                {"prefix": "", "count": None, "unit": "", "label": "Sauces béarnaise, poivre, choron"},
            ],
        },
    ],
    "steps": [
        "Mélanger le bœuf coupé en petits morceaux rectangulaires avec le vin rouge, l'ail, les herbes de Provence, le paprika fumé et le mélange 5 baies. Saler légèrement.",
        "Couvrer et laisser mariner au réfrigérateur au moins 4 heures, idéalement toute une nuit.",
        "Préparer les frites maison et la salade.",
        "Verser le bouillon de bœuf et le vin blanc dans le caquelon. Ajouter l'oignon clouté et la feuille de laurier. Porter à frémissement, saler, poivrer.",
        "Poser le caquelon sur le réchaud allumé, au centre de la table. Disposer la viande marinée, les frites et les sauces autour.",
    ],
}

KLEFTIKO_TEXT = """
Kleftiko (3 à 4 personnes)

Médaillons d'agneau marinés au citron et aux herbes, mijotés en cocotte
avec poivrons, tomates et oignons, feta dorée en fin de cuisson.

Note: pour plus de jus, ajouter un peu de vin blanc. Pour une feta bien
dorée, terminer quelques minutes en mode grill.

Pour la marinade:
- Jus d'1 citron
- 4 c. à s. d'huile d'olive
- 1 c. à s. de miel
- 2 gousses d'ail
- 1 c. à c. d'origan séché
- 1 c. à c. de romarin séché
- 1 c. à c. de thym séché (facultatif)
- Sel, poivre

Pour la cocotte:
- 4 médaillons d'agneau (200g chacun)
- 3 poivrons
- 4 pommes de terre
- 3 tomates
- 2 oignons
- 1 gousse d'ail
- 1 c. à c. de miel
- 1 branche de romarin frais
- 1 c. à c. d'origan séché
- 1 c. à c. de thym séché (facultatif)
- 2 feuilles de laurier
- 0.75L de bouillon (légumes, volaille ou agneau, au choix. Quantité à jauger)
- 200g de feta (à ajouter en fin de cuisson)

Préparation:
1. Mélanger le jus de citron, l'huile d'olive, l'ail, l'origan, le romarin et le thym. Saler, poivrer, puis enrober les médaillons d'agneau. Laisser mariner au moins 30 minutes.
2. Éplucher et couper les pommes de terre en 2 ou 3, couper le poivron en dés de quelques cm, détailler grossièrement les oignons et couper les tomates en morceaux.
3. Saisir les médaillons à feu vif, 20 secondes de chaque côté, pour les colorer.
4. Rebadigeonner les médaillons du mélange de jus de citron, d'huile d'olive et d'herbes en y rajoutant le miel.
5. Dans une cocotte, disposer l'agneau saisi avec les pommes de terre, les poivrons, les oignons et les tomates. Ajouter l'ail, le miel, le romarin, l'origan, le thym et les feuilles de laurier, puis verser le bouillon. Saler, poivrer.
6. Cuire à couvert 3 heures à 140°C.
7. 10 à 15 minutes avant la fin, retirer le couvercle, ajouter la feta et laisser dorer.
8. Servir bien chaud, arrosé du jus de cuisson.
"""

KLEFTIKO_JSON: ExtractedRecipe = {
    "description": "Médaillons d'agneau marinés au citron et aux herbes, mijotés en cocotte avec poivrons, tomates et oignons, feta dorée en fin de cuisson.",
    "servings": "3 à 4 personnes",
    "note": "Pour plus de jus, ajouter un peu de vin blanc. Pour une feta bien dorée, terminer quelques minutes en mode grill.",
    "ingredient_groups": [
        {
            "name": "Pour la marinade",
            "ingredients": [
                {"prefix": "Jus d'", "count": 1, "unit": "", "label": "citron"},
                {"prefix": "", "count": 4, "unit": "c. à s.", "label": "d'huile d'olive"},
                {"prefix": "", "count": 1, "unit": "c. à s.", "label": "de miel"},
                {"prefix": "", "count": 2, "unit": "gousses", "label": "d'ail"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "d'origan séché"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "de romarin séché"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "de thym séché", "note": "Facultatif"},
                {"prefix": "", "count": None, "unit": "", "label": "Sel, poivre"},
            ],
        },
        {
            "name": "Pour la cocotte",
            "ingredients": [
                {"prefix": "", "count": 4, "unit": "médaillons", "label": "d'agneau (200 g chacun)"},
                {"prefix": "", "count": 3, "unit": "", "label": "poivrons"},
                {"prefix": "", "count": 4, "unit": "", "label": "pommes de terre"},
                {"prefix": "", "count": 3, "unit": "", "label": "tomates"},
                {"prefix": "", "count": 2, "unit": "", "label": "oignons"},
                {"prefix": "", "count": 1, "unit": "gousse", "label": "d'ail"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "de miel"},
                {"prefix": "", "count": 1, "unit": "branche", "label": "de romarin frais"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "d'origan séché"},
                {"prefix": "", "count": 1, "unit": "c. à c.", "label": "de thym séché", "note": "Facultatif"},
                {"prefix": "", "count": 2, "unit": "feuilles", "label": "de laurier"},
                {"prefix": "", "count": 0.75, "unit": "L", "label": "de bouillon", "note": "Légumes, volaille ou agneau, au choix. Quantité à jauger"},
                {"prefix": "", "count": 200, "unit": "g", "label": "de feta", "note": "À ajouter en fin de cuisson"},
            ],
        },
    ],
    "steps": [
        "Mélanger le jus de citron, l'huile d'olive, l'ail, l'origan, le romarin et le thym. Saler, poivrer, puis enrober les médaillons d'agneau. Laisser mariner au moins 30 minutes.",
        "Éplucher et couper les pommes de terre en 2 ou 3, couper le poivron en dés de quelques cm, détailler grossièrement les oignons et couper les tomates en morceaux.",
        "Saisir les médaillons à feu vif, 20 secondes de chaque côté, pour les colorer.",
        "Rebadigeonner les médaillons du mélange de jus de citron, d'huile d'olive et d'herbes en y rajoutant le miel.",
        "Dans une cocotte, disposer l'agneau saisi avec les pommes de terre, les poivrons, les oignons et les tomates. Ajouter l'ail, le miel, le romarin, l'origan, le thym et les feuilles de laurier, puis verser le bouillon. Saler, poivrer.",
        "Cuire à couvert 3 heures à 140°C.",
        "10 à 15 minutes avant la fin, retirer le couvercle, ajouter la feta et laisser dorer.",
        "Servir bien chaud, arrosé du jus de cuisson.",
    ],
}

EXAMPLES = [
    (VOL_AU_VENT_TEXT, VOL_AU_VENT_JSON),
    (FONDUE_TEXT, FONDUE_JSON),
    (KLEFTIKO_TEXT, KLEFTIKO_JSON),
]

_EXAMPLES_BLOCK = "\n\n".join(
    f"Example input:\n{text.strip()}\n\nExample output:\n{json.dumps(data, ensure_ascii=False)}"
    for text, data in EXAMPLES
)

MODEL = "gemini-3-flash-preview"


class ExtractionError(Exception):
    pass


def extract_recipe(text: str, title: str) -> ExtractedRecipe:
    if not settings.GEMINI_API_KEY:
        raise ExtractionError("GEMINI_API_KEY is not configured.")

    prompt = (
        "Extract this recipe into structured data, in French. "
        "Only use what's actually in the text — never invent content for a "
        "field just because the schema has a slot for it. Omit optional "
        "fields entirely if there's nothing for them. The recipe's title is "
        f'"{title}" — it is already known, do not repeat it anywhere in '
        "your output. If there's only one ingredient group, leave its name "
        'empty rather than reusing a generic heading like "Ingrédients".\n\n'
        f"{_EXAMPLES_BLOCK}\n\n"
        f"Now extract this one:\n{text.strip()}"
    )

    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json", "response_schema": ExtractedRecipe},
        )
    except Exception as exc:
        raise ExtractionError(str(exc)) from exc

    return json.loads(response.text)
