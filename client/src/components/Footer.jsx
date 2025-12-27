/**
 * Footer component
 * Shows credits and copyright info
 *
 * Created by Gourav Chaudhary
 */

import React from "react";

const Footer = () => {
  // Get current year dynamically so I don't have to update it every January lol
  const currentYear = new Date().getFullYear();

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
        <p className="footer__copyright">© {currentYear} CipherSQLStudio</p>
      </div>
    </footer>
  );
};

export default Footer;
