import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import SortableList from '../SortableList.tsx';
import IngredientRow from './IngredientRow.tsx';
import { useConfirm } from '../../hooks/useConfirm.tsx';
import type { AdminIngredient, AdminIngredientGroup } from '../../models/Admin.ts';

type IngredientWrite = { count: number | null; unit: string; prefix: string; label: string; note: string };

interface IngredientGroupBlockProps {
  group: AdminIngredientGroup;
  ingredients: AdminIngredient[];
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddIngredient: (label: string) => void;
  onUpdateIngredient: (id: number, data: Partial<IngredientWrite>) => void;
  onDeleteIngredient: (id: number) => void;
  onReorderIngredients: (ids: number[]) => void;
}

export default function IngredientGroupBlock({
  group,
  ingredients,
  onRename,
  onDelete,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
  onReorderIngredients,
}: IngredientGroupBlockProps) {
  const [name, setName] = useState(group.name);
  const [newLabel, setNewLabel] = useState('');
  const { confirm, dialog } = useConfirm();

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    onAddIngredient(newLabel.trim());
    setNewLabel('');
  }

  async function handleDelete() {
    if (await confirm(`Supprimer ce groupe d'ingrédients ?`, { danger: true, confirmLabel: 'Supprimer' })) {
      onDelete();
    }
  }

  return (
    <div className="block">
      <div className="block-head">
        <input
          className="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name !== group.name && onRename(name)}
          placeholder="Nom du groupe (optionnel)"
        />
        <button type="button" className="icon-btn danger" onClick={handleDelete} aria-label="Supprimer le groupe">
          <Trash2 size={16} />
        </button>
      </div>
      {dialog}

      <div className="block-body">
        <SortableList
          items={ingredients}
          getId={(i) => i.id}
          onReorder={onReorderIngredients}
          renderItem={(ingredient) => (
            <IngredientRow
              ingredient={ingredient}
              onUpdate={(data) => onUpdateIngredient(ingredient.id, data)}
              onDelete={() => onDeleteIngredient(ingredient.id)}
            />
          )}
        />

        <form onSubmit={handleAdd}>
          <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Nouvel ingrédient" />
          <button type="submit">Ajouter</button>
        </form>
      </div>
    </div>
  );
}
