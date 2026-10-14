
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useCart,
  money,
  productId
} from "../context/CartContext";

const CATEGORIES = [
  "Sparklers",
  "Flower Pots",
  "Ground Chakkars",
  "Fountains",
  "Rockets",
  "Sky Shots",
  "Gift Boxes",
  "Family Combos",
  "Kids Collection",
  "Festival Specials",
  "Combos"
];

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [product.image]);

  return (
    <div className="cc-shop-image">
      {product.image && !failed ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cc-shop-placeholder">
          <span>✦</span>
          <strong>CHAN'S CRACKERS</strong>
          <small>{product.category}</small>
        </div>
      )}

      {product.badge && (
        <span className="cc-shop-badge">
          {product.badge}
        </span>
      )}
    </div>
  );
}

export default function Shop() {
  const { addItem, cartCount } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [addedId, setAddedId] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          credentials: "include"
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load products"
          );
        }

        if (mounted) {
          setProducts(
            Array.isArray(data)
              ? data
              : Array.isArray(data.products)
              ? data.products
              : []
          );
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesCategory =
        category === "All" ||
        product.category === category;

      const matchesSearch =
        !query ||
        `${product.name} ${product.category} ${product.description || ""}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "low") {
        return Number(a.price) - Number(b.price);
      }

      if (sort === "high") {
        return Number(b.price) - Number(a.price);
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return (
        Number(Boolean(b.featured)) -
        Number(Boolean(a.featured))
      );
    });
  }, [products, category, search, sort]);

  function handleAdd(product) {
    addItem(product, 1);
    setAddedId(productId(product));
  }

  return (
    <main className="page-shell content-page cc-shop">
      <header className="section-heading">
        <span className="eyebrow">
          CHAN'S CRACKERS COLLECTION
        </span>

        <h1>Shop Our Crackers</h1>

        <p>
          Explore our collection, compare prices
          and add products to your cart.
        </p>
      </header>

      <div className="cc-shop-controls">
        <input
          type="search"
          placeholder="Search products..."
          aria-label="Search products"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={category}
          aria-label="Filter category"
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >
          <option value="All">All Categories</option>

          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          aria-label="Sort products"
          onChange={(event) =>
            setSort(event.target.value)
          }
        >
          <option value="featured">Featured</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>

        <Link className="primary-btn" to="/cart">
          Cart ({cartCount})
        </Link>
      </div>

      {loading && <p>Loading products...</p>}

      {error && (
        <div className="alert-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="cc-shop-heading">
            <h2>Available Products</h2>
            <span>
              Showing {visibleProducts.length} of{" "}
              {products.length} products
            </span>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="empty-state">
              <h3>No matching products</h3>

              <button
                type="button"
                className="outline-btn"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="cc-shop-grid">
              {visibleProducts.map((product) => {
                const id = productId(product);
                const stock = Number(product.stock || 0);
                const soldOut = stock <= 0;

                return (
                  <article className="cc-shop-card" key={id}>
                    <Link
                      to={`/product/${id}`}
                      aria-label={`View ${product.name}`}
                    >
                      <ProductImage product={product} />
                    </Link>

                    <div className="cc-shop-details">
                      <small>{product.category}</small>

                      <h3>
                        <Link to={`/product/${id}`}>
                          {product.name}
                        </Link>
                      </h3>

                      <p>
                        {product.description ||
                          "Quality festive collection from Chan's Crackers."}
                      </p>

                      <div className="cc-shop-price">
                        <strong>{money(product.price)}</strong>

                        {Number(product.oldPrice) >
                          Number(product.price) && (
                          <del>
                            {money(product.oldPrice)}
                          </del>
                        )}
                      </div>

                      <div className="cc-shop-stock">
                        {soldOut
                          ? "Out of Stock"
                          : `${stock} available`}
                      </div>

                      <button
                        type="button"
                        className="primary-btn"
                        disabled={soldOut || !id}
                        onClick={() => handleAdd(product)}
                      >
                        {soldOut
                          ? "Out of Stock"
                          : addedId === id
                          ? "Add Another +"
                          : "+ Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}
