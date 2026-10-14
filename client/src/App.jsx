import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation
} from "react-router-dom";

import { useStore } from "./context/StoreContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Protected({ children, admin = false }) {
  const { user, authLoading } = useStore();

  if (authLoading) {
    return <div className="page-loader">Loading your account...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  if (admin && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!admin && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function App() {
  const location = useLocation();
  const { notice } = useStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const adminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!adminPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />

          <Route
            path="/checkout"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!adminPage && <Footer />}

      {notice && <div className="toast">{notice}</div>}
    </>
  );
}