import pytest
from django.conf import settings

pytestmark = pytest.mark.django_db


def test_session_reports_unauthenticated_by_default(api_client):
    response = api_client.get("/api/admin/session/")

    assert response.status_code == 200
    assert response.data == {"authenticated": False}


def test_login_with_correct_password_succeeds(api_client):
    response = api_client.post("/api/admin/login/", {"password": settings.ADMIN_PASSWORD}, format="json")

    assert response.status_code == 200
    assert response.data == {"authenticated": True}
    assert api_client.get("/api/admin/session/").data == {"authenticated": True}


def test_login_with_wrong_password_is_rejected(api_client):
    response = api_client.post("/api/admin/login/", {"password": "not-the-password"}, format="json")

    assert response.status_code == 401
    assert api_client.get("/api/admin/session/").data == {"authenticated": False}


def test_logout_clears_session(auth_client):
    assert auth_client.get("/api/admin/session/").data == {"authenticated": True}

    response = auth_client.post("/api/admin/logout/")

    assert response.status_code == 200
    assert auth_client.get("/api/admin/session/").data == {"authenticated": False}
