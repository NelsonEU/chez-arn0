export interface Ingredient {
  count: number | null;
  unit: string;
  prefix: string;
  label: string;
  note: string;
}

export interface IngredientGroup {
  name: string;
  items: Ingredient[];
}

export interface RecipeSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string | null;
}

export interface RecipeDetail extends RecipeSummary {
  servings: string;
  note: string;
  ingredients: IngredientGroup[];
  steps: string[];
}
