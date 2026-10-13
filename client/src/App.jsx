import React, { useEffect } from "react";
import {
  Routes, Route, useLocation
} from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EmptyState from "./components/EmptyState";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const timer = setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({
          behavior: "smooth"
        });
      }, 50);
      return () => clearTimeout(timer);
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname === "/admin";

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="*"
          element={
            <main className="section container">
              <EmptyState
                title="Page Not Found"
                text="The page you requested doesn't exist."
                link="/"
                linkText="Return Home"
              />
            </main>
          }
        />
      </Routes>

      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
}