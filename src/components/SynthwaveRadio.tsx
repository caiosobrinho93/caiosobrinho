"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, Music, X, Radio } from "lucide-react";
import { playClickSound, playHoverSound, initAudioContext } from "./CyberAudio";
import { motion, AnimatePresence } from "framer-motion";

// Live radio stream URLs for Votuporanga-SP
const RADIO_STREAMS = [
  {
    title: "Clube FM 92.1",
    artist: "Votuporanga - SP",
    url: "https://ice.fabricahost.com.br/clube92votuporanga"
  },
  {
    title: "Unifev FM 96.5",
    artist: "Votuporanga - SP",
    url: "https://servidor17-4.brlogic.com:7618/live?source=7250"
  },
  {
    title: "Cidade FM 98.3",
    artist: "Votuporanga - SP",
    url: "https://servidor4.suaradionanet.net:8390/stream"
  },
  {
    title: "Líder FM 104.9",
    artist: "Votuporanga - SP",
    url: "https://servidor31.brlogic.com:8192/live"
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

  const currentTrack = RADIO_STREAMS[currentTrackIdx];

  // Set volume on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Set source track change (live streams require calling .load())
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.load();
      if (isPlaying) {
        audio.play().catch((err) => {
          console.warn("Failed to autoplay changed stream:", err);
          setIsPlaying(false);
        });
      }
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
      audio.load(); // Load fresh stream buffer
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error("Failed to play radio stream:", e);
        setIsPlaying(false);
      });
    }
  };

  const handleSelectRadio = (idx: number) => {
    playClickSound();
    initAudioContext();
    initVisualizer();
    
    if (currentTrackIdx === idx) {
      const audio = audioRef.current;
      if (!audio) return;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.load();
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => setIsPlaying(false));
      }
    } else {
      setCurrentTrackIdx(idx);
      setIsPlaying(true);
      // Wait for React to apply track source change, then play
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.load();
          audio.play().then(() => {
            setIsPlaying(true);
          }).catch((err) => {
            console.error("Stream play failed:", err);
            setIsPlaying(false);
          });
        }
      }, 100);
    }
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
        gradient.addColorStop(0, "rgba(6, 182, 212, 0.3)");
        gradient.addColorStop(0.5, "rgba(197, 254, 0, 0.6)");
        gradient.addColorStop(1, "rgba(217, 70, 239, 0.8)");

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
  }, [isPlaying, analyser, isOpen]);

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        crossOrigin="anonymous"
      />
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Side-out Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 h-full w-80 bg-black/95 border-l border-primary/20 p-6 shadow-2xl z-50 font-display flex flex-col justify-between select-none"
            >

            <div className="space-y-6 flex-1 flex flex-col min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4 text-muted-foreground hover:text-white">
                <div className="flex items-center gap-3">
                  <Radio className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Estações de Rádio</span>
                </div>
                <button
                  onClick={() => { playClickSound(); onClose(); }}
                  onMouseEnter={playHoverSound}
                  className="p-1 rounded bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/30 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Current Track Panel */}
              <div className="p-4 border border-primary/20 rounded-xl bg-white/[0.02] space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-lg border ${isPlaying ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"}`}>
                    <Music className={`w-5 h-5 ${isPlaying ? "animate-bounce" : ""}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold font-mono tracking-widest text-primary block leading-none mb-1">
                      {isPlaying ? "Transmitindo ao vivo" : "Rádio em espera"}
                    </span>
                    <p className="text-sm font-bold text-white truncate leading-tight">{currentTrack.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{currentTrack.artist}</p>
                  </div>
                </div>

                {/* Spectrometer Visualizer */}
                <div className="h-10 w-full bg-black/50 border border-border/40 rounded-lg overflow-hidden relative flex items-center justify-center">
                  <canvas ref={canvasRef} width={250} height={40} className="w-full h-full" />
                  {!isPlaying && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-muted-foreground/60 uppercase tracking-widest leading-none font-mono">
                      Visualizador Inativo
                    </span>
                  )}
                </div>
              </div>

              {/* Radio Stations List */}
              <div className="flex-1 flex flex-col min-h-0 space-y-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Região de Votuporanga-SP
                </span>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {RADIO_STREAMS.map((radio, idx) => {
                    const isSelected = currentTrackIdx === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectRadio(idx)}
                        onMouseEnter={playHoverSound}
                        className={`w-full text-left p-3 border rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group ${
                          isSelected
                            ? "bg-primary/5 border-primary/40 text-white shadow-[0_0_12px_rgba(var(--primary-color),0.05)]"
                            : "bg-white/[0.02] border-white/5 text-muted-foreground hover:bg-white/[0.04] hover:border-white/10 hover:text-white"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`text-xs font-bold leading-tight ${isSelected ? "text-primary" : "text-white"}`}>
                            {radio.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5">{radio.artist}</p>
                        </div>
                        
                        <div className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                          isSelected && isPlaying
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-black/35 border-white/5 group-hover:border-primary/20 group-hover:text-primary"
                        }`}>
                          {isSelected && isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="border-t border-border/40 pt-4 flex items-center justify-between gap-4">
              {/* Play Toggle Button */}
              <button
                onClick={handlePlayToggle}
                onMouseEnter={playHoverSound}
                className={`px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all border ${
                  isPlaying 
                    ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/25" 
                    : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Play
                  </>
                )}
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3 py-2 rounded-lg">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </>
);
}
