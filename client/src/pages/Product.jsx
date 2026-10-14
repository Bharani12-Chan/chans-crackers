
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  PackageCheck
} from "lucide-react";

import { useStore } from "../context/StoreContext";

import {
  useCart,
  productId,
  money
} from "../context/CartContext";

import { getProductImage } from "../data/categories";

import "../catalog.css";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products = [] } = useStore();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);

  const product = products.find(
    (item) => productId(item) === String(id)
  );

  if (!product) {
    return (
      <main className="catalog-page-wrap">
        <div className="catalog-container catalog-empty">
          <h2>Product Not Found</h2>
          <p>
            The product may still be loading or is unavailable.
          </p>
          <Link className="btn btn-primary" to="/shop">
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const stock = Number(product.stock || 0);
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);

  const handleAdd = () => {
    if (addItem(product, quantity)) {
      navigate("/cart");
    }
  };

  return (
    <main className="catalog-page-wrap">
      <div className="catalog-container">
        <Link to="/shop" className="catalog-back-link">
          <ArrowLeft size={18} />
          Back to Shop
        </Link>

        <div className="catalog-detail-grid">
          <div className="catalog-detail-image">
            <img
              src={getProductImage(product)}
              alt={product.name}
            />
          </div>

          <div className="catalog-detail-info">
            <span className="catalog-section-eyebrow">
              {product.category}
            </span>

            <h1>{product.name}</h1>

            <p>{product.description}</p>

            <div className="catalog-detail-price">
              <strong>{money(price)}</strong>

              {oldPrice > price && (
                <del>{money(oldPrice)}</del>
              )}
            </div>

            <div className="catalog-stock">
              <PackageCheck size={19} />
              {stock > 0
                ? `${stock} available`
                : "Out of stock"}
            </div>

            <div className="catalog-detail-actions">
              <div className="catalog-quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setQuantity((value) => Math.max(1, value - 1))
                  }
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>

                <strong>{quantity}</strong>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQuantity((value) =>
                      Math.min(stock, value + 1)
                    )
                  }
                  disabled={quantity >= stock}
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                className="catalog-button catalog-button-purple"
                disabled={stock <= 0}
                onClick={handleAdd}
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>
            </div>

            <p className="catalog-demo-note">
              Product details and images are for demonstration.
              Follow applicable product safety instructions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
