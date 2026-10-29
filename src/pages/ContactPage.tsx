/** ContactPage.tsx — the Contact Us page: product issues and complaints go to the admin Support inbox, editorial edition. */
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { submitComplaint } from "@/lib/contact";
import "@/styles/vault-ui.css";

export function ContactPage() {
  const { data: member } = useAuth();
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (member)
      setF((p) => ({
        ...p,
        name: p.name || member.display_name || "",
        email: p.email || member.email,
      }));
  }, [member]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submitComplaint(f);
      setSent(true);
      toast.success("Message sent", { description: "Our team will reply to your email." });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="vsite min-h-screen">
      <div className="relative max-w-6xl mx-auto px-5 md:px-10 pt-32 pb-16">
        <div className="fog-layer" />
        <header className="vsite-head">
          <p className="vsite-index">
            <span>Support</span>
            <span>Replies within 48h</span>
          </p>
          <span className="vsite-rule" />
          <p className="vsite-eyebrow">Orders · Product issues · Complaints</p>
          <div className="vsite-head-row">
            <h1 className="vsite-title">
              Contact <em>Us.</em>
            </h1>
            <p className="vsite-lede">
              Product issue, order problem or complaint — tell us what happened and we'll reply by
              email.
            </p>
          </div>
        </header>

        <div className="relative mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="vsite-panel p-6 md:p-10 lg:col-span-3 animate-rise">
            {sent ? (
              <div className="py-10 text-center">
                <p className="vsite-panel-title">
                  Message <em>received.</em>
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  We'll get back to {f.email} soon.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setF((p) => ({ ...p, subject: "", message: "" }));
                  }}
                  className="vsite-cta-quiet mt-8 inline-flex"
                >
                  <span>Send another</span>
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">Name</span>
                    <input
                      className="vsite-field"
                      maxLength={100}
                      required
                      value={f.name}
                      onChange={(e) => setF({ ...f, name: e.target.value })}
                      autoComplete="name"
                    />
                  </label>
                  <label className="vsite-field-wrap">
                    <span className="vsite-field-label">Email</span>
                    <input
                      className="vsite-field"
                      type="email"
                      maxLength={255}
                      required
                      value={f.email}
                      onChange={(e) => setF({ ...f, email: e.target.value })}
                      autoComplete="email"
                    />
                  </label>
                </div>
                <label className="vsite-field-wrap">
                  <span className="vsite-field-label">Subject</span>
                  <input
                    className="vsite-field"
                    maxLength={200}
                    required
                    value={f.subject}
                    onChange={(e) => setF({ ...f, subject: e.target.value })}
                  />
                </label>
                <label className="vsite-field-wrap">
                  <span className="vsite-field-label">Message</span>
                  <textarea
                    className="vsite-field"
                    maxLength={5000}
                    required
                    value={f.message}
                    onChange={(e) => setF({ ...f, message: e.target.value })}
                  />
                </label>
                <button
                  type="submit"
                  disabled={busy}
                  className="vsite-cta mt-2 w-full sm:w-auto self-start"
                >
                  <span className="flex items-center gap-2">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
                  </span>
                  <span className="vsite-cta-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </form>
            )}
          </div>

          <aside className="lg:col-span-2 space-y-8">
            <div
              className="vsite-panel p-6 md:p-8 animate-rise"
              style={{ animationDelay: "100ms" }}
            >
              <p className="vsite-eyebrow">Direct lines</p>
              <h2 className="vsite-panel-title mt-2">
                Other <em>routes.</em>
              </h2>
              <ul className="mt-6 flex flex-col gap-5 text-sm">
                <li>
                  <p className="vsite-stat-label">Email</p>
                  <a
                    href="mailto:contact@ghost.studio"
                    className="mt-2 inline-block text-foreground/85 transition-colors hover:text-gold"
                  >
                    contact@ghost.studio
                  </a>
                </li>
                <li>
                  <p className="vsite-stat-label">Social</p>
                  <div className="mt-2 flex gap-5">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/85 transition-colors hover:text-gold"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://tiktok.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/85 transition-colors hover:text-gold"
                    >
                      TikTok
                    </a>
                  </div>
                </li>
              </ul>
            </div>
            <div
              className="vsite-panel p-6 md:p-8 animate-rise"
              style={{ animationDelay: "200ms" }}
            >
              <p className="vsite-eyebrow">Before you write</p>
              <h2 className="vsite-panel-title mt-2">
                Order <em>issues.</em>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Include your order ID (it looks like G-0001) — you'll find it under My Vault → Order
                History. It helps us resolve things in one pass.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}
