import { Link } from 'react-router-dom';
import type { RecipeSummary } from '../models/Recipe.ts';

export default function RecipeCard({ recipe, featured = false }: { recipe: RecipeSummary; featured?: boolean }) {
  return (
    <Link className={featured ? 'card featured' : 'card'} to={`/recettes/${recipe.slug}`}>
      {recipe.image ? (
        <img src={recipe.image} alt={recipe.title} loading="lazy" />
      ) : (
        <div className="image-placeholder">{recipe.title.charAt(0)}</div>
      )}
      <div className="card-body">
        <h2>{recipe.title}</h2>
        <p>{recipe.description}</p>
      </div>
    </Link>
  );
}
