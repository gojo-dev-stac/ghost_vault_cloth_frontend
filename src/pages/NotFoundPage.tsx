/** NotFoundPage.tsx — the themed 404 screen: shown for any URL that doesn't match a
 *  route (bad links, moved pages, typos), in the same editorial vsite language as
 *  Contact / Privacy / Terms. */
import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import "@/styles/vault-ui.css";

const ROUTES: { to: string; label: string; note: string }[] = [
  { to: "/", label: "Enter the Vault", note: "The entry screen" },
  { to: "/collection", label: "The Collection", note: "Current drop & pieces" },
  { to: "/contact", label: "Contact Us", note: "Orders, issues & complaints" },
];

export function NotFoundPage() {
  return (
    <div className="vsite min-h-screen">
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-32 pb-16">
        <div className="fog-layer" />
        <header className="vsite-head">
          <p className="vsite-index">
            <span>Lost</span>
            <span>Error 404</span>
          </p>
          <span className="vsite-rule" />
          <p className="vsite-eyebrow">Dead end · Nothing here</p>
          <div className="vsite-head-row">
            <h1 className="vsite-title">
              Page not <em>found.</em>
            </h1>
            <p className="vsite-lede">
              The page you're looking for doesn't exist or has been moved. The routes below still
              work.
            </p>
          </div>
        </header>

        <div className="relative mt-14 max-w-3xl">
          <div className="vsite-panel p-6 md:p-10 animate-rise">
            <p className="vsite-eyebrow">Take a right turn</p>
            <ul className="mt-6">
              {ROUTES.map((r, i) => (
                <li key={r.to}>
                  <Link
                    to={r.to}
                    className="flex items-baseline gap-4 border-b border-[rgb(226_220_203_/_10%)] py-5 transition-colors hover:bg-gradient-to-r hover:from-[rgb(201_162_74_/_6%)] hover:to-transparent last:border-b-0"
                  >
                    <span className="flex-none w-[42px] text-[10px] tracking-[0.13em] text-[rgb(201_162_74_/_75%)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="vsite-panel-title block">{r.label}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{r.note}</span>
                    </span>
                    <span
                      className="ml-auto flex-none self-center text-[rgb(231_206_136)] transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <p className="mt-8 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Looking for an order?{" "}
            <Link
              to="/contact"
              className="text-[rgb(231_206_136)] underline decoration-[rgb(201_162_74_/_50%)] underline-offset-4 transition-colors hover:text-gold"
            >
              Contact us
            </Link>{" "}
            with your order ID.
          </p> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
