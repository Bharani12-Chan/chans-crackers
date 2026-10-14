export default function PageBanner({ eyebrow, title, description }) {
  return (
    <section className="page-banner">
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}