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
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";

interface MusicPlayerProps {
  fileName?: string;
  filePath?: string;
}

export function MusicPlayer({
  fileName = "ForAReason.mp3",
  filePath = "/ForAReason.mp3",
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
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
      console.log("Setting audio volume to:", newVolumeValue);
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
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (error) {
      console.error("Failed to setup audio context:", error);
    }
  }, []);

  // Visualizer animation
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw particles
      const time = Date.now() * 0.001;
      for (let i = 0; i < 50; i++) {
        const x = Math.sin(time + i * 0.5) * 150 + canvas.width / 2;
        const y = Math.cos(time + i * 0.3) * 100 + canvas.height / 2;
        const intensity = dataArray[i % bufferLength] / 255;

        ctx.beginPath();
        ctx.arc(x, y, 2 + intensity * 8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${200 + intensity * 100}, 70%, 60%, ${
          0.3 + intensity * 0.7
        })`;
        ctx.fill();
      }

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (isPlaying) {
      draw();
    }
  }, [isPlaying]);

  // Start visualizer when playing
  useEffect(() => {
    if (isPlaying) {
      setupAudioContext();
      drawVisualizer();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, setupAudioContext, drawVisualizer]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Resume audio context if needed
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1e293b] to-[#0f172a] text-white">
      {/* Title Bar */}
      <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] px-4 py-2 flex items-center justify-between border-b border-blue-600">
        <div className="flex items-center gap-2">
          <MusicIcon className="w-5 h-5" />
          <h1 className="font-semibold">Windows Media Player</h1>
        </div>
        <div className="flex gap-1">
          <button className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="w-6 h-6 flex items-center justify-center hover:bg-red-500 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Now Playing Info */}
        <div className="bg-gradient-to-r from-[#334155] to-[#475569] p-6 border-b border-slate-600">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MusicIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{fileName}</h2>
              <p className="text-blue-300">Syed Abdul Muneeb</p>
              <p className="text-sm text-slate-400">Unknown Album • 2024</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Duration</p>
              <p className="text-lg font-mono text-white">
                {formatTime(duration)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-800 p-4 border-b border-slate-600">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-mono text-slate-400 min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressBarRef}
              className="flex-1 h-2 bg-slate-700 rounded-full cursor-pointer relative overflow-hidden"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
              <div
                className="absolute top-0 w-3 h-3 bg-white rounded-full shadow-lg transform -translate-y-0.5 transition-all duration-100"
                style={{ left: `calc(${progressPercentage}% - 6px)` }}
              />
            </div>
            <span className="text-sm font-mono text-slate-400 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Status */}
          {isLoading && (
            <div className="text-center text-sm text-blue-400">
              Loading audio...
            </div>
          )}
          {error && (
            <div className="text-center text-sm text-red-400">{error}</div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-750 to-slate-800 p-6 relative overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 animate-pulse" />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-6">
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20">
                <Shuffle className="w-5 h-5 text-slate-300" />
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20">
                <SkipBack className="w-6 h-6 text-slate-300" />
              </button>
              <button
                onClick={togglePlay}
                disabled={isLoading || !!error}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white relative z-10" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1 relative z-10" />
                )}
              </button>
              <button
                onClick={stopAudio}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
              >
                <Square className="w-6 h-6 text-slate-300" />
              </button>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20">
                <SkipForward className="w-6 h-6 text-slate-300" />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20">
                <Repeat className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-700 transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <div className="relative w-32 h-4 flex items-center group">
                {/* Visual volume bar background */}
                <div className="w-full h-2 bg-slate-700 rounded-full">
                  {/* Volume fill */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-150"
                    style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                  />
                </div>
                {/* Volume thumb - visible on hover */}
                <div
                  className="absolute w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform -translate-x-2"
                  style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                {/* Interactive range input */}
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
                    console.log("Volume changed to:", newVolume);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  style={{ WebkitAppearance: "none", appearance: "none" }}
                />
              </div>
              <span className="text-xs text-slate-400 min-w-[30px] text-center">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Visualizer Area */}
        <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 p-6 relative overflow-hidden">
          {/* Canvas Visualizer */}
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full h-full rounded-lg border border-slate-700/50"
          />

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-slate-900/70 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full flex items-center justify-center border border-blue-400/40">
                <MusicIcon className="w-8 h-8 text-blue-300" />
              </div>
              <p className="text-slate-300 text-sm font-medium">
                {isPlaying ? "🎵 Now Playing" : "🎶 Ready to Play"}
              </p>
              <p className="text-slate-400 text-xs mt-1">{fileName}</p>
              <p className="text-slate-500 text-xs">High Quality Audio • MP3</p>
            </div>
          </div>

          {/* Floating particles background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={filePath} preload="metadata" />
    </div>
  );
}
