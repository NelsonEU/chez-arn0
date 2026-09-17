import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader.jsx';
import SiteFooter from './SiteFooter.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  const page = pathname.startsWith('/menu') ? 'menu' : 'recipes';

  return (
    <>
      <SiteHeader page={page} />
      <Outlet />
      <SiteFooter />
    </>
  );
}
