export default function MenuCategory({ category }) {
  return (
    <section>
      <div className="cat-head">
        <h2>{category.name}</h2>
      </div>
      {category.items.map((item) => (
        <div className="item" key={item}>
          {item}
        </div>
      ))}
    </section>
  );
}
