"use client";

import type React from "react";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";

export function ContactWindow() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Simulate sending
    setTimeout(() => {
      setStatus("sent");
      setTimeout(() => {
        setStatus("idle");
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 3000);
    }, 1500);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-auto">
      <div className="p-8 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get In Touch</h1>
        <p className="text-gray-600 mb-8">
          Have a question or want to work together? I'd love to hear from you!
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Send a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status !== "idle"}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {status === "sending" ? (
                  "Sending..."
                ) : status === "sent" ? (
                  "Message Sent!"
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <a
                    href="mailto:john.doe@email.com"
                    className="text-blue-600 hover:underline"
                  >
                    john.doe@email.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Phone</p>
                  <a
                    href="tel:+15551234567"
                    className="text-blue-600 hover:underline"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">San Francisco, CA</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Connect With Me
            </h3>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 text-gray-700" />
              </a>
              <a
                href="https://www.linkedin.com/in/syed-abdul-muneeb/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6 text-blue-700" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-sky-100 hover:bg-sky-200 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6 text-sky-700" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
