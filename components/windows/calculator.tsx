"use client";

import { useState } from "react";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    console.log(
      "Input digit:",
      digit,
      "Current display:",
      display,
      "Waiting for operand:",
      waitingForOperand
    );
    if (waitingForOperand) {
      console.log("Setting display to:", digit);
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      const newDisplay = display === "0" ? digit : display + digit;
      console.log("Setting display to:", newDisplay);
      setDisplay(newDisplay);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setDisplay("0");
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(String(inputValue));
    } else if (operation) {
      const currentValue = parseFloat(previousValue);
      let newValue = currentValue;

      switch (operation) {
        case "+":
          newValue = currentValue + inputValue;
          break;
        case "-":
          newValue = currentValue - inputValue;
          break;
        case "×":
          newValue = currentValue * inputValue;
          break;
        case "÷":
          newValue = currentValue / inputValue;
          break;
        case "%":
          newValue = currentValue % inputValue;
          break;
        default:
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const toggleSign = () => {
    const newValue = parseFloat(display) * -1;
    setDisplay(String(newValue));
  };

  const calculatePercentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(String(value));
  };

  const calculateSquareRoot = () => {
    const value = Math.sqrt(parseFloat(display));
    setDisplay(String(value));
  };

  const calculate = () => {
    if (operation && previousValue !== null) {
      performOperation("=");
      setOperation(null);
      setPreviousValue(null);
      setWaitingForOperand(true);
    }
  };

  const Button = ({
    children,
    onClick,
    className = "",
    variant = "default",
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    variant?: "default" | "operator" | "equals" | "clear";
  }) => {
    const baseClasses =
      "h-12 rounded border border-gray-400 font-semibold text-sm cursor-pointer";
    const variantClasses = {
      default: "bg-white hover:bg-gray-50 text-gray-900",
      operator: "bg-blue-100 hover:bg-blue-200 text-blue-900",
      equals: "bg-blue-500 hover:bg-blue-600 text-white",
      clear: "bg-red-100 hover:bg-red-200 text-red-900",
    };

    const handleClick = (e: React.MouseEvent) => {
      console.log("Button clicked:", children);
      e.stopPropagation();
      onClick();
    };

    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        type="button"
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      {/* Menu Bar */}
      <div className="mb-3 text-xs text-gray-600 flex gap-4 px-1">
        <span className="hover:text-blue-600 cursor-pointer">View</span>
        <span className="hover:text-blue-600 cursor-pointer">Edit</span>
        <span className="hover:text-blue-600 cursor-pointer">Help</span>
      </div>

      {/* Display */}
      <div className="bg-white border-2 border-gray-300 rounded-sm mb-4 p-3 shadow-inner">
        <div className="text-right">
          <div className="text-xs text-gray-500 h-4">
            {previousValue && operation
              ? `${previousValue} ${operation}`
              : "\u00A0"}
          </div>
          <div className="text-3xl font-bold text-gray-900 truncate">
            {display}
          </div>
        </div>
      </div>

      {/* Memory and Clear Buttons */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        <button
          onClick={clearEntry}
          style={{
            background: "lightcoral",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          CE
        </button>
        <button
          onClick={clear}
          style={{
            background: "lightcoral",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          C
        </button>
        <button
          onClick={() => setDisplay(display.slice(0, -1) || "0")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          ⌫
        </button>
        <button
          onClick={toggleSign}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          ±
        </button>
        <button
          onClick={calculateSquareRoot}
          style={{
            background: "lightblue",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          √
        </button>
      </div>

      {/* Number Pad and Operations */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {/* Row 1 */}
        <button
          onClick={() => inputDigit("7")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          7
        </button>
        <button
          onClick={() => inputDigit("8")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          8
        </button>
        <button
          onClick={() => inputDigit("9")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          9
        </button>
        <button
          onClick={() => performOperation("÷")}
          style={{
            background: "lightblue",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputDigit("4")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          4
        </button>
        <button
          onClick={() => inputDigit("5")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          5
        </button>
        <button
          onClick={() => inputDigit("6")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          6
        </button>
        <button
          onClick={() => performOperation("×")}
          style={{
            background: "lightblue",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputDigit("1")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          1
        </button>
        <button
          onClick={() => inputDigit("2")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          2
        </button>
        <button
          onClick={() => inputDigit("3")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          3
        </button>
        <button
          onClick={() => performOperation("-")}
          style={{
            background: "lightblue",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputDigit("0")}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
            gridColumn: "span 2",
          }}
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          style={{
            background: "white",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          .
        </button>
        <button
          onClick={() => performOperation("+")}
          style={{
            background: "lightblue",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          +
        </button>

        {/* Row 5 - Equals */}
        <button
          onClick={calculatePercentage}
          style={{
            background: "lightblue",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
            gridColumn: "span 3",
          }}
        >
          %
        </button>
        <button
          onClick={calculate}
          style={{
            background: "orange",
            padding: "10px",
            border: "1px solid gray",
            borderRadius: "4px",
          }}
        >
          =
        </button>
      </div>

      {/* Status Bar */}
      <div className="mt-3 pt-2 border-t border-gray-300 text-xs text-gray-600">
        Windows Calculator
      </div>
    </div>
  );
}
