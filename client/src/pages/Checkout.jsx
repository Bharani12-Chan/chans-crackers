import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CreditCard, CheckCircle2, ArrowRight } from "lucide-react";
import { useStore, money } from "../context/StoreContext";
import PageBanner from "../components/PageBanner";

export default function Checkout() {
  const { session, cartItems, subtotal, placeOrder } = useStore();
  const [completed, setCompleted] = useState(null);
  const [address, setAddress] = useState({
    fullName: session?.name || "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: ""
  });

  if (!session) {
    return <Navigate to="/login" state={{ from: "/checkout" }} replace />;
  }

  if (!cartItems.length && !completed) {
    return <Navigate to="/cart" replace />;
  }

  const change = event => {
    setAddress(previous => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const submit = event => {
    event.preventDefault();
    const order = placeOrder(address);
    if (order) setCompleted(order);
  };

  if (completed) {
    return (
      <main className="section container">
        <div className="success-card">
          <CheckCircle2 size={74} />
          <h1>Demo Payment Successful!</h1>
          <p>Your demonstration order has been created.</p>
          <div className="order-id">{completed.id}</div>
          <strong>Total: {money(completed.total)}</strong>
          <p className="muted">
            No real payment was processed or charged.
          </p>
          <Link className="btn btn-primary" to="/dashboard">
            View My Orders <ArrowRight size={18} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageBanner
        title="Demo Checkout"
        subtitle="No real payment or delivery is processed"
      />
      <section className="section container checkout-grid">
        <form className="panel checkout-form" onSubmit={submit}>
          <h2>Delivery Information</h2>
          <div className="form-grid">
            {[
              ["fullName", "Full Name", "text"],
              ["phone", "Phone Number", "tel"],
              ["line1", "Street Address", "text"],
              ["city", "City", "text"],
              ["state", "State", "text"],
              ["pincode", "PIN Code", "text"]
            ].map(([name, label, type]) => (
              <label className="field" key={name}>
                <span>{label}</span>
                <input
                  required
                  type={type}
                  name={name}
                  value={address[name]}
                  onChange={change}
                  placeholder={label}
                  pattern={name === "pincode" ? "[0-9]{6}" : undefined}
                  maxLength={name === "pincode" ? 6 : 150}
                />
              </label>
            ))}
          </div>

          <h2>Payment Method</h2>
          <div className="payment-option">
            <CreditCard size={25} />
            <div>
              <strong>Dummy Payment</strong>
              <p>No card number, bank details, or UPI required.</p>
            </div>
            <CheckCircle2 size={21} />
          </div>

          <button className="btn btn-primary btn-full" type="submit">
            Simulate Payment — {money(subtotal)}
          </button>
        </form>

        <div className="panel order-summary">
          <h2>Your Order</h2>
          {cartItems.map(({ product, quantity }) => (
            <div className="summary-line" key={product.id}>
              <span>{product.name} × {quantity}</span>
              <strong>{money(product.price * quantity)}</strong>
            </div>
          ))}
          <div className="summary-line total">
            <span>Total</span><strong>{money(subtotal)}</strong>
          </div>
          <p className="muted">
            Demonstration only. Shipping, taxes, regulatory
            checks, and real payment processing are not implemented.
          </p>
        </div>
      </section>
    </main>
  );
}