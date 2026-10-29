import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/pages/AuthPage";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — GHOST Vault" },
      { name: "description", content: "Sign in or request membership to the GHOST Vault." },
      { property: "og:title", content: "Sign in — GHOST Vault" },
      { property: "og:description", content: "Sign in or request membership to the GHOST Vault." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  validateSearch: (
    s: Record<string, unknown>,
  ): {
    mode?: "signup";
    rejected?: boolean;
    expired?: boolean;
  } => ({
    ...(s["mode"] === "signup" ? { mode: "signup" as const } : {}),
    ...(s["rejected"] === true || s["rejected"] === "true" || s["rejected"] === 1
      ? { rejected: true }
      : {}),
    ...(s["expired"] === true || s["expired"] === "true" || s["expired"] === 1
      ? { expired: true }
      : {}),
  }),
  component: AuthRoute,
});

function AuthRoute() {
  const { mode, rejected, expired } = Route.useSearch();
  return (
    <AuthPage
      initialMode={mode === "signup" ? "signup" : "login"}
      rejected={!!rejected}
      expired={!!expired}
    />
  );
}
