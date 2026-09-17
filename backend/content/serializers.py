from rest_framework import serializers

from .models import Category, Ingredient, IngredientGroup, MenuItem, Recipe, RecipeStep


class MenuItemSerializer(serializers.ModelSerializer):
    recipe_slug = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ["label", "recipe_slug"]

    def get_recipe_slug(self, obj):
        # Don't link to a recipe that isn't published yet.
        if obj.recipe and obj.recipe.published_at:
            return obj.recipe.slug
        return None


class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ["name", "items"]


class IngredientSerializer(serializers.ModelSerializer):
    count = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, required=False, allow_null=True
    )

    class Meta:
        model = Ingredient
        fields = ["count", "unit", "prefix", "label", "note"]


class IngredientGroupSerializer(serializers.ModelSerializer):
    items = IngredientSerializer(many=True, read_only=True)

    class Meta:
        model = IngredientGroup
        fields = ["name", "items"]


class RelativeImageMixin:
    """Returns the image's relative media path (e.g. /media/recipes/x.jpg) instead
    of an absolute URL — an absolute URL would be built from whatever Host header
    the request happened to arrive with (e.g. the Docker-internal proxy hostname),
    which isn't necessarily reachable by the browser."""

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class RecipeListSerializer(RelativeImageMixin, serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ["id", "slug", "title", "description", "image"]


class RecipeDetailSerializer(RelativeImageMixin, serializers.ModelSerializer):
    ingredients = IngredientGroupSerializer(source="ingredient_groups", many=True, read_only=True)
    steps = serializers.SlugRelatedField(slug_field="text", many=True, read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ["id", "slug", "title", "servings", "description", "note", "image", "ingredients", "steps"]


# --- Admin (authenticated, full CRUD) serializers ---
# Flat, one per model, every field (including id and FK ids) read/write, so
# the admin frontend can create/update/delete each piece directly. `order` is
# read-only here — it's managed by OrderedViewSetMixin (see views.py), not by
# the client, so a normal create/update can't accidentally scramble ordering.


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "order"]
        read_only_fields = ["order"]


class AdminMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ["id", "category", "label", "recipe", "order"]
        read_only_fields = ["order"]


class AdminRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ["id", "slug", "title", "servings", "description", "note", "image", "published_at", "order"]
        # published_at only ever changes via AdminRecipeViewSet.publish, never a plain PATCH.
        read_only_fields = ["order", "published_at"]

    def to_representation(self, instance):
        # Same reasoning as RelativeImageMixin above: force a relative URL on
        # read, independent of whatever Host header the request arrived with,
        # while still accepting a real uploaded file on write.
        data = super().to_representation(instance)
        if instance.image:
            data["image"] = instance.image.url
        return data


class AdminIngredientGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredientGroup
        fields = ["id", "recipe", "name", "order"]
        read_only_fields = ["order"]


class AdminIngredientSerializer(serializers.ModelSerializer):
    count = serializers.DecimalField(
        max_digits=6, decimal_places=2, coerce_to_string=False, required=False, allow_null=True
    )

    class Meta:
        model = Ingredient
        fields = ["id", "group", "count", "unit", "prefix", "label", "note", "order"]
        read_only_fields = ["order"]


class AdminRecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ["id", "recipe", "text", "order"]
        read_only_fields = ["order"]
