import React from "react";
import { Link } from "react-router-dom";
import { Plus, Star } from "lucide-react";
import {
  useStore, money, FALLBACK_IMAGE
} from "../context/StoreContext";

export default function ProductCard({ product }) {
  const { addCart } = useStore();

  const discount = product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <article className="product-card">
      <Link
        to={`/product/${product.id}`}
        className="product-image"
      >
        <img
          src={product.image || FALLBACK_IMAGE}
          alt={product.name}
          loading="lazy"
          onError={event => {
            if (event.currentTarget.src !== FALLBACK_IMAGE) {
              event.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />

        {product.badge && (
          <span className="product-badge">{product.badge}</span>
        )}

        {discount > 0 && (
          <span className="discount-badge">-{discount}%</span>
        )}
      </Link>

      <div className="product-content">
        <span className="product-category">
          {product.category}
        </span>

        <Link
          to={`/product/${product.id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        <div className="rating">
          <Star size={15} fill="currentColor" />
          <span>{product.rating || "New"}</span>
        </div>

        <div className="product-bottom">
          <div>
            <strong className="price">
              {money(product.price)}
            </strong>

            {product.oldPrice > product.price && (
              <del>{money(product.oldPrice)}</del>
            )}
          </div>

          <button
            className="add-btn"
            aria-label={`Add ${product.name} to cart`}
            disabled={product.stock < 1}
            onClick={() => addCart(product.id)}
          >
            <Plus size={20} />
          </button>
        </div>

        {product.stock < 1 && <small>Out of stock</small>}
      </div>
    </article>
  );
}