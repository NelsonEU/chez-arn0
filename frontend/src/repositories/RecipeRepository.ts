import type { Ingredient, IngredientGroup, RecipeDetail, RecipeSummary } from '../models/Recipe.ts';

interface RawIngredient {
  count: number | null;
  unit: string;
  prefix: string;
  label: string;
  note: string;
}

interface RawIngredientGroup {
  name: string;
  items: RawIngredient[];
}

interface RawRecipeSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string | null;
}

interface RawRecipeDetail extends RawRecipeSummary {
  servings: string;
  note: string;
  ingredients: RawIngredientGroup[];
  steps: string[];
}

interface RawRecipeList {
  recipes: RawRecipeSummary[];
}

function mapSummary(raw: RawRecipeSummary): RecipeSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    image: raw.image,
  };
}

function mapIngredient(raw: RawIngredient): Ingredient {
  return { count: raw.count, unit: raw.unit, prefix: raw.prefix, label: raw.label, note: raw.note };
}

function mapGroup(raw: RawIngredientGroup): IngredientGroup {
  return { name: raw.name, items: raw.items.map(mapIngredient) };
}

function mapDetail(raw: RawRecipeDetail): RecipeDetail {
  return {
    ...mapSummary(raw),
    servings: raw.servings,
    note: raw.note,
    ingredients: raw.ingredients.map(mapGroup),
    steps: raw.steps,
  };
}

export const RecipeRepository = {
  async list(signal?: AbortSignal): Promise<RecipeSummary[]> {
    const response = await fetch('/api/recipes/', { signal });
    const raw: RawRecipeList = await response.json();
    return raw.recipes.map(mapSummary);
  },

  async getBySlug(slug: string, signal?: AbortSignal): Promise<RecipeDetail> {
    // The API looks recipes up by id, not slug — slug is only used in the
    // frontend URL — so resolve slug -> id from the list first.
    const summaries = await RecipeRepository.list(signal);
    const match = summaries.find((r) => r.slug === slug);
    if (!match) {
      throw new Error(`Recipe not found: ${slug}`);
    }
    const response = await fetch(`/api/recipes/${match.id}/`, { signal });
    const raw: RawRecipeDetail = await response.json();
    return mapDetail(raw);
  },
};
