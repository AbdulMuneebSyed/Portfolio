"use client";

import { useState } from "react";
import { Send, Bug, MessageCircle } from "lucide-react";
import { composeMail, signature } from "@/lib/compose-mail";

interface ReviewFormData {
  name: string;
  email: string;
  review_text: string;
  rating: number | null;
}
interface ReportFormData {
  name: string;
  email: string;
  report_text: string;
}

export function FeedbackWindow() {
  // page 1 = review form, page 2 = bug/suggestion form (classic page nav mimic)
  const [page, setPage] = useState<1 | 2>(1);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const [reviewData, setReviewData] = useState<ReviewFormData>({
    name: "",
    email: "",
    review_text: "",
    rating: null,
  });
  const [reportData, setReportData] = useState<ReportFormData>({
    name: "",
    email: "",
    report_text: "",
  });

  // No listing display for now per user request

  const ready = {
    appId: "feedback",
    title: "Feedback ready",
    body: "Your mail app has the draft. Press Send there. Thank you!",
  };

  const handleSubmit = (kind: "review" | "report") => {
    if (kind === "review") {
      if (!reviewData.name.trim() || !reviewData.review_text.trim()) {
        setSubmitStatus("Please add name & review text (rating optional)");
        return;
      }
      const stars = reviewData.rating ? ` (${reviewData.rating}/5)` : "";
      composeMail(
        `Portfolio review${stars}`,
        reviewData.review_text.trim() + signature(reviewData.name, reviewData.email),
        ready,
      );
      setReviewData({ name: "", email: "", review_text: "", rating: null });
    } else {
      if (!reportData.name.trim() || !reportData.report_text.trim()) {
        setSubmitStatus("Please add name & details");
        return;
      }
      composeMail(
        "Portfolio issue",
        reportData.report_text.trim() + signature(reportData.name, reportData.email),
        ready,
      );
      setReportData({ name: "", email: "", report_text: "" });
    }
    setSubmitStatus("Your mail app should open with it ready. Press Send there.");
    setTimeout(() => setSubmitStatus(null), 6000);
  };

  const data = page === 1 ? reviewData : reportData;
  return (
    <div className="feedback-app">
      <div className="mac-toolbar">
        <h2>
          <span className="desktop-only">Feedback Assistant</span>
          <span className="mobile-only">Feedback</span>
        </h2>
        <div className="mac-segmented">
          <button
            aria-pressed={page === 1}
            onClick={() => {
              setPage(1);
              setSubmitStatus(null);
            }}
          >
            Review
          </button>
          <button
            aria-pressed={page === 2}
            onClick={() => {
              setPage(2);
              setSubmitStatus(null);
            }}
          >
            Report an Issue
          </button>
        </div>
      </div>
      <form
        className="feedback-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(page === 1 ? "review" : "report");
        }}
      >
        <div className="feedback-heading">
          {page === 1 ? <MessageCircle size={34} /> : <Bug size={34} />}
          <h1>
            {page === 1 ? "How was your visit?" : "Help improve this portfolio"}
          </h1>
          <p>
            {page === 1
              ? "Leave a note about your experience."
              : "Describe what happened and what you expected."}
          </p>
        </div>
        <div className="settings-group">
          {["name", "email"].map((field) => (
            <label key={field} className="mail-field">
              <span>{field === "name" ? "Name" : "Email"}</span>
              <input
                aria-label={field === "name" ? "Your name" : "Your email"}
                type={field === "email" ? "email" : "text"}
                required={field === "name"}
                placeholder={field === "email" ? "Optional" : "Your name"}
                value={data[field as "name" | "email"]}
                onChange={(e) =>
                  page === 1
                    ? setReviewData({ ...reviewData, [field]: e.target.value })
                    : setReportData({ ...reportData, [field]: e.target.value })
                }
              />
            </label>
          ))}
          {page === 1 && (
            <div className="settings-row">
              <span>Rating</span>
              <div className="feedback-stars flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    className="text-xl"
                    style={{
                      color:
                        (reviewData.rating ?? 0) >= rating
                          ? "#ffb340"
                          : "var(--mac-secondary)",
                    }}
                    aria-label={`${rating} stars`}
                    aria-pressed={reviewData.rating === rating}
                    onClick={() => setReviewData({ ...reviewData, rating })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <textarea
          aria-label={page === 1 ? "Your review" : "Issue details"}
          required
          rows={6}
          value={page === 1 ? reviewData.review_text : reportData.report_text}
          onChange={(e) =>
            page === 1
              ? setReviewData({ ...reviewData, review_text: e.target.value })
              : setReportData({ ...reportData, report_text: e.target.value })
          }
          placeholder={
            page === 1 ? "Share your thoughts…" : "What could be better?"
          }
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs mac-muted" role="status">
            {submitStatus ?? "Thank you for taking the time."}
          </span>
          <button type="submit" className="mac-button primary">
            <Send size={13} />
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
