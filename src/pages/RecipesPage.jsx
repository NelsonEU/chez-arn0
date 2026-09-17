import RecipeCard from '../components/RecipeCard.jsx';
import { useJsonData } from '../hooks/useJsonData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import '../styles/recipes-page.css';

export default function RecipesPage() {
  useDocumentTitle('Chez Arnaud — Recettes');
  const { data, error } = useJsonData('/data/recipes.json');
  const recipes = data?.recipes || [];

  return (
    <div className="recipes-list">
      {error && <p className="empty">Recettes introuvables.</p>}
      {data && !recipes.length && <p className="empty">Aucune recette pour le moment.</p>}
      {recipes.length > 0 && (
        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard recipe={r} key={r.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
