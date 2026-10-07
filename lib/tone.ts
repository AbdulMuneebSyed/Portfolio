import { useSystemControls } from "./system-controls";

// Short synthesised notes for Piano and Simon, scaled by the system Sound
// volume. Instruments play even when UI click sounds are off.
let context: AudioContext | null = null;

export function noteFrequency(semitonesFromA4: number) {
  return 440 * 2 ** (semitonesFromA4 / 12);
}

export function playTone(
  frequency: number,
  duration = 0.5,
  type: OscillatorType = "triangle",
) {
  const volume = useSystemControls.getState().volume;
  if (volume <= 0 || typeof window === "undefined") return;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25 * volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  } catch {
    /* Web Audio unavailable */
  }
}
