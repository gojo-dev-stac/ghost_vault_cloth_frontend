/** CatalogHero.tsx — the hero banner at the top of The Vault, editorial edition. */
import "@/styles/vault-ui.css";

export function CatalogHero() {
  return (
    <section className="vsite relative flex min-h-[92svh] items-center overflow-hidden px-6 pt-24 md:px-10 lg:px-[6.5vw]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_38%,rgba(111,82,34,0.16),transparent_46%),radial-gradient(ellipse_at_12%_78%,rgba(140,38,53,0.13),transparent_44%),linear-gradient(160deg,rgba(7,6,5,0.86),rgba(7,6,5,0.6)_52%,rgba(7,6,5,0.9))]" />
      <div className="fog-layer" />
      <div className="relative z-10 w-full max-w-4xl">
        <p className="vsite-index">
          <span>GHOST — The Vault</span>
          <span>Drop 001 / 2026</span>
        </p>
        <span className="vsite-rule" />
        <p className="vsite-eyebrow">Members only · Approved silhouettes</p>
        <h1 className="vsite-title">
          THE <em>Vault.</em>
        </h1>
        <p className="vsite-lede">
          Heavyweight cotton, sealed runs. Every piece below lives behind the vault door — sign in,
          claim it, and it ships from the same atelier as the campaign.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-5">
          <a href="#shop" className="vsite-cta">
            <span>Enter the drop</span>
            <span className="vsite-cta-arrow" aria-hidden="true">
              ↗
            </span>
          </a>
          <p className="flex items-center gap-3 text-[10px] tracking-[0.2em] text-foreground/45 uppercase">
            <span className="h-px w-10 bg-[linear-gradient(90deg,rgba(201,162,74,0.7),transparent)]" />
            GHOST · Luxury Streetwear
          </p>
        </div>
      </div>
      <p className="vsite-index absolute right-6 bottom-7 left-6 hidden justify-between md:right-10 md:left-10 md:flex lg:right-[6.5vw] lg:left-[6.5vw]">
        <span>Members' entrance</span>
        <span>Scroll to browse ↓</span>
      </p>
    </section>
  );
}
