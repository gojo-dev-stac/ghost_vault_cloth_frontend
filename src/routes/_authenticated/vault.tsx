import { createFileRoute } from "@tanstack/react-router";
import { VaultPage } from "@/pages/VaultPage";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({
    meta: [
      { title: "The Vault — GHOST" },
      {
        name: "description",
        content: "Members-only GHOST collection: heavyweight hoodies in limited runs.",
      },
      { property: "og:title", content: "The Vault — GHOST" },
      {
        property: "og:description",
        content: "Members-only GHOST collection: heavyweight hoodies in limited runs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  component: VaultPage,
});
