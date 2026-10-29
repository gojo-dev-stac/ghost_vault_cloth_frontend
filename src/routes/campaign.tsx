import { createFileRoute } from "@tanstack/react-router";
import { StreetwearCampaignPage } from "@/pages/StreetwearCampaignPage";

export const Route = createFileRoute("/campaign")({
  head: () => ({
    meta: [
      { title: "The Campaign — GHOST" },
      {
        name: "description",
        content: "Discover the GHOST collection through a film shaped by movement.",
      },
    ],
  }),
  component: StreetwearCampaignPage,
});
