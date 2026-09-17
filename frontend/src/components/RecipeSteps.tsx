export default function RecipeSteps({ steps }: { steps: string[] }) {
  return (
    <>
      <h2>Préparation</h2>
      <ol>
        {steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
    </>
  );
}
