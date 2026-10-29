import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ACCOUNT_REJECTED_EVENT, SESSION_EXPIRED_EVENT, onAuthChange } from "@/lib/api";
import { NotFoundPage } from "@/pages/NotFoundPage";

import appCss from "../styles/globals.css?url";
import { Header } from "@/components/Header";
import { VaultVideo } from "@/components/VaultVideo";

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GHOST — Luxury Streetwear" },
      {
        name: "description",
        content: "GHOST — Premium streetwear. Heavyweight hoodies, limited drops, dark luxury.",
      },
      { name: "author", content: "GHOST" },
      { name: "p:domain_verify", content: "cc17a2eccf66bc4c00c20d1f2037eb37" },
      { property: "og:title", content: "GHOST — Luxury Streetwear" },
      {
        property: "og:description",
        content: "Premium streetwear. Heavyweight hoodies, limited drops, dark luxury.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,500;1,500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const { pathname } = useLocation();

  useEffect(() => {
    // Fires on sign-in, sign-out and when an expired session is cleared.
    const unsubscribe = onAuthChange((signedIn) => {
      router.invalidate();
      if (signedIn) queryClient.invalidateQueries();
      else queryClient.setQueryData(["member"], null);
    });
    // The server rejected this account mid-session: drop all data and show the REJECTED screen.
    const onRejected = () => {
      queryClient.clear();
      queryClient.setQueryData(["member"], null);
      router.navigate({ to: "/auth", search: { rejected: true }, replace: true });
    };
    window.addEventListener(ACCOUNT_REJECTED_EVENT, onRejected);
    // The session expired mid-use (refresh token refused): clear data and go to
    // /auth with the "session expired" notice.
    const onExpired = () => {
      queryClient.setQueryData(["member"], null);
      const here = window.location.pathname;
      if (here !== "/auth")
        router.navigate({ to: "/auth", search: { expired: true }, replace: true });
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => {
      unsubscribe();
      window.removeEventListener(ACCOUNT_REJECTED_EVENT, onRejected);
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {pathname !== "/campaign" && pathname !== "/collection" && <VaultVideo />}
      {pathname !== "/" && <Header campaign={pathname === "/collection"} />}
      <main className="relative z-10">
        <Outlet />
      </main>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
