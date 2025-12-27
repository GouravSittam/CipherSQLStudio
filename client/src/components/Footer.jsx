import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__text">
          <span className="footer__created">Created by</span>
          <span className="footer__author">Gourav Chaudhary</span>
        </p>
        <p className="footer__copyright">
          © {new Date().getFullYear()} CipherSQLStudio
        </p>
      </div>
    </footer>
  );
};

export default Footer;
