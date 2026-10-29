import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { ApprovedGate } from "@/components/ApprovedGate";
import { fetchMember, memberQueryKey } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { wasSessionExpired } from "@/lib/api";

/**
 * Layout for every protected page (/vault, /me, /checkout, /admin):
 * signed out → /auth; rejected → signed out and sent to the REJECTED screen;
 * pending → the PENDING screen only; approved → the page.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const member = await context.queryClient
      .fetchQuery({ queryKey: memberQueryKey, queryFn: fetchMember, staleTime: 30_000 })
      .catch(() => null);
    if (!member) {
      // fetchMember returns null after the server reports a rejected account too.
      // A refused refresh token means the session expired — say so on the login screen.
      if (wasSessionExpired()) throw redirect({ to: "/auth", search: { expired: true } });
      throw redirect({ to: "/auth" });
    }
    if (member.status === "rejected") {
      await signOut();
      context.queryClient.setQueryData(memberQueryKey, null);
      throw redirect({ to: "/auth", search: { rejected: true } });
    }
    return { member };
  },
  component: () => (
    <ApprovedGate>
      <Outlet />
    </ApprovedGate>
  ),
});
