import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/pages/TermsPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — GHOST" },
      {
        name: "description",
        content:
          "The ground rules for shopping with GHOST — accounts, orders, payment, delivery and conduct.",
      },
      { property: "og:title", content: "Terms & Conditions — GHOST" },
      {
        property: "og:description",
        content:
          "The ground rules for shopping with GHOST — accounts, orders, payment, delivery and conduct.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),

  component: TermsPage,
});
