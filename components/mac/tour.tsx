"use client";

import React, { useEffect, useRef } from "react";
import Shepherd from "shepherd.js";
import { getApp } from "@/lib/app-registry";
import "@/styles/shepherd-pixel.css";

interface TourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const TOUR_ICON_IDS = ["about", "projects", "resume", "contact"];

export function Tour({ run, onComplete, onSkip }: TourProps) {
  const tourRef = useRef<any>(null);

  // Helper to determine character image based on content
  const getCharacterImage = (content: string) => {
    if (content.includes("This one’s my resume. Click here")) {
      return "/torch-linkedIn.png";
    }
    if (content.includes("That's the tour")) {
      return "/torch-final.png";
    }
    return "/torch.png";
  };

  // Helper to determine character style (poses)
  const getCharacterStyle = (stepIndex: number) => {
    const poses = [
      "transform: scaleX(1); filter: hue-rotate(0deg);", // Default greeting
      "transform: scaleX(-1); filter: hue-rotate(0deg);", // Looking left
      "transform: scaleX(1) rotate(5deg); filter: hue-rotate(0deg);", // Excited
      "transform: scaleX(-1) rotate(-3deg); filter: hue-rotate(0deg);", // Pointing
      "transform: scaleX(1) scale(1.1); filter: hue-rotate(0deg);", // Big
      "transform: scaleX(-1) rotate(0deg); filter: hue-rotate(0deg);", // Casual
    ];
    return poses[stepIndex % poses.length];
  };

  // Generate the HTML content for a step.
  // The character sits outside the speech panel so the bubble reads cleanly.
  const generateStepContent = (
    text: string,
    index: number,
    isFinal: boolean = false
  ) => {
    const imageSrc = getCharacterImage(text);
    const style = getCharacterStyle(index);

    return `
      <div class="pixel-tour-layout ${isFinal ? "pixel-tour-layout-final" : ""}">
        <div class="pixel-character-container pixel-character-outside" style="${style}">
          <img src="${imageSrc}" class="pixel-character-img" alt="Guide Character" />
        </div>
        <div class="pixel-speech-panel">
          <div class="pixel-step-text">${text}</div>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (!run) {
      if (tourRef.current && tourRef.current.isActive()) {
        tourRef.current.cancel();
      }
      return;
    }

    // If tour is already active, don't restart
    if (tourRef.current && tourRef.current.isActive()) {
      return;
    }

    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        scrollTo: true,
        cancelIcon: {
          enabled: false,
        },
        classes: "pixel-theme",
      },
      useModalOverlay: true,
    });

    const tourSteps: any[] = [];

    // Step 1: Intro
    const introText =
      "Hey there 👋 I’m Muneeb. Looks a bit unusual, right? Don’t worry!! it’s my portfolio site. Let me give you a quick tour!";
    tourSteps.push({
      id: "intro",
      text: generateStepContent(introText, 0),
      buttons: [
        {
          classes: "shepherd-button",
          text: "Skip",
          action: tour.cancel,
        },
        {
          classes: "shepherd-button shepherd-button-primary",
          text: "Next",
          action: tour.next,
        },
      ],
      classes: "pixel-theme",
    });

    // Steps point at the Dock icons that matter to a visitor; the rest are
    // discoverable on their own.
    const tourIcons = TOUR_ICON_IDS.map((id) => ({
      id,
      title: getApp(id)?.title ?? id,
    }));

    tourIcons.forEach((icon, index) => {
      const selector = `[data-dock-id="${icon.id}"]`;
      let content = "";

      switch (icon.id) {
        case "about":
          content =
            "🙋 About Me: my experience at Pulsegen, MathonGO and Capco, plus skills and awards.";
          break;
        case "projects":
          content =
            "🚀 Projects: real work I've shipped, like AiResumate, GetMarks and LaunchPad.";
          break;
        case "contact":
          content =
            "✉️ Contact: send me a message from here and it lands with me directly.";
          break;
        case "resume":
          content =
            "📜 This one’s my resume. Click here to check out my skills, experience, and the stuff I’ve worked on.";
          break;
        default:
          content = `✨ This is the ${icon.title}. Each icon has its own little purpose, so click around and explore.`;
      }

      tourSteps.push({
        id: icon.id,
        attachTo: { element: selector, on: "top" },
        text: generateStepContent(content, index + 1),
        buttons: [
          {
            classes: "shepherd-button",
            text: "Back",
            action: tour.back,
          },
          {
            classes: "shepherd-button",
            text: "Skip",
            action: tour.cancel,
          },
          {
            classes: "shepherd-button shepherd-button-primary",
            text: "Next",
            action: tour.next,
          },
        ],
        classes: "pixel-theme",
      });
    });

    // Final Step
    const finalText =
      "🎉 That's the tour! Everything else in the Dock (Terminal, GitHub, Safari, games in Finder) is yours to explore. Press ⌘K to search anything. If you like what you see, say hi through Contact or LinkedIn. ⚔️✨";
    tourSteps.push({
      id: "final",
      text: generateStepContent(finalText, tourIcons.length + 1, true),
      buttons: [
        {
          classes: "shepherd-button",
          text: "Back",
          action: tour.back,
        },
        {
          classes: "shepherd-button shepherd-button-primary",
          text: "Finish",
          action: tour.complete,
        },
      ],
      classes: "pixel-theme",
    });

    tour.addSteps(tourSteps);

    // Event listeners
    tour.on("complete", onComplete);
    tour.on("cancel", onSkip);

    // Small delay to ensure DOM is ready and animations have settled
    const startTimer = setTimeout(() => {
      console.log("Attempting to start tour...", {
        refExists: !!tourRef.current,
        isActive: tourRef.current?.isActive(),
      });
      if (tourRef.current && !tourRef.current.isActive()) {
        try {
          tour.start();
          console.log("Tour started successfully");
        } catch (error) {
          console.error("Failed to start tour:", error);
        }
      }
    }, 1000);

    tourRef.current = tour;

    return () => {
      clearTimeout(startTimer);
      if (tourRef.current) {
        tourRef.current.cancel();
        tourRef.current = null;
      }
    };
  }, [run, onComplete, onSkip]);

  return null;
}
