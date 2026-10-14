import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu, X, ShoppingBag, UserRound,
  Sparkles, LogOut
} from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Navbar() {
  const { user, cartCount, logout, setNotice } = useStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function signOut() {
    try {
      await logout();
      setNotice("You have logged out successfully");
      navigate("/");
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <>
      <div className="top-strip">
        Celebrate responsibly • Festive shopping demo • No real payments
      </div>

      <header className="site-header">
        <div className="container nav-inner">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-icon"><Sparkles size={24} /></span>
            <span>
              <strong>CHAN'S</strong>
              <small>CRACKERS</small>
            </span>
          </Link>

          <button
            className="mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <X /> : <Menu />}
          </button>

          <nav className={`nav-links ${open ? "open" : ""}`}>
            <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/shop" onClick={() => setOpen(false)}>Shop</NavLink>

            {user?.role === "customer" && (
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                My Orders
              </NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink to="/admin" onClick={() => setOpen(false)}>
                Admin Panel
              </NavLink>
            )}
          </nav>

          <div className="nav-actions">
            {user ? (
              <>
                <Link
                  className="icon-action"
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  title="Dashboard"
                >
                  <UserRound size={20} />
                </Link>
                <button
                  className="icon-action"
                  onClick={signOut}
                  title="Log out"
                >
                  <LogOut size={19} />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
            )}

            {user?.role !== "admin" && (
              <Link to="/cart" className="cart-button">
                <ShoppingBag size={19} />
                <span>Cart</span>
                <b>{cartCount}</b>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}