import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__text">
          <span className="footer__created">Created by</span>
          <span className="footer__author">Gourav Chaudhary</span>
          <a
            href="https://github.com/GouravSittam"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            GitHub
          </a>
        </div>
        <p className="footer__copyright">
          © {new Date().getFullYear()} CipherSQLStudio
        </p>
      </div>
    </footer>
  );
};

export default Footer;
