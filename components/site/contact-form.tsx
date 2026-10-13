"use client";

import { useState, type FormEvent } from "react";
import { composeMail, signature } from "@/lib/compose-mail";

// The website's contact form. Like the OS's Contact app, Submit opens the
// visitor's mail app with the message ready to send.
export function ContactForm() {
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !email || !message) return;
    composeMail(`Hello from ${name}`, message + signature(name, email));
    form.reset();
    setSent(true);
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
      <button type="submit">Submit</button>
      <p className="mj-form-note" role="status">
        {sent && "Your mail app should open with the message ready. Press Send there."}
      </p>
    </form>
  );
}
