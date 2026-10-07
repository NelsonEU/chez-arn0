import { createPortal } from 'react-dom';
import type { RecipeDetail } from '../models/Recipe.ts';
import { formatIngredientLine } from '../formatters/ingredient.ts';

const AUTHOR = 'Arnaud Etienne';

// schema.org Recipe for search engines: https://developers.google.com/search/docs/appearance/structured-data/recipe
export default function RecipeJsonLd({ recipe }: { recipe: RecipeDetail }) {
  const { origin } = window.location;
  const data = {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.image ? [new URL(recipe.image, origin).href] : undefined,
    author: { '@type': 'Person', name: AUTHOR },
    datePublished: recipe.publishedAt?.slice(0, 10),
    description: recipe.description || undefined,
    recipeYield: recipe.servings || undefined,
    recipeIngredient: recipe.ingredients.flatMap((group) => group.items.map(formatIngredientLine)),
    recipeInstructions: recipe.steps.map((text) => ({ '@type': 'HowToStep', text })),
  };

  // Escape "<" so recipe text can't close the script tag
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return createPortal(<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />, document.head);
}
