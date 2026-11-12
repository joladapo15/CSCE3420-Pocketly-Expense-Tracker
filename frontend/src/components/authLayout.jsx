import PocketlyLogo from "../assets/Pocketly_logo.png";
import authGraphic from "../assets/auth_graphic.jpg";
import "./authLayout.css";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-pill">
            <img src={PocketlyLogo} alt="Pocketly logo" />
            <span>Pocketly</span>
          </div>

          <div className="auth-left-text">
            <h2 className="auth-tagline">
              A space to<br />make your own.
            </h2>
            <p className="auth-subtitle-left">
              One account. A simple, secure way to get started and pick up where
              you left off.
            </p>
          </div>

          <div className="auth-graphic-wrap">
            <img
              src={authGraphic}
              alt="Pocketly 3D visual"
              className="auth-graphic-img"
            />
          </div>
        </div>

        <div className="auth-right">
          {title && <h1 className="auth-form-title">{title}</h1>}
          {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>

      <footer className="auth-footer">
        <span className="auth-footer-left">
          Your space to manage what matters
        </span>
        <div className="auth-footer-right">
          <span>© 2026 Pocketly</span>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/help">Help</a>
        </div>
      </footer>
    </div>
  );
}
