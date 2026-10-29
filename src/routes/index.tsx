import { createFileRoute } from "@tanstack/react-router";
import { VaultIntroPage } from "@/pages/VaultIntroPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GHOST — Enter The Vault" },
      { name: "description", content: "GHOST is a members-only luxury streetwear vault. Request access to enter." },
      { property: "og:title", content: "GHOST — Enter The Vault" },
      { property: "og:description", content: "A members-only luxury streetwear vault. Request access to enter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  component: VaultIntroPage,
});
