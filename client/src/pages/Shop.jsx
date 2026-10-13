import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { useStore, categories } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import PageBanner from "../components/PageBanner";
import EmptyState from "../components/EmptyState";

export default function Shop() {
  const { products } = useStore();
  const location = useLocation();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");

  useEffect(() => {
    setCategory(
      new URLSearchParams(location.search).get("category") || "All"
    );
  }, [location.search]);

  const filtered = products
    .filter(product =>
      (category === "All" || product.category === category) &&
      product.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <main>
      <PageBanner
        title="Explore Our Collection"
        subtitle="Find your celebration favorites."
      />
      <section className="section container">
        <div className="shop-toolbar">
          <div className="search-field">
            <Search size={20} />
            <input
              aria-label="Search products"
              placeholder="Search products..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
          <select
            aria-label="Sort products"
            value={sort}
            onChange={event => setSort(event.target.value)}
          >
            <option value="default">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        <div className="category-filters">
          {categories.map(item => (
            <button
              key={item}
              className={`filter ${category === item ? "active" : ""}`}
              aria-pressed={category === item}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="results-count">{filtered.length} products found</p>

        {filtered.length ? (
          <div className="product-grid">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No Products Found"
            text="Try another search term or category."
          />
        )}
      </section>
    </main>
  );
}