import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm.tsx';
import type { AdminMenuItem, AdminRecipe } from '../../models/Admin.ts';

interface ItemRowProps {
  item: AdminMenuItem;
  recipes: AdminRecipe[];
  onUpdate: (data: Partial<{ label: string; recipe: number | null }>) => void;
  onDelete: () => void;
}

export default function ItemRow({ item, recipes, onUpdate, onDelete }: ItemRowProps) {
  const [label, setLabel] = useState(item.label);
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    if (await confirm(`Supprimer « ${item.label} » ?`, { danger: true, confirmLabel: 'Supprimer' })) {
      onDelete();
    }
  }

  return (
    <div className="item-row">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onBlur={() => label.trim() && label !== item.label && onUpdate({ label: label.trim() })}
      />
      <select
        className="recipe-select"
        value={item.recipe ?? ''}
        onChange={(e) => onUpdate({ recipe: e.target.value ? Number(e.target.value) : null })}
      >
        <option value="">Aucune recette</option>
        {recipes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title}
          </option>
        ))}
      </select>
      <button type="button" className="icon-btn danger" onClick={handleDelete} aria-label="Supprimer le plat">
        <Trash2 size={16} />
      </button>
      {dialog}
    </div>
  );
}
