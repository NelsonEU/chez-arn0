import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { ExtractedRecipe } from '../../models/Admin.ts';
import { AdminRepository } from '../../repositories/AdminRepository.ts';

interface ExtractPanelProps {
  recipeId: number;
  onExtracted: (data: ExtractedRecipe) => Promise<void>;
}

export default function ExtractPanel({ recipeId, onExtracted }: ExtractPanelProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    try {
      const extracted = await AdminRepository.recipes.extract(recipeId, text.trim());
      await onExtracted(extracted);
      setText('');
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'extraction.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="extract-fab" onClick={() => setOpen(true)}>
        <Sparkles size={16} />
        Remplir avec l'IA
      </button>
    );
  }

  return (
    <div className="extract-panel">
      <div className="extract-panel-head">
        <span>Coller le texte de la recette</span>
        <button type="button" className="icon-btn" onClick={() => setOpen(false)}>
          <X size={16} />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        disabled={loading}
        placeholder="Collez ici le texte brut de la recette…"
      />
      {error && <p className="extract-error">{error}</p>}
      <button type="button" onClick={handleSubmit} disabled={loading || !text.trim()}>
        {loading ? 'Extraction…' : 'Extraire'}
      </button>
    </div>
  );
}
