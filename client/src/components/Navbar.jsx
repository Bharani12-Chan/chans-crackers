
import React, { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation
} from "react-router-dom";

import {
  Sparkles,
  ShoppingBag,
  Menu,
  X,
  LogOut
} from "lucide-react";

import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";

import "../catalog.css";

export default function Navbar() {
  const { session, logout } = useStore();
  const { cartCount } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="site-header catalog-site-header">
      <div className="catalog-container catalog-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Sparkles size={23} />
          </span>

          <span>
            CHAN'S
            <small>CRACKERS</small>
          </span>
        </Link>

        <nav
          className={`catalog-nav-links ${
            menuOpen ? "is-open" : ""
          }`}
          aria-label="Main navigation"
          id="catalog-mobile-menu"
        >
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/shop">
            Shop
          </NavLink>

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

        <div className="catalog-nav-actions">
          {session ? (
            <button
              type="button"
              className="catalog-nav-login"
              onClick={logout}
            >
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="catalog-nav-login"
            >
              Login
            </Link>
          )}

          <Link
            to="/cart"
            className="catalog-nav-cart"
            aria-label={`View cart with ${cartCount} items`}
          >
            <ShoppingBag size={19} />
            <span>Cart</span>
            <strong>{cartCount}</strong>
          </Link>

          <button
            type="button"
            className="catalog-mobile-menu-button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            aria-controls="catalog-mobile-menu"
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
    </header>
  );
}
