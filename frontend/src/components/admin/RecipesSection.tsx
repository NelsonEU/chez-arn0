import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import SortableList from '../SortableList.tsx';
import { useConfirm } from '../../hooks/useConfirm.tsx';
import { useAsync } from '../../hooks/useAsync.ts';
import type { AdminRecipe } from '../../models/Admin.ts';
import { AdminRepository } from '../../repositories/AdminRepository.ts';

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function StatusBadge({ publishedAt }: { publishedAt: string | null }) {
  if (publishedAt) {
    return <span className="status-badge published">Publiée le {formatDate(publishedAt)}</span>;
  }
  return <span className="status-badge draft">Brouillon</span>;
}

export default function RecipesSection() {
  const { data: initial } = useAsync((signal) => AdminRepository.recipes.list(undefined, signal), []);
  const [recipes, setRecipes] = useState<AdminRecipe[] | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const rowConfirm = useConfirm();

  useEffect(() => {
    if (initial) setRecipes(initial);
  }, [initial]);

  async function addRecipe(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setError(null);
    const form = new FormData();
    form.append('title', newTitle.trim());
    form.append('slug', slugify(newTitle));
    try {
      const created = await AdminRepository.recipes.create(form);
      navigate(`/admin/recipes/${created.id}`);
    } catch {
      setError("Impossible de créer la recette (slug déjà utilisé ?).");
    }
  }

  async function deleteRecipe(recipe: AdminRecipe) {
    if (await rowConfirm.confirm(`Supprimer la recette « ${recipe.title} » ?`, { danger: true, confirmLabel: 'Supprimer' })) {
      await AdminRepository.recipes.remove(recipe.id);
      setRecipes((prev) => prev!.filter((r) => r.id !== recipe.id));
    }
  }

  async function publishRecipe(recipe: AdminRecipe) {
    if (!(await rowConfirm.confirm(`Publier la recette « ${recipe.title} » ?`, { confirmLabel: 'Publier' }))) return;
    setError(null);
    try {
      const updated = await AdminRepository.recipes.publish(recipe.id);
      setRecipes((prev) => prev!.map((r) => (r.id === recipe.id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de publier cette recette.');
    }
  }

  async function reorderRecipes(ids: number[]) {
    setRecipes((prev) => ids.map((id) => prev!.find((r) => r.id === id)!));
    await AdminRepository.recipes.reorder(ids);
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>Recettes</h2>
      </div>

      {!recipes ? (
        <p className="error">Chargement…</p>
      ) : (
        <SortableList
          items={recipes}
          getId={(r) => r.id}
          onReorder={reorderRecipes}
          renderItem={(r) => (
            <div className="recipe-row">
              {r.image && <img className="thumb" src={r.image} alt="" />}
              <Link className="recipe-row-title" to={`/admin/recipes/${r.id}`}>
                {r.title}
              </Link>
              <StatusBadge publishedAt={r.published_at} />
              <div className="row-actions">
                {!r.published_at && (
                  <button type="button" onClick={() => publishRecipe(r)}>
                    Publier
                  </button>
                )}
                <button
                  type="button"
                  className="icon-btn danger"
                  onClick={() => deleteRecipe(r)}
                  aria-label="Supprimer la recette"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        />
      )}
      {rowConfirm.dialog}

      <h3>Nouvelle recette</h3>
      <form onSubmit={addRecipe}>
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Titre" />
        <button type="submit">Créer</button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  );
}
