import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import RecipesPage from './pages/RecipesPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RecipesPage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/recettes/:slug" element={<RecipeDetailPage />} />
    </Routes>
  );
}
