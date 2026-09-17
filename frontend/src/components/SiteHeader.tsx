import { Link } from 'react-router-dom';
import '../styles/site-header.css';

export type Page = 'menu' | 'recipes';

const SUBTITLES: Record<Page, string> = {
  menu: 'La carte de la maison',
  recipes: 'Mes recettes',
};

export default function SiteHeader({ page = 'menu' }: { page?: Page }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <h1>Chez Arnaud</h1>
        <div className="subtitle">{SUBTITLES[page] || ''}</div>
        <nav>
          <Link to="/" className={page === 'recipes' ? 'active' : ''}>
            Recettes
          </Link>
          <Link to="/menu" className={page === 'menu' ? 'active' : ''}>
            Menu
          </Link>
        </nav>
      </div>
    </header>
  );
}
