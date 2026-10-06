"use client";

import { useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  Music,
} from "lucide-react";
import { songs } from "@/lib/songs";
import { useNowPlaying } from "@/lib/now-playing";
import { useSystemControls } from "@/lib/system-controls";

const time = (value: number) =>
  `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
export function PixelMusicPlayer({
  fileName,
}: {
  fileName?: string;
  filePath?: string;
}) {
  const player = useNowPlaying();
  const { volume, setVolume } = useSystemControls();
  useEffect(() => {
    const index = songs.findIndex((song) => song.fileName === fileName);
    if (index >= 0) useNowPlaying.getState().select(index);
  }, [fileName]);
  const current = songs[player.index];
  return (
    <div className="music-app">
      <div className="mac-toolbar">
        <Music size={17} className="text-[#fa4260]" />
        <h2>Listen Now</h2>
        <span className="mac-muted text-xs">Your Library</span>
      </div>
      <div className="music-main">
        <div className="music-artwork">
          <Music size={76} strokeWidth={1.2} />
        </div>
        <h1>{current.title}</h1>
        <p>{current.artist}</p>
        <div className="music-progress">
          <input
            aria-label="Playback position"
            type="range"
            min="0"
            max={player.duration || 1}
            step="0.1"
            value={player.currentTime}
            onChange={(e) => player.seek(Number(e.target.value))}
          />
          <div>
            <span>{time(player.currentTime)}</span>
            <span>{time(player.duration)}</span>
          </div>
        </div>
        <div className="music-controls">
          <button
            className="mac-icon-button"
            aria-label="Shuffle"
            aria-pressed={player.shuffle}
            onClick={() => player.setShuffle(!player.shuffle)}
          >
            <Shuffle size={17} />
          </button>
          <button
            className="mac-icon-button"
            aria-label="Previous song"
            onClick={player.previous}
          >
            <SkipBack size={23} fill="currentColor" />
          </button>
          <button
            className="music-play"
            aria-label={player.isPlaying ? "Pause" : "Play"}
            onClick={player.toggle}
          >
            {player.isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" />
            )}
          </button>
          <button
            className="mac-icon-button"
            aria-label="Next song"
            onClick={player.next}
          >
            <SkipForward size={23} fill="currentColor" />
          </button>
          <button
            className="mac-icon-button"
            aria-label="Repeat"
            aria-pressed={player.repeat}
            onClick={() => player.setRepeat(!player.repeat)}
          >
            <Repeat size={17} />
          </button>
        </div>
        <div className="music-volume">
          <Volume2 size={15} />
          <input
            aria-label="Music volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="music-library">
        {songs.map((song, index) => (
          <button
            key={song.fileName}
            data-selected={player.index === index}
            onClick={() => player.select(index, true)}
          >
            <Music size={18} />
            <span>
              <strong>{song.title}</strong>
              <small>{song.artist}</small>
            </span>
            {player.index === index && player.isPlaying ? (
              <span className="music-playing">♫</span>
            ) : (
              <Play size={13} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
