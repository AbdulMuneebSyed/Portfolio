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
import NextImage from "next/image";

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

  // Determine which character image to use based on content
  const getCharacterImage = () => {
    const content = step?.content || "";

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

  return (
    <div
      {...tooltipProps}
      style={{
        position: "relative",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        maxWidth: "320px",
        opacity: 1,
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Pixel Art Speech Bubble */}
      <div
        style={{
          position: "relative",
          backgroundColor: "#f8f4e8",
          border: "4px solid #5a4a3a",
          borderRadius: "0",
          padding: "16px 20px",
          color: "#2d1f14",
          fontFamily: '"Courier New", monospace',
          fontSize: "13px",
          lineHeight: "1.6",
          marginBottom: "12px",
          width: "300px",
          boxShadow: "4px 4px 0px #3a2a1a, 8px 8px 0px rgba(0,0,0,0.2)",
          imageRendering: "pixelated",
          animation: "bubblePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      >
        {/* Pixel art corner decorations */}
        <div
          style={{
            position: "absolute",
            top: "-4px",
            left: "-4px",
            width: "8px",
            height: "8px",
            backgroundColor: "#5a4a3a",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-4px",
            right: "-4px",
            width: "8px",
            height: "8px",
            backgroundColor: "#5a4a3a",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-4px",
            left: "-4px",
            width: "8px",
            height: "8px",
            backgroundColor: "#5a4a3a",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-4px",
            right: "-4px",
            width: "8px",
            height: "8px",
            backgroundColor: "#5a4a3a",
          }}
        />

        {/* Pixel art speech bubble tail */}
        <div
          style={{
            position: "absolute",
            right: "20px",
            bottom: "-16px",
            width: "16px",
            height: "16px",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: "16px",
              height: "4px",
              backgroundColor: "#5a4a3a",
              bottom: "12px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "12px",
              height: "4px",
              backgroundColor: "#5a4a3a",
              bottom: "8px",
              left: "4px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "8px",
              height: "4px",
              backgroundColor: "#5a4a3a",
              bottom: "4px",
              left: "8px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              backgroundColor: "#5a4a3a",
              bottom: "0px",
              left: "12px",
            }}
          />
          {/* Fill */}
          <div
            style={{
              position: "absolute",
              width: "12px",
              height: "4px",
              backgroundColor: "#f8f4e8",
              bottom: "12px",
              left: "2px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "8px",
              height: "4px",
              backgroundColor: "#f8f4e8",
              bottom: "8px",
              left: "6px",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "4px",
              height: "4px",
              backgroundColor: "#f8f4e8",
              bottom: "4px",
              left: "10px",
            }}
          />
        </div>

        {/* Animations */}
        <style>
          {`
            @keyframes bubblePop {
              0% {
                transform: scale(0.8);
                opacity: 0;
              }
              50% {
                transform: scale(1.05);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }
            @keyframes textReveal {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
            @keyframes buttonFloat {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-2px);
              }
            }
          `}
        </style>

        {/* Content with pixel text style */}
        <div
          style={{
            marginBottom: "16px",
            animation: "textReveal 0.5s ease-in 0.2s both",
            textShadow: "1px 1px 0px rgba(255, 255, 255, 0.8)",
            fontWeight: "bold",
            color: "#2d1f14",
          }}
        >
          {step?.content || content || "Welcome to the tour!"}
        </div>

        {/* Button row with pixel styling */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            animation: "textReveal 0.5s ease-in 0.4s both",
          }}
        >
          {backProps && (
            <button
              {...backProps}
              style={{
                backgroundColor: "#d4c4a8",
                border: "3px solid #5a4a3a",
                borderRadius: "0",
                padding: "8px 12px",
                fontSize: "11px",
                cursor: "pointer",
                color: "#2d1f14",
                fontFamily: '"Courier New", monospace',
                fontWeight: "bold",
                boxShadow: "2px 2px 0px #3a2a1a",
                imageRendering: "pixelated",
                transition: "all 0.1s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-1px, -1px)";
                e.currentTarget.style.boxShadow = "3px 3px 0px #3a2a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0, 0)";
                e.currentTarget.style.boxShadow = "2px 2px 0px #3a2a1a";
              }}
            >
              Back
            </button>
          )}

          {skipProps && (
            <button
              {...skipProps}
              style={{
                backgroundColor: "#d4c4a8",
                border: "3px solid #5a4a3a",
                borderRadius: "0",
                padding: "8px 12px",
                fontSize: "11px",
                cursor: "pointer",
                color: "#2d1f14",
                fontFamily: '"Courier New", monospace',
                fontWeight: "bold",
                boxShadow: "2px 2px 0px #3a2a1a",
                imageRendering: "pixelated",
                transition: "all 0.1s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translate(-1px, -1px)";
                e.currentTarget.style.boxShadow = "3px 3px 0px #3a2a1a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translate(0, 0)";
                e.currentTarget.style.boxShadow = "2px 2px 0px #3a2a1a";
              }}
            >
              Skip
            </button>
          )}

          <button
            {...primaryProps}
            style={{
              backgroundColor: "#6b9e3e",
              border: "3px solid #4a6b2a",
              borderRadius: "0",
              padding: "8px 12px",
              fontSize: "11px",
              cursor: "pointer",
              color: "#ffffff",
              fontFamily: '"Courier New", monospace',
              fontWeight: "bold",
              boxShadow: "2px 2px 0px #2a3a1a",
              imageRendering: "pixelated",
              transition: "all 0.1s ease",
              animation: "buttonFloat 2s ease-in-out infinite",
              textShadow: "1px 1px 0px rgba(0,0,0,0.5)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-1px, -1px)";
              e.currentTarget.style.boxShadow = "3px 3px 0px #2a3a1a";
              e.currentTarget.style.animation = "none";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "2px 2px 0px #2a3a1a";
              e.currentTarget.style.animation =
                "buttonFloat 2s ease-in-out infinite";
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Character */}
      <div
        style={{
          width: "48px",
          height: "64px",
          imageRendering: "pixelated",
          ...getCharacterStyle(step?.index || 0),
          transition: "all 0.5s ease-in-out",
          flexShrink: 0,
          alignSelf: "flex-end",
        }}
      >
        <NextImage
          src={getCharacterImage()}
          alt="Guide Character"
          width={48}
          height={64}
          style={{
            imageRendering: "pixelated",
            filter: "drop-shadow(2px 2px 0px #000)",
          }}
        />
      </div>
    </div>
  );
};

export function Windows7Tour({ run, onComplete, onSkip }: Windows7TourProps) {
  const { desktopIcons } = useWindowManager();
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    // Define all the tour steps in a casual, conversational style
    const iconTourSteps: Step[] = [
      {
        target: "body",
        content:
          "Hey there 👋 I’m Muneeb. Looks a bit unusual, right? Don’t worry!! it’s my portfolio site. Let me give you a quick tour!",
        placement: "center",
        disableBeacon: true,
      },
    ];

    desktopIcons.forEach((icon) => {
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
            "🌐 Yep, Internet Explorer! Don’t worry, it’s just for the retro vibes. Inside, you can view my projects.";
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
        default:
          content = `✨ This is the ${icon.title}. Each icon has its own little purpose, so click around and explore.`;
      }

      iconTourSteps.push({
        target: selector,
        content,
        placement: "auto",
      });
    });

    // Final tour step
    iconTourSteps.push({
      target: "body",
      content:
        '🎉 Quest complete, brave explorer! This "MuneebOS 7"  is really my portfolio in disguise. Click icons, drag windows, and uncover my projects. And if you find treasure worth sharing, connect with me on LinkedIn or check my resume. The site is still under heavy development and many interesting things will be added in coming time. May your exploring quests be bug-free! ⚔️✨',
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
      showProgress={false}
      showSkipButton={true}
      steps={steps}
      tooltipComponent={CustomTooltip}
      styles={{
        options: {
          overlayColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 10000,
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          transition: "opacity 0.3s ease-in-out",
        },
        tooltip: {
          padding: 0,
          backgroundColor: "transparent",
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
          transition: "all 0.3s ease-in-out",
        },
        tooltipContainer: {
          padding: 0,
          backgroundColor: "transparent",
          transition: "all 0.3s ease-in-out",
        },
        spotlight: {
          transition: "all 0.3s ease-in-out",
        },
      }}
    />
  );
}
