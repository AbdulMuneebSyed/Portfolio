import { create } from "zustand";
import { songs } from "./songs";
import { useSystemControls } from "./system-controls";

// Control Center's Now Playing: one shared audio element, created on first
// use (browsers only allow playback after a user gesture anyway).
interface NowPlayingState {
  index: number;
  isPlaying: boolean;
  toggle: () => void;
  next: () => void;
  previous: () => void;
}

let audio: HTMLAudioElement | null = null;

function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.volume = useSystemControls.getState().volume;
    audio.addEventListener("ended", () => useNowPlaying.getState().next());
    // Control Center's Sound slider drives the music volume too.
    useSystemControls.subscribe((state) => {
      if (audio) audio.volume = state.volume;
    });
  }
  return audio;
}

export const useNowPlaying = create<NowPlayingState>((set, get) => {
  const playIndex = (index: number) => {
    const player = getAudio();
    if (!player) return;
    const song = songs[index];
    if (!player.src.endsWith(song.filePath)) player.src = song.filePath;
    player
      .play()
      .then(() => set({ index, isPlaying: true }))
      .catch(() => set({ index, isPlaying: false }));
  };

  return {
    index: 0,
    isPlaying: false,
    toggle: () => {
      const player = getAudio();
      if (!player) return;
      if (get().isPlaying) {
        player.pause();
        set({ isPlaying: false });
      } else {
        playIndex(get().index);
      }
    },
    next: () => {
      const index = (get().index + 1) % songs.length;
      if (get().isPlaying) playIndex(index);
      else set({ index });
    },
    previous: () => {
      const player = getAudio();
      // Like macOS: restart the song if it's a few seconds in.
      if (player && player.currentTime > 3) {
        player.currentTime = 0;
        return;
      }
      const index = (get().index - 1 + songs.length) % songs.length;
      if (get().isPlaying) playIndex(index);
      else set({ index });
    },
  };
});
