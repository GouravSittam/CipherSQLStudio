/**
 * Signup Page
 *
 * User registration form.
 *
 * Author: Gourav Chaudhary
 */

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.tsx";

const INITIAL_FORM = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
};

type SignupForm = typeof INITIAL_FORM;

function validateForm(form: SignupForm): string | null {
  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    return "Please fill in all required fields";
  }
  if (form.username.length < 3) return "Username must be at least 3 characters long";
  if (form.password.length < 6) return "Password must be at least 6 characters long";
  if (form.password !== form.confirmPassword) return "Passwords do not match";
  return null;
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState<SignupForm>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((previous) => ({ ...previous, [e.target.name]: e.target.value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await signup(formData.username, formData.email, formData.password, formData.fullName);
    setLoading(false);

    if (result.success) navigate("/");
    else setError(result.error);
  };

  return (
    <div className="auth-page">
      <title>Sign Up | CipherSQLStudio</title>
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your SQL learning journey</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">
                Username <span className="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={30}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name (optional)</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Choose a password (min 6 characters)"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
            <p className="guest-option">
              Or{" "}
              <Link to="/" className="auth-link">
                continue as guest
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
