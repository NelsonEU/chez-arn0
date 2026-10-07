import type { MenuCategory as MenuCategoryModel } from '../models/Menu.ts';
import MenuItem from './MenuItem.tsx';

export default function MenuCategory({ category }: { category: MenuCategoryModel }) {
  return (
    <section>
      <h2>{category.name}</h2>
      {category.items.map((item) => (
        <MenuItem item={item} key={item.label} />
      ))}
    </section>
  );
}
