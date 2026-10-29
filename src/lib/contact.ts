/**
 * contact.ts — the Contact Us form (product issues / complaints) and the
 * admin inbox behind it (Django API). Anyone may send; only the admin can
 * read every message and reply (the reply is emailed to the sender).
 */
import { api } from "@/lib/api";

export type ComplaintStatus = "Open" | "Replied" | "Closed";

export type Complaint = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  admin_reply: string | null;
  replied_at: string | null;
  status: ComplaintStatus;
  created_at: string;
};

/** Send a contact message; it is linked to the member when signed in. */
export async function submitComplaint(c: { name: string; email: string; subject: string; message: string }) {
  await api("/contact/", {
    method: "POST",
    body: { name: c.name.trim(), email: c.email.trim(), subject: c.subject.trim(), message: c.message.trim() },
  });
}

/** Admin: every message, newest first. Members: their own messages. */
export const fetchComplaints = () => api<Complaint[]>("/contact/");

/** Admin only: save a reply, email it to the sender and mark the message Replied. */
export async function replyToComplaint(id: string, reply: string) {
  await api(`/contact/${id}/reply/`, { method: "PATCH", body: { reply: reply.trim(), send_email: true } });
}

/** Admin only: set Open / Replied / Closed. */
export async function setComplaintStatus(id: string, status: ComplaintStatus) {
  await api(`/contact/${id}/status/`, { method: "PATCH", body: { status } });
}
