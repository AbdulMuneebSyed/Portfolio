// Word Guess: five-letter words developers use, and Wordle-style scoring.
export const WORDS = [
  "REACT", "REDIS", "MONGO", "ARRAY", "CLASS", "ASYNC", "AWAIT", "BYTES",
  "CACHE", "DEBUG", "FETCH", "GRAPH", "LINUX", "MERGE", "QUERY", "QUEUE",
  "PARSE", "PROPS", "STACK", "STATE", "TUPLE", "PIXEL", "ROUTE", "SHELL",
  "TOKEN", "TYPES", "LOGIC", "PATCH", "BUILD", "CLONE", "SCOPE", "SLICE",
  "SPAWN", "STYLE", "FLOAT", "FRAME", "HOOKS", "INDEX", "LAYER", "MACRO",
  "MUTEX", "NODES", "PROXY", "REGEX", "SWIFT", "TABLE", "THROW", "TRAIT",
  "VALUE", "WHILE", "YIELD", "CRASH", "ERROR", "LOOPS",
];

export type Mark = "correct" | "present" | "absent";

// Greens first, then yellows from the letters that are left, so a repeated
// letter is only marked as often as it appears in the answer.
export function scoreGuess(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(5).fill("absent");
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) marks[i] = "correct";
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (marks[i] === "correct") continue;
    if (left[guess[i]]) {
      marks[i] = "present";
      left[guess[i]]--;
    }
  }
  return marks;
}
