export interface AdminCategory {
  id: number;
  name: string;
  order: number;
}

export interface AdminMenuItem {
  id: number;
  category: number;
  label: string;
  recipe: number | null;
  order: number;
}

export interface AdminRecipe {
  id: number;
  slug: string;
  title: string;
  servings: string;
  description: string;
  note: string;
  image: string | null;
  published_at: string | null;
  order: number;
}

export interface AdminIngredientGroup {
  id: number;
  recipe: number;
  name: string;
  order: number;
}

export interface AdminIngredient {
  id: number;
  group: number;
  count: number | null;
  unit: string;
  prefix: string;
  label: string;
  note: string;
  order: number;
}

export interface AdminRecipeStep {
  id: number;
  recipe: number;
  text: string;
  order: number;
}

export interface ExtractedIngredient {
  prefix: string;
  count: number | null;
  unit: string;
  label: string;
  note?: string;
}

export interface ExtractedIngredientGroup {
  name: string;
  ingredients: ExtractedIngredient[];
}

export interface ExtractedRecipe {
  description: string;
  servings: string;
  note?: string;
  ingredient_groups: ExtractedIngredientGroup[];
  steps: string[];
}
