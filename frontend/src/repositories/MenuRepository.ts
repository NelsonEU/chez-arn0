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

export const MenuRepository = {
  async getMenu(signal?: AbortSignal): Promise<Menu> {
    const response = await fetch('/api/menu/', { signal });
    const raw: RawMenu = await response.json();
    return { categories: raw.categories.map(mapCategory) };
  },
};
