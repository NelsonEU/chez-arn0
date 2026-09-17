import type { Menu, MenuCategory, MenuItem } from '../models/Menu.ts';

interface RawMenuItem {
  label: string;
  recipe_slug: string | null;
}

interface RawMenuCategory {
  name: string;
  items: RawMenuItem[];
}

interface RawMenu {
  categories: RawMenuCategory[];
}

function mapItem(raw: RawMenuItem): MenuItem {
  return { label: raw.label, recipeSlug: raw.recipe_slug };
}

function mapCategory(raw: RawMenuCategory): MenuCategory {
  return { name: raw.name, items: raw.items.map(mapItem) };
}

// Cached for the lifetime of the page session (cleared on a full reload)
let cachedMenu: Promise<Menu> | null = null;

async function fetchMenu(signal?: AbortSignal): Promise<Menu> {
  const response = await fetch('/api/menu/', { signal });
  const raw: RawMenu = await response.json();
  return { categories: raw.categories.map(mapCategory) };
}

export const MenuRepository = {
  getMenu(signal?: AbortSignal): Promise<Menu> {
    if (!cachedMenu) {
      cachedMenu = fetchMenu(signal).catch((error) => {
        cachedMenu = null;
        throw error;
      });
    }
    return cachedMenu;
  },
};
