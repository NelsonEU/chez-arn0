import pytest
from django.conf import settings
from django.core.cache import cache
from rest_framework.test import APIClient


@pytest.fixture(autouse=True)
def media_root(settings, tmp_path):
    # Keep test-uploaded files (recipe images) out of the real backend/media/.
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture(autouse=True)
def clear_throttle_cache():
    # ScopedRateThrottle (admin-login: 5/min) counts requests via Django's
    # cache, which — unlike the DB — isn't reset between tests by default,
    # so a test-heavy suite that logs in a lot would otherwise throttle itself.
    cache.clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(db, api_client):
    """An APIClient already logged in as the seeded `admin` user (created by
    the 0005_create_admin_user data migration, which runs automatically as
    part of pytest-django's test database setup)."""
    response = api_client.post("/api/admin/login/", {"password": settings.ADMIN_PASSWORD}, format="json")
    assert response.status_code == 200, response.data
    return api_client
