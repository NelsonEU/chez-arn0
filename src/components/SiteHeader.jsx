import { Link } from 'react-router-dom';
import '../styles/site-header.css';

const SUBTITLES = {
  menu: 'La carte de la maison',
  recipes: 'Mes recettes',
};

export default function SiteHeader({ page = 'menu' }) {
  return (
    <header className="site-header">
      <div className="wrap">
        <h1>Chez Arnaud</h1>
        <div className="subtitle">{SUBTITLES[page] || ''}</div>
        <nav>
          <Link to="/" className={page === 'menu' ? 'active' : ''}>
            Menu
          </Link>
          <Link to="/recipes" className={page === 'recipes' ? 'active' : ''}>
            Recettes
          </Link>
        </nav>
      </div>
    </header>
  );
}
