import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  ShieldCheck, Truck, Headphones, CreditCard,
  ShoppingBag
} from "lucide-react";
import { useStore, IMAGES } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";

const slides = [
  {
    eyebrow: "CELEBRATE EVERY MOMENT",
    title: "Make Every Night Sparkle",
    description: "Explore beautiful festive collections for unforgettable celebrations.",
    image: IMAGES.hero1
  },
  {
    eyebrow: "FESTIVAL COLLECTION",
    title: "Bring Joy to Every Celebration",
    description: "Find your favorite festive collections in one place.",
    image: IMAGES.hero2
  },
  {
    eyebrow: "SPECIAL CELEBRATION PICKS",
    title: "Unbox the Magic",
    description: "Make memorable moments with our curated collections.",
    image: IMAGES.hero3
  }
];

export default function Home() {
  const { products } = useStore();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setActive(index => (index + 1) % slides.length),
      5500
    );
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <main>
      <section
        className="hero"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-bg ${index === active ? "active" : ""}`}
            style={{ backgroundImage: `url("${slide.image}")` }}
          />
        ))}

        <div className="container hero-content">
          <div className="hero-copy" key={active}>
            <span className="hero-eyebrow">
              <Sparkles size={18} />
              {slides[active].eyebrow}
            </span>
            <h1>{slides[active].title}</h1>
            <p>{slides[active].description}</p>
            <div className="hero-buttons">
              <Link className="btn btn-gold" to="/shop">
                Shop Collection <ArrowRight size={19} />
              </Link>
              <a className="btn btn-outline-light" href="#featured">
                Explore More
              </a>
            </div>
          </div>
        </div>

        <div className="hero-controls">
          <button
            aria-label="Previous slide"
            onClick={() => setActive((active + slides.length - 1) % slides.length)}
          >
            <ChevronLeft size={20} />
          </button>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-dot ${active === index ? "active" : ""}`}
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActive(index)}
            />
          ))}
          <button
            aria-label="Next slide"
            onClick={() => setActive((active + 1) % slides.length)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <section className="features-strip">
        <div className="container features-grid">
          {[
            [ShieldCheck, "Quality Focused", "Curated festive collections"],
            [Truck, "Order Tracking", "Follow demo order updates"],
            [Headphones, "Customer Support", "Help when you need it"],
            [CreditCard, "Easy Checkout", "Simple demo payment"]
          ].map(([Icon, title, text]) => (
            <div className="feature" key={title}>
              <Icon size={28} />
              <div><strong>{title}</strong><span>{text}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section container">
        <SectionHeading
          eyebrow="EXPLORE OUR WORLD"
          title="Shop by Category"
          subtitle="Discover something special for every celebration."
        />
        <div className="category-grid">
          {[
            ["Sparklers", IMAGES.sparkler, "Golden moments"],
            ["Gift Boxes", IMAGES.celebration, "Special surprises"],
            ["Combos", IMAGES.hero3, "Festival favorites"]
          ].map(([name, image, subtitle]) => (
            <button
              key={name}
              className="category-card"
              onClick={() => navigate(`/shop?category=${encodeURIComponent(name)}`)}
            >
              <img src={image} alt="" loading="lazy" />
              <span className="category-overlay">
                <small>{subtitle}</small>
                <strong>{name}</strong>
                <span>Explore <ArrowRight size={17} /></span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="section section-soft" id="featured">
        <div className="container">
          <SectionHeading
            eyebrow="CUSTOMER FAVORITES"
            title="Our Featured Collection"
            subtitle="Explore popular products for your next celebration."
          />
          <div className="product-grid">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="center-action">
            <Link to="/shop" className="btn btn-primary">
              View All Products <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container promo-wrap">
        <div className="promo">
          <div className="promo-content">
            <span className="eyebrow">FESTIVE SPECIAL</span>
            <h2>Let the Celebrations Begin!</h2>
            <p>Explore our festive selection and find your next favorite.</p>
            <Link className="btn btn-gold" to="/shop">
              Explore Collection <ArrowRight size={18} />
            </Link>
          </div>
          <img src={IMAGES.celebration} alt="Colorful celebration" loading="lazy" />
        </div>
      </section>

      <section className="section container" id="about">
        <SectionHeading
          eyebrow="THE CHAN'S EXPERIENCE"
          title="Celebrate with Confidence"
          subtitle="A modern shopping experience designed around convenience."
        />
        <div className="benefit-grid">
          {[
            [Sparkles, "Festive Collections", "Explore a curated product catalog."],
            [ShieldCheck, "Clear Product Details", "Review prices and availability."],
            [ShoppingBag, "Simple Shopping", "Discover, add to cart, and check out."]
          ].map(([Icon, title, text]) => (
            <div className="benefit-card" key={title}>
              <div className="benefit-icon"><Icon size={27} /></div>
              <h3>{title}</h3><p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <span className="eyebrow">STAY CONNECTED</span>
            <h2>More Celebrations Await</h2>
            <p>Discover our latest collections and seasonal favorites.</p>
          </div>
          <Link to="/shop" className="btn btn-gold">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}