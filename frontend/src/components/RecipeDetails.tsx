import type { RecipeDetail } from '../models/Recipe.ts';
import RecipeHero from './RecipeHero.tsx';
import RecipeIngredients from './RecipeIngredients.tsx';
import RecipeJsonLd from './RecipeJsonLd.tsx';
import RecipeSteps from './RecipeSteps.tsx';

export default function RecipeDetails({ recipe }: { recipe: RecipeDetail }) {
  return (
    <>
      <RecipeJsonLd recipe={recipe} />
      <RecipeHero recipe={recipe} />
      <div className="recipe-body">
        <RecipeIngredients groups={recipe.ingredients} />
        <RecipeSteps steps={recipe.steps} note={recipe.note} />
      </div>
    </>
  );
}
