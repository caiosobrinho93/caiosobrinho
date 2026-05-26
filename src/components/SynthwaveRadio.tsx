"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipForward, Volume2, Music, X, Move } from "lucide-react";
import { playClickSound, playHoverSound, initAudioContext } from "./CyberAudio";

// Copyright-free Synthwave/Lo-Fi track URLs
const TRACKS = [
  {
    title: "Neon Horizon",
    artist: "Synthwave HUD",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "cyberpunk City",
    artist: "Grid Runner",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    title: "Retro Future",
    artist: "PWA Runner",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  }
];

interface SynthwaveRadioProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SynthwaveRadio({ isOpen, onClose }: SynthwaveRadioProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Dragging states
  const [position, setPosition] = useState({ x: 80, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const currentTrack = TRACKS[currentTrackIdx];

  // Set default position on load/open
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      // Position next to the calculator (to the left of it on desktop)
      setPosition({
        x: isMobile ? 20 : window.innerWidth - 580,
        y: isMobile ? 80 : 150
      });
    }
  }, [isOpen]);

  // Set volume on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Set source track change
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIdx]);

  const initVisualizer = () => {
    if (audioCtx) return; // Already initialized

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 64;

      const audioEl = audioRef.current;
      if (audioEl) {
        const source = ctx.createMediaElementSource(audioEl);
        source.connect(analyserNode);
        analyserNode.connect(ctx.destination);

        setAudioCtx(ctx);
        setAudioSource(source);
        setAnalyser(analyserNode);
      }
    } catch (e) {
      console.warn("Could not initialize audio visualizer:", e);
    }
  };

  const handlePlayToggle = () => {
    playClickSound();
    initAudioContext();
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      initVisualizer();
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  };

  const handleNextTrack = () => {
    playClickSound();
    setCurrentTrackIdx((prev) => (prev + 1) % TRACKS.length);
  };

  // Draw frequency analysis to canvas
  useEffect(() => {
    if (!isPlaying || !analyser || !canvasRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.4)");
        gradient.addColorStop(0.5, "rgba(197, 254, 0, 0.7)");
        gradient.addColorStop(1, "rgba(217, 70, 239, 0.9)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1.5, barHeight);

        x += barWidth;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, analyser]);

  // Dragging event handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".drag-handle")) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".drag-handle")) {
      setIsDragging(true);
      const touch = e.touches[0];
      dragStartRef.current = {
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      };
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      let newX = e.clientX - dragStartRef.current.x;
      let newY = e.clientY - dragStartRef.current.y;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - 240));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 200));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      let newX = touch.clientX - dragStartRef.current.x;
      let newY = touch.clientY - dragStartRef.current.y;

      newX = Math.max(0, Math.min(newX, window.innerWidth - 240));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 200));

      setPosition({ x: newX, y: newY });
      if (e.cancelable) e.preventDefault();
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      style={{ top: position.y, left: position.x }}
      className="fixed w-56 bg-black/95 border border-primary/20 p-2.5 rounded-xl shadow-2xl z-50 font-display flex flex-col gap-2 select-none neon-glow-card"
    >
      {/* Hidden audio tag */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        crossOrigin="anonymous"
        onEnded={handleNextTrack}
      />

      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="drag-handle flex items-center justify-between border-b border-border/40 pb-1.5 cursor-move text-muted-foreground hover:text-white"
      >
        <div className="flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-primary" />
          <span className="text-[9px] font-bold text-white uppercase tracking-wider">HUD Rádio Synth</span>
        </div>
        <button
          onClick={() => { playClickSound(); onClose(); }}
          onMouseEnter={playHoverSound}
          className="p-0.5 rounded text-muted-foreground hover:text-white cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Track Info */}
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-white truncate leading-tight">{currentTrack.title}</p>
        <p className="text-[8px] text-muted-foreground truncate leading-none mt-0.5 uppercase tracking-wide">{currentTrack.artist}</p>
      </div>

      {/* Spectrometer Canvas */}
      <div className="h-6 w-full bg-black/45 border border-border/40 rounded overflow-hidden relative">
        <canvas ref={canvasRef} width={200} height={24} className="w-full h-full" />
        {!isPlaying && (
          <span className="absolute inset-0 flex items-center justify-center text-[7.5px] text-muted-foreground uppercase tracking-widest leading-none font-mono">
            Spectrometer Off
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-border/20">
        <div className="flex items-center gap-1">
          <button
            onClick={handlePlayToggle}
            onMouseEnter={playHoverSound}
            className="w-6 h-6 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 flex items-center justify-center cursor-pointer transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-primary/10" />}
          </button>
          <button
            onClick={handleNextTrack}
            onMouseEnter={playHoverSound}
            className="w-6 h-6 rounded bg-muted/20 border border-border/45 text-white hover:bg-muted/40 flex items-center justify-center cursor-pointer transition-colors"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-1">
          <Volume2 className="w-3 h-3 text-muted-foreground" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
