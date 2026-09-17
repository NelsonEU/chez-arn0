from django.contrib import admin

from .models import Category, Ingredient, IngredientGroup, MenuItem, Recipe, RecipeStep


class MenuItemInline(admin.TabularInline):
    model = MenuItem
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "order"]
    inlines = [MenuItemInline]


class IngredientInline(admin.TabularInline):
    model = Ingredient
    extra = 1


@admin.register(IngredientGroup)
class IngredientGroupAdmin(admin.ModelAdmin):
    list_display = ["name", "recipe", "order"]
    inlines = [IngredientInline]


class IngredientGroupInline(admin.TabularInline):
    model = IngredientGroup
    extra = 0
    show_change_link = True


class RecipeStepInline(admin.TabularInline):
    model = RecipeStep
    extra = 1


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "order"]
    prepopulated_fields = {"slug": ["title"]}
    inlines = [IngredientGroupInline, RecipeStepInline]
