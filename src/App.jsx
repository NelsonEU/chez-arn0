import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import MenuPage from './pages/MenuPage.jsx';
import RecipesPage from './pages/RecipesPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<RecipesPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/recettes/:slug" element={<RecipeDetailPage />} />
      </Route>
    </Routes>
  );
}
