import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Sparkles, LayoutDashboard, Package, ShoppingBag,
  Users, Crown, CreditCard, ClipboardList, LogOut,
  ArrowLeft, Plus, Edit3, Trash2, Save, AlertCircle
} from "lucide-react";
import { useStore, money, FALLBACK_IMAGE, categories } from "../context/StoreContext";
import StatCard from "../components/StatCard";

const blankProduct = {
  name: "",
  category: "Sparklers",
  price: "",
  oldPrice: "",
  stock: "",
  image: "",
  description: "",
  badge: ""
};

const menu = [
  ["overview", LayoutDashboard, "Overview"],
  ["products", Package, "Products"],
  ["orders", ClipboardList, "Orders"],
  ["customers", Users, "Customers"],
  ["admins", Crown, "Manage Admins"]
];

export default function AdminDashboard() {
  const {
    session, logout, products, orders, users,
    saveProduct, deleteProduct, updateOrder, addAdmin
  } = useStore();

  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankProduct);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== "admin") return <Navigate to="/dashboard" replace />;

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  const startAdd = () => {
    setEditing(null);
    setForm({ ...blankProduct });
    setFormOpen(true);
  };

  const startEdit = product => {
    setEditing(product.id);
    setForm({ ...product });
    setFormOpen(true);
  };

  const submitProduct = event => {
    event.preventDefault();

    const price = Number(form.price);
    const oldPrice = Number(form.oldPrice || 0);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !Number.isFinite(price) ||
      !Number.isFinite(oldPrice) ||
      !Number.isInteger(stock) ||
      price < 0 || oldPrice < 0 || stock < 0
    ) return;

    saveProduct({
      ...form,
      ...(editing ? { id: editing } : {}),
      name: form.name.trim(),
      price,
      oldPrice,
      stock
    });

    setFormOpen(false);
    setEditing(null);
    setForm({ ...blankProduct });
  };

  const submitAdmin = event => {
    event.preventDefault();
    if (addAdmin(adminName, adminEmail)) {
      setAdminName("");
      setAdminEmail("");
    }
  };

  const ordersTable = items => (
    items.length ? (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  {order.customer}<br />
                  <small>{order.email}</small>
                </td>
                <td>{money(order.total)}</td>
                <td><span className="status">{order.paymentStatus}</span></td>
                <td>
                  <select
                    aria-label={`Status for ${order.id}`}
                    value={order.status}
                    onChange={event => updateOrder(order.id, event.target.value)}
                  >
                    {["Placed", "Processing", "Completed", "Cancelled"].map(status => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : <p className="muted">No demo orders available yet.</p>
  );

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/" className="brand admin-brand">
          <span className="brand-icon"><Sparkles size={22} /></span>
          <span>Chan's <strong>Crackers</strong></span>
        </Link>

        <nav className="admin-menu">
          {menu.map(([id, Icon, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={19} /> {label}
            </button>
          ))}
          <button onClick={() => navigate("/")}>
            <ArrowLeft size={19} /> Back to Store
          </button>
          <button onClick={() => {
            logout();
            navigate("/");
          }}>
            <LogOut size={19} /> Logout
          </button>
        </nav>
      </aside>

      <div className="admin-content">
        <div className="admin-topbar">
          <div>
            <span className="eyebrow">ADMIN CONTROL CENTER</span>
            <h1>{menu.find(item => item[0] === tab)?.[2]}</h1>
          </div>
          <div className="admin-user">
            <div className="avatar"><Crown size={19} /></div>
            <span>{session.name}</span>
          </div>
        </div>

        <div className="demo-alert admin-alert">
          <AlertCircle size={19} />
          Demo admin mode only. Browser-local data and permissions
          are not secure. Real access control requires a backend.
        </div>

        {tab === "overview" && (
          <>
            <div className="stats-grid">
              <StatCard icon={CreditCard} title="Demo Revenue" value={money(revenue)} />
              <StatCard icon={Package} title="Products" value={products.length} />
              <StatCard icon={ShoppingBag} title="Orders" value={orders.length} />
              <StatCard
                icon={Users}
                title="Customers"
                value={users.filter(user => user.role === "customer").length}
              />
            </div>
            <div className="panel">
              <h2>Recent Orders</h2>
              {ordersTable(orders.slice(0, 5))}
            </div>
          </>
        )}

        {tab === "products" && (
          <div className="panel">
            <div className="panel-heading">
              <h2>Product Management</h2>
              <button className="btn btn-primary btn-small" onClick={startAdd}>
                <Plus size={18} /> Add Product
              </button>
            </div>

            {formOpen && (
              <form className="admin-form" onSubmit={submitProduct}>
                <h3>{editing ? "Edit Product" : "Add New Product"}</h3>
                <div className="form-grid">
                  {[
                    ["name", "Product Name", "text"],
                    ["price", "Selling Price", "number"],
                    ["oldPrice", "Original Price", "number"],
                    ["stock", "Stock Quantity", "number"],
                    ["image", "Hosted Image URL", "url"],
                    ["badge", "Product Badge", "text"]
                  ].map(([name, label, type]) => (
                    <label className="field" key={name}>
                      <span>{label}</span>
                      <input
                        type={type}
                        value={form[name] ?? ""}
                        min={type === "number" ? 0 : undefined}
                        step={name === "stock" ? "1" : "any"}
                        required={["name", "price", "stock"].includes(name)}
                        placeholder={label}
                        onChange={event => setForm(previous => ({
                          ...previous, [name]: event.target.value
                        }))}
                      />
                    </label>
                  ))}

                  <label className="field">
                    <span>Category</span>
                    <select
                      value={form.category}
                      onChange={event => setForm(previous => ({
                        ...previous, category: event.target.value
                      }))}
                    >
                      {categories.filter(item => item !== "All").map(item => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Description</span>
                    <textarea
                      rows="3"
                      value={form.description}
                      onChange={event => setForm(previous => ({
                        ...previous, description: event.target.value
                      }))}
                    />
                  </label>
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" type="submit">
                    <Save size={18} /> Save Product
                  </button>
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={() => setFormOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Product</th><th>Category</th>
                    <th>Price</th><th>Stock</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className="table-product">
                          <img
                            src={product.image || FALLBACK_IMAGE}
                            alt=""
                            onError={event => {
                              event.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />
                          <strong>{product.name}</strong>
                        </div>
                      </td>
                      <td>{product.category}</td>
                      <td>{money(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            aria-label={`Edit ${product.name}`}
                            onClick={() => startEdit(product)}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            className="danger"
                            aria-label={`Delete ${product.name}`}
                            onClick={() => {
                              if (window.confirm("Delete this demo product?")) {
                                deleteProduct(product.id);
                              }
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="panel">
            <h2>All Orders</h2>
            {ordersTable(orders)}
          </div>
        )}

        {tab === "customers" && (
          <div className="panel">
            <h2>Registered Demo Customers</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th></tr>
                </thead>
                <tbody>
                  {users.filter(user => user.role === "customer").map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className="status">Customer</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!users.some(user => user.role === "customer") && (
              <p className="muted">No demo customers registered yet.</p>
            )}
          </div>
        )}

        {tab === "admins" && (
          <div className="panel">
            <h2>Admin Management</h2>
            <p className="muted">
              These are demonstration records only.
              Real admin creation will be handled securely by the backend.
            </p>

            <form className="admin-form" onSubmit={submitAdmin}>
              <div className="form-grid">
                <label className="field">
                  <span>Admin Name</span>
                  <input
                    required
                    value={adminName}
                    onChange={event => setAdminName(event.target.value)}
                    placeholder="Admin name"
                  />
                </label>
                <label className="field">
                  <span>Admin Email</span>
                  <input
                    required
                    type="email"
                    value={adminEmail}
                    onChange={event => setAdminEmail(event.target.value)}
                    placeholder="admin@example.com"
                  />
                </label>
              </div>
              <button className="btn btn-primary" type="submit">
                <Plus size={18} /> Add Demo Admin
              </button>
            </form>

            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th></tr>
                </thead>
                <tbody>
                  {users.filter(user => user.role === "admin").map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className="status">Admin</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}