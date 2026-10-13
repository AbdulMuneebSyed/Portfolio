import { notify } from "./notifications";
import { profile } from "./portfolio-data";

// What the Contact and Feedback forms do on submit: open the visitor's mail
// app with a draft to Muneeb, filled in from the form, then confirm with a
// notification. Nothing is stored on a server.
export function composeMail(
  subject: string,
  body: string,
  sent?: { appId: string; title: string; body: string },
) {
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = `mailto:${profile.email}?${query}`;
  if (sent) notify(sent);
}

// The sender's details, appended under the message.
export const signature = (name: string, email: string) =>
  `\n\n— ${name.trim()}${email.trim() ? ` (${email.trim()})` : ""}`;
