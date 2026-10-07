"use client";

import { usePhone } from "@/lib/phone";
import { PhoneTour } from "./phone-tour";
import { PixelTour } from "./pixel-tour";

interface TourProps {
  run: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

// The pixel guide points at Dock icons, so it runs on the Mac desktop; the
// iPhone layout has no Dock and gets the card tour instead.
export function Tour(props: TourProps) {
  const phone = usePhone();
  return phone ? <PhoneTour {...props} /> : <PixelTour {...props} />;
}
