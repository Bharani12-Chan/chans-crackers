import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, Minus, Plus, ShoppingCart,
  ShieldCheck, Star
} from "lucide-react";
import {
  useStore, money, FALLBACK_IMAGE
} from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import EmptyState from "../components/EmptyState";

export default function Product() {
  const { id } = useParams();
  const { products, addCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => setQuantity(1), [id]);

  const product = products.find(item => item.id === id);

  if (!product) {
    return (
      <main className="section container">
        <EmptyState
          title="Product Not Found"
          text="This product is no longer available."
          link="/shop"
          linkText="Back to Shop"
        />
      </main>
    );
  }

  return (
    <main className="section container">
      <Link to="/shop" className="back-link">
        <ArrowLeft size={17} /> Back to Shop
      </Link>

      <div className="details-grid">
        <div className="details-image">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            onError={event => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="details-content">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="rating">
            <Star size={18} fill="currentColor" />
            {product.rating || "New"}
          </div>

          <div className="details-price">
            {money(product.price)}
            {product.oldPrice > product.price && (
              <del>{money(product.oldPrice)}</del>
            )}
          </div>

          <p>{product.description}</p>
          <p className="stock-text">
            {product.stock > 0
              ? `${product.stock} available`
              : "Out of stock"}
          </p>

          <div className="purchase-row">
            <div className="quantity-control">
              <button
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={17} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity >= product.stock}
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              >
                <Plus size={17} />
              </button>
            </div>

            <button
              className="btn btn-primary"
              disabled={product.stock < 1}
              onClick={() => addCart(product.id, quantity)}
            >
              <ShoppingCart size={19} /> Add to Cart
            </button>
          </div>

          <div className="product-notice">
            <ShieldCheck size={21} />
            Follow applicable local regulations, age restrictions,
            and safety instructions.
          </div>
        </div>
      </div>

      <section className="section">
        <SectionHeading eyebrow="MORE TO EXPLORE" title="You May Also Like" />
        <div className="product-grid">
          {products.filter(item => item.id !== id).slice(0, 4)
            .map(item => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </main>
  );
}