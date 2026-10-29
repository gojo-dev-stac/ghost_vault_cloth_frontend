/** Header.tsx — the fixed glass site header (logo, nav, bag), editorial edition. */
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Shield, User } from "lucide-react";
import { ShoppingBag } from "@/components/ShoppingBag";
import { signOut as endSession } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { GhostLogo } from "@/components/GhostLogo";
import { useEffect, useState } from "react";
import "@/styles/vault-ui.css";

export function Header({ campaign = false }: { campaign?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const { data: member } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!campaign) {
      setScrolled(true);
      return;
    }
    const syncScroll = () => setScrolled(window.scrollY > 32);
    syncScroll();
    window.addEventListener("scroll", syncScroll, { passive: true });
    return () => window.removeEventListener("scroll", syncScroll);
  }, [campaign]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await endSession();
    navigate({ to: "/auth", replace: true });
  };

  const isActive = (to: string) => pathname === to;

  return (
    <nav
      className={`vsite-nav fixed inset-x-0 top-0 z-50 border-b border-transparent ${
        scrolled ? "is-solid" : ""
      }`}
      aria-label="Primary"
    >
      <div className="flex h-16 items-center justify-between px-5 md:h-20 md:px-10">
        <div className="flex items-center gap-4">
          <Link
            to={member ? "/vault" : "/collection"}
            className="block transition hover:brightness-125"
            aria-label="GHOST — The Vault"
          >
            <GhostLogo className="h-12 md:h-14 drop-shadow-[0_0_16px_rgba(201,162,74,0.35)]" />
          </Link>
          <span
            aria-hidden="true"
            className="hidden h-8 w-px bg-[linear-gradient(180deg,transparent,rgba(201,162,74,0.5),transparent)] lg:block"
          />
          <span className="hidden text-[9px] leading-[1.7] tracking-[0.34em] text-foreground/45 uppercase lg:block">
            GHOST
            <br />
            The Vault
          </span>
        </div>
        <div className="flex items-center gap-5 md:gap-7">
          {!member ? (
            <>
              <Link
                to="/collection"
                className={`vsite-nav-link hidden sm:inline-block ${
                  isActive("/collection") ? "is-active" : ""
                }`}
              >
                The Drop
              </Link>
              <Link
                to="/contact"
                className={`vsite-nav-link hidden sm:inline-block ${
                  isActive("/contact") ? "is-active" : ""
                }`}
              >
                Contact
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="vsite-nav-cta">
                Request Access
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/vault"
                className={`vsite-nav-link hidden sm:inline-block ${
                  isActive("/vault") ? "is-active" : ""
                }`}
              >
                The Vault
              </Link>
              <Link
                to="/contact"
                className={`vsite-nav-link hidden md:inline-block ${
                  isActive("/contact") ? "is-active" : ""
                }`}
              >
                Contact
              </Link>
              <Link
                to="/me"
                className={`vsite-nav-link ${isActive("/me") ? "is-active" : ""}`}
                aria-label="My Vault"
              >
                <span className="hidden sm:inline">My Vault</span>
                <User className="h-4 w-4 sm:hidden" />
              </Link>
              {member?.isAdmin && (
                <Link
                  to="/admin"
                  className={`vsite-nav-link ${isActive("/admin") ? "is-active" : ""}`}
                  aria-label="Admin"
                >
                  <span className="hidden sm:inline">Admin</span>
                  <Shield className="h-4 w-4 sm:hidden" />
                </Link>
              )}
              <ShoppingBag />
              <button
                onClick={signOut}
                className="vsite-nav-iconbtn is-danger"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
