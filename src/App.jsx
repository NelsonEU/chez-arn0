import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage.jsx';
import RecipesPage from './pages/RecipesPage.jsx';
import RecipeDetailPage from './pages/RecipeDetailPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MenuPage />} />
      <Route path="/recipes" element={<RecipesPage />} />
      <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
    </Routes>
  );
}
