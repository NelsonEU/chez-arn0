import { Link, useParams } from 'react-router-dom';
import RecipeDetails from '../components/RecipeDetails.tsx';
import { useAsync } from '../hooks/useAsync.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { RecipeRepository } from '../repositories/RecipeRepository.ts';
import '../styles/recipe-detail-page.css';

export default function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: recipe, error } = useAsync(
    slug ? (signal) => RecipeRepository.getBySlug(slug, signal) : null,
    [slug]
  );
  const notFound = !!error;

  useDocumentTitle(recipe ? `Chez Arnaud — ${recipe.title}` : 'Chez Arnaud — Recette');

  return (
    <div className="recipe-detail">
      <Link className="back" to="/">
        ← Toutes les recettes
      </Link>
      {recipe && <RecipeDetails recipe={recipe} />}
      {notFound && <p className="empty">Cette recette est introuvable.</p>}
    </div>
  );
}
