import { Link } from 'react-router-dom';
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
            <img className="recipe-link-icon" src="/images/recipe-link-icon.svg" alt="" />
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
