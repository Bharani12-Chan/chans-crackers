import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, UserRound, Sparkles } from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegister = location.pathname === "/register";

  const { user, authLoading, login, register } = useStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <div className="page-loader">Checking your session...</div>;
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} />;
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const account = isRegister
        ? await register(form.name, form.email, form.password)
        : await login(form.email, form.password);

      navigate(account.role === "admin" ? "/admin" : "/dashboard", {
        replace: true
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-section">
      <div className="container auth-layout">
        <div className="auth-story">
          <Sparkles size={37} />
          <span className="eyebrow">WELCOME TO CHAN'S CRACKERS</span>
          <h1>Celebrate more. Experience something special.</h1>
          <p>
            One account to explore the collection, manage your cart,
            and follow every step of your order.
          </p>
          <div className="auth-story-image" />
        </div>

        <div className="auth-card">
          <span className="eyebrow">
            {isRegister ? "JOIN OUR COMMUNITY" : "WELCOME BACK"}
          </span>
          <h2>{isRegister ? "Create Your Account" : "Sign In"}</h2>
          <p>
            {isRegister
              ? "Register as a customer to begin shopping."
              : "Enter your registered email and password."}
          </p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={submit} className="form-stack">
            {isRegister && (
              <label className="field">
                Full Name
                <span className="input-icon">
                  <UserRound size={18} />
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.name}
                    onChange={event =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Your full name"
                  />
                </span>
              </label>
            )}

            <label className="field">
              Email Address
              <span className="input-icon">
                <Mail size={18} />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={event =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="you@example.com"
                />
              </span>
            </label>

            <label className="field">
              Password
              <span className="input-icon">
                <LockKeyhole size={18} />
                <input
                  required
                  type="password"
                  minLength={isRegister ? 10 : undefined}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  value={form.password}
                  onChange={event =>
                    setForm({ ...form, password: event.target.value })
                  }
                  placeholder="Enter your password"
                />
              </span>
            </label>

            {isRegister && (
              <p className="small-note">
                Customer accounts only. Admin access is restricted
                to the authorized store administrator.
              </p>
            )}

            <button
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="auth-switch">
            {isRegister ? (
              <>
                Already have an account?{" "}
                <Link to="/login">Sign In</Link>
              </>
            ) : (
              <>
                New to Chan's Crackers?{" "}
                <Link to="/register">Create Account</Link>
              </>
            )}
          </div>

          <p className="small-note center">
            Administrators sign in using their existing authorized credentials.
          </p>
        </div>
      </div>
    </section>
  );
}