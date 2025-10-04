"use client";

/**
 * This file is used to patch React Joyride for React 18 compatibility
 * by monkey-patching the react-dom import in the library at runtime.
 */
import React from "react";
import { createRoot, type Root } from "react-dom/client";

// Create a type for the ReactDOM we're patching
interface ReactDOMPatched {
  unmountComponentAtNode?: (container: Element | DocumentFragment) => boolean;
  render?: (
    element: React.ReactNode,
    container: Element | DocumentFragment
  ) => void;
  [key: string]: any;
}

// Track root instances for each container
const rootsMap = new Map<Element | DocumentFragment, Root>();

// Setup function to apply the patches
export function setupReactJoyrideCompatibility() {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  try {
    // Get the actual ReactDOM that might be used by the library
    const ReactDOM: ReactDOMPatched = require("react-dom");

    // Add the unmountComponentAtNode function if it doesn't exist
    if (!ReactDOM.unmountComponentAtNode) {
      console.log(
        "Patching ReactDOM.unmountComponentAtNode for React Joyride compatibility"
      );

      ReactDOM.unmountComponentAtNode = function (
        container: Element | DocumentFragment
      ): boolean {
        if (rootsMap.has(container)) {
          const root = rootsMap.get(container)!;
          root.unmount();
          rootsMap.delete(container);
          return true;
        }
        return false;
      };
    }

    // Create a patched render function
    if (!ReactDOM.render) {
      console.log("Patching ReactDOM.render for React Joyride compatibility");

      ReactDOM.render = function (
        element: React.ReactNode,
        container: Element | DocumentFragment
      ): void {
        if (!rootsMap.has(container)) {
          rootsMap.set(container, createRoot(container));
        }

        const root = rootsMap.get(container)!;
        root.render(element);
      };
    }

    console.log("React Joyride compatibility layer initialized");
  } catch (error) {
    console.error("Failed to patch ReactDOM for React Joyride:", error);
  }
}
