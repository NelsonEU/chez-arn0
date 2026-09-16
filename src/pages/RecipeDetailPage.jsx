import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader.jsx';
import RecipeDetails from '../components/RecipeDetails.jsx';
import { useJsonData } from '../hooks/useJsonData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import '../styles/recipe-detail-page.css';

export default function RecipeDetailPage() {
  const { slug } = useParams();
  const { data, error } = useJsonData('/data/recipes.json');
  const recipe = data?.recipes?.find((r) => r.slug === slug);
  const notFound = error || (data && !recipe);

  useDocumentTitle(recipe ? `Chez Arnaud — ${recipe.title}` : 'Chez Arnaud — Recette');

  return (
    <>
      <SiteHeader page="recipes" />
      <div className="recipe-detail">
        <Link className="back" to="/">
          ← Toutes les recettes
        </Link>
        {recipe && <RecipeDetails recipe={recipe} />}
        {notFound && <p className="empty">Cette recette est introuvable.</p>}
      </div>
    </>
  );
}
