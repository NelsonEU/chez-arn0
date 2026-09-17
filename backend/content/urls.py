from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoryViewSet,
    AdminIngredientGroupViewSet,
    AdminIngredientViewSet,
    AdminLoginView,
    AdminLogoutView,
    AdminMenuItemViewSet,
    AdminRecipeStepViewSet,
    AdminRecipeViewSet,
    AdminSessionView,
    MenuView,
    RecipeViewSet,
)

router = DefaultRouter()
router.register("menu", MenuView, basename="menu")
router.register("recipes", RecipeViewSet, basename="recipe")
router.register("admin/categories", AdminCategoryViewSet, basename="admin-category")
router.register("admin/menu-items", AdminMenuItemViewSet, basename="admin-menu-item")
router.register("admin/recipes", AdminRecipeViewSet, basename="admin-recipe")
router.register("admin/ingredient-groups", AdminIngredientGroupViewSet, basename="admin-ingredient-group")
router.register("admin/ingredients", AdminIngredientViewSet, basename="admin-ingredient")
router.register("admin/recipe-steps", AdminRecipeStepViewSet, basename="admin-recipe-step")

urlpatterns = [
    path("admin/session/", AdminSessionView.as_view(), name="admin-session"),
    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("admin/logout/", AdminLogoutView.as_view(), name="admin-logout"),
    *router.urls,
]
