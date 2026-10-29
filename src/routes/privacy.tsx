import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/pages/PrivacyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GHOST" },
      {
        name: "description",
        content:
          "How GHOST collects, uses and protects your personal data, and the rights you have over it.",
      },
      { property: "og:title", content: "Privacy Policy — GHOST" },
      {
        property: "og:description",
        content:
          "How GHOST collects, uses and protects your personal data, and the rights you have over it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),

  component: PrivacyPage,
});
