import React from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  User, Package, ShoppingBag, CreditCard,
  LayoutDashboard, LogOut
} from "lucide-react";
import { useStore, money } from "../context/StoreContext";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

export default function UserDashboard() {
  const { session, orders, logout } = useStore();
  const navigate = useNavigate();

  if (!session) return <Navigate to="/login" replace />;
  if (session.role === "admin") return <Navigate to="/admin" replace />;

  const myOrders = orders.filter(order => order.email === session.email);
  const spent = myOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="dashboard-page">
      <div className="container dashboard-header">
        <span className="eyebrow">MY ACCOUNT</span>
        <h1>Welcome, {session.name} 👋</h1>
        <p>Manage your demo account and view your orders.</p>
      </div>

      <div className="container dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="profile-mini">
            <div className="avatar"><User /></div>
            <strong>{session.name}</strong>
            <small>{session.email}</small>
          </div>
          <a href="#overview"><LayoutDashboard size={18} /> Overview</a>
          <a href="#orders"><Package size={18} /> My Orders</a>
          <button onClick={() => {
            logout();
            navigate("/");
          }}>
            <LogOut size={18} /> Logout
          </button>
        </aside>

        <div className="dashboard-main">
          <section id="overview" className="stats-grid">
            <StatCard icon={ShoppingBag} title="Total Orders" value={myOrders.length} />
            <StatCard icon={CreditCard} title="Demo Spent" value={money(spent)} />
            <StatCard
              icon={Package}
              title="Orders Placed"
              value={myOrders.filter(order => order.status === "Placed").length}
            />
          </section>

          <section className="panel" id="orders">
            <div className="panel-heading">
              <h2>My Orders</h2>
              <Link to="/shop" className="btn btn-small btn-primary">
                Shop Now
              </Link>
            </div>

            {myOrders.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myOrders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                        <td>{money(order.total)}</td>
                        <td><span className="status">{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No Orders Yet"
                text="Start shopping to see your orders here."
                link="/shop"
                linkText="Explore Products"
              />
            )}
          </section>

          <section className="panel">
            <h2>Account Details</h2>
            <p><strong>Name:</strong> {session.name}</p>
            <p><strong>Email:</strong> {session.email}</p>
            <p className="muted">
              Profile editing will be available after backend integration.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}