import MenuCategory from '../components/MenuCategory.tsx';
import { useAsync } from '../hooks/useAsync.ts';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { MenuRepository } from '../repositories/MenuRepository.ts';
import '../styles/menu-page.css';

export default function MenuPage() {
  useDocumentTitle('Chez Arnaud — Menu');
  const { data: menu } = useAsync(() => MenuRepository.getMenu(), []);
  const categories = menu?.categories ?? [];

  return (
    <main className="page menu-page">
      <h1 className="page-title">La carte de la maison</h1>
      <div className="categories">
        {categories.map((cat) => (
          <MenuCategory category={cat} key={cat.name} />
        ))}
      </div>
    </main>
  );
}
