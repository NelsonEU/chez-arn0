import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Ingredient, IngredientGroup } from '../models/Recipe.ts';

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

function formatCount(count: number | null): string | null {
  if (count == null) return null;
  return FRACTIONS[count] || String(count);
}

function formatIngredientLine(item: Ingredient): string {
  const base = item.prefix + [formatCount(item.count), item.unit, item.label].filter(Boolean).join(' ');
  return item.note ? `${base} — ${item.note}` : base;
}

function formatIngredientsText(groups: IngredientGroup[]): string {
  return groups
    .map((group) => {
      const lines = group.items.map((item) => formatIngredientLine(item));
      return group.name ? [group.name, ...lines].join('\n') : lines.join('\n');
    })
    .join('\n\n');
}

export default function RecipeIngredients({ groups }: { groups: IngredientGroup[] }) {
  const [copied, setCopied] = useState(false);

  async function copyIngredients() {
    await navigator.clipboard.writeText(formatIngredientsText(groups));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      <div className="section-head">
        <h2>Ingrédients</h2>
        <button type="button" className="copy-btn" onClick={copyIngredients} aria-label="Copier les ingrédients">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      {groups.map((group, gi) => (
        <div className="ingredient-group" key={group.name || gi}>
          {group.name && <h3>{group.name}</h3>}
          <ul>
            {group.items.map((item, ii) => (
              <li key={ii}>
                {item.prefix}
                {[formatCount(item.count), item.unit, item.label].filter(Boolean).join(' ')}
                {item.note && <span className="note"> — {item.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
