import type {
  AdminCategory,
  AdminIngredient,
  AdminIngredientGroup,
  AdminMenuItem,
  AdminRecipe,
  AdminRecipeStep,
} from '../models/Admin.ts';
import { getCsrfToken } from './csrf.ts';

async function adminFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body && !isForm ? { 'Content-Type': 'application/json' } : {}),
      ...(options.method && options.method !== 'GET' ? { 'X-CSRFToken': getCsrfToken() } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const detail = await response
      .clone()
      .json()
      .then((body) => body?.detail)
      .catch(() => undefined);
    throw new Error(detail || `Request to ${url} failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

// A full CRUD + reorder resource, generic over the model type and its
// create/update payload shape. `scopeField`, if set, is the FK field name
// (matching the backend's OrderedViewSetMixin.order_scope_field) used to
// scope the reorder call to one parent (e.g. one category's items).
function crudResource<T extends { id: number }, TWrite>(basePath: string, scopeField?: string) {
  return {
    list(signal?: AbortSignal): Promise<T[]> {
      return adminFetch<T[]>(`${basePath}/`, { signal });
    },
    create(data: TWrite, signal?: AbortSignal): Promise<T> {
      return adminFetch<T>(`${basePath}/`, { method: 'POST', body: JSON.stringify(data), signal });
    },
    update(id: number, data: Partial<TWrite>, signal?: AbortSignal): Promise<T> {
      return adminFetch<T>(`${basePath}/${id}/`, { method: 'PATCH', body: JSON.stringify(data), signal });
    },
    remove(id: number, signal?: AbortSignal): Promise<void> {
      return adminFetch<void>(`${basePath}/${id}/`, { method: 'DELETE', signal });
    },
    reorder(ids: number[], scopeValue?: number, signal?: AbortSignal): Promise<void> {
      const query = scopeField && scopeValue != null ? `?${scopeField}=${scopeValue}` : '';
      return adminFetch<void>(`${basePath}/reorder/${query}`, {
        method: 'POST',
        body: JSON.stringify({ ids }),
        signal,
      });
    },
  };
}

export const AdminRepository = {
  categories: crudResource<AdminCategory, { name: string }>('/api/admin/categories'),
  menuItems: crudResource<AdminMenuItem, { category: number; label: string; recipe: number | null }>(
    '/api/admin/menu-items',
    'category'
  ),
  ingredientGroups: crudResource<AdminIngredientGroup, { recipe: number; name: string }>(
    '/api/admin/ingredient-groups',
    'recipe'
  ),
  ingredients: crudResource<
    AdminIngredient,
    { group: number; count: number | null; unit: string; prefix: string; label: string; note: string }
  >('/api/admin/ingredients', 'group'),
  steps: crudResource<AdminRecipeStep, { recipe: number; text: string }>(
    '/api/admin/recipe-steps',
    'recipe'
  ),

  // Recipes are multipart (image upload), so they don't fit the JSON-only
  // crudResource shape, but they still reorder the same way as everything else.
  recipes: {
    list(params?: { unlinked?: boolean }, signal?: AbortSignal): Promise<AdminRecipe[]> {
      const query = params?.unlinked ? '?unlinked=true' : '';
      return adminFetch<AdminRecipe[]>(`/api/admin/recipes/${query}`, { signal });
    },
    create(data: FormData, signal?: AbortSignal): Promise<AdminRecipe> {
      return adminFetch<AdminRecipe>('/api/admin/recipes/', { method: 'POST', body: data, signal });
    },
    update(id: number, data: FormData, signal?: AbortSignal): Promise<AdminRecipe> {
      return adminFetch<AdminRecipe>(`/api/admin/recipes/${id}/`, { method: 'PATCH', body: data, signal });
    },
    remove(id: number, signal?: AbortSignal): Promise<void> {
      return adminFetch<void>(`/api/admin/recipes/${id}/`, { method: 'DELETE', signal });
    },
    publish(id: number, signal?: AbortSignal): Promise<AdminRecipe> {
      return adminFetch<AdminRecipe>(`/api/admin/recipes/${id}/publish/`, { method: 'POST', signal });
    },
    reorder(ids: number[], signal?: AbortSignal): Promise<void> {
      return adminFetch<void>('/api/admin/recipes/reorder/', { method: 'POST', body: JSON.stringify({ ids }), signal });
    },
  },
};
