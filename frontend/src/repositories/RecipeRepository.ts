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

// Both cached for the lifetime of the page session; shared, so not tied to a caller's AbortSignal
let cachedList: Promise<RecipeSummary[]> | null = null;
const cachedDetails = new Map<string, Promise<RecipeDetail>>();

async function fetchList(): Promise<RecipeSummary[]> {
  const response = await fetch('/api/recipes/');
  const raw: RawRecipeList = await response.json();
  return raw.recipes.map(mapSummary);
}

async function fetchDetail(id: number): Promise<RecipeDetail> {
  const response = await fetch(`/api/recipes/${id}/`);
  const raw: RawRecipeDetail = await response.json();
  return mapDetail(raw);
}

export const RecipeRepository = {
  list(): Promise<RecipeSummary[]> {
    if (!cachedList) {
      cachedList = fetchList().catch((error) => {
        cachedList = null;
        throw error;
      });
    }
    return cachedList;
  },

  getBySlug(slug: string): Promise<RecipeDetail> {
    if (!cachedDetails.has(slug)) {
      const promise = RecipeRepository.list()
        .then((summaries) => {
          const match = summaries.find((r) => r.slug === slug);
          if (!match) {
            throw new Error(`Recipe not found: ${slug}`);
          }
          return fetchDetail(match.id);
        })
        .catch((error) => {
          cachedDetails.delete(slug);
          throw error;
        });
      cachedDetails.set(slug, promise);
    }
    return cachedDetails.get(slug)!;
  },
};
