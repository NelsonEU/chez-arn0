import type { RecipeDetail } from '../models/Recipe.ts';

export default function RecipeHero({ recipe }: { recipe: RecipeDetail }) {
  return (
    <>
      {recipe.image ? (
        <img className="hero" src={recipe.image} alt={recipe.title} />
      ) : (
        <div className="hero-placeholder">{recipe.title.charAt(0)}</div>
      )}
      <h1>{recipe.title}</h1>
      {recipe.description ? <p className="description">{recipe.description}</p> : null}
      {recipe.servings ? <div className="servings">{recipe.servings}</div> : null}
    </>
  );
}
