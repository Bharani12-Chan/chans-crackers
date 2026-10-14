import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CheckCircle2,
  MapPin, ShieldCheck
} from "lucide-react";
import { useStore, money } from "../context/StoreContext";
import EmptyState from "../components/EmptyState";
import PageBanner from "../components/PageBanner";

export default function Checkout() {
  const {
    user, cartItems, cartTotal,
    clearCart, api, refreshProducts
  } = useStore();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    line1: "",
    city: "",
    state: "Tamil Nadu",
    pincode: ""
  });

  async function placeOrder(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          address: form
        })
      });

      clearCart();
      await refreshProducts();
      navigate("/dashboard?ordered=1", { replace: true });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageBanner
        eyebrow="FINAL STEP"
        title="Checkout"
        description="Confirm your details and place your demonstration order."
      />

      <section className="section container">
        {!cartItems.length ? (
          <EmptyState
            title="Your cart is empty"
            description="Add products before checking out."
          />
        ) : (
          <form className="checkout-layout" onSubmit={placeOrder}>
            <div className="checkout-form card-panel">
              <h2><MapPin size={24} /> Delivery Information</h2>
              <p className="muted">
                These details are stored for the demo order only.
              </p>

              {error && <div className="alert error">{error}</div>}

              <div className="form-grid">
                {[
                  ["fullName", "Full Name"],
                  ["phone", "Phone Number"],
                  ["line1", "Address / Street"],
                  ["city", "City"],
                  ["state", "State"],
                  ["pincode", "PIN Code"]
                ].map(([key, label]) => (
                  <label
                    className={`field ${key === "line1" ? "wide" : ""}`}
                    key={key}
                  >
                    {label}
                    <input
                      required
                      value={form[key]}
                      maxLength={key === "phone" ? 10 : key === "pincode" ? 6 : 200}
                      pattern={
                        key === "phone" ? "[0-9]{10}" :
                        key === "pincode" ? "[0-9]{6}" : undefined
                      }
                      onChange={event =>
                        setForm({ ...form, [key]: event.target.value })
                      }
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </label>
                ))}
              </div>

              <div className="checkout-notice">
                <ShieldCheck size={21} />
                <div>
                  <strong>Demonstration Checkout</strong>
                  <p>
                    No actual payment is processed. This creates a
                    sample order in MongoDB for project demonstration.
                  </p>
                </div>
              </div>

              <Link to="/cart" className="back-link">
                <ArrowLeft size={17} /> Back to Cart
              </Link>
            </div>

            <aside className="summary-card">
              <h3>Your Order</h3>

              {cartItems.map(item => (
                <div className="summary-row" key={item.productId}>
                  <span>{item.name} × {item.quantity}</span>
                  <strong>{money(item.price * item.quantity)}</strong>
                </div>
              ))}

              <div className="summary-total">
                <span>Total</span>
                <strong>{money(cartTotal)}</strong>
              </div>

              <div className="checkout-steps">
                <span><CheckCircle2 size={17} /> Review items</span>
                <span><CheckCircle2 size={17} /> Enter details</span>
                <span><CheckCircle2 size={17} /> Place demo order</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-full"
              >
                {loading ? "Placing Order..." : "Place Demo Order"}
                <ArrowRight size={18} />
              </button>
            </aside>
          </form>
        )}
      </section>
    </>
  );
}