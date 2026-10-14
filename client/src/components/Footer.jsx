import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Package, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <Sparkles /> CHAN'S CRACKERS
          </div>
          <p>
            A beautifully crafted full-stack festive storefront
            demonstrating React, Express, MongoDB, customer accounts,
            inventory and order management.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop Collection</Link>
          <Link to="/cart">Shopping Cart</Link>
        </div>

        <div>
          <h4>My Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/dashboard">My Orders</Link>
        </div>

        <div>
          <h4>Project Highlights</h4>
          <p><ShieldCheck size={15} /> Secure session login</p>
          <p><Package size={15} /> MongoDB order tracking</p>
          <p><Heart size={15} /> Built for learning</p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Chan's Crackers</span>
        <span>
          Educational demonstration only. Fireworks sales and delivery
          require applicable licenses, safety controls and local compliance.
          No real payment is collected.
        </span>
      </div>
    </footer>
  );
}