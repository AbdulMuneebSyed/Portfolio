import { create } from "zustand";
import { songs } from "./songs";
import { useSystemControls } from "./system-controls";

interface NowPlayingState {
  index: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  repeat: boolean;
  shuffle: boolean;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  select: (index: number, play?: boolean) => void;
  seek: (time: number) => void;
  setRepeat: (on: boolean) => void;
  setShuffle: (on: boolean) => void;
}
let audio: HTMLAudioElement | null = null;
function getAudio() {
  if (typeof window === "undefined") return null;
  if (!audio) {
    audio = new Audio();
    audio.volume = useSystemControls.getState().volume;
    audio.addEventListener("timeupdate", () =>
      useNowPlaying.setState({ currentTime: audio?.currentTime ?? 0 }),
    );
    audio.addEventListener("loadedmetadata", () =>
      useNowPlaying.setState({
        duration: Number.isFinite(audio?.duration) ? audio!.duration : 0,
      }),
    );
    audio.addEventListener("ended", () => {
      const state = useNowPlaying.getState();
      if (state.repeat) {
        state.seek(0);
        state.select(state.index, true);
      } else state.next();
    });
    audio.addEventListener("error", () =>
      useNowPlaying.setState({ isPlaying: false }),
    );
    useSystemControls.subscribe((state) => {
      if (audio) audio.volume = state.volume;
    });
  }
  return audio;
}
export const useNowPlaying = create<NowPlayingState>((set, get) => ({
  index: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  repeat: false,
  shuffle: false,
  select: (index, play = false) => {
    const player = getAudio();
    if (!player || !songs[index]) return;
    if (!player.src.endsWith(songs[index].filePath)) {
      player.src = songs[index].filePath;
      set({ currentTime: 0, duration: 0 });
    }
    set({ index });
    if (play)
      void player
        .play()
        .then(() => set({ isPlaying: true }))
        .catch(() => set({ isPlaying: false }));
    else {
      player.pause();
      set({ isPlaying: false });
    }
  },
  toggle: () => {
    const player = getAudio();
    if (!player) return;
    if (get().isPlaying) {
      player.pause();
      set({ isPlaying: false });
    } else get().select(get().index, true);
  },
  next: () => {
    const state = get();
    const step =
      state.shuffle && songs.length > 1
        ? 1 + Math.floor(Math.random() * (songs.length - 1))
        : 1;
    state.select((state.index + step) % songs.length, state.isPlaying);
  },
  previous: () => {
    if (get().currentTime > 3) get().seek(0);
    else
      get().select(
        (get().index - 1 + songs.length) % songs.length,
        get().isPlaying,
      );
  },
  seek: (time) => {
    const player = getAudio();
    if (player) {
      player.currentTime = time;
      set({ currentTime: time });
    }
  },
  setRepeat: (repeat) => set({ repeat }),
  setShuffle: (shuffle) => set({ shuffle }),
}));
