
import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ShoppingBag
} from "lucide-react";

import { useStore } from "../context/StoreContext";
import { categories, getProductId } from "../data/categories";
import PageBanner from "../components/PageBanner";
import ProductCard from "../components/ProductCard";
import "../catalog.css";

export default function Shop() {
  const { products = [] } = useStore();

  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  const selectedCategory =
    searchParams.get("category") || "All";

  const changeCategory = (category) => {
    if (category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    const result = products.filter((product) => {
      if (product.isActive === false) {
        return false;
      }

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const searchableText = [
        product.name,
        product.category,
        product.description
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(search);

      return matchesCategory && matchesSearch;
    });

    result.sort((a, b) => {
      if (sort === "low") {
        return a.price - b.price;
      }

      if (sort === "high") {
        return b.price - a.price;
      }

      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }

      return Number(Boolean(b.featured)) -
        Number(Boolean(a.featured));
    });

    return result;
  }, [products, selectedCategory, query, sort]);

  return (
    <main>
      <PageBanner
        title="Explore Our Collection"
        subtitle="Discover ten festive categories and find your favorite products."
      />

      <section className="section container">
        <div className="catalog-shop-heading">
          <div>
            <span className="eyebrow">
              THE COMPLETE COLLECTION
            </span>

            <h2>Find Your Favorites</h2>

            <p>
              Search, filter and explore the collection.
            </p>
          </div>

          <div className="catalog-count">
            <ShoppingBag size={21} />
            <span>
              {filteredProducts.length} Products
            </span>
          </div>
        </div>

        <div className="shop-toolbar catalog-toolbar">
          <label className="search-field">
            <Search size={20} />

            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products or categories..."
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
            />
          </label>

          <label className="catalog-sort">
            <SlidersHorizontal size={19} />

            <select
              aria-label="Sort products"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              <option value="featured">
                Featured First
              </option>

              <option value="low">
                Price: Low to High
              </option>

              <option value="high">
                Price: High to Low
              </option>

              <option value="name">
                Name: A to Z
              </option>
            </select>
          </label>
        </div>

        <div className="category-filters catalog-filters">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={`filter catalog-filter ${
                selectedCategory === category
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                changeCategory(category)
              }
              aria-pressed={
                selectedCategory === category
              }
            >
              {category}
            </button>
          ))}
        </div>

        <p className="results-count">
          Showing {filteredProducts.length} of{" "}
          {products.filter(
            (product) => product.isActive !== false
          ).length}{" "}
          products
        </p>

        {filteredProducts.length > 0 ? (
          <div className="product-grid catalog-product-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={getProductId(product)}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <Search size={38} />

            <h3>No products found</h3>

            <p>
              Try another category or search term.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setQuery("");
                setSearchParams({});
                setSort("featured");
              }}
            >
              Show All Products
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
