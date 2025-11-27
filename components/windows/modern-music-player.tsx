"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music as MusicIcon,
  List,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from "lucide-react";
import Image from "next/image";

interface MusicPlayerProps {
  fileName?: string;
  filePath?: string;
}

// Songs library with metadata
const songs = [
  {
    fileName: "ForAReason.mp3",
    filePath: "/ForAReason.mp3",
    title: "For A Reason",
    artist: "Syed Abdul Muneeb",
    album: "Portfolio Hits",
    duration: "3:45",
    year: "2024",
    genre: "Pop",
  },
  {
    fileName: "regrets.mp3",
    filePath: "/regrets.mp3",
    title: "Regrets",
    artist: "Talha Anjum and Jevin Gill",
    album: "Open Letter",
    duration: "4:12",
    year: "2023",
    genre: "Hip Hop",
  },
  {
    fileName: "memories.mp3",
    filePath: "/memories.mp3", // Placeholder
    title: "Windows 7 Memories",
    artist: "Microsoft",
    album: "OS Sounds",
    duration: "2:30",
    year: "2009",
    genre: "Soundtrack",
  },
];

export function PixelMusicPlayer({ fileName, filePath }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"nowPlaying" | "library">(
    "nowPlaying"
  );

  // Initialize song based on props
  useEffect(() => {
    if (fileName) {
      const index = songs.findIndex((s) => s.fileName === fileName);
      if (index !== -1) setCurrentSongIndex(index);
    }
  }, [fileName]);

  const currentSong = songs[currentSongIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeated) {
        audio.currentTime = 0;
        audio.play();
      } else {
        skipForward();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeated]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentSongIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => setIsRepeated(!isRepeated);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const skipForward = () => {
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (currentSongIndex + 1) % songs.length;
    }
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  };

  const skipBackward = () => {
    const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#EAF3FC] select-none font-segoe">
      {/* Top Bar (Aero Glass style) */}
      <div className="h-8 bg-gradient-to-b from-[#F3F8FD] to-[#DCEAF8] border-b border-[#AABCCF] flex items-center px-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded-full border border-orange-600 shadow-sm" />
          <span className="text-xs text-[#1E395B] font-medium">
            Windows Media Player
          </span>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-6 bg-[#F5F6F7] border-b border-[#D9D9D9] flex items-center px-2 gap-4 text-xs text-[#1E1E1E]">
        <button className="hover:bg-[#E5F3FB] px-2 py-0.5 rounded">
          Organize
        </button>
        <button className="hover:bg-[#E5F3FB] px-2 py-0.5 rounded">
          Stream
        </button>
        <button className="hover:bg-[#E5F3FB] px-2 py-0.5 rounded">
          Create playlist
        </button>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <button
            className={`p-1 rounded hover:bg-[#E5F3FB] ${
              viewMode === "nowPlaying"
                ? "bg-[#CDE6F7] border border-[#7DA2CE]"
                : ""
            }`}
            onClick={() => setViewMode("nowPlaying")}
            title="Now Playing"
          >
            <LayoutGrid className="w-3 h-3" />
          </button>
          <button
            className={`p-1 rounded hover:bg-[#E5F3FB] ${
              viewMode === "library"
                ? "bg-[#CDE6F7] border border-[#7DA2CE]"
                : ""
            }`}
            onClick={() => setViewMode("library")}
            title="Library"
          >
            <List className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Sidebar */}
        <div className="w-48 bg-[#F0F0F0] border-r border-[#D9D9D9] p-2 text-sm overflow-y-auto">
          <div className="font-medium text-[#1E395B] mb-2 px-2">Library</div>
          <div className="space-y-1">
            <div className="px-2 py-1 hover:bg-[#E5F3FB] rounded cursor-pointer flex items-center gap-2">
              <MusicIcon className="w-3 h-3" /> Playlists
            </div>
            <div className="px-2 py-1 hover:bg-[#E5F3FB] rounded cursor-pointer flex items-center gap-2 bg-[#CDE6F7] border border-[#7DA2CE]">
              <MusicIcon className="w-3 h-3" /> Music
            </div>
            <div className="pl-6 text-xs text-gray-600 space-y-1">
              <div className="hover:underline cursor-pointer">Artist</div>
              <div className="hover:underline cursor-pointer">Album</div>
              <div className="hover:underline cursor-pointer">Genre</div>
            </div>
            <div className="px-2 py-1 hover:bg-[#E5F3FB] rounded cursor-pointer flex items-center gap-2">
              <MusicIcon className="w-3 h-3" /> Videos
            </div>
            <div className="px-2 py-1 hover:bg-[#E5F3FB] rounded cursor-pointer flex items-center gap-2">
              <MusicIcon className="w-3 h-3" /> Pictures
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {viewMode === "nowPlaying" ? (
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              {/* Visualizer Background (Simple Gradient Animation) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1a2a6c] via-[#b21f1f] to-[#fdbb2d] opacity-30 animate-pulse" />

              {/* Album Art / Visualization */}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-white/10 shadow-2xl flex items-center justify-center relative group">
                  <MusicIcon className="w-20 h-20 text-white/20 group-hover:scale-110 transition-transform" />
                  {isPlaying && (
                    <div className="absolute inset-0 flex items-end justify-center pb-4 gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 bg-blue-400/80 animate-bounce"
                          style={{
                            height: "40%",
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: "0.8s",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-medium text-white drop-shadow-md">
                    {currentSong.title}
                  </h2>
                  <p className="text-gray-300 drop-shadow-md">
                    {currentSong.artist}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#F0F0F0] text-[#1E1E1E] border-b border-[#D9D9D9]">
                  <tr>
                    <th className="px-4 py-1 font-normal border-r border-[#D9D9D9]">
                      Title
                    </th>
                    <th className="px-4 py-1 font-normal border-r border-[#D9D9D9]">
                      Artist
                    </th>
                    <th className="px-4 py-1 font-normal border-r border-[#D9D9D9]">
                      Album
                    </th>
                    <th className="px-4 py-1 font-normal">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((song, index) => (
                    <tr
                      key={index}
                      className={`border-b border-transparent hover:bg-[#E5F3FB] cursor-pointer ${
                        currentSongIndex === index
                          ? "bg-[#CDE6F7] border-[#7DA2CE]"
                          : ""
                      }`}
                      onDoubleClick={() => {
                        setCurrentSongIndex(index);
                        setIsPlaying(true);
                        setViewMode("nowPlaying");
                      }}
                    >
                      <td className="px-4 py-1 flex items-center gap-2">
                        {currentSongIndex === index && isPlaying && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {song.title}
                      </td>
                      <td className="px-4 py-1 text-gray-600">{song.artist}</td>
                      <td className="px-4 py-1 text-gray-600">{song.album}</td>
                      <td className="px-4 py-1 text-gray-600">
                        {song.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar (WMP 12 Style) */}
      <div className="h-20 bg-gradient-to-b from-[#F0F0F0] to-[#D9D9D9] border-t border-[#A0A0A0] flex items-center px-4 gap-4 relative">
        {/* Progress Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 bg-[#E6E6E6] cursor-pointer group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const time = (x / width) * duration;
            if (audioRef.current) {
              audioRef.current.currentTime = time;
              setCurrentTime(time);
            }
          }}
        >
          <div
            className="h-full bg-[#1E90FF] group-hover:bg-[#0078D7] transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.5)] hover:shadow-sm transition-all ${
              isShuffled ? "text-blue-600 bg-blue-100" : "text-[#5C5C5C]"
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.5)] hover:shadow-sm transition-all ${
              isRepeated ? "text-blue-600 bg-blue-100" : "text-[#5C5C5C]"
            }`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
          <button
            onClick={stopAudio}
            className="p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.5)] hover:shadow-sm transition-all text-[#5C5C5C]"
            title="Stop"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Main Transport */}
        <div className="flex items-center gap-1">
          <button
            onClick={skipBackward}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-[#F9F9F9] to-[#E0E0E0] border border-[#A0A0A0] flex items-center justify-center hover:from-[#FFFFFF] hover:to-[#F0F0F0] active:from-[#D0D0D0] active:to-[#C0C0C0] shadow-sm"
          >
            <SkipBack className="w-5 h-5 text-[#1E395B] fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-b from-[#F0F8FF] to-[#B9D1EA] border border-[#3C7FB1] flex items-center justify-center hover:from-[#FFFFFF] hover:to-[#D0E5F5] active:from-[#A0C0E0] active:to-[#90B0D0] shadow-md"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-[#1E395B] fill-current" />
            ) : (
              <Play className="w-7 h-7 text-[#1E395B] fill-current ml-1" />
            )}
          </button>
          <button
            onClick={skipForward}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-[#F9F9F9] to-[#E0E0E0] border border-[#A0A0A0] flex items-center justify-center hover:from-[#FFFFFF] hover:to-[#F0F0F0] active:from-[#D0D0D0] active:to-[#C0C0C0] shadow-sm"
          >
            <SkipForward className="w-5 h-5 text-[#1E395B] fill-current" />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 ml-4 w-32">
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-[#5C5C5C]" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#5C5C5C]" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-full h-1 bg-[#A0A0A0] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#1E395B] [&::-webkit-slider-thumb]:rounded-full"
          />
        </div>

        {/* Time Info */}
        <div className="flex-1 text-right text-xs text-[#5C5C5C] font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={filePath || currentSong.filePath}
        preload="metadata"
      />
    </div>
  );
}
