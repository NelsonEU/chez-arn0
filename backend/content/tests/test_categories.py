import pytest

from content.models import Category

pytestmark = pytest.mark.django_db


def test_new_category_appends_to_end_of_order(auth_client):
    # The DB may already have seeded categories — assert relative to that,
    # not an assumed-empty table.
    starting_count = Category.objects.count()

    response = auth_client.post("/api/admin/categories/", {"name": "Test Category"}, format="json")

    assert response.status_code == 201
    assert response.data["order"] == starting_count


def test_reorder_persists_the_new_order(auth_client):
    a = Category.objects.create(name="A", order=0)
    b = Category.objects.create(name="B", order=1)
    c = Category.objects.create(name="C", order=2)

    response = auth_client.post("/api/admin/categories/reorder/", {"ids": [c.id, a.id, b.id]}, format="json")

    assert response.status_code == 204
    a.refresh_from_db()
    b.refresh_from_db()
    c.refresh_from_db()
    assert (c.order, a.order, b.order) == (0, 1, 2)
