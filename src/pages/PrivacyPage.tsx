/** PrivacyPage.tsx — Privacy Policy: what GHOST collects, why, and the member's rights,
 *  written as an editorial vsite page matching Contact / Vault styling. */
import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import "@/styles/vault-ui.css";

const SECTIONS: { n: string; title: string; body: string[] }[] = [
  {
    n: "01",
    title: "What we collect",
    body: [
      "When you request access or create an account, we collect the name and email address you submit. When you place an order, we collect the shipping details you enter — full name, phone number, street address, city, province, postal code and country — so the order can be delivered.",
      "Messages you send through the Contact page (subject and message) are stored so our support team can reply.",
    ],
  },
  {
    n: "02",
    title: "How we use it",
    body: [
      "We use this information only to operate the store: creating and securing your account, processing and shipping orders, sending order-related communication, and answering support requests.",
      "We do not use your data for advertising networks, and we do not sell or rent it to anyone.",
    ],
  },
  {
    n: "03",
    title: "Cookies & storage",
    body: [
      "The site uses your browser's local storage to keep you signed in and to remember your shopping bag between visits. Clearing your browser data will sign you out and empty the bag.",
      "We do not run third-party advertising or tracking cookies.",
    ],
  },
  {
    n: "04",
    title: "Who can see it",
    body: [
      "Order and account data is visible only to GHOST staff through the internal admin console, used strictly to fulfil orders and answer support messages.",
      "Data may be processed by the infrastructure providers that host the site and API (hosting, email delivery). They process it only on our behalf.",
    ],
  },
  {
    n: "05",
    title: "Retention",
    body: [
      "Account and order records are kept for as long as your account is active and as needed for order history, bookkeeping and support. You can request deletion at any time.",
    ],
  },
  {
    n: "06",
    title: "Your rights",
    body: [
      "You can request a copy of your data, correction of inaccurate details, or full deletion of your account and associated records by contacting us. We respond to verified requests within a reasonable period.",
      "If a security incident ever affects your data, we will notify you through the email address on your account.",
    ],
  },
];

export function PrivacyPage() {
  return (
    <div className="vsite min-h-screen">
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-32 pb-16">
        <div className="fog-layer" />
        <header className="vsite-head">
          <p className="vsite-index">
            <span>Legal</span>
            <span>Effective October 2026</span>
          </p>
          <span className="vsite-rule" />
          <p className="vsite-eyebrow">Data · Transparency · Trust</p>
          <div className="vsite-head-row">
            <h1 className="vsite-title">
              Privacy <em>Policy.</em>
            </h1>
            <p className="vsite-lede">
              What GHOST collects, why we collect it, and the control you keep over it — in plain
              words.
            </p>
          </div>
        </header>

        <div className="relative mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="vsite-panel p-6 md:p-10 lg:col-span-3 animate-rise">
            <div className="divide-y divide-[rgb(226_220_203_/_10%)]">
              {SECTIONS.map((s) => (
                <section key={s.n} className="py-7 first:pt-0 last:pb-0">
                  <div className="flex items-baseline gap-4">
                    <span className="text-[10px] tracking-[0.2em] text-[rgb(201_162_74_/_75%)]">
                      {s.n}
                    </span>
                    <h2 className="vsite-panel-title">{s.title}</h2>
                  </div>
                  {s.body.map((p, i) => (
                    <p key={i} className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-2 space-y-8">
            <div
              className="vsite-panel p-6 md:p-8 animate-rise"
              style={{ animationDelay: "100ms" }}
            >
              <p className="vsite-eyebrow">In short</p>
              <h2 className="vsite-panel-title mt-2">
                We only take <em>what's needed.</em>
              </h2>
              <ul className="mt-6 flex flex-col gap-4 text-sm text-muted-foreground">
                <li>Name, email and shipping details — to run your account and deliver orders.</li>
                <li>Support messages — so we can reply.</li>
                <li>Nothing sold, nothing rented, no ad trackers.</li>
              </ul>
            </div>
            <div
              className="vsite-panel p-6 md:p-8 animate-rise"
              style={{ animationDelay: "200ms" }}
            >
              <p className="vsite-eyebrow">Questions</p>
              <h2 className="vsite-panel-title mt-2">
                Exercise <em>your rights.</em>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Want a copy of your data or full account deletion? Write to us from the{" "}
                <Link
                  to="/contact"
                  className="text-foreground/85 underline decoration-[rgb(201_162_74_/_50%)] underline-offset-4 transition-colors hover:text-gold"
                >
                  Contact page
                </Link>{" "}
                or email{" "}
                <a
                  href="mailto:contact@ghost.studio"
                  className="text-foreground/85 underline decoration-[rgb(201_162_74_/_50%)] underline-offset-4 transition-colors hover:text-gold"
                >
                  contact@ghost.studio
                </a>
                .
              </p>
              <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                Also see{" "}
                <Link
                  to="/terms"
                  className="text-[rgb(231_206_136)] underline decoration-[rgb(201_162_74_/_50%)] underline-offset-4 transition-colors hover:text-gold"
                >
                  Terms &amp; Conditions
                </Link>
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
