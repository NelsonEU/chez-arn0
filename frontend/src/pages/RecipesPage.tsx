import RecipeCard from '../components/RecipeCard.tsx';
import { useAsync } from '../hooks/useAsync.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { RecipeRepository } from '../repositories/RecipeRepository.ts';
import '../styles/recipes-page.css';

export default function RecipesPage() {
  useDocumentTitle('Chez Arnaud — Recettes');
  const { data: recipes, error } = useAsync(() => RecipeRepository.list(), []);
  const [featured, ...rest] = recipes ?? [];

  return (
    <main className="page recipes-list">
      <h1 className="page-title">Mes recettes</h1>
      {error && <p className="empty">Recettes introuvables.</p>}
      {recipes && !recipes.length && <p className="empty">Aucune recette pour le moment.</p>}
      {featured && (
        <div className="layout">
          <RecipeCard recipe={featured} featured />
          {rest.length > 0 && (
            <div className="others">
              {rest.map((r) => (
                <RecipeCard recipe={r} key={r.slug} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
