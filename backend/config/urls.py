from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve

urlpatterns = [
    # Django's own built-in admin — deliberately NOT at "admin/", which is
    # the React app's admin route. They collided in production: Django
    # serves everything there (unlike dev, where Vite owns non-api/media
    # paths), and this pattern being registered first meant a full page
    # load of /admin (not client-side nav) hit Django's admin instead of
    # the SPA. This is a rarely-used dev/DB-inspection fallback, not the
    # real admin UI, so it moves — the React app keeps "admin/" outright.
    path("django-admin/", admin.site.urls),
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

# Catch-all: anything that isn't api/django-admin/media/assets is a
# client-side React Router route (including the React app's own /admin/*)
# — served the built SPA's index.html so a hard refresh on e.g.
# /recettes/vol-au-vent or /admin works, not just client-side navigation.
# Only reachable in production (frontend_dist only exists there — see
# FRONTEND_DIST in settings.py); in dev, Vite's own server handles this.
urlpatterns += [
    re_path(r"^(?!api/|django-admin/|media/|assets/).*$", TemplateView.as_view(template_name="index.html")),
]
