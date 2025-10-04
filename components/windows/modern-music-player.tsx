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
  Heart,
  Download,
  Share2,
  MoreHorizontal,
} from "lucide-react";

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
    favoriteTime: 112, // 1:52 in seconds
  },
  {
    fileName: "regrets.mp3",
    filePath: "/regrets.mp3",
    title: "Regrets",
    artist: "Talha Anjum and Jevin Gill",
    favoriteTime: 131, // 2:11 in seconds
  },
];

export function PixelMusicPlayer({
  fileName = "ForAReason.mp3",
  filePath = "/ForAReason.mp3",
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // Get current song info - use props if provided, otherwise use songs array
  const currentSong = (() => {
    // Find song by fileName prop
    const songFromProps = songs.find((song) => song.fileName === fileName);
    if (songFromProps) {
      return songFromProps;
    }
    // Fallback to songs array
    return songs[currentSongIndex];
  })();

  // Audio setup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleError = () => {
      setError("Failed to load audio file");
      setIsLoading(false);
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const newVolumeValue = isMuted ? 0 : volume;
      audioRef.current.volume = newVolumeValue;
    }
  }, [volume, isMuted]);

  // Setup audio context for visualizer
  const setupAudioContext = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audio);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (error) {
      console.error("Failed to setup audio context:", error);
    }
  }, []);

  // Modern Audio Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(30, 30, 60, 0.9)");
      gradient.addColorStop(0.5, "rgba(50, 20, 80, 0.8)");
      gradient.addColorStop(1, "rgba(20, 40, 100, 0.9)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        try {
          analyserRef.current.getByteFrequencyData(dataArray);

          // Create modern circular visualizer
          const centerX = width / 2;
          const centerY = height / 2;
          const radius = Math.min(width, height) * 0.3;

          // Draw outer glow
          ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
          ctx.shadowBlur = 30;

          // Draw frequency bars in circular pattern
          const bars = 64;
          const angleStep = (Math.PI * 2) / bars;

          for (let i = 0; i < bars; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const dataIndex = Math.floor((i / bars) * bufferLength);
            const amplitude = dataArray[dataIndex] / 255;

            const barHeight = amplitude * radius * 0.8;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);

            // Create gradient for each bar
            const barGradient = ctx.createLinearGradient(x1, y1, x2, y2);
            const hue = (i / bars) * 360 + ((Date.now() / 50) % 360);
            barGradient.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.8)`);
            barGradient.addColorStop(1, `hsla(${hue + 60}, 80%, 70%, 1)`);

            ctx.strokeStyle = barGradient;
            ctx.lineWidth = 3;
            ctx.lineCap = "round";

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }

          // Draw central circle with pulsing effect
          const avgAmplitude =
            dataArray.reduce((a, b) => a + b) / bufferLength / 255;
          const pulseRadius = 20 + avgAmplitude * 30;

          const centralGradient = ctx.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            pulseRadius
          );
          centralGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
          centralGradient.addColorStop(0.7, "rgba(100, 200, 255, 0.5)");
          centralGradient.addColorStop(1, "rgba(100, 200, 255, 0)");

          ctx.fillStyle = centralGradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
          ctx.fill();

          // Add floating particles
          for (let i = 0; i < 20; i++) {
            const particleAngle = (Date.now() / 2000 + i / 20) * Math.PI * 2;
            const particleRadius =
              radius * 0.6 + Math.sin(Date.now() / 1000 + i) * 20;
            const particleX =
              centerX + Math.cos(particleAngle) * particleRadius;
            const particleY =
              centerY + Math.sin(particleAngle) * particleRadius;
            const intensity = dataArray[i % bufferLength] / 255;

            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsla(${
              (i * 18 + Date.now() / 100) % 360
            }, 70%, 60%, 0.8)`;
            ctx.fillStyle = `hsla(${(i * 18) % 360}, 70%, 60%, ${
              0.3 + intensity * 0.7
            })`;

            ctx.beginPath();
            ctx.arc(particleX, particleY, 2 + intensity * 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } catch (e) {
          console.warn("Audio visualization error:", e);
        }
      } else {
        // Static visualization when not playing
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.shadowColor = "rgba(100, 200, 255, 0.3)";
        ctx.shadowBlur = 20;

        // Draw static circular pattern
        for (let i = 0; i < 60; i++) {
          const angle = (i / 60) * Math.PI * 2;
          const radius = 50 + Math.sin(Date.now() / 2000 + i * 0.1) * 10;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.fillStyle = `hsla(${
            (i * 6 + Date.now() / 100) % 360
          }, 50%, 60%, 0.3)`;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isPlaying]);

  // Handle song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset audio state when song changes
    audio.pause();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setError(null);

    // Load new song
    audio.load();
  }, [currentSongIndex]);

  // Initialize currentSongIndex based on fileName prop
  useEffect(() => {
    if (fileName) {
      const songIndex = songs.findIndex((song) => song.fileName === fileName);
      if (songIndex >= 0 && songIndex !== currentSongIndex) {
        setCurrentSongIndex(songIndex);
      }
    }
  }, [fileName]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setupAudioContext();
        if (audioContextRef.current?.state === "suspended") {
          await audioContextRef.current.resume();
        }
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      setError("Failed to play audio");
      console.error("Audio playback error:", error);
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const skipForward = () => {
    // Find current song index based on fileName prop or current state
    const currentIndex = fileName
      ? songs.findIndex((song) => song.fileName === fileName)
      : currentSongIndex;
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % songs.length : 0;
    setCurrentSongIndex(nextIndex);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const skipBackward = () => {
    // Find current song index based on fileName prop or current state
    const currentIndex = fileName
      ? songs.findIndex((song) => song.fileName === fileName)
      : currentSongIndex;
    const prevIndex =
      currentIndex >= 0
        ? currentIndex === 0
          ? songs.length - 1
          : currentIndex - 1
        : songs.length - 1;
    setCurrentSongIndex(prevIndex);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const toggleShuffle = () => setIsShuffled(!isShuffled);
  const toggleRepeat = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setIsRepeated(!isRepeated);
    audio.loop = !isRepeated;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audio.currentTime = newTime;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const favoritePosition =
    duration > 0 ? (currentSong.favoriteTime / duration) * 100 : 0;

  return (
    <div className="relative h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-3xl" />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                  <MusicIcon className="w-8 h-8 text-white" />
                </div>
                {isPlaying && (
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-75 blur animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {currentSong.title}
                </h1>
                <p className="text-white/60 mt-1">{currentSong.artist}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-200">
                    High Quality
                  </span>
                  <span className="text-white/40 text-xs">
                    {isLoading
                      ? "Loading..."
                      : error
                      ? "Error"
                      : `${formatTime(duration)}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full backdrop-blur-sm border border-white/10 transition-all hover:scale-110 ${
                  isLiked
                    ? "bg-red-500/20 text-red-400"
                    : "bg-white/5 text-white/60 hover:text-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </button>
              <button className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-all hover:scale-110">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-all hover:scale-110">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-all hover:scale-110">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Visualizer */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ width: "100%", height: "100%" }}
          />

          {/* Status overlay */}
          <div className="absolute top-4 left-4">
            <div className="px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/10">
              <p className="text-sm text-white/80">
                {isLoading
                  ? "🔄 Loading..."
                  : error
                  ? "❌ Error"
                  : isPlaying
                  ? "🎵 Now Playing"
                  : "⏸️ Paused"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-white/10">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-white/60 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div
              onClick={handleProgressClick}
              className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
            >
              {/* Background track */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-full" />

              {/* Progress fill */}
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />

              {/* Muneeb's favorite mark */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow-lg"
                style={{ left: `${favoritePosition}%` }}
                title={`Muneeb's Favorite - ${formatTime(
                  currentSong.favoriteTime
                )}`}
              >
                <div className="absolute -top-8 -left-8 text-xs text-yellow-400 whitespace-nowrap">
                  💛 {formatTime(currentSong.favoriteTime)}
                </div>
              </div>

              {/* Progress handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progressPercentage}%`, marginLeft: "-8px" }}
              />
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={toggleShuffle}
              className={`p-3 rounded-full backdrop-blur-sm border border-white/10 transition-all hover:scale-110 ${
                isShuffled
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={skipBackward}
              className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-all hover:scale-110"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading || !!error}
              className="p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>

            <button
              onClick={stopAudio}
              className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-all hover:scale-110"
            >
              <Square className="w-6 h-6" />
            </button>

            <button
              onClick={skipForward}
              className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-all hover:scale-110"
            >
              <SkipForward className="w-6 h-6" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-3 rounded-full backdrop-blur-sm border border-white/10 transition-all hover:scale-110 ${
                isRepeated
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 hover:text-white transition-all hover:scale-110"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div className="flex-1 relative">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
                  style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (newVolume > 0) setIsMuted(false);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="text-sm text-white/60 min-w-[35px] text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={filePath || currentSong.filePath}
        preload="metadata"
      />
    </div>
  );
}
