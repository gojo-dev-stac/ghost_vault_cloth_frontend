import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { AuthField } from "@/components/AuthField";
import { changePassword } from "@/lib/auth";
import "@/styles/vault-ui.css";

export function SettingsPage() {
  return (
    <div className="vsite min-h-screen">
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-10">
        <div className="fog-layer" />
        <header className="vsite-head">
          <p className="vsite-index">
            <span>Account</span>
            <span>Settings / Security</span>
          </p>
          <span className="vsite-rule" />
          <p className="vsite-eyebrow">Manage your account access</p>
          <div className="vsite-head-row">
            <h1 className="vsite-title">
              Account <em>settings.</em>
            </h1>
            <p className="vsite-lede">
              Update your password and keep your account secure. Your membership details and orders
              remain in My Vault.
            </p>
          </div>
        </header>

        <section className="relative mt-14" aria-labelledby="password-change-title">
          <p className="vsite-index">
            <span>Security</span>
            <span>Password</span>
          </p>
          <span className="vsite-rule" />
          <div className="vsite-panel mt-8 grid gap-8 p-6 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:p-8">
            <div>
              <LockKeyhole className="mb-5 h-5 w-5 text-gold" aria-hidden="true" />
              <h2 id="password-change-title" className="vsite-panel-title text-3xl">
                Change <em>password.</em>
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                Confirm your current password, then choose a new one for your account.
              </p>
            </div>
            <PasswordChangeForm />
          </div>
        </section>

        <div className="vsite-panel relative mt-12 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div>
            <p className="vsite-stat-label">Membership</p>
            <p className="mt-2 text-sm text-muted-foreground">
              View your access status, profile details, and order history.
            </p>
          </div>
          <Link to="/me" className="vsite-cta-quiet inline-flex w-fit">
            <span>Open My Vault</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("Choose a password different from your current one.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Your password has been changed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change your password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <AuthField
        label="Current password"
        type="password"
        autoComplete="current-password"
        required
        value={currentPassword}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setCurrentPassword(event.target.value)}
      />
      <AuthField
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        value={newPassword}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
      />
      <AuthField
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}
      />
      <button className="vsite-cta mt-2 w-fit" type="submit" disabled={isSubmitting}>
        <span>{isSubmitting ? "Updating..." : "Update password"}</span>
      </button>
    </form>
  );
}
