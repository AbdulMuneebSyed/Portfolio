"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import {
  Inbox,
  Mail,
  Plus,
  Search,
  Send,
  UserRound,
  UsersRound,
} from "lucide-react";

type Contact = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
};

type SentMessage = {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
};

const contactsSeed: Contact[] = [
  {
    id: "muneeb",
    name: "Syed Abdul Muneeb",
    role: "Software Developer",
    email: "abdulmuneebsyed.dev@gmail.com",
    phone: "+1 (555) 010-2026",
  },
  {
    id: "github",
    name: "GitHub Profile",
    role: "Code portfolio",
    email: "AbdulMuneebSyed@github.local",
    phone: "github.com/AbdulMuneebSyed",
  },
];

const inboxSeed = [
  {
    id: "welcome",
    from: "Portfolio Assistant",
    subject: "Mail client is ready",
    preview: "Compose messages, select contacts, and keep sent notes locally.",
  },
  {
    id: "lead",
    from: "Hiring Team",
    subject: "Frontend developer opportunity",
    preview: "Can you share recent UI-heavy projects and GitHub activity?",
  },
];

const storageKey = "muneebos-mail-client-v1";

export function MailContactClient() {
  const [folder, setFolder] = useState<"Inbox" | "Sent" | "Contacts">("Inbox");
  const [contacts, setContacts] = useState(contactsSeed);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(contactsSeed[0].id);
  const [compose, setCompose] = useState({
    to: contactsSeed[0].email,
    subject: "Portfolio conversation",
    body: "Hi Muneeb,\n\nI reviewed your portfolio and would like to connect about a project.\n\nBest,",
  });
  const [newContact, setNewContact] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const [notice, setNotice] = useState("Ready");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) {
        setHasLoadedStorage(true);
        return;
      }
      const parsed = JSON.parse(saved) as {
        contacts?: Contact[];
        sentMessages?: SentMessage[];
      };
      if (Array.isArray(parsed.contacts)) setContacts(parsed.contacts);
      if (Array.isArray(parsed.sentMessages)) {
        setSentMessages(parsed.sentMessages);
      }
    } catch {
      setNotice("Saved mailbox data could not be loaded.");
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ contacts, sentMessages })
    );
  }, [contacts, hasLoadedStorage, sentMessages]);

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) ?? contacts[0];

  const filteredContacts = useMemo(() => {
    const query = contactQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(query) ||
        contact.role.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query)
    );
  }, [contactQuery, contacts]);

  const selectContact = (contact: Contact) => {
    setSelectedContactId(contact.id);
    setCompose((current) => ({ ...current, to: contact.email }));
    setNotice(`${contact.name} selected.`);
  };

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    if (!compose.to.trim() || !compose.subject.trim() || !compose.body.trim()) {
      setNotice("To, subject, and message are required.");
      return;
    }

    setSentMessages((current) => [
      {
        id: `${Date.now()}`,
        ...compose,
        sentAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setNotice("Message added to Sent.");
    setFolder("Sent");
  };

  const addContact = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newContact.name.trim() || !newContact.email.trim()) {
      setNotice("New contacts need a name and email.");
      return;
    }

    const contact: Contact = {
      id: `${Date.now()}`,
      name: newContact.name.trim(),
      role: newContact.role.trim() || "Contact",
      email: newContact.email.trim(),
      phone: newContact.phone.trim() || "Not provided",
    };
    setContacts((current) => [contact, ...current]);
    setNewContact({ name: "", role: "", email: "", phone: "" });
    selectContact(contact);
    setFolder("Contacts");
  };

  const folders = [
    { id: "Inbox", icon: Inbox, count: inboxSeed.length },
    { id: "Sent", icon: Send, count: sentMessages.length },
    { id: "Contacts", icon: UsersRound, count: contacts.length },
  ] as const;

  return (
    <div className="flex h-full flex-col bg-[#f3f7fb] text-slate-900">
      <div className="flex items-center gap-2 border-b border-slate-300 bg-gradient-to-b from-white to-[#dfe9f5] px-3 py-2">
        <Mail className="size-5 text-sky-700" />
        <div className="font-semibold">Windows Mail - Portfolio Contact Center</div>
        <div className="ml-auto text-xs text-slate-500">{notice}</div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[170px_260px_minmax(320px,1fr)]">
        <aside className="border-r border-slate-300 bg-[#e9f1fa] p-3">
          <button
            onClick={() => {
              setFolder("Contacts");
              setNotice("Compose pane ready.");
            }}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded bg-[#1f5f99] px-3 py-2 text-sm font-medium text-white hover:bg-[#194f80]"
          >
            <Plus className="size-4" />
            New message
          </button>
          <div className="flex flex-col gap-1">
            {folders.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setFolder(item.id)}
                  className={`flex items-center justify-between rounded px-2 py-2 text-sm ${
                    folder === item.id
                      ? "bg-white shadow-sm"
                      : "hover:bg-white/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-sky-700" />
                    {item.id}
                  </span>
                  <span className="text-xs text-slate-500">{item.count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <aside className="border-r border-slate-300 bg-white">
          <div className="border-b border-slate-300 p-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={contactQuery}
                onChange={(event) => setContactQuery(event.target.value)}
                placeholder="Search contacts"
                className="w-full rounded border border-slate-300 py-1 pl-8 pr-2 text-sm outline-none focus:border-sky-500"
              />
            </div>
          </div>
          <div className="max-h-[210px] overflow-auto border-b border-slate-300">
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => selectContact(contact)}
                className={`flex w-full items-start gap-2 border-b border-slate-200 px-3 py-3 text-left hover:bg-sky-50 ${
                  selectedContact.id === contact.id ? "bg-[#def0ff]" : ""
                }`}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded border border-slate-300 bg-[#f8fbff]">
                  <UserRound className="size-4 text-sky-700" />
                </div>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {contact.name}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {contact.role}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={addContact} className="flex flex-col gap-2 p-3">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Add contact
            </div>
            <input
              value={newContact.name}
              onChange={(event) =>
                setNewContact((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="Name"
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <input
              value={newContact.email}
              onChange={(event) =>
                setNewContact((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="Email"
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <button className="rounded border border-sky-400 bg-[#e5f3ff] px-2 py-1 text-sm font-medium hover:bg-[#d8edff]">
              Save contact
            </button>
          </form>
        </aside>

        <main className="min-w-0 overflow-auto bg-[#f8fbff]">
          {folder === "Inbox" && (
            <div>
              <div className="border-b border-slate-300 bg-[#edf5fc] px-4 py-2 text-xs font-semibold uppercase text-slate-500">
                Inbox
              </div>
              {inboxSeed.map((message) => (
                <div
                  key={message.id}
                  className="border-b border-slate-200 bg-white px-4 py-3"
                >
                  <div className="font-semibold">{message.subject}</div>
                  <div className="text-sm text-slate-500">{message.from}</div>
                  <p className="mt-1 text-sm text-slate-600">{message.preview}</p>
                </div>
              ))}
            </div>
          )}

          {folder === "Sent" && (
            <div>
              <div className="border-b border-slate-300 bg-[#edf5fc] px-4 py-2 text-xs font-semibold uppercase text-slate-500">
                Sent Mail
              </div>
              {sentMessages.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">
                  No sent messages yet. Compose one on the right.
                </div>
              ) : (
                sentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="border-b border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="font-semibold">{message.subject}</div>
                    <div className="text-sm text-slate-500">To: {message.to}</div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                      {message.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {folder === "Contacts" && (
            <div className="p-4">
              <h2 className="mb-2 text-lg font-semibold">
                {selectedContact.name}
              </h2>
              <div className="mb-4 text-sm text-slate-600">
                {selectedContact.role}
              </div>
              <div className="rounded border border-slate-300 bg-white p-4 text-sm">
                <div className="mb-2">Email: {selectedContact.email}</div>
                <div>Phone: {selectedContact.phone}</div>
              </div>
            </div>
          )}

          <form
            onSubmit={sendMessage}
            className="m-4 flex flex-col gap-2 rounded border border-slate-300 bg-white p-4"
          >
            <div className="text-sm font-semibold">Compose</div>
            <input
              value={compose.to}
              onChange={(event) =>
                setCompose((current) => ({ ...current, to: event.target.value }))
              }
              placeholder="To"
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={compose.subject}
              onChange={(event) =>
                setCompose((current) => ({
                  ...current,
                  subject: event.target.value,
                }))
              }
              placeholder="Subject"
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              value={compose.body}
              onChange={(event) =>
                setCompose((current) => ({ ...current, body: event.target.value }))
              }
              rows={6}
              className="resize-none rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded bg-[#1f5f99] px-3 py-2 text-sm font-medium text-white hover:bg-[#194f80]">
                <Send className="size-4" />
                Send locally
              </button>
              <a
                href={`mailto:${compose.to}?subject=${encodeURIComponent(
                  compose.subject
                )}&body=${encodeURIComponent(compose.body)}`}
                className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
              >
                Open mail app
              </a>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
