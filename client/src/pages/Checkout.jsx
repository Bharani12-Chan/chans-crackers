
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart, money } from "../context/CartContext";
import { api } from "../context/StoreContext";

const emptyAddress = {
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: ""
};

export default function Checkout() {
  const {
    cart,
    subtotal,
    clearCart
  } = useCart();

  const [address, setAddress] = useState(emptyAddress);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading || !cart.length) return;

    setLoading(true);
    setError("");

    try {
      const data = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity
          })),
          address
        })
      });

      if (!data.order?._id) {
        throw new Error("Order confirmation missing");
      }

      setOrder(data.order);
      clearCart();
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (order) {
    return (
      <main className="page-shell content-page">
        <div className="success-panel">
          <div className="success-icon">✓</div>

          <h1>Demo Order Confirmed!</h1>

          <p>
            Your order has been saved in MongoDB.
            No real payment was charged.
          </p>

          <div className="order-reference">
            Order ID: {order._id}
          </div>

          <h2>{money(order.total)}</h2>

          <p>
            Payment Status:{" "}
            <strong>{order.paymentStatus}</strong>
          </p>

          <Link to="/dashboard" className="primary-btn">
            View My Orders →
          </Link>
        </div>
      </main>
    );
  }

  if (!cart.length) {
    return (
      <main className="page-shell content-page">
        <div className="empty-state">
          <h2>Your Cart Is Empty</h2>
          <Link to="/shop" className="primary-btn">
            Go Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell content-page">
      <div className="section-heading">
        <span className="eyebrow">FINAL STEP</span>
        <h1>Demo Checkout</h1>
        <p>
          Enter delivery details and confirm your sample order.
        </p>
      </div>

      <div className="two-column">
        <form className="panel" onSubmit={handleSubmit}>
          <h2>Customer Details</h2>

          <div className="form-grid">
            {[
              ["fullName", "Full Name"],
              ["phone", "Phone Number"],
              ["line1", "Street Address"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "PIN Code"]
            ].map(([key, label]) => (
              <label className="form-field" key={key}>
                <span>{label}</span>

                <input
                  name={key}
                  placeholder={label}
                  value={address[key]}
                  onChange={(event) =>
                    setAddress((previous) => ({
                      ...previous,
                      [key]: event.target.value
                    }))
                  }
                  required
                  maxLength={
                    key === "pincode" ? 6 : 200
                  }
                  pattern={
                    key === "phone"
                      ? "[0-9]{10}"
                      : key === "pincode"
                      ? "[0-9]{6}"
                      : undefined
                  }
                />
              </label>
            ))}
          </div>

          <div className="demo-payment-box">
            <strong>✓ Dummy Payment</strong>
            <p>
              No card number, UPI, or real payment needed.
            </p>
          </div>

          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={loading}
          >
            {loading
              ? "Saving Order..."
              : `Confirm Demo Payment · ${money(subtotal)}`}
          </button>
        </form>

        <aside className="panel">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="summary-line" key={item.id}>
              <span>
                {item.product.name} × {item.quantity}
              </span>

              <strong>
                {money(
                  item.product.price * item.quantity
                )}
              </strong>
            </div>
          ))}

          <hr />

          <div className="summary-line summary-total">
            <strong>Total</strong>
            <strong>{money(subtotal)}</strong>
          </div>

          <p className="muted">
            The backend verifies product prices and stock
            before saving the order.
          </p>
        </aside>
      </div>
    </main>
  );
}
