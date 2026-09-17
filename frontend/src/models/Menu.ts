export interface MenuItem {
  label: string;
  recipeSlug: string | null;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface Menu {
  categories: MenuCategory[];
}
