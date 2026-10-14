
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
  ShoppingBag
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

const pics = {
  hero:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85",

  night:
    "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1600&q=85",

  party:
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1600&q=85",

  festival:
    "https://images.unsplash.com/photo-1533236897111-3e94666b2edf?auto=format&fit=crop&w=1600&q=85",

  spark:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=85"
};

const slides = [
  {
    title: "Make Every Night Sparkle",
    tag: "CELEBRATE EVERY MOMENT",
    text: "Discover colorful collections and bring festive energy to every special occasion.",
    image: pics.hero
  },
  {
    title: "Celebrate in Style",
    tag: "FESTIVAL COLLECTIONS",
    text: "Explore ten unique categories with exciting products and beautiful festive inspiration.",
    image: pics.night
  },
  {
    title: "Unbox the Celebration",
    tag: "SPECIAL GIFT COLLECTIONS",
    text: "Browse premium gift boxes, festive combos, and our featured celebration collection.",
    image: pics.party
  }
];

const benefits = [
  {
    Icon: ShieldCheck,
    title: "Product Information",
    text: "Browse product descriptions and stock details."
  },
  {
    Icon: Truck,
    title: "Order Tracking",
    text: "Follow the progress of demo orders."
  },
  {
    Icon: Headphones,
    title: "Customer Experience",
    text: "A simple, easy-to-use shopping interface."
  },
  {
    Icon: CreditCard,
    title: "Demo Checkout",
    text: "Practice the complete checkout workflow."
  }
];

export default function Home() {
  const { products = [] } = useStore();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const availableProducts = products.filter(
    (product) => product.isActive !== false
  );

  const featuredProducts = [
    ...availableProducts.filter((product) => product.featured),
    ...availableProducts.filter((product) => !product.featured)
  ].slice(0, 10);

  const shopCategories = categories.filter(
    (category) => category !== "All"
  );

  const previousSlide = () => {
    setSlide((current) =>
      (current - 1 + slides.length) % slides.length
    );
  };

  const nextSlide = () => {
    setSlide((current) =>
      (current + 1) % slides.length
    );
  };

  return (
    <main>
      <section className="hero catalog-hero">
        {slides.map((item, index) => (
          <div
            key={item.title}
            className={`hero-bg ${
              slide === index ? "active" : ""
            }`}
            style={{
              backgroundImage: `url("${item.image}")`
            }}
          />
        ))}

        <div className="container hero-content">
          <div className="hero-copy" key={slide}>
            <span className="hero-eyebrow">
              <Sparkles size={18} />
              {slides[slide].tag}
            </span>

            <h1>{slides[slide].title}</h1>

            <p>{slides[slide].text}</p>

            <div className="hero-buttons">
              <Link className="btn btn-gold" to="/shop">
                Explore Products
                <ArrowRight size={19} />
              </Link>

              <a
                className="btn btn-outline-light"
                href="#categories"
              >
                View Categories
              </a>
            </div>

            <div className="catalog-hero-stats">
              <div>
                <strong>10</strong>
                <span>Categories</span>
              </div>

              <div>
                <strong>{availableProducts.length}</strong>
                <span>Products</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Demo Experience</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-controls">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={previousSlide}
          >
            <ChevronLeft />
          </button>

          {slides.map((item, index) => (
            <button
              type="button"
              key={item.title}
              className={`hero-dot ${
                slide === index ? "active" : ""
              }`}
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setSlide(index)}
            />
          ))}

          <button
            type="button"
            aria-label="Next slide"
            onClick={nextSlide}
          >
            <ChevronRight />
          </button>
        </div>
      </section>

      <section className="features-strip">
        <div className="container features-grid">
          {benefits.map(({ Icon, title, text }) => (
            <div className="feature" key={title}>
              <Icon size={28} />

              <div>
                <strong>{title}</strong>
                <span>{text}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="section container"
        id="categories"
      >
        <SectionHeading
          eyebrow="EXPLORE ALL COLLECTIONS"
          title="Shop by Category"
          subtitle="Ten different collections, all in one place."
        />

        <div className="category-grid catalog-category-grid">
          {shopCategories.map((name, index) => (
            <Link
              className="category-card catalog-category-card"
              key={name}
              to={`/shop?category=${encodeURIComponent(name)}`}
            >
              <img
                src={categoryImages[name]}
                alt={`${name} celebration illustration`}
                loading="lazy"
              />

              <span className="category-overlay">
                <small>
                  COLLECTION {String(index + 1).padStart(2, "0")}
                </small>

                <strong>{name}</strong>

                <span>
                  Explore Collection
                  <ArrowRight size={17} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="section section-soft"
        id="featured"
      >
        <div className="container">
          <SectionHeading
            eyebrow="DISCOVER OUR PRODUCTS"
            title="Featured Collection"
            subtitle="Browse our popular festive product listings."
          />

          {featuredProducts.length > 0 ? (
            <div className="product-grid catalog-product-grid">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={getProductId(product)}
                  product={product}
                />
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <ShoppingBag size={38} />
              <h3>Products are coming soon</h3>
              <p>
                Add the predefined products to MongoDB
                to display them here.
              </p>
            </div>
          )}

          <div className="center-action">
            <Link
              className="btn btn-primary"
              to="/shop"
            >
              View All Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="container promo-wrap">
        <div className="promo">
          <div className="promo-content">
            <span className="eyebrow">
              FESTIVAL SPECIAL
            </span>

            <h2>
              Discover Your Next Celebration
            </h2>

            <p>
              Explore sparklers, gift collections,
              family combos, and more.
            </p>

            <Link
              className="btn btn-gold"
              to="/shop"
            >
              Shop Collection
              <ArrowRight size={18} />
            </Link>
          </div>

          <img
            src={pics.party}
            alt="Festive celebration decorations"
            loading="lazy"
          />
        </div>
      </section>

      <section className="section container" id="about">
        <SectionHeading
          eyebrow="THE CHAN'S EXPERIENCE"
          title="A Better Shopping Experience"
          subtitle="A modern storefront with ten organized product categories."
        />

        <div className="benefit-grid">
          {[
            {
              Icon: Sparkles,
              title: "Beautiful Collections",
              text: "Discover a wide variety of festive categories."
            },
            {
              Icon: ShieldCheck,
              title: "Clear Product Details",
              text: "Explore descriptions, prices and stock."
            },
            {
              Icon: ShoppingBag,
              title: "Easy Shopping",
              text: "Add products to your cart and create demo orders."
            }
          ].map(({ Icon, title, text }) => (
            <article
              className="benefit-card"
              key={title}
            >
              <div className="benefit-icon">
                <Icon size={27} />
              </div>

              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <span className="eyebrow">
              EXPLORE MORE
            </span>

            <h2>Ready to Explore?</h2>

            <p>
              Browse all ten categories in the shop.
            </p>
          </div>

          <Link
            to="/shop"
            className="btn btn-gold"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
