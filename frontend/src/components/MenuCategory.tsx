import type { MenuCategory as MenuCategoryModel } from '../models/Menu.ts';
import MenuItem from './MenuItem.tsx';

export default function MenuCategory({ category }: { category: MenuCategoryModel }) {
  return (
    <section>
      <div className="cat-head">
        <h2>{category.name}</h2>
      </div>
      {category.items.map((item) => (
        <MenuItem item={item} key={item.label} />
      ))}
    </section>
  );
}
