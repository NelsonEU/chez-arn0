const FRACTIONS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };

function formatCount(count) {
  if (count == null) return null;
  return FRACTIONS[count] || String(count);
}

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
      {recipe.ingredients.map((group, gi) => (
        <div className="ingredient-group" key={group.name || gi}>
          {group.name && <h3>{group.name}</h3>}
          <ul>
            {group.items.map((item, ii) => (
              <li key={ii}>
                {item.prefix}
                {[formatCount(item.count), item.unit, item.label].filter(Boolean).join(' ')}
                {item.note && <span className="note"> — {item.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <h2>Préparation</h2>
      <ol>
        {recipe.steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
      {recipe.note && <p className="recipe-note">{recipe.note}</p>}
    </>
  );
}
