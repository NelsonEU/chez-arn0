import { useAdminAuth } from '../../contexts/AdminAuthContext.tsx';
import RecipesSection from '../../components/admin/RecipesSection.tsx';
import MenuSection from '../../components/admin/MenuSection.tsx';
import '../../styles/admin.css';

export default function AdminDashboardPage() {
  const { logout } = useAdminAuth();

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <h1>Admin</h1>
        <div className="topbar-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="secondary">
            Voir le site
          </a>
          <button type="button" className="secondary" onClick={() => logout()}>
            Déconnexion
          </button>
        </div>
      </div>

      <RecipesSection />
      <MenuSection />
    </div>
  );
}
