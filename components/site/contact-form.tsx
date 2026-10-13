"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { profile } from "@/lib/portfolio-data";

// The website's contact form. It saves to the same table as the OS's
// Contact app, tagged so the two can be told apart.
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) return;
    setStatus("sending");
    const { error } = await supabase.from("bugs_and_suggestions").insert({
      name,
      email,
      report_text: `[WEBSITE CONTACT FORM]\n\n${message}`,
    });
    if (error) return setStatus("error");
    form.reset();
    setStatus("sent");
  };

  return (
    <form className="mj-form" onSubmit={submit}>
      <label>
        Name
        <input name="name" placeholder="Enter your name" autoComplete="name" required />
      </label>
      <label>
        Email
        <input name="email" type="email" placeholder="Enter your email" autoComplete="email" required />
      </label>
      <label>
        Message
        <textarea name="message" placeholder="Tell me about your project" rows={5} required />
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : status === "sent" ? "Sent, thank you!" : "Submit"}
      </button>
      <p className="mj-form-note" role="status">
        {status === "error" && (
          <>
            That didn&apos;t go through. Email me at{" "}
            <a href={`mailto:${profile.email}`}>{profile.email}</a> instead.
          </>
        )}
        {status === "sent" && "I'll get back to you soon."}
      </p>
    </form>
  );
}
