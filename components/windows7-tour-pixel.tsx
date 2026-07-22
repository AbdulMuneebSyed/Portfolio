"use client";

import React, { useEffect, useRef } from "react";
import Shepherd from "shepherd.js";
import { useWindowManager } from "@/lib/window-manager";
import "@/styles/shepherd-pixel.css";

interface Windows7TourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function Windows7Tour({ run, onComplete, onSkip }: Windows7TourProps) {
  const { desktopIcons } = useWindowManager();
  const tourRef = useRef<any>(null);

  // Helper to determine character image based on content
  const getCharacterImage = (content: string) => {
    if (
      content.includes("That’s my LinkedIn profile") ||
      content.includes("This one’s my resume. Click here")
    ) {
      return "/torch-linkedIn.png";
    } else if (
      content.includes("Quest complete") ||
      content.includes("coding quests be bug-free")
    ) {
      return "/torch-final.png";
    } else if (content.includes("This is the Recycle Bin. Sometimes")) {
      return "/torch-bin.png";
    } else if (content.includes("bug reports, or just thoughts")) {
      return "/torch-bugs.png";
    } else {
      return "/torch.png";
    }
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

    // Steps for icons
    desktopIcons.forEach((icon, index) => {
      const selector = `[data-icon-id="${icon.id}"]`;
      let content = "";

      switch (icon.id) {
        case "computer":
          content =
            "🗂️ This is *This PC*.Does what a normal 'this PC' does. Listen music,play games and much more to come";
          break;
        case "resume":
          content =
            "📜 This one’s my resume. Click here to check out my skills, experience, and the stuff I’ve worked on.";
          break;
        case "linkedin":
          content =
            "🔗 That’s my LinkedIn profile. If you want to connect professionally, this is the spot.";
          break;
        case "feedback":
          content =
            "💌 Got feedback? Whether it’s suggestions, bug reports, or just thoughts, drop them here. It really helps me improve!";
          break;
        case "ie":
          content =
            "🌐 Yep, Internet Explorer! Don’t worry, it’s just for the retro vibes. Inside, you can see all my projects in one place.";
          break;
        case "settings":
          content =
            "⚙️ Want to customize the vibe? Wallpapers, transparency, effects etc, you can tweak them all here.";
          break;
        case "recycle":
          content =
            "🗑️ This is the Recycle Bin. Sometimes I dump experiments here. Not much to see, but hey, it’s part of the desktop feel.";
          break;
        case "games":
          content =
            "🎮 And here’s the fun part,games and interactive demos. Because coding doesn’t always have to be serious.";
          break;
        case "notepad":
          content =
            "📝 Need to jot down something? Notepad is here. Simple, classic, and gets the job done.";
          break;
        case "calculator":
          content =
            "🧮 A fully functional Calculator. Math is hard, so let this handle the numbers for you.";
          break;
        case "music":
          content =
            "🎵 Tunes for the vibe. Play some music while you browse around.";
          break;
        case "minesweeper":
          content =
            "💣 Watch your step! The classic Minesweeper game. Try not to blow up!";
          break;
        case "snake":
          content =
            "🐍 Hiss... The legendary Snake game. Eat apples, get long, don't hit the wall!";
          break;
        default:
          content = `✨ This is the ${icon.title}. Each icon has its own little purpose, so click around and explore.`;
      }

      tourSteps.push({
        id: icon.id,
        attachTo: { element: selector, on: "auto" },
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
      '🎉 Quest complete, brave explorer! This "MuneebOS 7"  is really my portfolio in disguise. Click icons, drag windows, and uncover my projects. And if you find treasure worth sharing, connect with me on LinkedIn or check my resume. The site is still under heavy development and many interesting things will be added in coming time. May your exploring quests be bug-free! ⚔️✨';

    tourSteps.push({
      id: "final",
      text: generateStepContent(finalText, desktopIcons.length + 1, true),
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
  }, [run, desktopIcons, onComplete, onSkip]);

  return null;
}
