export default function RecipeDetails({ recipe }) {
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
      <h2>Ingrédients</h2>
      <ul>
        {recipe.ingredients.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <h2>Préparation</h2>
      <ol>
        {recipe.steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
    </>
  );
}
