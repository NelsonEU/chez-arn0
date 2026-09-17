import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useConfirm } from '../../hooks/useConfirm.tsx';
import type { AdminRecipeStep } from '../../models/Admin.ts';

interface StepRowProps {
  step: AdminRecipeStep;
  onUpdate: (text: string) => void;
  onDelete: () => void;
}

export default function StepRow({ step, onUpdate, onDelete }: StepRowProps) {
  const [text, setText] = useState(step.text);
  const { confirm, dialog } = useConfirm();

  async function handleDelete() {
    if (await confirm('Supprimer cette étape ?', { danger: true, confirmLabel: 'Supprimer' })) {
      onDelete();
    }
  }

  return (
    <div className="item-row">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text.trim() && text !== step.text && onUpdate(text.trim())}
      />
      <button type="button" className="icon-btn danger" onClick={handleDelete} aria-label="Supprimer l'étape">
        <Trash2 size={16} />
      </button>
      {dialog}
    </div>
  );
}
