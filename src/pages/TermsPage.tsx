/** TermsPage.tsx — Terms & Conditions: store rules for accounts, orders, payment,
 *  shipping and conduct, written as an editorial vsite page matching the site theme. */
import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import "@/styles/vault-ui.css";

const SECTIONS: { n: string; title: string; body: string[] }[] = [
  {
    n: "01",
    title: "The store",
    body: [
      "GHOST is a members-only streetwear store. By requesting access, creating an account or placing an order, you agree to these terms. If you do not agree, please do not use the site.",
    ],
  },
  {
    n: "02",
    title: "Accounts",
    body: [
      "Access is granted after approval of your request. You are responsible for keeping your login credentials confidential and for all activity under your account. Provide accurate information and keep it up to date.",
      "We may suspend or close accounts that violate these terms, misuse the store, or provide false information.",
    ],
  },
  {
    n: "03",
    title: "Orders & pricing",
    body: [
      "Placing an order is an offer to buy. An order is confirmed once it appears in your order history; we may decline or cancel an order (for example, if an item is unavailable or a pricing error occurred) and refund anything already paid.",
      "Prices are shown in USD. We may change prices at any time without notice for future orders.",
    ],
  },
  {
    n: "04",
    title: "Payment",
    body: [
      "Orders are placed on a cash-on-delivery basis: you pay when your order is delivered. Have the exact amount ready where possible. An order that is refused or repeatedly unavailable on delivery may lead to restrictions on future orders.",
    ],
  },
  {
    n: "05",
    title: "Shipping & delivery",
    body: [
      "You are responsible for the shipping details you enter — a wrong phone number, address or postal code may delay or prevent delivery. Delivery timeframes are estimates, not guarantees.",
      "Risk in the goods passes to you on delivery at the address you provided.",
    ],
  },
  {
    n: "06",
    title: "Returns & issues",
    body: [
      "If an item arrives damaged, faulty or incorrect, contact us through the Contact page with your order ID (it looks like GV-00000000, found under My Vault → Order History) and photos of the issue. We will review it and make it right.",
      "Items must be unworn and unwashed with original tags to be eligible for an approved return.",
    ],
  },
  {
    n: "07",
    title: "Intellectual property",
    body: [
      "The GHOST name, logo, designs, photography and site content are owned by or licensed to GHOST. No part of the site may be copied, reproduced or used commercially without written permission.",
    ],
  },
  {
    n: "08",
    title: "Liability",
    body: [
      "The site is provided as-is. To the extent permitted by law, GHOST is not liable for indirect or consequential losses arising from use of the site or delays outside our reasonable control. Nothing in these terms limits rights you have by law that cannot be excluded.",
    ],
  },
  {
    n: "09",
    title: "Changes",
    body: [
      "We may update these terms from time to time. Changes take effect when posted on this page; the effective date above shows the latest revision. Continued use of the store after a change means you accept the updated terms.",
    ],
  },
];

export function TermsPage() {
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
          <p className="vsite-eyebrow">Store rules · Orders · Conduct</p>
          <div className="vsite-head-row">
            <h1 className="vsite-title">
              Terms &amp; <em>Conditions.</em>
            </h1>
            <p className="vsite-lede">
              The ground rules for shopping with GHOST — accounts, orders, payment, delivery and
              everything in between.
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
              <p className="vsite-eyebrow">At a glance</p>
              <h2 className="vsite-panel-title mt-2">
                Fair and <em>simple.</em>
              </h2>
              <ul className="mt-6 flex flex-col gap-4 text-sm text-muted-foreground">
                <li>Cash on delivery — you pay when the order reaches you.</li>
                <li>Faulty or wrong item? Report it with your order ID and photos.</li>
                <li>One account per member; keep your details accurate.</li>
              </ul>
            </div>
            <div
              className="vsite-panel p-6 md:p-8 animate-rise"
              style={{ animationDelay: "200ms" }}
            >
              <p className="vsite-eyebrow">Need help</p>
              <h2 className="vsite-panel-title mt-2">
                Talk to <em>us first.</em>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Order problem or question about these terms? Reach us from the{" "}
                <Link
                  to="/contact"
                  className="text-foreground/85 underline decoration-[rgb(201_162_74_/_50%)] underline-offset-4 transition-colors hover:text-gold"
                >
                  Contact page
                </Link>{" "}
                — include your order ID for the fastest reply.
              </p>
              <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                Also see{" "}
                <Link
                  to="/privacy"
                  className="text-[rgb(231_206_136)] underline decoration-[rgb(201_162_74_/_50%)] underline-offset-4 transition-colors hover:text-gold"
                >
                  Privacy Policy
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
