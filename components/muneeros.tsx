"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "react-spring";
import Image from "next/image";

interface MuneerOSProps {}

interface ProfileCard {
  id: number;
  name: string;
  description: string;
  image: string;
}

const SwipeCard: React.FC<{ card: ProfileCard; onDismiss: () => void }> =
  React.memo(({ card, onDismiss }) => {
    // spring for horizontal translation
    const [{ x }, api] = useSpring(() => ({ x: 0 }));
    // refs to track drag state
    const startXRef = useRef(0);
    const draggingRef = useRef(false);
    const deltaX = useRef(0);

    // on drag start (mouse or touch)
    const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = true;
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      startXRef.current = clientX;
    };
    // on drag move (mouse or touch)
    const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
      if (!draggingRef.current) return;
      const clientX =
        "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const mx = clientX - startXRef.current;
      deltaX.current = mx;
      api.start({ x: mx });
    };
    // on drag end, snap or dismiss
    const handleDragEnd = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const mx = deltaX.current;
      const threshold = 150;
      if (mx > threshold) {
        api.start({ x: 500, onRest: onDismiss });
      } else if (mx < -threshold) {
        api.start({ x: -500, onRest: onDismiss });
      } else {
        api.start({ x: 0 });
      }
    };

    return (
      <animated.div
        className="bg-slate-900/90 h-[75px] w-full backdrop-blur-lg p-1 px-3 flex items-center rounded-lg cursor-pointer select-none will-change-transform"
        style={{
          transform: x.to((xVal: number) => `translateX(${xVal}px)`),
          touchAction: "none",
        }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <Image
          src={card.image}
          alt="Profile"
          width={44}
          height={44}
          className="rounded-full"
          draggable={false}
          priority
        />
        <div className="flex-1">
          <p className="text-white font-medium text-[12px] ml-3">{card.name}</p>
          <p className="text-white/70 text-[10px] ml-3 line-clamp-2">
            {card.description}
          </p>
        </div>
        <div className="text-white/40 text-xs ml-2 select-none">↔</div>
      </animated.div>
    );
  });

// Optimized time display component to prevent re-animations
const TimeDisplay = React.memo(
  ({ time, isInitial }: { time: string; isInitial: boolean }) => (
    <motion.div
      className="text-7xl font-thin mb-2"
      initial={isInitial ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isInitial ? 0.8 : 0 }}
    >
      {time}
    </motion.div>
  )
);

const DateDisplay = React.memo(
  ({ date, isInitial }: { date: string; isInitial: boolean }) => (
    <motion.div
      className="text-xl opacity-80"
      initial={isInitial ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: isInitial ? 0.8 : 0, delay: isInitial ? 0.2 : 0 }}
    >
      {date}
    </motion.div>
  )
);

// Move apps array outside component to prevent re-creation on every render
const APPS = [
  { name: "Chrome", icon: "/chrome.png", id: "chrome" },
  { name: "Contact", icon: "/contactmobile.png", id: "contact" },
  { name: "Camera", icon: "/camera.png", id: "camera" },
  { name: "LinkedIn", icon: "/linkedInmobile.png", id: "linkedin" },
];

// Profile cards data

export function MuneerOS({}: MuneerOSProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [time, setTime] = useState(new Date());
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [dataSpeed, setDataSpeed] = useState(2.3);

  // App state management
  const [openApp, setOpenApp] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string>("");
  const [browserUrl, setBrowserUrl] = useState<string>("about:blank");

  const [visibleCards, setVisibleCards] = useState([
    {
      id: 1,
      name: "Syed Abdul Muneeb",
      description: "SDE intern MathonGo, eXCapco-cs Full Stack Developer",
      image: "/profile.jpg",
    },
    {
      id: 2,
      name: "Software Developer",
      description: "React, Next.js, TypeScript, Node.js Specialist",
      image: "/avatar.jpg",
    },
    {
      id: 3,
      name: "Tech Enthusiast",
      description: "Building innovative solutions with modern technologies",
      image: "/profile.jpg",
    },
  ]);

  // Set initial render to false after first render
  // useEffect(() => {
  //   console.log(177);
  //   const timer = setTimeout(() => {
  //     setIsInitialRender(false);
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, []);

  // Prevent body scrolling when MuneerOS is active
  // useEffect(() => {
  //   // Save original styles
  //   const originalOverflow = document.body.style.overflow;
  //   const originalTouchAction = document.body.style.touchAction;

  //   // Disable scrolling on mount
  //   document.body.style.overflow = "hidden";
  //   document.body.style.touchAction = "none";

  //   // Prevent touch scrolling only when no app is open
  //   const preventTouch = (e: TouchEvent) => {
  //     if (!openApp) {
  //       e.preventDefault();
  //     }
  //   };

  //   document.addEventListener("touchmove", preventTouch, { passive: false });

  //   // Re-enable scrolling on unmount
  //   return () => {
  //     document.body.style.overflow = originalOverflow;
  //     document.body.style.touchAction = originalTouchAction;
  //     document.removeEventListener("touchmove", preventTouch);
  //   };
  // }, [openApp]);

  // Update time every second with useMemo to prevent flickering
  // useEffect(() => {
  //   console.log(213);
  //   const timer = setInterval(() => {
  //     setTime(new Date());
  //   }, 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // Generate live data speed between 0.25 - 5 KB/s
  useEffect(() => {
    console.log(222);
    const generateDataSpeed = () => {
      // Generate random speed between 0.25 and 5
      const min = 0.25;
      const max = 5;
      const speed = Math.random() * (max - min) + min;
      return Math.round(speed * 10) / 10; // Round to 1 decimal place
    };

    const speedTimer = setInterval(() => {
      setDataSpeed(generateDataSpeed());
    }, 200); // Update every 2 seconds

    return () => clearInterval(speedTimer);
  }, []);

  // Memoize time formatting to prevent flickering
  const formattedTime = useMemo(() => {
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [time]);

  const formattedDate = useMemo(() => {
    return time.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }, [time]);

  const currentTimeForStatus = useMemo(() => {
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }, [time]);

  // Handle fingerprint press
  // const handleFingerprintStart = () => {
  //   // Create ripple effect
  //   const fingerprintArea = document.getElementById("fingerprint-area");
  //   if (fingerprintArea) {
  //     const rect = fingerprintArea.getBoundingClientRect();
  //     const centerX = rect.left + rect.width / 2;
  //     const centerY = rect.top + rect.height / 2;

  //     const newRipple = {
  //       id: Date.now(),
  //       x: centerX,
  //       y: centerY,
  //     };

  //     // setRipples((prev) => [...prev, newRipple]);

  //     // Remove ripple after animation
  //     setTimeout(() => {
  //       setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
  //     }, 1000);
  //   }

  //   // Start unlock timer
  //   const timer = setTimeout(() => {
  //     setIsUnlocking(true);
  //     setTimeout(() => {
  //       setIsLocked(false);
  //     }, 800);
  //   }, 1200); // Hold for 1.2 seconds

  //   setPressTimer(timer);
  // };

  // const handleFingerprintEnd = () => {
  //   if (pressTimer) {
  //     clearTimeout(pressTimer);
  //     setPressTimer(null);
  //   }
  //   setIsUnlocking(false);
  // };

  // Handle card swipe to dismiss
  const handleCardDismiss = (cardId: number) => {
    setVisibleCards((prev: ProfileCard[]) =>
      prev.filter((card: ProfileCard) => card.id !== cardId)
    );
  };

  // App handlers
  const handleAppClick = (appId: string) => {
    switch (appId) {
      case "linkedin":
        // Open LinkedIn profile
        window.open("https://www.linkedin.com/in/syed-abdul-muneeb/", "_blank");
        break;
      case "camera":
        setOpenApp("camera");
        requestCameraAccess();
        break;
      case "contact":
        setOpenApp("contact");
        break;
      case "chrome":
        setOpenApp("chrome");
        setBrowserUrl("about:blank");
        break;
      default:
        break;
    }
  };

  const requestCameraAccess = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraError("Camera access denied. Please allow camera permissions.");
    }
  };

  const closeApp = () => {
    setOpenApp(null);
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraError("");
  };

  // Camera Component
  const CameraApp = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
    }, [cameraStream]);

    return (
      <motion.div
        className="fixed inset-0 bg-black z-50 flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Camera Header */}
        <div className="flex justify-between items-center p-4 bg-gray-900">
          <h2 className="text-white text-lg font-semibold">Camera</h2>
          <button
            onClick={closeApp}
            className="text-white p-2 hover:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Camera Content */}
        <div className="flex-1 flex items-center justify-center bg-black">
          {cameraError ? (
            <div className="text-center">
              <p className="text-red-400 mb-4">{cameraError}</p>
              <button
                onClick={requestCameraAccess}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Retry Camera Access
              </button>
            </div>
          ) : cameraStream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="max-w-full max-h-full"
            />
          ) : (
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Requesting camera access...</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Contact Component
  const ContactApp = () => {
    return (
      <motion.div
        className="fixed inset-0 bg-black z-50 flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Contact Header */}
        <div className="flex justify-between items-center p-4 bg-gray-900">
          <h2 className="text-white text-lg font-semibold">Contact</h2>
          <button
            onClick={closeApp}
            className="text-white p-2 hover:bg-gray-700 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* Contact Content */}
        <div
          className="flex-1 bg-gradient-to-br from-blue-900 to-purple-900 p-6 overflow-y-auto"
          style={{ touchAction: "auto" }}
        >
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex justify-center">
              <Image
                src="/profile.jpg"
                alt="Syed Abdul Muneeb"
                width={120}
                height={120}
                className="rounded-full border-4 border-white/20"
              />
            </div>

            {/* Name */}
            <div className="text-center">
              <h3 className="text-white text-2xl font-bold">
                SYED ABDUL MUNEEB
              </h3>
              <p className="text-white/80 text-sm mt-1">
                Software Engineering Student
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  📧
                </div>
                <div>
                  <p className="text-white/60 text-xs">Email</p>
                  <p className="text-white text-sm">samuneeb786@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  📱
                </div>
                <div>
                  <p className="text-white/60 text-xs">Phone</p>
                  <p className="text-white text-sm">+91 9966782707</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  💼
                </div>
                <div>
                  <p className="text-white/60 text-xs">LinkedIn</p>
                  <p className="text-white text-sm">linkedin-syedabdulmuneeb</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  🎓
                </div>
                <div>
                  <p className="text-white/60 text-xs">Education</p>
                  <p className="text-white text-sm">B.E CS (AI&DS) - MJCET</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  💻
                </div>
                <div>
                  <p className="text-white/60 text-xs">Current Role</p>
                  <p className="text-white text-sm">SDE Intern at MathonGO</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => window.open("mailto:samuneeb786@gmail.com")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium"
              >
                Send Email
              </button>
              <button
                onClick={() => window.open("tel:+919966782707")}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium"
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Chrome Browser Component
  const ChromeApp = () => {
    const [currentUrl, setCurrentUrl] = useState(browserUrl);
    const [isLoading, setIsLoading] = useState(false);

    const projects = [
      {
        name: "AIresumate",
        url: "https://airesumate.com/",
        description: "AI-powered resume enhancement platform",
        image: "/ai-chat-interface.png",
      },
      {
        name: "Paighaam Chat App",
        url: "https://paighaam-alpha.vercel.app/",
        description: "Real-time multilingual chat application",
        image: "/task-management-interface.png",
      },
      {
        name: "E-commerce Dashboard",
        url: "https://github.com/AbdulMuneebSyed",
        description: "Modern e-commerce management dashboard",
        image: "/ecommerce-dashboard.png",
      },
      {
        name: "Portfolio Website",
        url: "https://github.com/AbdulMuneebSyed",
        description: "Personal portfolio website showcase",
        image: "/portfolio-website-showcase.png",
      },
    ];

    const handleNavigate = (url: string) => {
      setIsLoading(true);
      setCurrentUrl(url);
      setBrowserUrl(url);
      setTimeout(() => setIsLoading(false), 1000);
    };

    // Wheel/touch fallback (in rare cases touch-action ancestry blocks default)
    // const scrollRef = useRef<HTMLDivElement | null>(null);
    // const handleWheel = (e: React.WheelEvent) => {
    //   if (!scrollRef.current) return;
    //   // Only manually scroll if browser didn't already (deltaY != 0 is typical)
    //   scrollRef.current.scrollTop += e.deltaY;
    // };

    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-gray-100 z-[1000] flex flex-col min-h-0"
          // initial={{ opacity: 0.4 }}
          // animate={{ opacity: 1 }}
          // transition={{ duration: 0.25 }}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="bg-gray-200 border-b border-gray-300 flex-shrink-0">
            <div className="flex items-center px-2 py-1">
              <div className="bg-white rounded-t-lg px-4 py-2 mr-2 flex items-center space-x-2 min-w-[200px]">
                <Image src="/chrome.png" alt="Chrome" width={16} height={16} />
                <span className="text-sm text-gray-700 truncate">
                  {currentUrl === "about:blank"
                    ? "New Tab"
                    : "Project Showcase"}
                </span>
                <button
                  onClick={closeApp}
                  className="text-gray-400 hover:text-gray-600 ml-auto"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="px-4 py-2 bg-white border-t border-gray-300">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNavigate("about:blank")}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  🏠
                </button>
                <div className="flex-1 bg-gray-50 border border-gray-300 rounded-full px-4 py-2 flex items-center">
                  <span className="text-sm text-gray-600 truncate">
                    {currentUrl === "about:blank"
                      ? "chrome://newtab"
                      : currentUrl}
                  </span>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded">⋮</button>
              </div>
            </div>
          </div>

          <div
            // ref={scrollRef}
            className="flex-1 overflow-y-auto min-h-0 will-change-scroll"
            style={{
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
            }}
            // onWheel={handleWheel}
          >
            {currentUrl === "about:blank" ? (
              <div className="bg-white p-8 min-h-full">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    My Projects
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, index) => (
                      <motion.div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleNavigate(project.url)}
                      >
                        <div className="aspect-video bg-gray-100 relative">
                          <Image
                            src={project.image}
                            alt={project.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {project.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative min-h-full">
                {isLoading && (
                  <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <iframe
                  src={currentUrl}
                  className="w-full h-full border-0"
                  title="Project Preview"
                  onLoad={() => setIsLoading(false)}
                  style={{ touchAction: "auto" }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Lockscreen Component
  const LockScreen = () => (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "100dvh", // Use dynamic viewport height for mobile
        backgroundImage: `url('/nothing-wallpaper.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#000",
      }}
    >
      <div className="flex flex-col justify-between h-full">
        {/* Top Status */}
        <div className="flex justify-between items-center p-6 pt-2 text-white">
          <div className="flex items-center space-x-2">
            {/* Signal bars */}
            <span className="text-sm font-medium">{currentTimeForStatus}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-medium">{dataSpeed}</span>
              <span className="text-[6px]">KB/s</span>
            </div>
            <span className="text-sm">98%</span>
            <div className="w-6 h-3 border border-white flex justify-start items-center rounded-sm">
              <div className="w-4 h-2 bg-white rounded-sm m-[1px]" />
            </div>
          </div>
        </div>

        {/* Time and Date */}
        <div className="flex-1 flex flex-col justify-start items-start text-white px-3">
          <div className="grid grid-cols-3 gap-3 w-full ">
            <div className="col-span-2 bg-black/90 backdrop-blur-lg px-6 py-4 rounded-2xl text-center">
              <TimeDisplay
                time={formattedTime}
                isInitial={isInitialRender && isLocked}
              />
              <DateDisplay
                date={formattedDate}
                isInitial={isInitialRender && isLocked}
              />
            </div>
            <div className="bg-black/90 backdrop-blur-lg p-1 flex justify-center items-center rounded-lg">
              <Image
                src="/avatar.jpg"
                alt="Muneer"
                width={100}
                height={100}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="mt-6 w-full space-y-3">
            <AnimatePresence>
              {visibleCards.map((card: ProfileCard) => (
                <SwipeCard
                  key={card.id}
                  card={card}
                  onDismiss={() => handleCardDismiss(card.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Fingerprint Area */}
        <div className="pb-20 flex justify-center">
          <div className="relative">
            <motion.div
              id="fingerprint-area"
              className={`w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center cursor-pointer transition-all duration-300 ${
                isUnlocking
                  ? "border-green-400 bg-green-400/20"
                  : "hover:border-white/50"
              }`}
              // onTouchStart={handleFingerprintStart}
              // onTouchEnd={handleFingerprintEnd}
              // onMouseDown={handleFingerprintStart}
              // onMouseUp={handleFingerprintEnd}
              // onMouseLeave={handleFingerprintEnd}
              whileTap={{ scale: 0.95 }}
              animate={
                isUnlocking
                  ? {
                      borderColor: "#4ade80",
                      backgroundColor: "rgba(74, 222, 128)",
                      scale: 1.1,
                    }
                  : {}
              }
            >
              {/* Fingerprint Icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className={`transition-colors duration-300 ${
                  isUnlocking ? "text-green-400" : "text-white/70"
                }`}
              >
                <path
                  d="M12 2C9.79 2 8 3.79 8 6v4c0 1.1-.9 2-2 2s-2-.9-2-2V6c0-3.31 2.69-6 6-6s6 2.69 6 6v4c0 1.1-.9 2-2 2s-2-.9-2-2V6c0-1.1-.9-2-2-2z"
                  fill="currentColor"
                />
                <path
                  d="M12 14c-1.1 0-2-.9-2-2V6c0-.55.45-1 1-1s1 .45 1 1v6c0 .55.45 1 1 1s1-.45 1-1V6c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 2.21 1.79 4 4 4s4-1.79 4-4v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 1.1-.9 2-2 2z"
                  fill="currentColor"
                />
              </svg>
            </motion.div>

            {/* Ripple Effects */}
            <AnimatePresence>
              {ripples.map((ripple) => (
                <motion.div
                  key={ripple.id}
                  className="absolute w-32 h-32 border border-white/20 rounded-full pointer-events-none"
                  style={{
                    left: "50%",
                    top: "50%",
                    marginLeft: "-64px",
                    marginTop: "-64px",
                  }}
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <motion.p
            className="text-white text-sm"
            // animate={{ opacity: [0.6, 1, 0.6] }}
            // transition={{ duration: 2, repeat: 0 }}
          >
            Hold to unlock
          </motion.p>
        </div>
      </div>
    </div>
  );

  // Home Screen Component
  const HomeScreen = () => {
    return (
      <div
        className="relative w-full overflow-hidden"
        style={{
          height: "100dvh", // Use dynamic viewport height for mobile
          backgroundImage: `url('/nothing-wallpaper.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#000",
        }}
      >
        {/* Top Status Bar */}
        <div className="flex justify-between items-center p-6 pt-2 text-white">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{currentTimeForStatus}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-medium">{dataSpeed}</span>
              <span className="text-[6px]">KB/s</span>
            </div>
            <span className="text-sm">98%</span>
            <div className="w-6 h-3 border border-white flex justify-start items-center rounded-sm">
              <div className="w-4 h-2 bg-white rounded-sm m-[1px]" />
            </div>
          </div>
        </div>

        {/* Dock at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center sm:w-full mx-auto">
          <motion.div className="rounded-2xl px-6 py-2 flex justify-center items-center space-x-6">
            {APPS.map((app) => (
              <motion.div
                key={app.id}
                className="flex flex-col items-center cursor-pointer"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => handleAppClick(app.id)}
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-1">
                  <Image
                    src={app.icon}
                    alt={app.name}
                    width={64}
                    height={64}
                    className={`rounded-lg ${
                      app.name === "Contact" ? "!size-[64px]" : ""
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    );
  };

  // Notification Panel Component
  const NotificationPanel = () => (
    <motion.div
      className="absolute top-0 left-0 right-0 bg-black/90 backdrop-blur-xl text-white z-50"
      initial={{ y: "-100%" }}
      animate={{ y: notificationPanelOpen ? 0 : "-100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      style={{ height: "60vh" }}
    >
      <div className="p-6 pt-12">
        {/* Quick Settings */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {["WiFi", "Data", "Bluetooth", "Hotspot"].map((setting) => (
            <motion.button
              key={setting}
              className="bg-white/100 rounded-2xl p-4 text-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-sm font-medium">{setting}</div>
            </motion.button>
          ))}
        </div>

        {/* Brightness Control */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Brightness</span>
            <span className="text-sm opacity-70">80%</span>
          </div>
          <div className="w-full h-2 bg-white/20 rounded-full">
            <div className="w-4/5 h-2 bg-white rounded-full" />
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <div className="text-sm font-medium mb-2">Notifications</div>
          <div className="bg-white/100 rounded-2xl p-4">
            <div className="text-sm font-medium">No new notifications</div>
          </div>
        </div>

        {/* Close gesture area */}
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-white/50 rounded-full cursor-pointer"
          onClick={() => setNotificationPanelOpen(false)}
        />
      </div>
    </motion.div>
  );

  return (
    <div
      className="fixed inset-0 w-full bg-black overflow-hidden"
      style={{
        height: "100dvh",
        width: "100vw",
        overscrollBehavior: "none",
        touchAction: openApp ? "auto" : "none", // Allow touch in apps, prevent on OS
      }}
    >
      <AnimatePresence>
        {isLocked ? (
          <motion.div
            key="lockscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <LockScreen />
          </motion.div>
        ) : (
          <motion.div
            key="homescreen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HomeScreen />
            <NotificationPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Overlays */}
      <AnimatePresence>
        {openApp === "camera" && <CameraApp />}
        {openApp === "contact" && <ContactApp />}
        {openApp === "chrome" && <ChromeApp />}
      </AnimatePresence>
    </div>
  );
}
