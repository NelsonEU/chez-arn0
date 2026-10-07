export default function RecipeSteps({ steps, note }: { steps: string[]; note: string }) {
  return (
    <section className="steps">
      <h2>Préparation</h2>
      <ol>
        {steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
      {note && (
        <aside className="recipe-note">
          <div className="recipe-note-label">Note</div>
          <p>{note}</p>
        </aside>
      )}
    </section>
  );
}
