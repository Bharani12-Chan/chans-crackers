import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Crown, User, ArrowRight, Sparkles } from "lucide-react";
import { useStore, IMAGES } from "../context/StoreContext";

export default function Auth({ mode = "login" }) {
  const { session, register, login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("customer");

  if (session) {
    return <Navigate to={session.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  const submit = event => {
    event.preventDefault();

    if (mode === "register") {
      const success = register(name, email);
      if (success) navigate("/dashboard");
      return;
    }

    const account = login(email, role);
    const destination = account.role === "admin"
      ? "/admin"
      : location.state?.from || "/dashboard";

    navigate(destination);
  };

  return (
    <main className="auth-page">
      <div className="auth-art">
        <img src={IMAGES.hero1} alt="Celebration lights" />
        <div>
          <Sparkles size={39} />
          <h2>Celebrate Every Moment</h2>
          <p>Welcome to the Chan's Crackers experience.</p>
        </div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <span className="eyebrow">WELCOME TO CHAN'S</span>
          <h1>{mode === "register" ? "Create Your Account" : "Welcome Back"}</h1>
          <p className="muted">
            {mode === "register"
              ? "Join our celebration community."
              : "Sign in to explore your account."}
          </p>

          <div className="demo-alert">
            <AlertCircle size={19} />
            Frontend demonstration only. No password or
            secure authentication is implemented.
          </div>

          {mode === "login" && (
            <div className="role-switch">
              <button
                type="button"
                className={role === "customer" ? "active" : ""}
                onClick={() => setRole("customer")}
              >
                <User size={17} /> Customer Demo
              </button>
              <button
                type="button"
                className={role === "admin" ? "active" : ""}
                onClick={() => setRole("admin")}
              >
                <Crown size={17} /> Admin Demo
              </button>
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <label className="field">
                <span>Full Name</span>
                <input
                  required
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Enter your full name"
                />
              </label>
            )}

            <label className="field">
              <span>Email Address</span>
              <input
                required
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="Enter your email"
              />
            </label>

            <button className="btn btn-primary btn-full" type="submit">
              {mode === "register" ? "Create Demo Account" : "Enter Demo Dashboard"}
              <ArrowRight size={18} />
            </button>
          </form>

          <p className="auth-bottom">
            {mode === "register"
              ? "Already have an account?"
              : "New to Chan's Crackers?"}
            {" "}
            <Link to={mode === "register" ? "/login" : "/register"}>
              {mode === "register" ? "Sign In" : "Register"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}