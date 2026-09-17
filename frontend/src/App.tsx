import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import RequireAdminAuth from './components/RequireAdminAuth.tsx';
import MenuPage from './pages/MenuPage.tsx';
import RecipesPage from './pages/RecipesPage.tsx';
import RecipeDetailPage from './pages/RecipeDetailPage.tsx';
import AdminLoginPage from './pages/admin/AdminLoginPage.tsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx';
import AdminRecipeEditPage from './pages/admin/AdminRecipeEditPage.tsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RecipesPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/recettes/:slug" element={<RecipeDetailPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<RequireAdminAuth />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/recipes/:id" element={<AdminRecipeEditPage />} />
      </Route>
    </Routes>
  );
}
