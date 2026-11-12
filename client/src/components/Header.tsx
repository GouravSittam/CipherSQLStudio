/**
 * Header component - the top navbar
 * Has the logo, main navigation and auth controls
 */

import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.tsx";

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img src="/Cipherschools_icon@2x.png" alt="CipherSchools" className="header__logo-img" />
          <span className="header__logo-text">CipherSQLStudio</span>
        </Link>

        <nav className="header__nav">
          <Link to="/" className="header__link">
            🎮 Challenges
          </Link>

          {isAuthenticated ? (
            <div className="header__user-menu">
              <span className="header__username">👤 {user?.username}</span>
              <button type="button" onClick={handleLogout} className="header__logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="header__auth-links">
              <Link to="/login" className="header__link">
                Login
              </Link>
              <Link to="/signup" className="header__signup-btn">
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
