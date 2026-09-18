import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/site-header.css';

export type Page = 'menu' | 'recipes';

const SUBTITLES: Record<Page, string> = {
  menu: 'La carte de la maison',
  recipes: 'Mes recettes',
};

const TAP_COUNT = 5;
const TAP_WINDOW_MS = 2000;

export default function SiteHeader({ page = 'menu' }: { page?: Page }) {
  const navigate = useNavigate();
  const taps = useRef<number[]>([]);

  function handleLogoTap() {
    const now = Date.now();
    taps.current = [...taps.current.filter((t) => now - t < TAP_WINDOW_MS), now];
    if (taps.current.length >= TAP_COUNT) {
      taps.current = [];
      navigate('/admin');
    }
  }

  return (
    <header className="site-header">
      <div className="wrap">
        <h1 onClick={handleLogoTap}>Chez Arnaud</h1>
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
