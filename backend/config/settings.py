import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Only present in the production image (backend/Dockerfile.prod copies the
# built frontend here) — absent in dev, where Vite's own dev server handles
# the frontend and Django never receives HTML-page requests directly.
FRONTEND_DIST = BASE_DIR / "frontend_dist"

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-insecure-secret-key")
DEBUG = os.environ.get("DEBUG", "true").lower() == "true"
ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "*").split(",") if h]

CSRF_TRUSTED_ORIGINS = [
    o for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "http://localhost:5173").split(",") if o
]

ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

# Optional: a missing key disables the AI-assisted recipe entry feature
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

# The dev-friendly defaults above (insecure secret key, wildcard host) are
# fine for local Docker Compose, but would be a real hole if the production
# .env ever forgot to set them. Fail loudly instead of running insecurely.
if not DEBUG:
    from django.core.exceptions import ImproperlyConfigured

    if SECRET_KEY == "dev-only-insecure-secret-key":
        raise ImproperlyConfigured("SECRET_KEY must be set explicitly when DEBUG=False")
    if ALLOWED_HOSTS == ["*"]:
        raise ImproperlyConfigured("ALLOWED_HOSTS must be set explicitly when DEBUG=False")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "content",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [FRONTEND_DIST],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": dj_database_url.config(
        default="sqlite:///" + str(BASE_DIR / "db.sqlite3"),
        conn_max_age=600,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr"
TIME_ZONE = "Europe/Zurich"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/assets/"
# Matches Vite's default build output, which already references /assets/...
# from the site root — no vite.config.ts changes needed. Only present in
# production, hence the existence check (see FRONTEND_DIST above).
STATICFILES_DIRS = [FRONTEND_DIST / "assets"] if (FRONTEND_DIST / "assets").is_dir() else []
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
# Vite's public/ directory (icons, etc. — anything not under assets/) gets
# copied verbatim into frontend_dist/ at build time, but nothing was serving
# it: it doesn't match STATIC_URL ("/assets/") and isn't api/admin/media/
# assets, so it fell through to the SPA catch-all route in urls.py and
# returned index.html instead of the actual file. WHITENOISE_ROOT serves a
# directory's contents at the site root as middleware, before Django's URL
# routing (and this catch-all) ever runs.
if FRONTEND_DIST.is_dir():
    WHITENOISE_ROOT = FRONTEND_DIST
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "COERCE_DECIMAL_TO_STRING": False,
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {"admin-login": "5/min"},
}
