import SiteHeader from '../components/SiteHeader.jsx';
import MenuCategory from '../components/MenuCategory.jsx';
import { useJsonData } from '../hooks/useJsonData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import '../styles/menu-page.css';

export default function MenuPage() {
  useDocumentTitle('Chez Arnaud — Menu');
  const { data, error } = useJsonData('/data/menu.json');
  const categories = data?.categories || [];

  return (
    <>
      <SiteHeader page="menu" />
      <div className="menu-page">
        <main>
          {categories.map((cat) => (
            <MenuCategory category={cat} key={cat.name} />
          ))}
        </main>
        <footer>
          <span>chez.arn0.be</span>
          <span>{error ? 'menu.json introuvable' : 'Service continu'}</span>
        </footer>
      </div>
    </>
  );
}
