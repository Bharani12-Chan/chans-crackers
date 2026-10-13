import React from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart, Minus, Plus, Trash2, ArrowRight
} from "lucide-react";
import {
  useStore, money, FALLBACK_IMAGE
} from "../context/StoreContext";
import PageBanner from "../components/PageBanner";
import EmptyState from "../components/EmptyState";

export default function Cart() {
  const { cartItems, updateCart, subtotal } = useStore();

  if (!cartItems.length) {
    return (
      <main>
        <PageBanner title="Your Shopping Cart" />
        <EmptyState
          icon={ShoppingCart}
          title="Your Cart Is Empty"
          text="Your next celebration starts with something special."
          link="/shop"
          linkText="Explore Products"
        />
      </main>
    );
  }

  return (
    <main>
      <PageBanner title="Your Shopping Cart" />
      <section className="section container checkout-grid">
        <div className="panel">
          <h2>Cart Items ({cartItems.length})</h2>
          {cartItems.map(({ product, quantity }) => (
            <div className="cart-item" key={product.id}>
              <img
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                onError={event => {
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="cart-info">
                <Link to={`/product/${product.id}`}>
                  <h3>{product.name}</h3>
                </Link>
                <small>{product.category}</small>
                <strong>{money(product.price)}</strong>
                <div className="quantity-control">
                  <button
                    aria-label={`Decrease ${product.name}`}
                    onClick={() => updateCart(product.id, quantity - 1)}
                  >
                    <Minus size={15} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    aria-label={`Increase ${product.name}`}
                    disabled={quantity >= product.stock}
                    onClick={() => updateCart(product.id, quantity + 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
              <button
                className="icon-btn danger"
                aria-label={`Remove ${product.name}`}
                onClick={() => updateCart(product.id, 0)}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="panel order-summary">
          <h2>Order Summary</h2>
          <div className="summary-line">
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div className="summary-line">
            <span>Delivery</span>
            <span>Calculated later</span>
          </div>
          <div className="summary-line total">
            <span>Demo Total</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-full">
            Proceed to Checkout <ArrowRight size={18} />
          </Link>
          <Link to="/shop" className="continue-link">
            Continue Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}