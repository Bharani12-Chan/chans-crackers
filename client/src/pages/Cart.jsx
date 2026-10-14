
import React from "react";
import { Link } from "react-router-dom";
import { useCart, money } from "../context/CartContext";

export default function Cart() {
  const {
    cart,
    subtotal,
    updateQuantity,
    removeItem
  } = useCart();

  return (
    <main className="page-shell content-page">
      <div className="section-heading">
        <span className="eyebrow">YOUR SELECTION</span>
        <h1>Shopping Cart</h1>
        <p>
          Review your products before dummy checkout.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <h2>Your Cart Is Empty</h2>
          <p>
            Add products from our collection to get started.
          </p>

          <Link to="/shop" className="primary-btn">
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="two-column">
          <section className="panel">
            <h2>Cart Items</h2>

            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-info">
                  <h3>{item.product.name}</h3>
                  <p>{money(item.product.price)} each</p>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-control">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                      disabled={item.quantity >= 100}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    {money(
                      Number(item.product.price) *
                        item.quantity
                    )}
                  </strong>
                </div>
              </div>
            ))}
          </section>

          <aside className="panel">
            <h2>Order Summary</h2>

            <div className="summary-line">
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>

            <div className="summary-line">
              <span>Payment Type</span>
              <span>Dummy Payment</span>
            </div>

            <hr />

            <div className="summary-line summary-total">
              <strong>Total</strong>
              <strong>{money(subtotal)}</strong>
            </div>

            <Link
              to="/checkout"
              className="primary-btn full-width"
            >
              Proceed to Checkout →
            </Link>

            <Link
              to="/shop"
              className="outline-btn full-width"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
