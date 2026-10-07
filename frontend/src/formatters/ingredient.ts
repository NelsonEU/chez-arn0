import type { Ingredient } from '../models/Recipe.ts';

const FRACTIONS: Record<number, string> = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

function formatCount(count: number | null): string | null {
  if (count == null) return null;
  return FRACTIONS[count] || String(count);
}

export function formatQuantity(item: Ingredient): string {
  return [formatCount(item.count), item.unit].filter(Boolean).join(' ');
}

export function formatIngredientLine(item: Ingredient): string {
  const base = item.prefix + [formatQuantity(item), item.label].filter(Boolean).join(' ');
  return item.note ? `${base} — ${item.note}` : base;
}
