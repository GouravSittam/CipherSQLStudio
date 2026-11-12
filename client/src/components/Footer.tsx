/**
 * Footer component
 * Shows credits and copyright info
 *
 * Created by Gourav Chaudhary
 */

const LINKS = [
  { label: "GitHub", href: "https://github.com/GouravSittam" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/gouravsittam/" },
  { label: "X", href: "https://x.com/Gouravv_c" },
] as const;

export default function Footer() {
  // Current year, so this never needs updating in January
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__text">
          <span className="footer__created">Created by</span>
          <span className="footer__author">Gourav Chaudhary</span>
          <div className="footer__links">
            {LINKS.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="footer__link">
                {label}
              </a>
            ))}
            <a href="mailto:gouravsittam@gmail.com" className="footer__link">
              Email
            </a>
          </div>
        </div>
        <p className="footer__copyright">© {currentYear} CipherSQLStudio</p>
      </div>
    </footer>
  );
}
