import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Camera, Sparkles, X } from 'lucide-react';
import type { ExtractedRecipe } from '../../models/Admin.ts';
import { AdminRepository } from '../../repositories/AdminRepository.ts';

interface ExtractPanelProps {
  recipeId: number;
  onExtracted: (data: ExtractedRecipe) => Promise<void>;
}

export default function ExtractPanel({ recipeId, onExtracted }: ExtractPanelProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const imageUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setText('');
    setImage(null);
    setMode('text');
    setError('');
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    setImage(e.target.files?.[0] ?? null);
  }

  async function handleSubmit() {
    const input = mode === 'image' ? (image ? { image } : null) : text.trim() ? { text: text.trim() } : null;
    if (!input) return;
    setLoading(true);
    setError('');
    try {
      const extracted = await AdminRepository.recipes.extract(recipeId, input);
      await onExtracted(extracted);
      reset();
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

  const canSubmit = mode === 'image' ? image != null : text.trim().length > 0;

  return (
    <div
      className="extract-overlay"
      onClick={() => {
        if (!loading) {
          reset();
          setOpen(false);
        }
      }}
    >
      <div className="extract-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="extract-dialog-head">
          <span>Remplir la recette avec l'IA</span>
          <button
            type="button"
            className="icon-btn"
            disabled={loading}
            onClick={() => {
              reset();
              setOpen(false);
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="extract-mode-toggle">
          <button type="button" className={mode === 'text' ? 'active' : ''} disabled={loading} onClick={() => setMode('text')}>
            Texte
          </button>
          <button type="button" className={mode === 'image' ? 'active' : ''} disabled={loading} onClick={() => setMode('image')}>
            Photo
          </button>
        </div>

        {mode === 'text' ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            placeholder="Collez ici le texte brut de la recette…"
          />
        ) : (
          <div className="extract-photo-picker">
            {image ? (
              <div className="extract-photo-preview">
                <img src={imageUrl!} alt="" />
                <button type="button" className="icon-btn danger" disabled={loading} onClick={() => setImage(null)}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={handleImageChange}
                  className="file-input-hidden"
                />
                <button
                  type="button"
                  className="secondary"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={18} />
                  Choisir ou prendre une photo
                </button>
              </>
            )}
          </div>
        )}

        {error && <p className="extract-error">{error}</p>}
        <button type="button" onClick={handleSubmit} disabled={loading || !canSubmit}>
          {loading ? 'Extraction…' : 'Extraire'}
        </button>
      </div>
    </div>
  );
}
