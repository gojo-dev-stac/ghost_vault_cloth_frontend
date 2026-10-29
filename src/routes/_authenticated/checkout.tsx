import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "@/pages/CheckoutPage";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GHOST Vault" },
      { name: "description", content: "Secure your GHOST pieces. Cash on delivery or card." },
      { property: "og:title", content: "Checkout — GHOST Vault" },
      { property: "og:description", content: "Secure your GHOST pieces. Cash on delivery or card." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),

  component: CheckoutPage,
});
