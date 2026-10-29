import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — GHOST" },
      { name: "description", content: "Reach GHOST support about orders, product issues or complaints." },
      { property: "og:title", content: "Contact Us — GHOST" },
      { property: "og:description", content: "Reach GHOST support about orders, product issues or complaints." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),

  component: ContactPage,
});
