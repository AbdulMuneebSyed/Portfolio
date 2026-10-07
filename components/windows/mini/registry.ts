import type React from "react";
import { Game2048 } from "./game-2048";
import { TicTacToe } from "./tic-tac-toe";
import { MemoryGame } from "./memory";
import { Breakout } from "./breakout";
import { WordGuess } from "./word-guess";
import { Simon } from "./simon";
import { TypingTest } from "./typing-test";
import { Pomodoro } from "./pomodoro";
import { Sketch } from "./sketch";
import { Piano } from "./piano";
import { ColorLab } from "./color-lab";
import { JsonFormatter } from "./json-formatter";

// App Store mini-apps by registry id. `preview` renders a still, inert copy
// for product-page screenshots: no timers, sounds or keyboard handling.
export type MiniAppProps = { preview?: boolean };

export const MINI_APPS: Record<string, React.ComponentType<MiniAppProps>> = {
  "game-2048": Game2048,
  "tic-tac-toe": TicTacToe,
  memory: MemoryGame,
  breakout: Breakout,
  "word-guess": WordGuess,
  simon: Simon,
  "typing-test": TypingTest,
  pomodoro: Pomodoro,
  sketch: Sketch,
  piano: Piano,
  "color-lab": ColorLab,
  "json-formatter": JsonFormatter,
};

// Window component names used in the app registry.
export const MINI_APP_COMPONENTS: Record<string, React.ComponentType<MiniAppProps>> = {
  Game2048,
  TicTacToe,
  MemoryGame,
  Breakout,
  WordGuess,
  Simon,
  TypingTest,
  Pomodoro,
  Sketch,
  Piano,
  ColorLab,
  JsonFormatter,
};
