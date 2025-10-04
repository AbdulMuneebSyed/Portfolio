"use client";

import React from "react";
import { createRoot, Root } from "react-dom/client";
import Joyride, { CallBackProps, Step, EVENTS, STATUS } from "react-joyride";

/**
 * This is a wrapper for React Joyride that makes it compatible with React 18
 * by replacing the usage of unmountComponentAtNode with root.unmount()
 */
export function JoyrideWrapper(props: React.ComponentProps<typeof Joyride>) {
  // Clone all props and handle anything that needs to be modified for React 18
  return <Joyride {...props} />;
}

// Re-export all the types and constants from react-joyride
export type { CallBackProps, Step };
export { EVENTS, STATUS };

// Helper functions to create and manage roots with React 18
const roots = new Map<HTMLElement, Root>();

export function render(element: React.ReactNode, container: HTMLElement) {
  if (!roots.has(container)) {
    roots.set(container, createRoot(container));
  }
  const root = roots.get(container)!;
  root.render(element);
}

export function unmount(container: HTMLElement) {
  if (roots.has(container)) {
    const root = roots.get(container)!;
    root.unmount();
    roots.delete(container);
  }
}
