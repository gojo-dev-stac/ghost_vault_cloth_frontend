import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/SettingsPage";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GHOST" },
      { name: "description", content: "Manage your GHOST account and password settings." },
      { property: "og:title", content: "Settings — GHOST" },
      { property: "og:description", content: "Manage your GHOST account and password settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});
