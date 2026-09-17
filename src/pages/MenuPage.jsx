import MenuCategory from '../components/MenuCategory.jsx';
import { useJsonData } from '../hooks/useJsonData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import '../styles/menu-page.css';

export default function MenuPage() {
  useDocumentTitle('Chez Arnaud — Menu');
  const { data } = useJsonData('/data/menu.json');
  const categories = data?.categories || [];

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
