
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, useStore } from "../context/StoreContext";
import { money } from "../context/CartContext";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { session, logout } = useStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/orders/my");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoggingOut(false);
    }
  }

  const total = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return (
    <main className="page-shell content-page">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">CUSTOMER ACCOUNT</span>
          <h1>My Dashboard</h1>
          <p>Welcome, {session?.name || "Customer"}!</p>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          ↪ {loggingOut ? "Logging Out..." : "Logout"}
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className="stat-card">
          <span>Demo Order Value</span>
          <strong>{money(total)}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h2>My Orders</h2>

          <button
            type="button"
            className="outline-btn"
            onClick={loadOrders}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No Orders Yet</h3>
            <p>
              Your demo purchases will appear here.
            </p>
            <Link to="/shop" className="primary-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-heading">
                  <div>
                    <small>ORDER</small>
                    <h3>
                      #{String(order._id)
                        .slice(-8)
                        .toUpperCase()}
                    </h3>
                    <p className="muted">
                      {new Date(
                        order.createdAt
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span className="status-pill">
                    {order.status}
                  </span>
                </div>

                <div className="order-products">
                  {(order.items || []).map((item, index) => (
                    <div
                      className="summary-line"
                      key={`${order._id}-${index}`}
                    >
                      <span>
                        {item.name} × {item.quantity}
                      </span>

                      <strong>
                        {money(item.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <span>
                    Payment:{" "}
                    <strong>{order.paymentStatus}</strong>
                  </span>

                  <strong>{money(order.total)}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
