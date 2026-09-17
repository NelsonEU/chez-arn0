from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("content.urls")),
]

# Media (user-uploaded recipe images) isn't tied to DEBUG — Django serves it
# directly in production too. Fine at this project's scale; no Nginx/S3
# involved, matching the "Django serves everything" deployment shape.
# Wired directly to the `serve` view rather than the `static()` helper:
# that helper has its own internal `if not settings.DEBUG: return []` check
# baked into Django itself, which silently no-ops it in production no
# matter how it's called from here.
urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]

# Catch-all: anything that isn't api/admin/media/assets is a client-side
# React Router route — served the built SPA's index.html so a hard refresh
# on e.g. /recettes/vol-au-vent works, not just client-side navigation.
# Only reachable in production (frontend_dist only exists there — see
# FRONTEND_DIST in settings.py); in dev, Vite's own server handles this.
urlpatterns += [
    re_path(r"^(?!api/|admin/|media/|assets/).*$", TemplateView.as_view(template_name="index.html")),
]
