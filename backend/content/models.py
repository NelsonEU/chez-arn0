from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(Category, related_name="items", on_delete=models.CASCADE)
    label = models.CharField(max_length=200)
    recipe = models.OneToOneField(
        "Recipe", related_name="menu_item", on_delete=models.SET_NULL, blank=True, null=True
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.label


class Recipe(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    servings = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    note = models.TextField(blank=True)
    image = models.ImageField(upload_to="recipes/", blank=True, null=True)
    published_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title


class IngredientGroup(models.Model):
    recipe = models.ForeignKey(Recipe, related_name="ingredient_groups", on_delete=models.CASCADE)
    name = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.name or f"(unnamed group — {self.recipe.title})"


class Ingredient(models.Model):
    group = models.ForeignKey(IngredientGroup, related_name="items", on_delete=models.CASCADE)
    count = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    unit = models.CharField(max_length=50, blank=True)
    prefix = models.CharField(max_length=20, blank=True)
    label = models.CharField(max_length=200)
    note = models.CharField(max_length=300, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.label


class RecipeStep(models.Model):
    recipe = models.ForeignKey(Recipe, related_name="steps", on_delete=models.CASCADE)
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.text[:60]
