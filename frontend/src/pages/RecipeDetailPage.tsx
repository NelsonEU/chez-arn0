import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RecipeDetails from '../components/RecipeDetails.tsx';
import { useAsync } from '../hooks/useAsync.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { RecipeRepository } from '../repositories/RecipeRepository.ts';
import '../styles/recipe-detail-page.css';

export default function RecipeDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: recipe, error } = useAsync(
    slug ? () => RecipeRepository.getBySlug(slug) : null,
    [slug]
  );
  const notFound = !!error;

  useDocumentTitle(recipe ? `Chez Arnaud — ${recipe.title}` : 'Chez Arnaud — Recette');

  return (
    <main className="page recipe-detail">
      <Link className="back" to="/">
        <ArrowLeft size={16} aria-hidden="true" />
        Toutes les recettes
      </Link>
      {recipe && <RecipeDetails recipe={recipe} />}
      {notFound && <p className="empty">Cette recette est introuvable.</p>}
    </main>
  );
}
