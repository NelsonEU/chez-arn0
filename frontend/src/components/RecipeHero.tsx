import { Users } from 'lucide-react';
import type { RecipeDetail } from '../models/Recipe.ts';

export default function RecipeHero({ recipe }: { recipe: RecipeDetail }) {
  return (
    <div className="hero">
      <div className="hero-text">
        <h1>{recipe.title}</h1>
        {recipe.description ? <p className="description">{recipe.description}</p> : null}
        {recipe.servings ? (
          <div className="servings">
            <Users size={18} aria-hidden="true" />
            {recipe.servings}
          </div>
        ) : null}
      </div>
      {recipe.image ? (
        <img className="hero-image" src={recipe.image} alt={recipe.title} />
      ) : (
        <div className="hero-image image-placeholder">{recipe.title.charAt(0)}</div>
      )}
    </div>
  );
}
