"use client";

import { useState } from "react";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [replace, setReplace] = useState(false);
  const clear = () => {
    setDisplay("0");
    setStored(null);
    setOperation(null);
    setReplace(false);
  };
  const input = (value: string) => {
    if (/^\d$/.test(value)) {
      setDisplay(
        replace || display === "0" || display === "Error"
          ? value
          : display.length < 14
            ? display + value
            : display,
      );
      setReplace(false);
    } else if (value === ".") {
      if (replace || display === "Error") {
        setDisplay("0.");
        setReplace(false);
      } else if (!display.includes(".")) setDisplay(display + ".");
    } else if (value === "AC") clear();
    else if (value === "±") setDisplay(String(-Number(display)));
    else if (value === "%") setDisplay(String(Number(display) / 100));
    else {
      let result = Number(display);
      if (stored !== null && operation && !replace) {
        result =
          operation === "+"
            ? stored + result
            : operation === "−"
              ? stored - result
              : operation === "×"
                ? stored * result
                : stored / result;
        if (!Number.isFinite(result)) {
          setDisplay("Error");
          setStored(null);
          setOperation(null);
          setReplace(true);
          return;
        }
        setDisplay(String(Number(result.toPrecision(12))));
      }
      setStored(value === "=" ? null : result);
      setOperation(value === "=" ? null : value);
      setReplace(true);
    }
  };
  const keys = [
    "AC",
    "±",
    "%",
    "÷",
    "7",
    "8",
    "9",
    "×",
    "4",
    "5",
    "6",
    "−",
    "1",
    "2",
    "3",
    "+",
    "0",
    ".",
    "=",
  ];
  return (
    <div
      className="calculator-app"
      tabIndex={0}
      aria-label="Calculator keypad"
      onKeyDown={(e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const aliases: Record<string, string> = {
          Enter: "=",
          Escape: "AC",
          "*": "×",
          "/": "÷",
          "-": "−",
        };
        const key = aliases[e.key] ?? e.key;
        if (keys.includes(key)) {
          e.preventDefault();
          input(key);
        } else if (e.key === "Backspace") {
          e.preventDefault();
          setDisplay(display.slice(0, -1) || "0");
        }
      }}
    >
      <div className="calculator-display">
        <small>
          {stored !== null && operation ? `${stored} ${operation}` : "\u00a0"}
        </small>
        <output aria-live="polite">{display}</output>
      </div>
      <div className="calculator-keys">
        {keys.map((key) => (
          <button
            key={key}
            className={`${["÷", "×", "−", "+", "="].includes(key) ? "operator" : ["AC", "±", "%"].includes(key) ? "utility" : ""} ${key === "0" ? "zero" : ""}`}
            aria-pressed={operation === key}
            onClick={() => input(key)}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}
