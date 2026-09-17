import { Link } from 'react-router-dom';
import type { RecipeSummary } from '../models/Recipe.ts';

export default function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link className="card" to={`/recettes/${recipe.slug}`}>
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.title} loading="lazy" />
      ) : (
        <div className="placeholder">{recipe.title.charAt(0)}</div>
      )}
      <div className="card-body">
        <h3>{recipe.title}</h3>
        <p>{recipe.description}</p>
      </div>
    </Link>
  );
}
