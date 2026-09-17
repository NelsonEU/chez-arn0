import { Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import type { MenuCategory as MenuCategoryModel } from '../models/Menu.ts';

export default function MenuCategory({ category }: { category: MenuCategoryModel }) {
  return (
    <section>
      <div className="cat-head">
        <h2>{category.name}</h2>
      </div>
      {category.items.map((item) =>
        item.recipeSlug ? (
          <Link className="item" to={`/recettes/${item.recipeSlug}`} key={item.label}>
            {item.label}
            <ChefHat className="recipe-link-icon" size={14} />
          </Link>
        ) : (
          <div className="item" key={item.label}>
            {item.label}
          </div>
        )
      )}
    </section>
  );
}
