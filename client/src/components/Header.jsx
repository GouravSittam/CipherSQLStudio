import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <img
            src="/Cipherschools_icon@2x.png"
            alt="CipherSchools"
            className="header__logo-img"
          />
          <span className="header__logo-text">CipherSQLStudio</span>
        </Link>
        <nav className="header__nav">
          <Link to="/" className="header__link">
            🎮 Challenges
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
