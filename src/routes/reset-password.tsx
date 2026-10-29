import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — GHOST Vault" },
      { name: "description", content: "Set a new password for your GHOST Vault account." },
      { property: "og:title", content: "Reset password — GHOST Vault" },
      { property: "og:description", content: "Set a new password for your GHOST Vault account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { uid?: string; token?: string } => ({
    ...(typeof s["uid"] === "string" ? { uid: s["uid"] } : {}),
    ...(typeof s["token"] === "string" ? { token: s["token"] } : {}),
  }),
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const { uid, token } = Route.useSearch();
  return <ResetPasswordPage uid={uid ?? ""} token={token ?? ""} />;
}
