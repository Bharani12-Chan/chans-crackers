
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api, useStore } from "../context/StoreContext";

export default function Auth({ register = false }) {
  const navigate = useNavigate();
  const {
    session,
    refreshSession,
    loadingSession
  } = useStore();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (loadingSession) {
    return (
      <main className="page-shell content-page">
        Loading...
      </main>
    );
  }

  if (session) {
    return (
      <Navigate
        to={session.role === "admin" ? "/admin" : "/dashboard"}
        replace
      />
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = register
        ? "/api/auth/register"
        : "/api/auth/login";

      await api(endpoint, {
        method: "POST",
        body: JSON.stringify(
          register
            ? form
            : {
                email: form.email,
                password: form.password
              }
        )
      });

      const user = await refreshSession();

      if (user) {
        navigate(
          user.role === "admin" ? "/admin" : "/dashboard",
          { replace: true }
        );
      } else if (register) {
        navigate("/login", { replace: true });
      } else {
        throw new Error(
          "Login did not create a session. Check the existing auth route."
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell content-page">
      <div className="auth-panel">
        <div className="section-heading">
          <span className="eyebrow">
            CHAN'S CRACKERS
          </span>

          <h1>
            {register ? "Create Account" : "Welcome Back"}
          </h1>

          <p>
            {register
              ? "Register to start shopping."
              : "Log in to manage your orders."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {register && (
            <label className="form-field">
              <span>Full Name</span>

              <input
                value={form.name}
                required
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value
                  }))
                }
                placeholder="Your name"
              />
            </label>
          )}

          <label className="form-field">
            <span>Email</span>

            <input
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  email: event.target.value
                }))
              }
              placeholder="you@example.com"
            />
          </label>

          <label className="form-field">
            <span>Password</span>

            <input
              type="password"
              required
              value={form.password}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  password: event.target.value
                }))
              }
              placeholder="Enter password"
            />
          </label>

          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={loading}
          >
            {loading
              ? "Please Wait..."
              : register
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          {register ? (
            <>
              Already registered?{" "}
              <Link to="/login">Login</Link>
            </>
          ) : (
            <>
              New customer?{" "}
              <Link to="/register">Create Account</Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
