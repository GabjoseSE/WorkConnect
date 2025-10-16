import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.login(email, password);
      const role = auth.profile?.role || "jobhunter";
      if (role === "employer") navigate("/employer/dashboard");
      else navigate("/jobhunter/dashboard");
    } catch (err) {
      // Friendly, non-revealing message if backend doesn't provide one
      const msg = err?.message || "The username or password you entered is incorrect.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page modern">
      <div className="login-center">
        <div className="login-card" role="main" aria-labelledby="signin-title">
          <div className="login-card-header">
            <div className="brand">
              <div className="brand-logo">WC</div>
              <div className="brand-name">WorkConnect</div>
            </div>
            <h2 id="signin-title">Sign in to your account</h2>
            <p className="login-sub">Welcome back — continue where you left off.</p>
          </div>

          <div className="login-card-body">
            <button type="button" className="social-btn google" aria-label="Sign in with Google">
              Continue with Google
            </button>

            <div className="divider"><span>or</span></div>

            <form onSubmit={onSubmit} aria-busy={loading} className={error ? 'has-error' : ''}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  className={`wc-input ${error ? 'error' : ''}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <input
                    id="password"
                    className={`wc-input ${error ? 'error' : ''}`}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="eye-toggle-label"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <BsEyeSlash /> : <BsEye />}
                  </button>
                </div>
              </div>

              {error && <div className="error-box" role="alert">{error}</div>}

              <div className="form-actions">
                <Link to="#" className="forgot-link">Forgot password?</Link>
                <label className="remember">
                  <input type="checkbox" /> Remember me
                </label>
              </div>

              <button type="submit" className="signin-btn" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <div className="signup-cta">
              New to WorkConnect? <Link to="/choose-role" className="join-link">Create an account</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
