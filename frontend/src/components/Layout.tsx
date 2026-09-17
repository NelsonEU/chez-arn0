import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader, { type Page } from './SiteHeader.tsx';
import SiteFooter from './SiteFooter.tsx';

export default function Layout() {
  const { pathname } = useLocation();
  const page: Page = pathname.startsWith('/menu') ? 'menu' : 'recipes';

  return (
    <>
      <SiteHeader page={page} />
      <Outlet />
      <SiteFooter />
    </>
  );
}
