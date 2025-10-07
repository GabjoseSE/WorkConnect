import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Login payload:", { email, password });
  };

  return (
    <div className="login-page">
      {/* Left side (brand/description) */}
      <div className="login-left">
        <h1 className="brand-title">WorkConnect</h1>
        <p className="brand-subtitle">
          Connect with employers, find jobs, and grow your career.
        </p>
      </div>

      {/* Right side (login form) */}
      <div className="login-right">
        <div className="login-box">
          <h2>Sign in</h2>
          <p className="login-desc">
            Stay updated on your professional world
          </p>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="signin-btn">
              Sign in
            </button>
          </form>

          <div className="links">
            <button type="button" className="forgot-link" onClick={() => { /* TODO: open reset flow */ }}>
              Forgot password?
            </button>
            <p>
              New to WorkConnect?{" "}
              <Link to="/choose-role" className="join-link">
                Join now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
