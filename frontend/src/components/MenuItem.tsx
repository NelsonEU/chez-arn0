import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import type { MenuItem as MenuItemModel } from '../models/Menu.ts';

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function MenuItem({ item }: { item: MenuItemModel }) {
  const label = capitalize(item.label);
  if (!item.recipeSlug) {
    return <div className="item">{label}</div>;
  }
  return (
    <Link className="item linked" to={`/recettes/${item.recipeSlug}`}>
      {label}
      <ChefHat className="recipe-link-icon" size={16} aria-hidden="true" />
    </Link>
  );
}
