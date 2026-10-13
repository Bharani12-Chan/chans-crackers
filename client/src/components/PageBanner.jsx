import React from "react";

export default function PageBanner({ title, subtitle }) {
  return (
    <section className="page-banner">
      <div className="container">
        <span className="eyebrow">CHAN'S CRACKERS</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}