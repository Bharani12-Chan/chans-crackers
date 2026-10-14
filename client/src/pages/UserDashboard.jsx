import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingBag, Package, CheckCircle2,
  Clock3, ArrowRight, UserRound
} from "lucide-react";
import { useStore, money } from "../context/StoreContext";
import PageBanner from "../components/PageBanner";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

const dateText = value =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });

export default function UserDashboard() {
  const { user, api, cartCount } = useStore();
  const [params] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/orders/my")
      .then(data => setOrders(data.orders || []))
      .catch(error => setError(error.message))
      .finally(() => setLoading(false));
  }, [api]);

  const completed = orders.filter(
    order => order.status === "Completed"
  ).length;

  return (
    <>
      <PageBanner
        eyebrow="YOUR PERSONAL SPACE"
        title={`Hello, ${user?.name?.split(" ")[0] || "Customer"}!`}
        description="Track your orders, review your shopping history and explore more."
      />

      <section className="section container">
        {params.get("ordered") === "1" && (
          <div className="alert success">
            <CheckCircle2 size={22} />
            Your demo order has been placed successfully!
            No payment was charged.
          </div>
        )}

        {error && <div className="alert error">{error}</div>}

        <div className="dashboard-stats">
          <StatCard icon={Package} label="Total Orders" value={orders.length} />
          <StatCard icon={Clock3} label="Active Orders"
            value={orders.filter(o =>
              ["Placed", "Processing"].includes(o.status)
            ).length}
          />
          <StatCard icon={CheckCircle2} label="Completed" value={completed} />
          <StatCard icon={ShoppingBag} label="Items in Cart" value={cartCount} />
        </div>

        <div className="customer-layout">
          <div className="card-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">YOUR PURCHASE JOURNEY</span>
                <h2>My Orders</h2>
              </div>
              <Link className="btn btn-outline btn-sm" to="/shop">
                Shop More <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <p>Loading your orders...</p>
            ) : orders.length ? (
              <div className="order-list">
                {orders.map(order => (
                  <article className="order-card" key={order._id}>
                    <div className="order-card-top">
                      <div>
                        <small>ORDER #{order._id.slice(-8).toUpperCase()}</small>
                        <h3>{dateText(order.createdAt)}</h3>
                      </div>
                      <span className={`status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="order-products">
                      {order.items.map((item, index) => (
                        <div key={index}>
                          <span>{item.name} × {item.quantity}</span>
                          <strong>{money(item.price * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-bottom">
                      <span>{order.items.length} product lines</span>
                      <strong>Total: {money(order.total)}</strong>
                    </div>
                    <p className="small-note">
                      Payment: {order.paymentStatus || "Demo Only"}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="You haven't placed an order yet"
                description="Your orders will appear here after demo checkout."
              />
            )}
          </div>

          <aside className="dashboard-side">
            <div className="card-panel">
              <UserRound className="side-icon" />
              <h3>Account Details</h3>
              <p><strong>{user?.name}</strong></p>
              <p>{user?.email}</p>
              <span className="status status-completed">Customer Account</span>
            </div>

            <div className="card-panel">
              <h3>How to Order</h3>
              <ol className="steps-list">
                <li>Browse the product collection</li>
                <li>Open a product and choose quantity</li>
                <li>Add your favorites to the cart</li>
                <li>Review the cart and proceed</li>
                <li>Enter details and place a demo order</li>
                <li>Track progress from this dashboard</li>
              </ol>
              <Link to="/shop" className="btn btn-primary btn-full">
                Explore Products <ArrowRight size={17} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}