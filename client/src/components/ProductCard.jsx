
import React from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ArrowUpRight,
  PackageCheck
} from "lucide-react";

import {
  useStore,
  money
} from "../context/StoreContext";

import {
  getProductId,
  getProductImage
} from "../data/categories";

import "../catalog.css";

const FALLBACK =
  "https://placehold.co/900x700/ede9fe/4c1d95?text=Chan%27s+Crackers";

export default function ProductCard({ product }) {
  const { addCart } = useStore();

  const id = getProductId(product);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);
  const stock = Number(product.stock || 0);

  const discount =
    oldPrice > price && oldPrice > 0
      ? Math.round(
          ((oldPrice - price) / oldPrice) * 100
        )
      : 0;

  const handleAddToCart = () => {
    if (id && stock > 0) {
      addCart(id, 1);
    }
  };

  return (
    <article className="product-card catalog-product-card">
      <Link
        className="product-image"
        to={`/product/${id}`}
      >
        <img
          src={getProductImage(product)}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src !== FALLBACK) {
              event.currentTarget.src = FALLBACK;
            }
          }}
        />

        {product.badge && (
          <span className="product-badge">
            {product.badge}
          </span>
        )}

        {discount > 0 && (
          <span className="discount-badge">
            {discount}% OFF
          </span>
        )}
      </Link>

      <div className="product-content">
        <span className="product-category">
          {product.category}
        </span>

        <Link
          className="product-name"
          to={`/product/${id}`}
        >
          {product.name}
        </Link>

        <p className="catalog-product-description">
          {product.description ||
            "Explore this festive collection."}
        </p>

        <div
          className={`catalog-stock ${
            stock <= 0 ? "out" : ""
          }`}
        >
          <PackageCheck size={15} />
          {stock > 0
            ? `${stock} in stock`
            : "Out of stock"}
        </div>

        <div className="product-bottom">
          <div className="catalog-pricing">
            <strong className="price">
              {money(price)}
            </strong>

            {oldPrice > price && (
              <del>{money(oldPrice)}</del>
            )}
          </div>

          <button
            type="button"
            className="add-btn"
            disabled={stock <= 0 || !id}
            aria-label={`Add ${product.name} to cart`}
            onClick={handleAddToCart}
          >
            <Plus size={21} />
          </button>
        </div>

        <Link
          className="catalog-view-link"
          to={`/product/${id}`}
        >
          View Product
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </article>
  );
}
