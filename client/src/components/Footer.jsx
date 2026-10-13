import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles, Instagram, Facebook,
  Mail, MapPin
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand">
            <span className="brand-icon">
              <Sparkles size={23} />
            </span>
            <span>Chan's <strong>Crackers</strong></span>
          </Link>

          <p>
            Making every celebration memorable.
            Explore our festive collection.
          </p>

          <div className="socials">
            <span><Instagram size={20} /></span>
            <span><Facebook size={20} /></span>
          </div>
        </div>

        <div>
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/cart">My Cart</Link>
          <Link to="/dashboard">My Account</Link>
        </div>

        <div>
          <h3>Categories</h3>
          <Link to="/shop?category=Sparklers">Sparklers</Link>
          <Link to="/shop?category=Gift%20Boxes">Gift Boxes</Link>
          <Link to="/shop?category=Combos">Combos</Link>
        </div>

        <div>
          <h3>Customer Care</h3>
          <p><Mail size={17} /> Contact details coming soon</p>
          <p><MapPin size={17} /> Store location coming soon</p>
          <p className="footer-note">
            Product availability and applicable regulations
            must be verified before real sales begin.
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Chan's Crackers</span>
        <span>Designed for brighter celebrations ✨</span>
      </div>
    </footer>
  );
}