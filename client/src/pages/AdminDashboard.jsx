import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Plus, Pencil, Trash2, LogOut, Menu, X,
  TrendingUp, AlertTriangle, Search, ArrowLeft,
  Save, RefreshCw, Sparkles, CheckCircle2
} from "lucide-react";

import {
  useStore, money, imageFallback
} from "../context/StoreContext";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

const blankProduct = {
  name: "",
  category: "Sparklers",
  description: "",
  price: "",
  oldPrice: "",
  stock: "",
  image: "",
  badge: "",
  featured: false
};

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "customers", label: "Customers", icon: Users }
];

const orderStatuses = ["Placed", "Processing", "Completed", "Cancelled"];

export default function AdminDashboard() {
  const { user, api, logout, refreshProducts } = useStore();
  const navigate = useNavigate();

  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankProduct);
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [s, p, o, u] = await Promise.all([
        api("/admin/stats"),
        api("/admin/products"),
        api("/admin/orders"),
        api("/admin/users")
      ]);

      setStats(s.stats || {});
      setProducts(p.products || []);
      setOrders(o.orders || []);
      setCustomers(u.users || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function showTab(next) {
    setTab(next);
    setSidebarOpen(false);
    setError("");
    setSuccess("");
    setFormOpen(false);
  }

  function newProduct() {
    setEditingId(null);
    setForm({ ...blankProduct });
    setFormOpen(true);
    setTab("products");
    setError("");
    setSuccess("");
  }

  function editProduct(product) {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category || "Sparklers",
      description: product.description || "",
      price: String(product.price ?? ""),
      oldPrice: String(product.oldPrice ?? ""),
      stock: String(product.stock ?? ""),
      image: product.image || "",
      badge: product.badge || "",
      featured: Boolean(product.featured)
    });
    setFormOpen(true);
    setTab("products");
    setError("");
  }

  async function saveProduct(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice || 0),
        stock: Number(form.stock)
      };

      await api(
        editingId
          ? `/admin/products/${editingId}`
          : "/admin/products",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setSuccess(editingId
        ? "Product updated successfully"
        : "New product added successfully");

      setFormOpen(false);
      setEditingId(null);
      setForm({ ...blankProduct });
      await loadData();
      await refreshProducts();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Remove "${product.name}" from the shop?`)) {
      return;
    }

    setError("");

    try {
      await api(`/admin/products/${product._id}`, {
        method: "DELETE"
      });

      setSuccess("Product removed from storefront");
      await loadData();
      await refreshProducts();
    } catch (error) {
      setError(error.message);
    }
  }

  async function updateOrderStatus(order, status) {
    if (
      status === "Cancelled" &&
      !window.confirm("Cancel this order and restore its stock?")
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api(`/admin/orders/${order._id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });

      setSuccess("Order status updated");
      await loadData();
      await refreshProducts();
    } catch (error) {
      setError(error.message);
    }
  }

  async function signOut() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      setError(error.message);
    }
  }

  const visibleProducts = products.filter(product =>
    `${product.name} ${product.category}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Link to="/" className="admin-brand">
          <Sparkles size={27} />
          <span>
            <strong>CHAN'S</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </Link>

        <div className="sidebar-caption">MANAGEMENT</div>

        <nav className="admin-menu">
          {menuItems.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={tab === item.id ? "active" : ""}
                onClick={() => showTab(item.id)}
              >
                <Icon size={20} /> {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <Link to="/" className="sidebar-link">
            <ArrowLeft size={18} /> View Storefront
          </Link>
          <button onClick={signOut} className="sidebar-link">
            <LogOut size={18} /> Log Out
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-top-left">
            <button
              className="mobile-menu admin-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle admin navigation"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>

            <div>
              <span className="eyebrow">STORE MANAGEMENT</span>
              <h2>{menuItems.find(item => item.id === tab)?.label}</h2>
            </div>
          </div>

          <div className="admin-profile">
            <span className="admin-avatar">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <small>Authorized Administrator</small>
            </div>
          </div>
        </header>

        <div className="admin-content">
          {error && <div className="alert error">{error}</div>}
          {success && (
            <div className="alert success">
              <CheckCircle2 size={19} /> {success}
            </div>
          )}

          {loading && <p className="muted">Refreshing dashboard data...</p>}

          {tab === "overview" && (
            <>
              <div className="admin-welcome">
                <div>
                  <span className="eyebrow">GOOD TO SEE YOU</span>
                  <h1>Welcome back, {user?.name?.split(" ")[0]}!</h1>
                  <p>
                    Manage products, track demo orders and monitor
                    your storefront from one place.
                  </p>
                </div>
                <button className="btn btn-gold" onClick={newProduct}>
                  <Plus size={18} /> Add New Product
                </button>
              </div>

              <div className="dashboard-stats">
                <StatCard
                  icon={Package}
                  label="Active Products"
                  value={stats.products || 0}
                />
                <StatCard
                  icon={ShoppingBag}
                  label="Total Orders"
                  value={stats.orders || 0}
                />
                <StatCard
                  icon={Users}
                  label="Customers"
                  value={stats.customers || 0}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Demo Order Value"
                  value={money(stats.revenue)}
                />
              </div>

              <div className="admin-two-column">
                <div className="card-panel">
                  <div className="panel-heading">
                    <h3>Recent Orders</h3>
                    <button
                      className="text-button"
                      onClick={() => showTab("orders")}
                    >
                      View All
                    </button>
                  </div>

                  {orders.length ? (
                    orders.slice(0, 5).map(order => (
                      <div className="recent-row" key={order._id}>
                        <div>
                          <strong>{order.customer}</strong>
                          <small>#{order._id.slice(-8).toUpperCase()}</small>
                        </div>
                        <span className={`status status-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                        <strong>{money(order.total)}</strong>
                      </div>
                    ))
                  ) : (
                    <p className="muted">No orders yet.</p>
                  )}
                </div>

                <div className="card-panel">
                  <div className="panel-heading">
                    <h3>Store Insights</h3>
                    <RefreshCw size={18} />
                  </div>

                  <div className="insight-line">
                    <span><AlertTriangle size={19} /> Low Stock Products</span>
                    <strong>{stats.lowStock || 0}</strong>
                  </div>
                  <div className="insight-line">
                    <span><Package size={19} /> Listed Products</span>
                    <strong>{stats.products || 0}</strong>
                  </div>
                  <div className="insight-line">
                    <span><Users size={19} /> Registered Customers</span>
                    <strong>{stats.customers || 0}</strong>
                  </div>

                  <button
                    className="btn btn-outline btn-full"
                    onClick={loadData}
                  >
                    <RefreshCw size={17} /> Refresh Dashboard
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "products" && (
            <>
              <div className="panel-heading admin-section-head">
                <div>
                  <span className="eyebrow">INVENTORY CONTROL</span>
                  <h2>Manage Products</h2>
                  <p>Add products, update prices and manage stock.</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={newProduct}
                >
                  <Plus size={18} /> Add Product
                </button>
              </div>

              {formOpen && (
                <div className="card-panel product-editor">
                  <div className="panel-heading">
                    <div>
                      <span className="eyebrow">
                        {editingId ? "UPDATE LISTING" : "NEW LISTING"}
                      </span>
                      <h2>
                        {editingId ? "Edit Product" : "Add New Product"}
                      </h2>
                    </div>
                    <button
                      className="icon-action"
                      onClick={() => setFormOpen(false)}
                    >
                      <X size={21} />
                    </button>
                  </div>

                  <form onSubmit={saveProduct}>
                    <div className="form-grid">
                      <label className="field wide">
                        Product Name *
                        <input
                          required
                          minLength={2}
                          maxLength={150}
                          value={form.name}
                          onChange={event =>
                            setForm({ ...form, name: event.target.value })
                          }
                          placeholder="Example: Premium Festive Gift Box"
                        />
                      </label>

                      <label className="field">
                        Category *
                        <select
                          value={form.category}
                          onChange={event =>
                            setForm({ ...form, category: event.target.value })
                          }
                        >
                          <option>Sparklers</option>
                          <option>Gift Boxes</option>
                          <option>Combos</option>
                        </select>
                      </label>

                      <label className="field">
                        Product Badge
                        <input
                          maxLength={80}
                          value={form.badge}
                          onChange={event =>
                            setForm({ ...form, badge: event.target.value })
                          }
                          placeholder="Bestseller / New Arrival"
                        />
                      </label>

                      <label className="field">
                        Selling Price (₹) *
                        <input
                          required
                          type="number"
                          min="1"
                          step="0.01"
                          value={form.price}
                          onChange={event =>
                            setForm({ ...form, price: event.target.value })
                          }
                          placeholder="999"
                        />
                      </label>

                      <label className="field">
                        Original Price (₹)
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.oldPrice}
                          onChange={event =>
                            setForm({ ...form, oldPrice: event.target.value })
                          }
                          placeholder="1499"
                        />
                      </label>

                      <label className="field">
                        Available Stock *
                        <input
                          required
                          type="number"
                          min="0"
                          step="1"
                          value={form.stock}
                          onChange={event =>
                            setForm({ ...form, stock: event.target.value })
                          }
                          placeholder="50"
                        />
                      </label>

                      <label className="field wide">
                        Image URL
                        <input
                          type="url"
                          value={form.image}
                          onChange={event =>
                            setForm({ ...form, image: event.target.value })
                          }
                          placeholder="https://example.com/product-image.jpg"
                        />
                      </label>

                      <label className="field wide">
                        Product Description
                        <textarea
                          rows={4}
                          maxLength={2000}
                          value={form.description}
                          onChange={event =>
                            setForm({
                              ...form,
                              description: event.target.value
                            })
                          }
                          placeholder="Describe the product, package contents and features..."
                        />
                      </label>
                    </div>

                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={event =>
                          setForm({
                            ...form,
                            featured: event.target.checked
                          })
                        }
                      />
                      Show in Featured Collection on homepage
                    </label>

                    {form.image && (
                      <div className="image-preview">
                        <img
                          src={form.image}
                          alt="Product preview"
                          onError={event => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = imageFallback;
                          }}
                        />
                        <span>Image Preview</span>
                      </div>
                    )}

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setFormOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={busy}
                      >
                        <Save size={18} />
                        {busy
                          ? "Saving..."
                          : editingId ? "Save Changes" : "Publish Product"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="card-panel">
                <div className="panel-heading">
                  <h3>Product Inventory ({visibleProducts.length})</h3>
                  <div className="search-field compact">
                    <Search size={17} />
                    <input
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder="Search inventory..."
                    />
                  </div>
                </div>

                {!visibleProducts.length ? (
                  <EmptyState
                    title="No products found"
                    description="Use Add Product to create your first listing."
                    action={null}
                  />
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleProducts.map(product => (
                          <tr key={product._id}>
                            <td>
                              <div className="table-product">
                                <img
                                  src={product.image || imageFallback}
                                  alt={product.name}
                                />
                                <div>
                                  <strong>{product.name}</strong>
                                  <small>
                                    {product.featured ? "Featured" : "Standard"}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{product.category}</td>
                            <td><strong>{money(product.price)}</strong></td>
                            <td>
                              <span className={`status ${
                                product.stock <= 5
                                  ? "status-cancelled"
                                  : "status-completed"
                              }`}>
                                {product.stock} left
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  onClick={() => editProduct(product)}
                                  title="Edit product"
                                >
                                  <Pencil size={17} />
                                </button>
                                <button
                                  className="danger"
                                  onClick={() => deleteProduct(product)}
                                  title="Remove product"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "orders" && (
            <>
              <div className="admin-section-head">
                <span className="eyebrow">ORDER OPERATIONS</span>
                <h2>Customer Orders</h2>
                <p>Review orders and update their progress.</p>
              </div>

              <div className="card-panel">
                {!orders.length ? (
                  <EmptyState
                    title="No orders yet"
                    description="Customer demo orders will appear here."
                    action={null}
                  />
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order._id}>
                            <td>
                              <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                              <small className="table-subtext">
                                {new Date(order.createdAt)
                                  .toLocaleDateString("en-IN")}
                              </small>
                            </td>
                            <td>
                              <strong>{order.customer}</strong>
                              <small className="table-subtext">{order.email}</small>
                              <small className="table-subtext">
                                {order.address?.city}, {order.address?.state}
                              </small>
                            </td>
                            <td>
                              {order.items.map((item, index) => (
                                <small className="table-subtext" key={index}>
                                  {item.name} × {item.quantity}
                                </small>
                              ))}
                            </td>
                            <td><strong>{money(order.total)}</strong></td>
                            <td>
                              <select
                                className="status-select"
                                value={order.status}
                                disabled={order.status === "Cancelled"}
                                onChange={event =>
                                  updateOrderStatus(order, event.target.value)
                                }
                              >
                                {orderStatuses.map(status => (
                                  <option key={status}>{status}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === "customers" && (
            <>
              <div className="admin-section-head">
                <span className="eyebrow">YOUR COMMUNITY</span>
                <h2>Registered Customers</h2>
                <p>
                  Customer accounts are created through public registration.
                  Admin accounts cannot be created here.
                </p>
              </div>

              <div className="card-panel">
                {!customers.length ? (
                  <EmptyState
                    title="No customers yet"
                    description="New customer registrations will appear here."
                    action={null}
                  />
                ) : (
                  <div className="table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Email</th>
                          <th>Account</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(customer => (
                          <tr key={customer._id}>
                            <td><strong>{customer.name}</strong></td>
                            <td>{customer.email}</td>
                            <td>
                              <span className="status status-completed">
                                Customer
                              </span>
                            </td>
                            <td>
                              {new Date(customer.createdAt)
                                .toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}