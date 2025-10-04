"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Bug, MessageCircle } from "lucide-react";
import {
  supabase,
  type ReviewRow,
  type BugReportRow,
} from "@/lib/supabase-client";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (kind: "review" | "report") => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (kind === "review") {
        if (!reviewData.name.trim() || !reviewData.review_text.trim()) {
          setSubmitStatus("Please add name & review text (rating optional)");
          return;
        }
        const { error } = await supabase.from("review").insert({
          name: reviewData.name.trim(),
          email: reviewData.email.trim() || null,
          rating: reviewData.rating ?? null,
          review_text: reviewData.review_text.trim(),
        });
        if (error) throw error;
        setReviewData({ name: "", email: "", review_text: "", rating: null });
        setSubmitStatus("Saved review successfully");
      } else {
        if (!reportData.name.trim() || !reportData.report_text.trim()) {
          setSubmitStatus("Please add name & details");
          return;
        }
        const { error } = await supabase.from("bugs_and_suggestions").insert({
          name: reportData.name.trim(),
          email: reportData.email.trim() || null,
          report_text: reportData.report_text.trim(),
        });
        if (error) throw error;
        setReportData({ name: "", email: "", report_text: "" });
        setSubmitStatus("Saved report successfully");
      }
      setTimeout(() => setSubmitStatus(null), 2500);
    } catch (e: any) {
      setSubmitStatus(e.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto h-full flex flex-col bg-[#c0c0c0] font-[system-ui] border-2 border-outset shadow-lg">
      {/* Top Navigation Tabs */}
      <div className="bg-[#c0c0c0] px-2 pt-2 flex gap-1">
        <ClassicButton
          onClick={() => setPage(1)}
          active={page === 1}
          className="px-3 py-1 text-[10px]"
        >
          Review
        </ClassicButton>
        <ClassicButton
          onClick={() => setPage(2)}
          active={page === 2}
          className="px-3 py-1 text-[10px]"
        >
          Bugs and Suggestions
        </ClassicButton>
      </div>

      {/* Main Form Area */}
      <div className="flex flex-col bg-[#c0c0c0] p-2">
        <div className="bg-[#c0c0c0] border-2 border-inset p-4">
          <div
            className="grid gap-y-3"
            style={{
              gridTemplateColumns:
                page === 1 ? "100px 200px 100px 200px" : "100px 300px",
              minWidth: page === 1 ? "520px" : "420px",
            }}
          >
            {page === 1 && (
              <>
                <FormField label="First Name">
                  <ClassicInput
                    value={reviewData.name}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, name: e.target.value })
                    }
                    placeholder=""
                  />
                </FormField>

                <FormField label="Email">
                  <ClassicInput
                    value={reviewData.email}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, email: e.target.value })
                    }
                    placeholder=""
                  />
                </FormField>

                <FormField label="Rating">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setReviewData({ ...reviewData, rating: num })
                        }
                        className={`w-4 h-4 border border-gray-600 text-[10px] ${
                          reviewData.rating && reviewData.rating >= num
                            ? "bg-yellow-400 text-black"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: null })
                      }
                      className="ml-2 text-[9px] text-gray-600 underline"
                    >
                      Clear
                    </button>
                  </div>
                </FormField>

                <div
                  className="col-span-4 grid gap-y-2"
                  style={{ gridTemplateColumns: "100px 1fr" }}
                >
                  <FormField label="Review">
                    <ClassicTextarea
                      value={reviewData.review_text}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          review_text: e.target.value,
                        })
                      }
                      rows={4}
                    />
                  </FormField>
                </div>
              </>
            )}

            {page === 2 && (
              <>
                <FormField label="First Name">
                  <ClassicInput
                    value={reportData.name}
                    onChange={(e) =>
                      setReportData({ ...reportData, name: e.target.value })
                    }
                    placeholder=""
                  />
                </FormField>

                <FormField label="Email">
                  <ClassicInput
                    value={reportData.email}
                    onChange={(e) =>
                      setReportData({ ...reportData, email: e.target.value })
                    }
                    placeholder=""
                  />
                </FormField>

                <div
                  className="col-span-2 grid gap-y-2"
                  style={{ gridTemplateColumns: "100px 1fr" }}
                >
                  <FormField label="Details">
                    <ClassicTextarea
                      value={reportData.report_text}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          report_text: e.target.value,
                        })
                      }
                      rows={6}
                    />
                  </FormField>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Status/Action Bar */}
        <div className="mt-2 flex items-center justify-between bg-[#c0c0c0] py-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-700">
              {page === 1 ? "Review Form" : "Bug Report Form"}
            </span>
            <span className="text-[10px] text-gray-700 ml-4">
              Record: 1 of 1
            </span>
          </div>

          <div className="flex gap-2">
            <ClassicButton
              onClick={() => handleSubmit(page === 1 ? "review" : "report")}
              disabled={isSubmitting}
              className="px-3 py-1 text-[10px]"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </ClassicButton>
          </div>
        </div>

        {submitStatus && (
          <div className="mt-1 text-[9px] text-gray-700 bg-yellow-100 px-2 py-1 border">
            {submitStatus}
          </div>
        )}
      </div>
    </div>
  );
}

// Classic Windows form components
function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="text-[11px] text-gray-800 font-medium flex items-center">
        {label}
      </div>
      <div className="flex items-center">{children}</div>
    </>
  );
}

function ClassicInput({
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-5 px-1 text-[11px] border-2 border-inset bg-white focus:outline-none focus:bg-yellow-50"
      style={{
        borderTopColor: "#808080",
        borderLeftColor: "#808080",
        borderRightColor: "#c0c0c0",
        borderBottomColor: "#c0c0c0",
      }}
    />
  );
}

function ClassicTextarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className="w-full px-1 py-1 text-[11px] border-2 border-inset bg-white resize-none focus:outline-none focus:bg-yellow-50"
      style={{
        borderTopColor: "#808080",
        borderLeftColor: "#808080",
        borderRightColor: "#c0c0c0",
        borderBottomColor: "#c0c0c0",
      }}
    />
  );
}

function ClassicButton({
  children,
  onClick,
  active = false,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} border-2 bg-[#c0c0c0] text-black text-[11px] font-normal ${
        active
          ? "border-inset"
          : disabled
          ? "border-outset opacity-50"
          : "border-outset hover:bg-[#d0d0d0] active:border-inset"
      }`}
      style={{
        borderTopColor: active ? "#808080" : "#dfdfdf",
        borderLeftColor: active ? "#808080" : "#dfdfdf",
        borderRightColor: active ? "#dfdfdf" : "#808080",
        borderBottomColor: active ? "#dfdfdf" : "#808080",
      }}
    >
      {children}
    </button>
  );
}
