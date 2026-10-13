"use client";

import type React from "react";

import { useState } from "react";
import { Mail, Send, Github, Linkedin, ArrowUp, Phone } from "lucide-react";
import { composeMail, signature } from "@/lib/compose-mail";
import { profile } from "@/lib/portfolio-data";

export function ContactWindow() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sent" | "error">(
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

    setErrorMessage("");
    composeMail(
      formData.subject.trim() || `Hello from ${formData.name.trim()}`,
      formData.message.trim() + signature(formData.name, formData.email),
      {
        appId: "contact",
        title: "Message ready",
        body: "Your mail app has the draft. Press Send there and it's on its way.",
      },
    );
    setStatus("sent");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setStatus("idle"), 6000);
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
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href="tel:+919966782707">+91 99667 82707</a>
          <span>Hyderabad, India</span>
          <div className="flex gap-4 mt-4">
            <a
              href={profile.github}
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={17} />
            </a>
            <a
              href={profile.linkedin}
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
            <span className="desktop-only">Send</span>
            {/* iOS Mail sends with a round arrow button. */}
            <ArrowUp size={20} strokeWidth={2.6} className="mobile-only" />
          </button>
        </div>
        {/* On iPhone the contact card's actions sit above the message. */}
        <div className="mail-phone-actions mobile-only">
          {[
            { label: "call", href: "tel:+919966782707", icon: Phone },
            { label: "mail", href: `mailto:${profile.email}`, icon: Mail },
            { label: "LinkedIn", href: profile.linkedin, icon: Linkedin },
            { label: "GitHub", href: profile.github, icon: Github },
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
            Your mail app should open with the message ready. Press Send there.
          </p>
        )}
        <div className="mac-statusbar">
          <span>Contact Muneeb</span>
          <a href={`mailto:${profile.email}`}>Open in your mail app ↗</a>
        </div>
      </form>
    </div>
  );
}
