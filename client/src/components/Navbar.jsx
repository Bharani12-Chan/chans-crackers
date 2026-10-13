import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles, Search, ShoppingCart, User,
  LogOut, Menu, X
} from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Navbar() {
  const { cartCount, session, logout } = useStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <>
      <div className="announcement">
        <Sparkles size={14} />
        Celebrate brighter with Chan's Crackers
        <Sparkles size={14} />
      </div>

      <header className="site-header">
        <div className="container nav-wrap">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <Sparkles size={23} />
            </span>
            <span>Chan's <strong>Crackers</strong></span>
          </Link>

          <nav
            className={`nav-links ${open ? "open" : ""}`}
            aria-label="Main navigation"
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <Link to="/#about">About</Link>
            <Link to="/#contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <button
              className="icon-btn"
              aria-label="Search products"
              onClick={() => navigate("/shop")}
            >
              <Search size={21} />
            </button>

            <Link
              to="/cart"
              className="icon-btn cart-link"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </Link>

            <Link
              className="icon-btn"
              aria-label="My account"
              to={
                session
                  ? session.role === "admin"
                    ? "/admin"
                    : "/dashboard"
                  : "/login"
              }
            >
              <User size={21} />
            </Link>

            {session && (
              <button
                className="icon-btn logout-btn"
                aria-label="Logout"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut size={20} />
              </button>
            )}

            <button
              className="icon-btn mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}