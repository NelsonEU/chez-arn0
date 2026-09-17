import { useState, type FormEvent, type MouseEvent } from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';
import SortableList from '../SortableList.tsx';
import ItemRow from './ItemRow.tsx';
import { useConfirm } from '../../hooks/useConfirm.tsx';
import type { AdminCategory, AdminMenuItem, AdminRecipe } from '../../models/Admin.ts';

interface CategoryBlockProps {
  category: AdminCategory;
  items: AdminMenuItem[];
  getRecipeOptions: (item: AdminMenuItem) => AdminRecipe[];
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddItem: (label: string) => void;
  onUpdateItem: (id: number, data: Partial<{ label: string; recipe: number | null }>) => void;
  onDeleteItem: (id: number) => void;
  onReorderItems: (ids: number[]) => void;
}

export default function CategoryBlock({
  category,
  items,
  getRecipeOptions,
  onRename,
  onDelete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onReorderItems,
}: CategoryBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(category.name);
  const [newItemLabel, setNewItemLabel] = useState('');
  const { confirm, dialog } = useConfirm();

  function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (!newItemLabel.trim()) return;
    onAddItem(newItemLabel.trim());
    setNewItemLabel('');
  }

  function stopToggle(e: MouseEvent) {
    e.stopPropagation();
  }

  async function handleDelete() {
    if (await confirm(`Supprimer la catégorie « ${category.name} » et tous ses plats ?`, { danger: true, confirmLabel: 'Supprimer' })) {
      onDelete();
    }
  }

  return (
    <div className="block">
      <div className="block-head">
        <button type="button" className="chevron-btn" onClick={() => setExpanded((v) => !v)}>
          <ChevronRight size={14} style={{ transform: expanded ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s ease' }} />
        </button>
        <input
          className="name-input"
          value={name}
          onClick={stopToggle}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => name.trim() && name !== category.name && onRename(name.trim())}
        />
        <span className="item-count">
          {items.length} plat{items.length !== 1 ? 's' : ''}
        </span>
        <button type="button" className="icon-btn danger" onClick={handleDelete} aria-label="Supprimer la catégorie">
          <Trash2 size={16} />
        </button>
      </div>
      {dialog}

      {expanded && (
        <div className="block-body">
          <SortableList
            items={items}
            getId={(item) => item.id}
            onReorder={onReorderItems}
            renderItem={(item) => (
              <ItemRow
                item={item}
                recipes={getRecipeOptions(item)}
                onUpdate={(data) => onUpdateItem(item.id, data)}
                onDelete={() => onDeleteItem(item.id)}
              />
            )}
          />

          <form onSubmit={handleAddItem}>
            <input value={newItemLabel} onChange={(e) => setNewItemLabel(e.target.value)} placeholder="Nouveau plat" />
            <button type="submit">Ajouter</button>
          </form>
        </div>
      )}
    </div>
  );
}
