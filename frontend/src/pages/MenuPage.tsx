import MenuCategory from '../components/MenuCategory.tsx';
import { useAsync } from '../hooks/useAsync.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { MenuRepository } from '../repositories/MenuRepository.ts';
import '../styles/menu-page.css';

export default function MenuPage() {
  useDocumentTitle('Chez Arnaud — Menu');
  const { data: menu } = useAsync((signal) => MenuRepository.getMenu(signal), []);
  const categories = menu?.categories ?? [];

  return (
    <div className="menu-page">
      <main>
        {categories.map((cat) => (
          <MenuCategory category={cat} key={cat.name} />
        ))}
      </main>
    </div>
  );
}
