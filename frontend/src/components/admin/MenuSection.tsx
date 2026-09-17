import { useEffect, useState, type FormEvent } from 'react';
import CategoryBlock from './CategoryBlock.tsx';
import SortableList from '../SortableList.tsx';
import { useAsync } from '../../hooks/useAsync.ts';
import type { AdminCategory, AdminMenuItem, AdminRecipe } from '../../models/Admin.ts';
import { AdminRepository } from '../../repositories/AdminRepository.ts';

export default function MenuSection() {
  const { data: initialCategories } = useAsync((signal) => AdminRepository.categories.list(signal), []);
  const { data: initialItems } = useAsync((signal) => AdminRepository.menuItems.list(signal), []);
  // Two lists: `recipes` (everything, so a currently-linked recipe still
  // resolves to its title even though it's excluded from `availableRecipes`)
  // and `availableRecipes` (not yet linked to any item — what a picker
  // should actually offer, since MenuItem.recipe is a OneToOneField).
  const { data: recipes } = useAsync((signal) => AdminRepository.recipes.list(undefined, signal), []);
  const { data: availableRecipes } = useAsync(
    (signal) => AdminRepository.recipes.list({ unlinked: true }, signal),
    []
  );

  const [categories, setCategories] = useState<AdminCategory[] | null>(null);
  const [items, setItems] = useState<AdminMenuItem[] | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (initialCategories) setCategories(initialCategories);
  }, [initialCategories]);
  useEffect(() => {
    if (initialItems) setItems(initialItems);
  }, [initialItems]);

  async function addCategory(e: FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const created = await AdminRepository.categories.create({ name: newCategoryName.trim() });
    setCategories((prev) => [...(prev ?? []), created]);
    setNewCategoryName('');
  }

  async function renameCategory(id: number, name: string) {
    const updated = await AdminRepository.categories.update(id, { name });
    setCategories((prev) => prev!.map((c) => (c.id === id ? updated : c)));
  }

  async function deleteCategory(id: number) {
    await AdminRepository.categories.remove(id);
    setCategories((prev) => prev!.filter((c) => c.id !== id));
    setItems((prev) => prev!.filter((i) => i.category !== id));
  }

  async function reorderCategories(ids: number[]) {
    setCategories((prev) => ids.map((id) => prev!.find((c) => c.id === id)!));
    await AdminRepository.categories.reorder(ids);
  }

  async function addItem(categoryId: number, label: string) {
    const created = await AdminRepository.menuItems.create({ category: categoryId, label, recipe: null });
    setItems((prev) => [...(prev ?? []), created]);
  }

  async function updateItem(id: number, data: Partial<{ label: string; recipe: number | null }>) {
    const updated = await AdminRepository.menuItems.update(id, data);
    setItems((prev) => prev!.map((i) => (i.id === id ? updated : i)));
  }

  async function deleteItem(id: number) {
    await AdminRepository.menuItems.remove(id);
    setItems((prev) => prev!.filter((i) => i.id !== id));
  }

  async function reorderItems(categoryId: number, ids: number[]) {
    setItems((prev) => {
      const others = prev!.filter((i) => i.category !== categoryId);
      const reordered = ids.map((id) => prev!.find((i) => i.id === id)!);
      return [...others, ...reordered];
    });
    await AdminRepository.menuItems.reorder(ids, categoryId);
  }

  function recipeOptionsFor(item: AdminMenuItem): AdminRecipe[] {
    if (!availableRecipes) return [];
    if (item.recipe != null && !availableRecipes.some((r) => r.id === item.recipe)) {
      const current = recipes?.find((r) => r.id === item.recipe);
      if (current) return [current, ...availableRecipes];
    }
    return availableRecipes;
  }

  return (
    <section className="admin-section">
      <div className="admin-section-head">
        <h2>Menu</h2>
      </div>

      {!categories || !items || !recipes || !availableRecipes ? (
        <p className="error">Chargement…</p>
      ) : (
        <SortableList
          items={categories}
          getId={(c) => c.id}
          onReorder={reorderCategories}
          renderItem={(category) => (
            <CategoryBlock
              category={category}
              items={items.filter((i) => i.category === category.id)}
              getRecipeOptions={recipeOptionsFor}
              onRename={(name) => renameCategory(category.id, name)}
              onDelete={() => deleteCategory(category.id)}
              onAddItem={(label) => addItem(category.id, label)}
              onUpdateItem={updateItem}
              onDeleteItem={deleteItem}
              onReorderItems={(ids) => reorderItems(category.id, ids)}
            />
          )}
        />
      )}

      <h3>Nouvelle catégorie</h3>
      <form onSubmit={addCategory}>
        <input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nom de la catégorie"
        />
        <button type="submit">Ajouter</button>
      </form>
    </section>
  );
}
