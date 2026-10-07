"use client";

import { useEffect, useState } from "react";
import { PhoneTour } from "./phone-tour";
import { PixelTour } from "./pixel-tour";

// Same breakpoint as the iPhone layout in globals.css.
const PHONE_QUERY =
  "(max-width: 699px), (max-width: 950px) and (max-height: 500px)";

interface TourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

// The pixel guide points at Dock icons, so it runs on the Mac desktop; the
// iPhone layout has no Dock and gets the card tour instead.
export function Tour(props: TourProps) {
  const [phone, setPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const query = matchMedia(PHONE_QUERY);
    const update = () => setPhone(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (phone === null) return null;
  return phone ? <PhoneTour {...props} /> : <PixelTour {...props} />;
}
