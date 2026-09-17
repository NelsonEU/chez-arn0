import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Ingredient, RecipeDetail } from '../models/Recipe.ts';

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

function formatCount(count: number | null): string | null {
  if (count == null) return null;
  return FRACTIONS[count] || String(count);
}

function formatIngredientLine(item: Ingredient): string {
  const base = item.prefix + [formatCount(item.count), item.unit, item.label].filter(Boolean).join(' ');
  return item.note ? `${base} — ${item.note}` : base;
}

function formatIngredientsText(recipe: RecipeDetail): string {
  return recipe.ingredients
    .map((group) => {
      const lines = group.items.map((item) => formatIngredientLine(item));
      return group.name ? [group.name, ...lines].join('\n') : lines.join('\n');
    })
    .join('\n\n');
}

export default function RecipeDetails({ recipe }: { recipe: RecipeDetail }) {
  const [copied, setCopied] = useState(false);

  async function copyIngredients() {
    await navigator.clipboard.writeText(formatIngredientsText(recipe));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <>
      {recipe.image ? (
        <img className="hero" src={recipe.image} alt={recipe.title} />
      ) : (
        <div className="hero-placeholder">{recipe.title.charAt(0)}</div>
      )}
      <h1>{recipe.title}</h1>
      {recipe.description ? <p className="description">{recipe.description}</p> : null}
      {recipe.servings ? <div className="servings">{recipe.servings}</div> : null}
      <div className="section-head">
        <h2>Ingrédients</h2>
        <button type="button" className="copy-btn" onClick={copyIngredients} aria-label="Copier les ingrédients">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>
      {recipe.ingredients.map((group, gi) => (
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
      <h2>Préparation</h2>
      <ol>
        {recipe.steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
      {recipe.note && <p className="recipe-note">{recipe.note}</p>}
    </>
  );
}
