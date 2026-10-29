/** Footer.tsx — the shared site footer. */
import { Link } from "@tanstack/react-router";
import { GhostLogo } from "@/components/GhostLogo";

export function Footer() {
  return (
    <footer className="border-t border-border mt-32">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <GhostLogo className="h-24 drop-shadow-[0_0_20px_rgba(201,162,74,0.25)]" />
            <p className="mt-3 text-xs tracking-[0.3em] uppercase text-muted-foreground">
              Luxury Streetwear
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs text-muted-foreground">
            <Link to="/contact" className="hover:text-foreground transition-colors tracking-wide">
              Contact Us
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors tracking-wide">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors tracking-wide">
              Terms &amp; Conditions
            </Link>
            <a
              href="mailto:contact@ghost.studio"
              className="hover:text-foreground transition-colors tracking-wide"
            >
              contact@ghost.studio
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors tracking-wide"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors tracking-wide"
            >
              TikTok
            </a>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border/50">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
              © 2026 GHOST. All Rights Reserved.
            </p>
            <div className="flex gap-5 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/60">
              <Link to="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
