"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, SkipForward, Volume2, Music, Minimize2, Maximize2 } from "lucide-react";
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

export default function SynthwaveRadio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [isMinimized, setIsMinimized] = useState(true);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const currentTrack = TRACKS[currentTrackIdx];

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
        // MediaElementAudioSourceNode must only be created once per audio element
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

        // Cyberpunk colors: Cyan to Magenta gradient
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

  return (
    <div className="fixed bottom-20 right-4 z-40 select-none">
      {/* Hidden audio tag */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        crossOrigin="anonymous"
        onEnded={handleNextTrack}
      />

      {isMinimized ? (
        <button
          onClick={() => { playClickSound(); setIsMinimized(false); }}
          onMouseEnter={playHoverSound}
          className={`w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center cursor-pointer transition-all ${
            isPlaying 
              ? "bg-primary/20 shadow-[0_0_15px_rgba(197,254,0,0.45)] text-primary animate-pulse" 
              : "bg-black/60 text-muted-foreground hover:text-white"
          }`}
          title="Abrir Rádio Synthwave"
        >
          <Music className={`w-4 h-4 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: '4s' }} />
        </button>
      ) : (
        <div className="w-56 glass-panel border border-primary/20 p-2.5 rounded-xl shadow-2xl relative bg-black/90 flex flex-col gap-2 font-display neon-glow-card">
          <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-primary" />
              <span className="text-[9px] font-bold text-white uppercase tracking-wider">HUD Synth Radio</span>
            </div>
            <button
              onClick={() => { playClickSound(); setIsMinimized(true); }}
              onMouseEnter={playHoverSound}
              className="p-0.5 rounded text-muted-foreground hover:text-white cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" />
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
      )}
    </div>
  );
}
