import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import type { MenuItem as MenuItemModel } from '../models/Menu.ts';

export default function MenuItem({ item }: { item: MenuItemModel }) {
  if (!item.recipeSlug) {
    return <div className="item">{item.label}</div>;
  }
  return (
    <Link className="item" to={`/recettes/${item.recipeSlug}`}>
      {item.label}
      <ChefHat className="recipe-link-icon" size={14} />
    </Link>
  );
}
