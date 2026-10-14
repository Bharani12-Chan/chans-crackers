
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { api, useStore } from "../context/StoreContext";
import { money } from "../context/CartContext";

const CATEGORIES = [
  "Sparklers",
  "Flower Pots",
  "Ground Chakkars",
  "Fountains",
  "Rockets",
  "Sky Shots",
  "Gift Boxes",
  "Family Combos",
  "Kids Collection",
  "Festival Specials",
  "Combos"
];

const emptyProduct = {
  name: "",
  category: "Sparklers",
  description: "",
  price: "",
  oldPrice: "",
  stock: "0",
  image: "",
  badge: "",
  featured: false,
  isActive: true
};

function Picture({ src, alt }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  return (
    <div className="cc-admin-picture">
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
        />
      ) : (
        <span>✦</span>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { session, logout } = useStore();

  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({ ...emptyProduct });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      api("/api/products/admin/all"),
      api("/api/admin-orders"),
      api("/api/admin/customers")
    ]);

    const errors = [];

    if (results[0].status === "fulfilled") {
      setProducts(results[0].value.products || []);
    } else {
      errors.push("Products: " + results[0].reason.message);
    }

    if (results[1].status === "fulfilled") {
      setOrders(results[1].value.orders || []);
    } else {
      errors.push("Orders: " + results[1].reason.message);
    }

    if (results[2].status === "fulfilled") {
      setCustomers(results[2].value.customers || []);
    } else {
      errors.push("Customers: " + results[2].reason.message);
    }

    if (errors.length) setError(errors.join(" | "));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const demoTotal = useMemo(
    () => orders.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    ),
    [orders]
  );

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyProduct });
  }

  function beginAdd() {
    resetForm();
    setTab("products");
    setError("");
    setMessage("");
    setTimeout(() => {
      document.getElementById("cc-product-editor")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  function beginEdit(product) {
    setEditingId(product._id);
    setForm({
      name: product.name || "",
      category: product.category || "Sparklers",
      description: product.description || "",
      price: String(product.price ?? ""),
      oldPrice: String(product.oldPrice ?? 0),
      stock: String(product.stock ?? 0),
      image: product.image || "",
      badge: product.badge || "",
      featured: Boolean(product.featured),
      isActive: Boolean(product.isActive)
    });
    setTab("products");
    setMessage("");

    setTimeout(() => {
      document.getElementById("cc-product-editor")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice || 0),
        stock: Number(form.stock)
      };

      const url = editingId
        ? `/api/products/admin/${editingId}`
        : "/api/products/admin";

      await api(url, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });

      setMessage(
        editingId
          ? "Product updated successfully"
          : "New product added successfully"
      );

      resetForm();

      const data = await api("/api/products/admin/all");
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleProduct(product) {
    const action = product.isActive
      ? "deactivate"
      : "reactivate";

    if (!window.confirm(
      `${action} ${product.name}?`
    )) return;

    setBusy(product._id);
    setError("");

    try {
      const data = await api(
        `/api/products/admin/${product._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            isActive: !product.isActive
          })
        }
      );

      setProducts((previous) =>
        previous.map((item) =>
          item._id === product._id ? data.product : item
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function updateOrder(id, status) {
    setBusy(id);
    setError("");

    try {
      const data = await api(
        `/api/admin-orders/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status })
        }
      );

      setOrders((previous) =>
        previous.map((order) =>
          order._id === id
            ? { ...order, status: data.order.status }
            : order
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function handleLogout() {
    setBusy("logout");
    setError("");

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <main className="page-shell content-page cc-admin">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">
            CHAN'S CRACKERS ADMINISTRATION
          </span>
          <h1>Management Dashboard</h1>
          <p>
            Welcome, {session?.name || "Admin"}.
            Manage your store from one place.
          </p>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
          disabled={busy === "logout"}
        >
          ↪ Logout
        </button>
      </header>

      <nav className="cc-admin-tabs" aria-label="Admin sections">
        {[
          ["overview", "Overview"],
          ["products", "Products"],
          ["orders", "Orders"],
          ["customers", "Customers"]
        ].map(([key, label]) => (
          <button
            type="button"
            key={key}
            className={tab === key ? "selected" : ""}
            onClick={() => {
              setTab(key);
              setError("");
              setMessage("");
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && (
        <div className="alert-error" role="alert">{error}</div>
      )}

      {message && (
        <p className="cc-admin-notice" role="status">
          ✓ {message}
        </p>
      )}

      {loading ? (
        <section className="panel">Loading dashboard...</section>
      ) : (
        <>
          {tab === "overview" && (
            <>
              <div className="stats-grid">
                {[
                  ["Products", products.length],
                  [
                    "Active Products",
                    products.filter((p) => p.isActive).length
                  ],
                  ["Registered Customers", customers.length],
                  ["Customer Orders", orders.length],
                  ["Demo Order Value", money(demoTotal)]
                ].map(([label, value]) => (
                  <div className="stat-card" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <section className="panel">
                <h2>Store Management</h2>
                <p className="muted">
                  Add products, check inventory, review
                  customer orders and view registered users.
                </p>

                <div className="cc-admin-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={beginAdd}
                  >
                    + Add New Product
                  </button>

                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => setTab("orders")}
                  >
                    View Orders
                  </button>

                  <button
                    type="button"
                    className="outline-btn"
                    onClick={() => setTab("customers")}
                  >
                    View Customers
                  </button>

                  <button
                    type="button"
                    className="outline-btn"
                    onClick={loadData}
                  >
                    Refresh Data
                  </button>
                </div>
              </section>
            </>
          )}

          {tab === "products" && (
            <>
              <section
                className="panel"
                id="cc-product-editor"
              >
                <h2>
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>

                <form onSubmit={saveProduct}>
                  <div className="cc-admin-form-grid">
                    <label>
                      Product Name *
                      <input
                        name="name"
                        value={form.name}
                        onChange={updateField}
                        required
                        maxLength={120}
                      />
                    </label>

                    <label>
                      Category *
                      <select
                        name="category"
                        value={form.category}
                        onChange={updateField}
                      >
                        {CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Selling Price (₹) *
                      <input
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={updateField}
                        required
                      />
                    </label>

                    <label>
                      Original Price (₹)
                      <input
                        name="oldPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.oldPrice}
                        onChange={updateField}
                      />
                    </label>

                    <label>
                      Available Stock *
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={updateField}
                        required
                      />
                    </label>

                    <label>
                      Badge
                      <input
                        name="badge"
                        value={form.badge}
                        onChange={updateField}
                        placeholder="Best Seller"
                      />
                    </label>

                    <label className="wide">
                      Image URL *
                      <input
                        name="image"
                        value={form.image}
                        onChange={updateField}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </label>

                    <label className="wide">
                      Description
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={updateField}
                        rows={4}
                      />
                    </label>
                  </div>

                  <div className="cc-admin-checks">
                    <label>
                      <input
                        type="checkbox"
                        name="featured"
                        checked={form.featured}
                        onChange={updateField}
                      />
                      Featured Product
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={updateField}
                      />
                      Visible in Shop
                    </label>
                  </div>

                  <div className="cc-admin-actions">
                    <button
                      className="primary-btn"
                      type="submit"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Update Product"
                        : "Add Product"}
                    </button>

                    <button
                      className="outline-btn"
                      type="button"
                      onClick={resetForm}
                    >
                      Clear Form
                    </button>
                  </div>
                </form>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <h2>Product Inventory ({products.length})</h2>

                  <button
                    className="outline-btn"
                    type="button"
                    onClick={loadData}
                  >
                    Refresh
                  </button>
                </div>

                <input
                  className="cc-admin-search"
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="cc-admin-product-list">
                  {filteredProducts.map((product) => (
                    <article
                      className="cc-admin-product"
                      key={product._id}
                    >
                      <Picture
                        src={product.image}
                        alt={product.name}
                      />

                      <div className="cc-admin-product-info">
                        <h3>{product.name}</h3>
                        <p>{product.category}</p>
                        <strong>{money(product.price)}</strong>
                        <p>
                          Stock: {product.stock} ·{" "}
                          {product.isActive
                            ? "Active"
                            : "Inactive"}
                        </p>
                      </div>

                      <div className="cc-admin-product-buttons">
                        <button
                          className="outline-btn"
                          type="button"
                          onClick={() => beginEdit(product)}
                        >
                          Edit
                        </button>

                        <button
                          className="outline-btn"
                          type="button"
                          disabled={busy === product._id}
                          onClick={() => toggleProduct(product)}
                        >
                          {product.isActive
                            ? "Deactivate"
                            : "Reactivate"}
                        </button>
                      </div>
                    </article>
                  ))}

                  {filteredProducts.length === 0 && (
                    <p className="muted">
                      No matching products.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {tab === "orders" && (
            <section className="panel">
              <div className="panel-header">
                <h2>Customer Orders ({orders.length})</h2>

                <button
                  className="outline-btn"
                  type="button"
                  onClick={loadData}
                >
                  Refresh Orders
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  No customer orders yet.
                </div>
              ) : (
                <div className="order-list">
                  {orders.map((order) => (
                    <article
                      className="order-card"
                      key={order._id}
                    >
                      <div className="order-heading">
                        <div>
                          <h3>
                            Order #
                            {String(order._id)
                              .slice(-8)
                              .toUpperCase()}
                          </h3>

                          <p className="muted">
                            {new Date(
                              order.createdAt
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <select
                          className="status-select"
                          value={order.status}
                          disabled={busy === order._id}
                          onChange={(event) =>
                            updateOrder(
                              order._id,
                              event.target.value
                            )
                          }
                        >
                          {[
                            "Placed",
                            "Processing",
                            "Completed",
                            "Cancelled"
                          ].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="customer-details">
                        <strong>
                          {order.customer ||
                            order.user?.name ||
                            "Customer"}
                        </strong>

                        <span>
                          {order.email ||
                            order.user?.email ||
                            "—"}
                        </span>

                        <span>
                          Phone: {order.address?.phone || "—"}
                        </span>

                        <span>
                          {[
                            order.address?.line1,
                            order.address?.city,
                            order.address?.state,
                            order.address?.pincode
                          ].filter(Boolean).join(", ")}
                        </span>
                      </div>

                      <div className="order-products">
                        {(order.items || []).map((item, i) => (
                          <div
                            className="summary-line"
                            key={i}
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>

                            <strong>
                              {money(
                                Number(item.price) *
                                Number(item.quantity)
                              )}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <span>
                          Payment:{" "}
                          <strong>
                            {order.paymentStatus || "Demo Only"}
                          </strong>
                        </span>

                        <strong>{money(order.total)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "customers" && (
            <section className="panel">
              <div className="panel-header">
                <h2>
                  Registered Customers ({customers.length})
                </h2>

                <button
                  className="outline-btn"
                  type="button"
                  onClick={loadData}
                >
                  Refresh Customers
                </button>
              </div>

              <div className="cc-admin-table-wrap">
                <table className="cc-admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Orders</th>
                      <th>Demo Order Value</th>
                      <th>Registered</th>
                    </tr>
                  </thead>

                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer._id}>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.orderCount}</td>
                        <td>
                          {money(customer.demoOrderValue)}
                        </td>
                        <td>
                          {customer.createdAt
                            ? new Date(
                                customer.createdAt
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </td>
                      </tr>
                    ))}

                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          No registered customers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      <p className="muted center section-action">
        All displayed payment amounts are simulated.
        No real payment has been collected.
      </p>
    </main>
  );
}
