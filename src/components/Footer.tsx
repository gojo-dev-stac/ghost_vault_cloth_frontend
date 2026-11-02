/** Footer.tsx — the shared campaign-style footer. */
import { Link } from "@tanstack/react-router";
import { GhostLogo } from "@/components/GhostLogo";
import "@/styles/site-footer.css";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-top">
        <div>
          <p className="site-footer-kicker">GHOST / COLLECTION 01</p>
          <p className="site-footer-statement">
            Stay in
            <br />
            <em>motion.</em>
          </p>
        </div>
        <div className="site-footer-aside">
          <p>
            Built with intention.
            <br />
            Designed for movement.
          </p>
          <button
            type="button"
            className="site-footer-return"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top <span aria-hidden="true">↑</span>
          </button>
        </div>
      </div>

      <div className="site-footer-main">
        <div className="site-footer-brand">
          <GhostLogo className="h-16 w-auto" />
          <p>Independent by design.</p>
        </div>
        <nav aria-label="Footer navigation">
          <div className="site-footer-nav-group">
            <span>Explore</span>
            <Link to="/collection">Collection</Link>
            <a href="/collection#story">Our story</a>
          </div>
          <div className="site-footer-nav-group">
            <span>Connect</span>
            <Link to="/contact">Contact</Link>
            <a href="mailto:contact@ghost.studio">Email us</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
          </div>
          <div className="site-footer-nav-group">
            <span>The Vault</span>
            <Link to="/auth">Login</Link>
            <Link to="/auth" search={{ mode: "signup" }}>
              Request access <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="site-footer-nav-group">
            <span>Legal</span>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms &amp; conditions</Link>
          </div>
        </nav>
      </div>

      <div className="site-footer-legal">
        <span>© 2026 GHOST</span>
        <span>Made for the hours after dark.</span>
      </div>
    </footer>
  );
}
