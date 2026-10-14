
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="page-shell hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">
              CHAN'S CRACKERS · FESTIVE COLLECTION
            </span>

            <h1>
              Celebrate Every Moment
              <span> With Sparkle.</span>
            </h1>

            <p>
              Explore our festive collection, add products
              to your cart and experience a complete
              full-stack demo shopping journey.
            </p>

            <div className="hero-actions">
              <Link to="/shop" className="primary-btn">
                Explore Collection →
              </Link>

              <Link to="/cart" className="outline-btn">
                View Cart
              </Link>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <span>✦</span>
            <span>✧</span>
            <span>✺</span>
            <strong>LET'S CELEBRATE</strong>
          </div>
        </div>
      </section>

      <section className="page-shell features-section">
        <div className="section-heading">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2>Your Shopping Journey</h2>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-number">01</div>
            <h3>Choose Products</h3>
            <p>
              Browse the collection and select your
              favourite products.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-number">02</div>
            <h3>Add to Cart</h3>
            <p>
              Adjust quantities and review the total
              before checkout.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-number">03</div>
            <h3>Demo Checkout</h3>
            <p>
              Place a sample order and track it in
              your account.
            </p>
          </article>
        </div>

        <div className="center section-action">
          <Link to="/shop" className="primary-btn">
            Start Shopping →
          </Link>
        </div>
      </section>
    </main>
  );
}
