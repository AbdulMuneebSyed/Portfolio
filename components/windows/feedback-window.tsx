"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Send, Bug, MessageCircle, User, Mail } from "lucide-react";

interface FeedbackData {
  name: string;
  email: string;
  message: string;
  rating?: number;
  type: "review" | "bug" | "suggestion";
}

// Add click sound function
const playClickSound = () => {
  try {
    const audio = new Audio("/click.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore audio play errors (user interaction required)
    });
  } catch (error) {
    // Ignore audio errors
  }
};

export function FeedbackWindow() {
  const [activeTab, setActiveTab] = useState("review");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  // Form states
  const [reviewData, setReviewData] = useState<FeedbackData>({
    name: "",
    email: "",
    message: "",
    rating: 0,
    type: "review",
  });

  const [bugData, setBugData] = useState<FeedbackData>({
    name: "",
    email: "",
    message: "",
    type: "bug",
  });

  const sendEmail = async (data: FeedbackData) => {
    const subject =
      data.type === "review"
        ? `Portfolio Review from ${data.name}`
        : `Bug Report/Suggestion from ${data.name}`;

    const ratingText =
      data.rating && data.rating > 0
        ? `Rating: ${data.rating}/5 stars ⭐`
        : "No rating provided";
    const emailText = data.email ? data.email : "Not provided";

    const body = `
Name: ${data.name}
Email: ${emailText}
Type: ${data.type.toUpperCase()}
${data.type === "review" ? ratingText : ""}

Message:
${data.message}

---
Sent from Windows 7 Portfolio Website
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:samuneeb786@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Open default email client
    window.location.href = mailtoLink;

    return true;
  };

  const handleSubmit = async (type: "review" | "bug") => {
    const data = type === "review" ? reviewData : bugData;

    if (!data.name || !data.message) {
      setSubmitStatus("Please fill in your name and message");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("Opening email client...");

    try {
      await sendEmail(data);
      setSubmitStatus("Email client opened! Please send the email from there.");

      // Reset form after 3 seconds
      setTimeout(() => {
        if (type === "review") {
          setReviewData({
            name: "",
            email: "",
            message: "",
            rating: 0,
            type: "review",
          });
        } else {
          setBugData({ name: "", email: "", message: "", type: "bug" });
        }
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      setSubmitStatus("Failed to open email client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    onRatingChange,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
  }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer transition-all duration-200 ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400 scale-110"
                : "text-gray-300 hover:text-yellow-200"
            }`}
            onClick={() => {
              playClickSound();
              onRatingChange(star);
            }}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-600 flex items-center">
            {rating}/5 stars
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4F8CB8] to-[#326EA0] text-white p-4 border-b">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6" />
          <div>
            <h1 className="text-xl font-semibold">Reviews & Bug Reports</h1>
            <p className="text-sm opacity-90">
              Share your feedback with Samun Neeb
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            playClickSound();
            setActiveTab(value);
            setSubmitStatus(null);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="bugs" className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Bugs & Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">
                Share Your Experience
              </h3>
              <p className="text-blue-700 text-sm">
                I'd love to hear your thoughts about my portfolio website! Your
                feedback helps me improve.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="review-name"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="review-name"
                  value={reviewData.name}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, name: e.target.value })
                  }
                  onClick={playClickSound}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="review-email"
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Your Email{" "}
                  <span className="text-gray-500 text-sm">(optional)</span>
                </Label>
                <Input
                  id="review-email"
                  type="email"
                  value={reviewData.email}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, email: e.target.value })
                  }
                  onClick={playClickSound}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4" />
                Rating <span className="text-gray-500 text-sm">(optional)</span>
              </Label>
              <StarRating
                rating={reviewData.rating || 0}
                onRatingChange={(rating) => {
                  console.log("Rating changed to:", rating);
                  setReviewData({ ...reviewData, rating });
                }}
              />
            </div>

            <div>
              <Label htmlFor="review-message">
                Your Review <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="review-message"
                value={reviewData.message}
                onChange={(e) =>
                  setReviewData({ ...reviewData, message: e.target.value })
                }
                onClick={playClickSound}
                placeholder="What did you think of the portfolio? What stood out to you?"
                className="mt-1 min-h-[120px]"
              />
            </div>

            <Button
              onClick={() => handleSubmit("review")}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#4F8CB8] to-[#326EA0] hover:from-[#5A9BC8] hover:to-[#3D7EB0]"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Review"}
            </Button>
          </TabsContent>

          {/* Bug Reports Tab */}
          <TabsContent value="bugs" className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-2">
                Report Issues & Suggestions
              </h3>
              <p className="text-orange-700 text-sm">
                Found a bug or have a suggestion? Let me know so I can make the
                site better!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bug-name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Your Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bug-name"
                  value={bugData.name}
                  onChange={(e) =>
                    setBugData({ ...bugData, name: e.target.value })
                  }
                  onClick={playClickSound}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bug-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Your Email{" "}
                  <span className="text-gray-500 text-sm">(optional)</span>
                </Label>
                <Input
                  id="bug-email"
                  type="email"
                  value={bugData.email}
                  onChange={(e) =>
                    setBugData({ ...bugData, email: e.target.value })
                  }
                  onClick={playClickSound}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bug-message">
                Bug Report or Suggestion <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bug-message"
                value={bugData.message}
                onChange={(e) =>
                  setBugData({ ...bugData, message: e.target.value })
                }
                onClick={playClickSound}
                placeholder="Describe the bug you found or suggestion you have. Include steps to reproduce if it's a bug."
                className="mt-1 min-h-[120px]"
              />
            </div>

            <Button
              onClick={() => handleSubmit("bug")}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Bug className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Submit Report"}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Status Message */}
        {submitStatus && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              submitStatus.includes("opened") || submitStatus.includes("sent")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {submitStatus}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            Your feedback is sent directly to{" "}
            <strong>samuneeb786@gmail.com</strong>
          </p>
          <p className="mt-1">Thank you for helping me improve! 🚀</p>
        </div>
      </div>
    </div>
  );
}
