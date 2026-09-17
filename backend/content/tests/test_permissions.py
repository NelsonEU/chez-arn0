import pytest

pytestmark = pytest.mark.django_db

ADMIN_LIST_ENDPOINTS = [
    "/api/admin/categories/",
    "/api/admin/menu-items/",
    "/api/admin/recipes/",
    "/api/admin/ingredient-groups/",
    "/api/admin/ingredients/",
    "/api/admin/recipe-steps/",
]


@pytest.mark.parametrize("endpoint", ADMIN_LIST_ENDPOINTS)
def test_admin_endpoints_reject_unauthenticated_requests(api_client, endpoint):
    response = api_client.get(endpoint)

    assert response.status_code in (401, 403)


@pytest.mark.parametrize("endpoint", ADMIN_LIST_ENDPOINTS)
def test_admin_endpoints_allow_authenticated_requests(auth_client, endpoint):
    response = auth_client.get(endpoint)

    assert response.status_code == 200
