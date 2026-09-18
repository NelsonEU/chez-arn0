import secrets

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Ingredient, IngredientGroup, MenuItem, Recipe, RecipeStep
from .recipe_extraction import ExtractionError, extract_recipe
from .serializers import (
    AdminCategorySerializer,
    AdminIngredientGroupSerializer,
    AdminIngredientSerializer,
    AdminMenuItemSerializer,
    AdminRecipeSerializer,
    AdminRecipeStepSerializer,
    CategorySerializer,
    RecipeDetailSerializer,
    RecipeListSerializer,
)


class MenuView(viewsets.ViewSet):
    def list(self, request):
        categories = Category.objects.prefetch_related("items__recipe")
        return Response({"categories": CategorySerializer(categories, many=True).data})


class RecipeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Recipe.objects.filter(published_at__isnull=False)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return RecipeDetailSerializer
        return RecipeListSerializer

    def get_queryset(self):
        published = Recipe.objects.filter(published_at__isnull=False)
        if self.action == "retrieve":
            return published.prefetch_related("ingredient_groups__items", "steps")
        return published

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({"recipes": response.data})


class AdminSessionView(APIView):
    """Reports whether the current session is logged in as the admin, and —
    as a side effect — ensures the csrftoken cookie is set, so a frontend can
    call this once (e.g. on load) before ever submitting the login form."""

    permission_classes = [AllowAny]

    def get(self, request):
        get_token(request)
        return Response({"authenticated": request.user.is_authenticated})


class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "admin-login"

    def post(self, request):
        password = str(request.data.get("password", ""))
        if not secrets.compare_digest(password, settings.ADMIN_PASSWORD):
            return Response({"detail": "Invalid password."}, status=401)
        login(request, User.objects.get(username="admin"))
        return Response({"authenticated": True})


class AdminLogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        logout(request)
        return Response({"authenticated": False})


class OrderedViewSetMixin:
    """Shared behavior for admin viewsets whose model has an `order` field:
    new objects are appended to the end of their scope automatically, and a
    `reorder` action lets the frontend persist a drag-and-drop reorder.

    `order_scope_field`, if set, is the FK field name (e.g. "recipe") that
    scopes ordering — objects are only ordered relative to siblings sharing
    the same scope value (passed as a query param on reorder, and read from
    the payload on create), not the whole table. Leave unset for models with
    no parent scope (ordered globally).
    """

    order_scope_field = None

    def _scoped_queryset(self, scope_value):
        queryset = self.get_queryset()
        if self.order_scope_field:
            queryset = queryset.filter(**{self.order_scope_field: scope_value})
        return queryset

    def perform_create(self, serializer):
        scope_value = (
            serializer.validated_data.get(self.order_scope_field) if self.order_scope_field else None
        )
        next_order = self._scoped_queryset(scope_value).count()
        serializer.save(order=next_order)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        scope_value = request.query_params.get(self.order_scope_field) if self.order_scope_field else None
        queryset = self._scoped_queryset(scope_value)
        ids = request.data.get("ids", [])
        objects = {obj.pk: obj for obj in queryset.filter(pk__in=ids)}
        for position, obj_id in enumerate(ids):
            obj = objects.get(obj_id)
            if obj is not None and obj.order != position:
                obj.order = position
                obj.save(update_fields=["order"])
        return Response(status=204)


class AdminCategoryViewSet(OrderedViewSetMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAuthenticated]


class AdminMenuItemViewSet(OrderedViewSetMixin, viewsets.ModelViewSet):
    queryset = MenuItem.objects.all()
    serializer_class = AdminMenuItemSerializer
    permission_classes = [IsAuthenticated]
    order_scope_field = "category"


class AdminRecipeViewSet(OrderedViewSetMixin, viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = AdminRecipeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Recipe.objects.all()
        if self.request.query_params.get("unlinked") == "true":
            queryset = queryset.filter(menu_item__isnull=True)
        return queryset

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        recipe = self.get_object()
        if recipe.published_at is None:
            missing = []
            if not recipe.description.strip():
                missing.append("une description")
            if not recipe.image:
                missing.append("une photo")
            if not Ingredient.objects.filter(group__recipe=recipe).exists():
                missing.append("un ingrédient")
            if not recipe.steps.exists():
                missing.append("une étape")
            if missing:
                return Response({"detail": f"Il manque : {', '.join(missing)}."}, status=400)
            recipe.published_at = timezone.now()
            recipe.save(update_fields=["published_at"])
        return Response(self.get_serializer(recipe).data)

    @action(detail=True, methods=["post"])
    def extract(self, request, pk=None):
        recipe = self.get_object()
        text = str(request.data.get("text", "")).strip()
        if not text:
            return Response({"detail": "Aucun texte fourni."}, status=400)
        try:
            extracted = extract_recipe(text, recipe.title)
        except ExtractionError as e:
            return Response({"detail": str(e)}, status=502)
        return Response(extracted)


class AdminIngredientGroupViewSet(OrderedViewSetMixin, viewsets.ModelViewSet):
    queryset = IngredientGroup.objects.all()
    serializer_class = AdminIngredientGroupSerializer
    permission_classes = [IsAuthenticated]
    order_scope_field = "recipe"


class AdminIngredientViewSet(OrderedViewSetMixin, viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = AdminIngredientSerializer
    permission_classes = [IsAuthenticated]
    order_scope_field = "group"


class AdminRecipeStepViewSet(OrderedViewSetMixin, viewsets.ModelViewSet):
    queryset = RecipeStep.objects.all()
    serializer_class = AdminRecipeStepSerializer
    permission_classes = [IsAuthenticated]
    order_scope_field = "recipe"
