import { useAuth } from "@/hooks/useAuth";

export function useCanBuy() {
  const { data: member } = useAuth();
  return !!member && (member.status === "approved" || member.isAdmin);
}
