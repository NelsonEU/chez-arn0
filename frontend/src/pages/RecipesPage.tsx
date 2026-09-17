import RecipeCard from '../components/RecipeCard.tsx';
import { useAsync } from '../hooks/useAsync.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { RecipeRepository } from '../repositories/RecipeRepository.ts';
import '../styles/recipes-page.css';

export default function RecipesPage() {
  useDocumentTitle('Chez Arnaud — Recettes');
  const { data: recipes, error } = useAsync((signal) => RecipeRepository.list(signal), []);

  return (
    <div className="recipes-list">
      {error && <p className="empty">Recettes introuvables.</p>}
      {recipes && !recipes.length && <p className="empty">Aucune recette pour le moment.</p>}
      {recipes && recipes.length > 0 && (
        <div className="grid">
          {recipes.map((r) => (
            <RecipeCard recipe={r} key={r.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
