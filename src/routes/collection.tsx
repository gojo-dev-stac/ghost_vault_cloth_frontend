import { createFileRoute } from "@tanstack/react-router";
import { StreetwearCampaignPage } from "@/pages/StreetwearCampaignPage";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "The Drop — GHOST Collection" },
      {
        name: "description",
        content:
          "Watch the GHOST Vault preview and discover the collection through a scroll-driven campaign.",
      },
      { property: "og:title", content: "The Drop — GHOST Collection" },
      {
        property: "og:description",
        content:
          "Watch the GHOST Vault preview and discover the collection through a scroll-driven campaign.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  component: StreetwearCampaignPage,
});
