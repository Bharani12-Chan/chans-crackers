
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Headphones,
  CreditCard,
  ShoppingBag,
  Gift,
  PackageCheck,
  Star
} from "lucide-react";

import { useStore } from "../context/StoreContext";

import {
  categories,
  categoryImages,
  getProductId
} from "../data/categories";

import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/ProductCard";

import "../catalog.css";

const images = {
  hero:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1500&q=85",

  festival:
    "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1500&q=85",

  celebration:
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1500&q=85"
};

const slides = [
  {
    eyebrow: "WELCOME TO CHAN'S CRACKERS",
    title: "Make Every Moment Sparkle",
    description:
      "Explore beautiful festive collections, discover your favorites, and celebrate every special moment in style.",
    image: images.hero,
    highlight: "Celebrate Brighter"
  },
  {
    eyebrow: "FESTIVAL COLLECTIONS",
    title: "Celebrate in Style",
    description:
      "Discover ten unique product categories, from classic collections to premium celebration combos.",
    image: images.festival,
    highlight: "10 Unique Categories"
  },
  {
    eyebrow: "SPECIAL CELEBRATION PICKS",
    title: "Unbox the Celebration",
    description:
      "Browse featured products, gift collections, and festival specials in one beautiful storefront.",
    image: images.celebration,
    highlight: "Explore Our Favorites"
  }
];

const benefits = [
  {
    Icon: ShieldCheck,
    title: "Clear Product Details",
    description: "Descriptions and availability"
  },
  {
    Icon: Truck,
    title: "Order Tracking",
    description: "Follow your demo orders"
  },
  {
    Icon: Headphones,
    title: "Easy Experience",
    description: "Simple browsing and checkout"
  },
  {
    Icon: CreditCard,
    title: "Demo Checkout",
    description: "Explore the ordering process"
  }
];

export default function Home() {
  const { products = [] } = useStore();

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((previous) =>
        (previous + 1) % slides.length
      );
    }, 6500);

    return () => window.clearInterval(interval);
  }, []);

  const currentSlide = slides[activeSlide];

  const activeProducts = products.filter(
    (product) => product.isActive !== false
  );

  const featuredProducts = [
    ...activeProducts.filter((product) => product.featured),
    ...activeProducts.filter((product) => !product.featured)
  ].slice(0, 10);

  const shopCategories = categories.filter(
    (category) => category !== "All"
  );

  const previousSlide = () => {
    setActiveSlide((previous) =>
      (previous - 1 + slides.length) % slides.length
    );
  };

  const nextSlide = () => {
    setActiveSlide((previous) =>
      (previous + 1) % slides.length
    );
  };

  return (
    <main className="catalog-home">
      {/* HERO SECTION */}
      <section className="catalog-hero">
        <div className="catalog-hero-glow catalog-glow-one" />
        <div className="catalog-hero-glow catalog-glow-two" />

        <div className="catalog-container catalog-hero-layout">
          <div className="catalog-hero-copy">
            <div className="catalog-hero-eyebrow">
              <Sparkles size={17} />
              <span>{currentSlide.eyebrow}</span>
            </div>

            <h1 key={`title-${activeSlide}`}>
              {currentSlide.title}
            </h1>

            <p className="catalog-hero-description">
              {currentSlide.description}
            </p>

            <div className="catalog-hero-actions">
              <Link
                to="/shop"
                className="catalog-button catalog-button-white"
              >
                Explore Products
                <ArrowRight size={19} />
              </Link>

              <a
                href="#categories"
                className="catalog-button catalog-button-outline"
              >
                View Categories
              </a>
            </div>

            <div className="catalog-hero-stats">
              <div className="catalog-stat">
                <strong>{shopCategories.length}</strong>
                <span>Categories</span>
              </div>

              <div className="catalog-stat">
                <strong>{activeProducts.length}</strong>
                <span>Products</span>
              </div>

              <div className="catalog-stat">
                <strong>100%</strong>
                <span>Demo Experience</span>
              </div>
            </div>
          </div>

          <div className="catalog-hero-visual">
            <div className="catalog-visual-frame">
              <img
                key={currentSlide.image}
                src={currentSlide.image}
                alt="Colorful festive celebration"
              />

              <div className="catalog-visual-overlay" />

              <div className="catalog-visual-label">
                <Sparkles size={18} />
                <span>{currentSlide.highlight}</span>
              </div>
            </div>

            <div className="catalog-floating-card">
              <span className="catalog-floating-icon">
                <Gift size={21} />
              </span>

              <div>
                <strong>Festival Collection</strong>
                <span>Explore all 10 categories</span>
              </div>
            </div>
          </div>
        </div>

        <div className="catalog-hero-controls">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="catalog-slide-dots">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-current={
                  activeSlide === index ? "true" : undefined
                }
                className={
                  activeSlide === index ? "active" : ""
                }
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="catalog-benefits-strip">
        <div className="catalog-container catalog-benefits-grid">
          {benefits.map(({ Icon, title, description }) => (
            <div className="catalog-benefit" key={title}>
              <div className="catalog-benefit-icon">
                <Icon size={23} />
              </div>

              <div>
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section
        className="catalog-section"
        id="categories"
      >
        <div className="catalog-container">
          <div className="catalog-section-heading">
            <span className="catalog-section-eyebrow">
              EXPLORE OUR COLLECTIONS
            </span>

            <h2>Shop by Category</h2>

            <p>
              Discover ten different collections in one place.
            </p>
          </div>

          <div className="catalog-category-grid">
            {shopCategories.map((name, index) => (
              <Link
                key={name}
                to={`/shop?category=${encodeURIComponent(name)}`}
                className="catalog-category-card"
              >
                <img
                  src={categoryImages[name]}
                  alt={`${name} category illustration`}
                  loading="lazy"
                />

                <div className="catalog-category-overlay">
                  <small>
                    COLLECTION{" "}
                    {String(index + 1).padStart(2, "0")}
                  </small>

                  <strong>{name}</strong>

                  <span>
                    Explore
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="catalog-section catalog-products-section">
        <div className="catalog-container">
          <div className="catalog-section-heading">
            <span className="catalog-section-eyebrow">
              DISCOVER OUR PRODUCTS
            </span>

            <h2>Featured Collection</h2>

            <p>
              Explore our popular festive product listings.
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="catalog-product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={getProductId(product)}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <ShoppingBag size={40} />
              <h3>Products Coming Soon</h3>
              <p>
                Your products will appear here after
                they are loaded from MongoDB.
              </p>
            </div>
          )}

          <div className="catalog-center-action">
            <Link
              to="/shop"
              className="catalog-button catalog-button-purple"
            >
              View All Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* PROMOTIONAL SECTION */}
      <section className="catalog-section">
        <div className="catalog-container">
          <div className="catalog-promo">
            <div className="catalog-promo-copy">
              <span className="catalog-section-eyebrow">
                FESTIVAL SPECIAL
              </span>

              <h2>Discover Your Next Celebration</h2>

              <p>
                Explore exciting festive collections,
                gift boxes, and celebration combos.
              </p>

              <Link
                to="/shop"
                className="catalog-button catalog-button-white"
              >
                Explore Collection
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="catalog-promo-image">
              <img
                src={images.celebration}
                alt="Festive decorations and celebration"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="catalog-section catalog-why-section">
        <div className="catalog-container">
          <div className="catalog-section-heading">
            <span className="catalog-section-eyebrow">
              THE CHAN'S EXPERIENCE
            </span>

            <h2>Celebrate with Confidence</h2>

            <p>
              A simple and beautiful shopping experience.
            </p>
          </div>

          <div className="catalog-why-grid">
            {[
              {
                Icon: Star,
                title: "Beautiful Collections",
                text: "Discover ten organized product categories."
              },
              {
                Icon: PackageCheck,
                title: "Product Information",
                text: "Browse product details, prices and stock."
              },
              {
                Icon: ShoppingBag,
                title: "Easy Shopping",
                text: "Add products to your cart and place demo orders."
              }
            ].map(({ Icon, title, text }) => (
              <article className="catalog-why-card" key={title}>
                <div className="catalog-why-icon">
                  <Icon size={28} />
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="catalog-final-cta">
        <div className="catalog-container catalog-final-cta-inner">
          <div>
            <span>READY TO EXPLORE?</span>
            <h2>Your Celebration Starts Here</h2>
            <p>Browse all ten festive categories.</p>
          </div>

          <Link
            to="/shop"
            className="catalog-button catalog-button-white"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
