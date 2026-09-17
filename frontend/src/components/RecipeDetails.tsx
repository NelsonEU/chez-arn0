import type { RecipeDetail } from '../models/Recipe.ts';
import RecipeHero from './RecipeHero.tsx';
import RecipeIngredients from './RecipeIngredients.tsx';
import RecipeSteps from './RecipeSteps.tsx';

export default function RecipeDetails({ recipe }: { recipe: RecipeDetail }) {
  return (
    <>
      <RecipeHero recipe={recipe} />
      <RecipeIngredients groups={recipe.ingredients} />
      <RecipeSteps steps={recipe.steps} />
      {recipe.note && <p className="recipe-note">{recipe.note}</p>}
    </>
  );
}
