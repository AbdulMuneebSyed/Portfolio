"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Send, Github, Linkedin, ArrowUp, Phone } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { notify } from "@/lib/notifications";

export function ContactWindow() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage("Please fill in name, email, and message.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const { error } = await supabase.from("bugs_and_suggestions").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        report_text: `[CONTACT FORM] Subject: ${
          formData.subject.trim() || "(no subject)"
        }\n\n${formData.message.trim()}`,
      });
      if (error) throw error;
      setStatus("sent");
      notify({
        appId: "contact",
        title: "Message sent",
        body: `Thanks, ${formData.name.trim()}! Muneeb will reply to ${formData.email.trim()}.`,
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 3500);
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Something went wrong. Try emailing me directly.",
      );
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="mac-split mail-app">
      <aside className="mac-sidebar">
        <div className="sidebar-heading">Mailboxes</div>
        <div className="sidebar-item" data-selected="true">
          <Mail />
          <span>New Message</span>
        </div>
        <div className="mail-contact-details">
          <img src="/avatar-256.jpg" alt="Syed Abdul Muneeb" />
          <strong>Syed Abdul Muneeb</strong>
          <p>Software Engineer</p>
          <a href="mailto:samuneeb786@gmail.com">samuneeb786@gmail.com</a>
          <a href="tel:+919966782707">+91 99667 82707</a>
          <span>Hyderabad, India</span>
          <div className="flex gap-4 mt-4">
            <a
              href="https://github.com/AbdulMuneebSyed"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={17} />
            </a>
            <a
              href="https://www.linkedin.com/in/syed-abdul-muneeb/"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin size={17} />
            </a>
          </div>
        </div>
      </aside>
      <form onSubmit={handleSubmit} className="finder-main">
        <div className="mac-toolbar">
          <h2>New Message</h2>
          <button
            type="submit"
            className="mac-button primary"
            disabled={status !== "idle"}
          >
            <Send size={14} className="desktop-only" />
            <span className="desktop-only">
              {status === "sending"
                ? "Sending…"
                : status === "sent"
                  ? "Sent"
                  : "Send"}
            </span>
            {/* iOS Mail sends with a round arrow button. */}
            <ArrowUp size={20} strokeWidth={2.6} className="mobile-only" />
          </button>
        </div>
        {/* On iPhone the contact card's actions sit above the message. */}
        <div className="mail-phone-actions mobile-only">
          {[
            { label: "call", href: "tel:+919966782707", icon: Phone },
            { label: "mail", href: "mailto:samuneeb786@gmail.com", icon: Mail },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/syed-abdul-muneeb/", icon: Linkedin },
            { label: "GitHub", href: "https://github.com/AbdulMuneebSyed", icon: Github },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              target={action.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              <action.icon size={20} />
              {action.label}
            </a>
          ))}
        </div>
        <div className="mail-fields">
          <div className="mail-field">
            <span>To:</span>
            <span>Syed Abdul Muneeb</span>
          </div>
          {[
            ["name", "Name:", "Your name", "text"],
            ["email", "From:", "Your email address", "email"],
            ["subject", "Subject:", "Let’s build something", "text"],
          ].map(([name, label, placeholder, type]) => (
            <label key={name} className="mail-field">
              <span>{label}</span>
              <input
                name={name}
                aria-label={
                  name === "email"
                    ? "Email"
                    : name === "name"
                      ? "Name"
                      : "Subject"
                }
                type={type}
                placeholder={placeholder}
                required={name !== "subject"}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
              />
            </label>
          ))}
        </div>
        <textarea
          aria-label="Message"
          name="message"
          className="mail-body"
          placeholder="Hi Muneeb,"
          required
          value={formData.message}
          onChange={handleChange}
        />
        {status === "error" && (
          <p role="alert" className="px-5 py-2 text-xs text-red-500">
            {errorMessage}
          </p>
        )}
        {status === "sent" && (
          <p role="status" className="px-5 py-2 text-xs text-green-600">
            Your message has been sent. Thank you!
          </p>
        )}
        <div className="mac-statusbar">
          <span>Contact Muneeb</span>
          <a href="mailto:samuneeb786@gmail.com">Open in your mail app ↗</a>
        </div>
      </form>
    </div>
  );
}
