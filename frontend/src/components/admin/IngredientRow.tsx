import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm.tsx';
import type { AdminIngredient } from '../../models/Admin.ts';

type IngredientWrite = { count: number | null; unit: string; prefix: string; label: string; note: string };

interface IngredientRowProps {
  ingredient: AdminIngredient;
  onUpdate: (data: Partial<IngredientWrite>) => void;
  onDelete: () => void;
}

export default function IngredientRow({ ingredient, onUpdate, onDelete }: IngredientRowProps) {
  const [count, setCount] = useState(ingredient.count?.toString() ?? '');
  const [unit, setUnit] = useState(ingredient.unit);
  const [prefix, setPrefix] = useState(ingredient.prefix);
  const [label, setLabel] = useState(ingredient.label);
  const [note, setNote] = useState(ingredient.note);
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    if (await confirm(`Supprimer « ${ingredient.label} » ?`, { danger: true, confirmLabel: 'Supprimer' })) {
      onDelete();
    }
  }

  function saveIfChanged() {
    const parsedCount = count.trim() === '' ? null : Number(count);
    const changed =
      parsedCount !== ingredient.count ||
      unit !== ingredient.unit ||
      prefix !== ingredient.prefix ||
      label !== ingredient.label ||
      note !== ingredient.note;
    if (changed && label.trim()) {
      onUpdate({ count: parsedCount, unit, prefix, label: label.trim(), note });
    }
  }

  return (
    <div className="item-row">
      <input
        value={prefix}
        onChange={(e) => setPrefix(e.target.value)}
        onBlur={saveIfChanged}
        placeholder="Préfixe"
        style={{ width: 70 }}
      />
      <input
        value={count}
        onChange={(e) => setCount(e.target.value)}
        onBlur={saveIfChanged}
        placeholder="Qté"
        style={{ width: 60 }}
      />
      <input
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
        onBlur={saveIfChanged}
        placeholder="Unité"
        style={{ width: 70 }}
      />
      <input value={label} onChange={(e) => setLabel(e.target.value)} onBlur={saveIfChanged} placeholder="Libellé" />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={saveIfChanged}
        placeholder="Note (optionnel)"
      />
      <button type="button" className="icon-btn danger" onClick={handleDelete} aria-label="Supprimer l'ingrédient">
        <Trash2 size={16} />
      </button>
      {dialog}
    </div>
  );
}
