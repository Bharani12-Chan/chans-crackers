
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowUpRight,
  PackageCheck
} from "lucide-react";

import {
  useCart,
  productId,
  money
} from "../context/CartContext";

import {
  getProductImage
} from "../data/categories";

import "../catalog.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const id = productId(product);
  const stock = Number(product.stock || 0);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);

  const discount =
    oldPrice > price
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  const handleAdd = () => {
    if (addItem(product, 1)) {
      navigate("/cart");
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
          to={`/product/${id}`}
          className="product-name"
        >
          {product.name}
        </Link>

        <p className="catalog-product-description">
          {product.description}
        </p>

        <div
          className={`catalog-stock ${
            stock === 0 ? "out" : ""
          }`}
        >
          <PackageCheck size={15} />
          {stock > 0
            ? `${stock} available`
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
            onClick={handleAdd}
            disabled={!id || stock <= 0}
            title="Add to cart"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={19} />
          </button>
        </div>

        <Link
          to={`/product/${id}`}
          className="catalog-view-link"
        >
          View Details
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
