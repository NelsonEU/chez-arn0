import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import ExtractPanel from '../../components/admin/ExtractPanel.tsx';
import IngredientGroupBlock from '../../components/admin/IngredientGroupBlock.tsx';
import StepRow from '../../components/admin/StepRow.tsx';
import SortableList from '../../components/SortableList.tsx';
import { useAsync } from '../../hooks/useAsync.ts';
import type {
  AdminIngredient,
  AdminIngredientGroup,
  AdminRecipe,
  AdminRecipeStep,
  ExtractedRecipe,
} from '../../models/Admin.ts';
import { AdminRepository } from '../../repositories/AdminRepository.ts';
import '../../styles/admin.css';

type IngredientWrite = { count: number | null; unit: string; prefix: string; label: string; note: string };

export default function AdminRecipeEditPage() {
  const { id } = useParams<{ id: string }>();
  const recipeId = Number(id);

  const { data: initialRecipes } = useAsync((signal) => AdminRepository.recipes.list(undefined, signal), []);
  const { data: initialGroups } = useAsync((signal) => AdminRepository.ingredientGroups.list(signal), []);
  const { data: initialIngredients } = useAsync((signal) => AdminRepository.ingredients.list(signal), []);
  const { data: initialSteps } = useAsync((signal) => AdminRepository.steps.list(signal), []);

  const [recipe, setRecipe] = useState<AdminRecipe | null>(null);
  const [groups, setGroups] = useState<AdminIngredientGroup[] | null>(null);
  const [ingredients, setIngredients] = useState<AdminIngredient[] | null>(null);
  const [steps, setSteps] = useState<AdminRecipeStep[] | null>(null);

  const [title, setTitle] = useState('');
  const [servings, setServings] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newStepText, setNewStepText] = useState('');

  useEffect(() => {
    if (!initialRecipes) return;
    const found = initialRecipes.find((r) => r.id === recipeId) ?? null;
    setRecipe(found);
    if (found) {
      setTitle(found.title);
      setServings(found.servings);
      setDescription(found.description);
      setNote(found.note);
    }
  }, [initialRecipes, recipeId]);
  useEffect(() => {
    if (initialGroups) setGroups(initialGroups.filter((g) => g.recipe === recipeId));
  }, [initialGroups, recipeId]);
  useEffect(() => {
    if (initialIngredients) setIngredients(initialIngredients);
  }, [initialIngredients]);
  useEffect(() => {
    if (initialSteps) setSteps(initialSteps.filter((s) => s.recipe === recipeId));
  }, [initialSteps, recipeId]);

  if (!recipe || !groups || !ingredients || !steps) {
    return <div className="admin-page">Chargement…</div>;
  }

  async function saveFieldsIfChanged() {
    if (
      title === recipe!.title &&
      servings === recipe!.servings &&
      description === recipe!.description &&
      note === recipe!.note
    ) {
      return;
    }
    const form = new FormData();
    form.append('title', title);
    form.append('servings', servings);
    form.append('description', description);
    form.append('note', note);
    const updated = await AdminRepository.recipes.update(recipeId, form);
    setRecipe(updated);
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    const updated = await AdminRepository.recipes.update(recipeId, form);
    setRecipe(updated);
  }

  async function addGroup(e: FormEvent) {
    e.preventDefault();
    const created = await AdminRepository.ingredientGroups.create({ recipe: recipeId, name: newGroupName });
    setGroups((prev) => [...(prev ?? []), created]);
    setNewGroupName('');
  }

  async function renameGroup(groupId: number, name: string) {
    const updated = await AdminRepository.ingredientGroups.update(groupId, { name });
    setGroups((prev) => prev!.map((g) => (g.id === groupId ? updated : g)));
  }

  async function deleteGroup(groupId: number) {
    await AdminRepository.ingredientGroups.remove(groupId);
    setGroups((prev) => prev!.filter((g) => g.id !== groupId));
    setIngredients((prev) => prev!.filter((i) => i.group !== groupId));
  }

  async function reorderGroups(ids: number[]) {
    setGroups((prev) => ids.map((gid) => prev!.find((g) => g.id === gid)!));
    await AdminRepository.ingredientGroups.reorder(ids, recipeId);
  }

  async function addIngredient(groupId: number, label: string) {
    const created = await AdminRepository.ingredients.create({
      group: groupId,
      count: null,
      unit: '',
      prefix: '',
      label,
      note: '',
    });
    setIngredients((prev) => [...(prev ?? []), created]);
  }

  async function updateIngredient(ingredientId: number, data: Partial<IngredientWrite>) {
    const updated = await AdminRepository.ingredients.update(ingredientId, data);
    setIngredients((prev) => prev!.map((i) => (i.id === ingredientId ? updated : i)));
  }

  async function deleteIngredient(ingredientId: number) {
    await AdminRepository.ingredients.remove(ingredientId);
    setIngredients((prev) => prev!.filter((i) => i.id !== ingredientId));
  }

  async function reorderIngredients(groupId: number, ids: number[]) {
    setIngredients((prev) => {
      const others = prev!.filter((i) => i.group !== groupId);
      const reordered = ids.map((iid) => prev!.find((i) => i.id === iid)!);
      return [...others, ...reordered];
    });
    await AdminRepository.ingredients.reorder(ids, groupId);
  }

  async function addStep(e: FormEvent) {
    e.preventDefault();
    if (!newStepText.trim()) return;
    const created = await AdminRepository.steps.create({ recipe: recipeId, text: newStepText.trim() });
    setSteps((prev) => [...(prev ?? []), created]);
    setNewStepText('');
  }

  async function updateStep(stepId: number, text: string) {
    const updated = await AdminRepository.steps.update(stepId, { text });
    setSteps((prev) => prev!.map((s) => (s.id === stepId ? updated : s)));
  }

  async function deleteStep(stepId: number) {
    await AdminRepository.steps.remove(stepId);
    setSteps((prev) => prev!.filter((s) => s.id !== stepId));
  }

  async function reorderSteps(ids: number[]) {
    setSteps((prev) => ids.map((sid) => prev!.find((s) => s.id === sid)!));
    await AdminRepository.steps.reorder(ids, recipeId);
  }

  async function applyExtraction(extracted: ExtractedRecipe) {
    const form = new FormData();
    form.append('description', extracted.description);
    form.append('servings', extracted.servings);
    if (extracted.note) form.append('note', extracted.note);
    const updatedRecipe = await AdminRepository.recipes.update(recipeId, form);
    setRecipe(updatedRecipe);
    setDescription(updatedRecipe.description);
    setServings(updatedRecipe.servings);
    setNote(updatedRecipe.note);

    const newGroups: AdminIngredientGroup[] = [];
    const newIngredients: AdminIngredient[] = [];
    for (const group of extracted.ingredient_groups) {
      const createdGroup = await AdminRepository.ingredientGroups.create({ recipe: recipeId, name: group.name });
      newGroups.push(createdGroup);
      for (const ingredient of group.ingredients) {
        const createdIngredient = await AdminRepository.ingredients.create({
          group: createdGroup.id,
          count: ingredient.count,
          unit: ingredient.unit,
          prefix: ingredient.prefix,
          label: ingredient.label,
          note: ingredient.note ?? '',
        });
        newIngredients.push(createdIngredient);
      }
    }
    setGroups((prev) => [...(prev ?? []), ...newGroups]);
    setIngredients((prev) => [...(prev ?? []), ...newIngredients]);

    const newSteps: AdminRecipeStep[] = [];
    for (const text of extracted.steps) {
      newSteps.push(await AdminRepository.steps.create({ recipe: recipeId, text }));
    }
    setSteps((prev) => [...(prev ?? []), ...newSteps]);
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <h1>{recipe.title}</h1>
        <Link to="/admin">← Admin</Link>
      </div>

      <section className="admin-section">
        <div className="field-row">
          <label>Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveFieldsIfChanged} />
        </div>
        <div className="field-row">
          <label>Personnes</label>
          <input value={servings} onChange={(e) => setServings(e.target.value)} onBlur={saveFieldsIfChanged} />
        </div>
        <div className="field-row">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} onBlur={saveFieldsIfChanged} />
        </div>
        <div className="field-row">
          <label>Note</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={saveFieldsIfChanged} />
        </div>
        <div className="field-row">
          <label>Photo</label>
          {recipe.image && <img className="photo-preview" src={recipe.image} alt="" />}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Ingrédients</h2>
        </div>
        <SortableList
          items={groups}
          getId={(g) => g.id}
          onReorder={reorderGroups}
          renderItem={(group) => (
            <IngredientGroupBlock
              group={group}
              ingredients={ingredients.filter((i) => i.group === group.id)}
              onRename={(name) => renameGroup(group.id, name)}
              onDelete={() => deleteGroup(group.id)}
              onAddIngredient={(label) => addIngredient(group.id, label)}
              onUpdateIngredient={updateIngredient}
              onDeleteIngredient={deleteIngredient}
              onReorderIngredients={(ids) => reorderIngredients(group.id, ids)}
            />
          )}
        />
        <form onSubmit={addGroup}>
          <input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nom du groupe (optionnel)"
          />
          <button type="submit">Ajouter un groupe</button>
        </form>
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Préparation</h2>
        </div>
        <SortableList
          items={steps}
          getId={(s) => s.id}
          onReorder={reorderSteps}
          renderItem={(step) => (
            <StepRow step={step} onUpdate={(text) => updateStep(step.id, text)} onDelete={() => deleteStep(step.id)} />
          )}
        />
        <form onSubmit={addStep}>
          <textarea value={newStepText} onChange={(e) => setNewStepText(e.target.value)} placeholder="Nouvelle étape" />
          <button type="submit">Ajouter</button>
        </form>
      </section>

      <ExtractPanel recipeId={recipeId} onExtracted={applyExtraction} />
    </div>
  );
}
