
import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation
} from "react-router-dom";

import { useStore } from "./context/StoreContext";
import { useCart } from "./context/CartContext";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Protected({ admin = false, children }) {
  const { session, loadingSession } = useStore();

  if (loadingSession) {
    return (
      <div className="page-shell">
        <p>Loading account...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (admin && session.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!admin && session.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function Navbar() {
  const { session } = useStore();
  const { cartCount } = useCart();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="brand">
          <span className="brand-symbol">✦</span>
          <span>
            <strong>CHAN'S</strong>
            <small>CRACKERS</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/cart">Cart</NavLink>
          {session && (
            <NavLink
              to={
                session.role === "admin"
                  ? "/admin"
                  : "/dashboard"
              }
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <Link
            to={
              session
                ? session.role === "admin"
                  ? "/admin"
                  : "/dashboard"
                : "/login"
            }
            className="nav-login"
          >
            {session ? "My Account" : "Login"}
          </Link>

          <Link to="/cart" className="nav-cart">
            Cart <span>{cartCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <h2>✦ CHAN'S CRACKERS</h2>
          <p>
            A festive full-stack shopping demonstration
            built with React, Express and MongoDB.
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop Collection</Link>
          <Link to="/cart">Shopping Cart</Link>
        </div>

        <div>
          <h3>My Account</h3>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/dashboard">My Orders</Link>
        </div>

        <div>
          <h3>Project Highlights</h3>
          <p>Secure session login</p>
          <p>MongoDB order tracking</p>
          <p>Demo payment only</p>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Chan's Crackers · Educational demonstration only.
        No real payment is collected.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-layout">
      <ScrollToTop />
      <Navbar />

      <div className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
          />

          <Route path="/login" element={<Auth />} />
          <Route
            path="/register"
            element={<Auth register />}
          />

          <Route
            path="/dashboard"
            element={
              <Protected>
                <UserDashboard />
              </Protected>
            }
          />

          <Route
            path="/admin"
            element={
              <Protected admin>
                <AdminDashboard />
              </Protected>
            }
          />

          <Route
            path="*"
            element={
              <div className="page-shell center">
                <h1>Page Not Found</h1>
                <Link to="/" className="primary-btn">
                  Go Home
                </Link>
              </div>
            }
          />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}
