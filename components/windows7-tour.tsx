"use client";

import React, { useState, useEffect } from "react";
import {
  JoyrideWrapper as Joyride,
  CallBackProps,
  Step,
  EVENTS,
  STATUS,
} from "@/lib/joyride-patch";
import { useWindowManager } from "@/lib/window-manager";
import Image from "next/image";

interface Windows7TourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

// Custom Tooltip Component with Pixel Character
const CustomTooltip = ({
  content,
  primaryProps,
  tooltipProps,
  backProps,
  skipProps,
  step,
}: any) => {
  // Different character expressions/poses for different steps
  const getCharacterStyle = (stepIndex: number) => {
    const poses = [
      { transform: "scaleX(1)", filter: "hue-rotate(0deg)" }, // Default greeting
      { transform: "scaleX(-1)", filter: "hue-rotate(20deg)" }, // Looking left
      { transform: "scaleX(1) rotate(5deg)", filter: "hue-rotate(40deg)" }, // Excited
      { transform: "scaleX(-1) rotate(-3deg)", filter: "hue-rotate(60deg)" }, // Pointing
      { transform: "scaleX(1) scale(1.1)", filter: "hue-rotate(80deg)" }, // Big
      { transform: "scaleX(-1) rotate(2deg)", filter: "hue-rotate(100deg)" }, // Casual
    ];
    return poses[stepIndex % poses.length];
  };

  return (
    <div
      {...tooltipProps}
      className="pixel-tooltip"
      style={{
        backgroundColor: "#2d1b47",
        border: "4px solid #4a3564",
        borderRadius: "0px",
        boxShadow: "8px 8px 0px #1a0f2e, inset 2px 2px 0px #6b4d7a",
        padding: "16px",
        maxWidth: "300px",
        fontFamily: "'Courier New', monospace",
        fontSize: "12px",
        imageRendering: "pixelated",
        position: "relative",
      }}
    >
      {/* Pixel Border Effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(90deg, #6b4d7a 2px, transparent 2px),
            linear-gradient(180deg, #6b4d7a 2px, transparent 2px)
          `,
          backgroundSize: "8px 8px",
          opacity: 0.3,
        }}
      />

      {/* Character and Speech Bubble */}
      <div className="flex items-start gap-3 relative z-10">
        {/* Pixel Character */}
        <div className="flex-shrink-0 relative">
          <div
            className="character-container"
            style={{
              width: "48px",
              height: "64px",
              imageRendering: "pixelated",
              ...getCharacterStyle(step?.index || 0),
              transition: "all 0.5s ease-in-out",
            }}
          >
            <Image
              src="/torch.png"
              alt="Guide Character"
              width={48}
              height={64}
              style={{
                imageRendering: "pixelated",
                filter: "drop-shadow(2px 2px 0px #1a0f2e)",
              }}
              className="pixel-char"
            />
          </div>

          {/* Speech Bubble Tail */}
          <div
            className="absolute -right-1 top-4"
            style={{
              width: "0",
              height: "0",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
              borderLeft: "12px solid #f4e4bc",
            }}
          />
        </div>

        {/* Speech Bubble Content */}
        <div
          className="flex-1 relative"
          style={{
            backgroundColor: "#f4e4bc",
            border: "3px solid #8b6914",
            padding: "12px",
            color: "#2d1b47",
            lineHeight: "1.4",
            fontWeight: "bold",
            textShadow: "1px 1px 0px #fff",
          }}
        >
          {content}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-3 pt-2 border-t-2 border-dashed border-[#8b6914]">
            <div className="flex gap-2">
              {backProps && (
                <button
                  {...backProps}
                  className="pixel-btn pixel-btn-secondary"
                  style={{
                    backgroundColor: "#7c3f3f",
                    border: "2px solid #5a2d2d",
                    color: "#fff",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontFamily: "'Courier New', monospace",
                    fontWeight: "bold",
                    cursor: "pointer",
                    textShadow: "1px 1px 0px #2d1515",
                    boxShadow: "2px 2px 0px #2d1515",
                  }}
                >
                  ← Back
                </button>
              )}

              {skipProps && (
                <button
                  {...skipProps}
                  className="pixel-btn pixel-btn-skip"
                  style={{
                    backgroundColor: "#6b6b6b",
                    border: "2px solid #4a4a4a",
                    color: "#fff",
                    padding: "4px 8px",
                    fontSize: "10px",
                    fontFamily: "'Courier New', monospace",
                    fontWeight: "bold",
                    cursor: "pointer",
                    textShadow: "1px 1px 0px #2a2a2a",
                    boxShadow: "2px 2px 0px #2a2a2a",
                  }}
                >
                  Skip
                </button>
              )}
            </div>

            <button
              {...primaryProps}
              className="pixel-btn pixel-btn-primary"
              style={{
                backgroundColor: "#4a7c59",
                border: "2px solid #2d5a3f",
                color: "#fff",
                padding: "6px 12px",
                fontSize: "11px",
                fontFamily: "'Courier New', monospace",
                fontWeight: "bold",
                cursor: "pointer",
                textShadow: "1px 1px 0px #1a3326",
                boxShadow: "3px 3px 0px #1a3326",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Decorative pixels */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#6b4d7a]" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#6b4d7a]" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#6b4d7a]" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#6b4d7a]" />
    </div>
  );
};

export function Windows7Tour({ run, onComplete, onSkip }: Windows7TourProps) {
  const { desktopIcons } = useWindowManager();
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    // Define all the tour steps with pixel character personality
    const iconTourSteps: Step[] = [
      {
        target: "body",
        content:
          "Greetings, fellow adventurer! ⚔️ I'm your pixelated guide through Syed's digital realm. This Windows 7 interface is actually a clever disguise for his developer portfolio. Ready to explore?",
        placement: "center",
        disableBeacon: true,
      },
    ];

    // Add steps for each desktop icon with character personality
    desktopIcons.forEach((icon) => {
      const selector = `[data-icon-id="${icon.id}"]`;
      let content = "";

      // Custom content for each icon with pixel character personality
      switch (icon.id) {
        case "computer":
          content =
            "🗂️ Behold, the 'This PC' treasure chest! Inside you'll discover Syed's projects organized like folders in a mystical file explorer. Each folder contains real working demos!";
          break;
        case "resume":
          content =
            "📜 Ah, the sacred scroll of accomplishments! Click here to unveil Syed's resume in a retro-styled window. Experience points, skill trees, and epic achievements await!";
          break;
        case "linkedin":
          content =
            "🔗 This magic portal opens directly to Syed's LinkedIn realm! A gateway to the professional networking dimension. *Whoosh!*";
          break;
        case "feedback":
          content =
            "💌 The communication crystal! Here you can send messages, report bugs, or share reviews. Your feedback helps level up this portfolio experience!";
          break;
        case "ie":
          content =
            "🌐 The legendary Internet Explorer shrine! This themed window is actually a launcher for Syed's projects. A nostalgic doorway to digital adventures!";
          break;
        case "settings":
          content =
            "⚙️ The customization forge! Here you can craft your own experience. Change wallpapers, transparency, and magical effects to your heart's content!";
          break;
        case "recycle":
          content =
            "🗑️ The recycling sanctuary! Currently resting, but sometimes Syed drops experimental artifacts here. A place for digital composting!";
          break;
        default:
          content = `This '${icon.title}' shortcut is part of the interactive portfolio. Open it to explore its content.`;
      }

      iconTourSteps.push({
        target: selector,
        content,
        disableBeacon: true,
      });
    });

    // Final step
    iconTourSteps.push({
      target: "body",
      content:
        "That's the quick tour. This isn't an OS simulator — it's my portfolio disguised in nostalgia. Open anything, drag windows around, explore projects, and if something stands out, reach out via Resume or LinkedIn. Enjoy!",
      placement: "center",
      disableBeacon: true,
    });

    setSteps(iconTourSteps);
  }, [desktopIcons]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED) {
      onComplete();
    } else if (status === STATUS.SKIPPED) {
      onSkip();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          // Windows 7 inspired styling
          backgroundColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          primaryColor: "#0078D7",
          textColor: "#000",
          width: 320,
          zIndex: 10000,
        },
        tooltip: {
          fontSize: "14px",
          backgroundColor: "#ffffff",
          color: "#000000",
        },
        tooltipContainer: {
          padding: "15px",
          boxShadow:
            "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
          borderRadius: "5px",
          background: "linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)",
          border: "1px solid #d9d9d9",
        },
        buttonNext: {
          backgroundColor: "#0078D7",
          color: "#fff",
        },
        buttonBack: {
          color: "#0078D7",
        },
        buttonSkip: {
          color: "#666",
        },
      }}
    />
  );
}
