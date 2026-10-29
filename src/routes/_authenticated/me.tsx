import { createFileRoute } from "@tanstack/react-router";
import { MyVaultPage } from "@/pages/MyVaultPage";

export const Route = createFileRoute("/_authenticated/me")({
  head: () => ({
    meta: [
      { title: "My Vault — GHOST" },
      { name: "description", content: "Your GHOST membership, vault status and order history." },
      { property: "og:title", content: "My Vault — GHOST" },
      { property: "og:description", content: "Your GHOST membership, vault status and order history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),

  component: MyVaultPage,
});
