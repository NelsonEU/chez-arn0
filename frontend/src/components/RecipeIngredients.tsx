import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { IngredientGroup } from '../models/Recipe.ts';
import { formatIngredientLine, formatQuantity } from '../formatters/ingredient.ts';

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
    <section className="ingredients">
      <div className="section-head">
        <h2>Ingrédients</h2>
        <button type="button" className="copy-btn" onClick={copyIngredients} aria-label="Copier les ingrédients">
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      {groups.map((group, gi) => (
        <div className="ingredient-group" key={group.name || gi}>
          {group.name && <h3>{group.name}</h3>}
          <ul>
            {group.items.map((item, ii) => {
              const quantity = formatQuantity(item);
              return (
                <li key={ii}>
                  {item.prefix}
                  {quantity && <strong>{quantity}</strong>}
                  {quantity && item.label ? ' ' : null}
                  {item.label}
                  {item.note && <div className="note">{item.note}</div>}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
