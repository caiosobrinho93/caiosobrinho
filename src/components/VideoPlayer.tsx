"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Tv, 
  X, 
  ChevronRight, 
  Loader2,
  Tv2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  progress: number;
  isFavorite: boolean;
  category: string | null;
  tags: string | null;
  user?: {
    username: string;
  };
}

interface VideoPlayerProps {
  video: VideoItem;
  playlist: VideoItem[];
  onClose: () => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onPlayVideo: (video: VideoItem) => void;
}

export default function VideoPlayer({ 
  video, 
  playlist, 
  onClose, 
  onUpdateProgress, 
  onPlayVideo 
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  // Suggestion overlay states
  const [showNextSuggestion, setShowNextSuggestion] = useState(false);
  const [nextCountdown, setNextCountdown] = useState(8);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Controls hide timeout
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find next video in playlist
  const currentIndex = playlist.findIndex(v => v.id === video.id);
  const nextVideo = currentIndex !== -1 && currentIndex < playlist.length - 1 
    ? playlist[currentIndex + 1] 
    : null;

  const isYouTube = (url: string) => {
    return url.includes("youtube.com/watch") || url.includes("youtu.be/");
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch")) {
      const vidId = url.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    if (url.includes("youtu.be/")) {
      const vidId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${vidId}`;
    }
    return null;
  };

  // Reset player when source video changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setShowNextSuggestion(false);
    setNextCountdown(8);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  }, [video]);

  // Handle auto-hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isPlaying]);

  // Handle native video controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Playback error:", err));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    
    // Save progress periodically (e.g. every 5 seconds or on significant progress)
    if (Math.floor(current) % 5 === 0) {
      onUpdateProgress(video.id, Math.floor(current));
    }

    // Trigger next video suggestion 10 seconds before end
    const total = videoRef.current.duration;
    if (total > 0 && nextVideo) {
      const remaining = total - current;
      if (remaining <= 10 && !showNextSuggestion) {
        setShowNextSuggestion(true);
        startCountdown();
      } else if (remaining > 10 && showNextSuggestion) {
        // Reset if scrubbed back
        setShowNextSuggestion(false);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      }
    }
  };

  const startCountdown = () => {
    setNextCountdown(8);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    countdownIntervalRef.current = setInterval(() => {
      setNextCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          handlePlayNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePlayNext = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (nextVideo) {
      if (videoRef.current) {
        onUpdateProgress(video.id, Math.floor(videoRef.current.currentTime));
      }
      onPlayVideo(nextVideo);
    }
  };

  const cancelNextSuggestion = () => {
    setShowNextSuggestion(false);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
    
    if (video.progress > 0) {
      videoRef.current.currentTime = video.progress;
      setCurrentTime(video.progress);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    videoRef.current.muted = nextMute;
    if (!nextMute && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const triggerPiP = () => {
    if (!videoRef.current) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      videoRef.current.requestPictureInPicture().catch(err => console.error("PiP error:", err));
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const embedUrl = getEmbedUrl(video.url);

  return (
    <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-5 sm:p-4">
      {/* Black backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.95 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (videoRef.current) {
            onUpdateProgress(video.id, Math.floor(videoRef.current.currentTime));
          }
          onClose();
        }}
        className="absolute inset-0 bg-black/98 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        ref={containerRef}
        layoutId={video.id}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className={`w-full bg-black border border-border/80 relative z-10 flex flex-col overflow-hidden shadow-2xl rounded-sm transition-all duration-300 ${
          isCinemaMode && !isFullscreen ? "max-w-6xl aspect-[21/9] border-primary/20" : "max-w-4xl aspect-video"
        }`}
      >
        {/* Top Header Bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between px-4 sm:px-5 z-20 pointer-events-auto"
            >
              <div className="flex items-center gap-5 min-w-0">
                <span className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-sm shrink-0 uppercase tracking-widest">
                  {video.category || "CINE"}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md shadow-sm font-display uppercase tracking-wider">
                  {video.title}
                </span>
              </div>
              
              <div className="flex items-center gap-5">
                {/* Cinema Mode Switch (Not available in Fullscreen or YouTube) */}
                {!isFullscreen && !embedUrl && (
                  <button
                    onClick={() => setIsCinemaMode(!isCinemaMode)}
                    className={`p-5 rounded-sm border transition-all cursor-pointer ${
                      isCinemaMode 
                        ? "border-primary/45 bg-primary/10 text-primary" 
                        : "border-white/5 bg-black/40 hover:bg-black/60 text-muted-foreground hover:text-white"
                    }`}
                    title="Modo Cinema"
                  >
                    <Tv2 className="w-4 h-4" />
                  </button>
                )}
                
                {/* Close Button */}
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      onUpdateProgress(video.id, Math.floor(videoRef.current.currentTime));
                    }
                    onClose();
                  }}
                  className="p-5 rounded-sm bg-black/40 hover:bg-black/60 text-muted-foreground hover:text-white cursor-pointer border border-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Frame */}
        <div className="flex-1 w-full h-full relative flex items-center justify-center">
          {isLoading && !embedUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-5">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm text-primary tracking-widest font-bold font-display uppercase">Carregando Fluxo</span>
            </div>
          )}

          {embedUrl ? (
            <iframe
              src={`${embedUrl}?autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0 absolute inset-0"
            />
          ) : (
            <video
              ref={videoRef}
              src={video.url}
              autoPlay
              controls={false}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onEnded={() => {
                setIsPlaying(false);
                if (nextVideo) {
                  handlePlayNext();
                } else {
                  onUpdateProgress(video.id, 0);
                }
              }}
            />
          )}

          {/* Holographic grid and scanner overlay in cinema/private aesthetic */}
          <div className="absolute inset-0 pointer-events-none border border-primary/5 holographic opacity-40 z-0" />
        </div>

        {/* Custom Video Controls overlay (Native video only) */}
        {!embedUrl && (
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-10 pb-4 px-4 flex flex-col gap-3 z-20 pointer-events-auto"
              >
                {/* Timeline slider bar */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground w-10 text-right">
                    {formatTime(currentTime)}
                  </span>
                  
                  <div className="flex-1 relative group py-1 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none transition-all group-hover:h-1.5"
                      style={{
                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                          duration ? (currentTime / duration) * 100 : 0
                        }%, rgba(255,255,255,0.1) ${
                          duration ? (currentTime / duration) * 100 : 0
                        }%, rgba(255,255,255,0.1) 100%)`,
                      }}
                    />
                  </div>

                  <span className="text-sm font-mono text-muted-foreground w-10 text-left">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Bottom Control Bar */}
                <div className="flex items-center justify-between">
                  {/* Play & Mute group */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-9 h-9 rounded-sm bg-primary/10 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-4 group/volume">
                      <button
                        onClick={toggleMute}
                        className="p-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-0 opacity-0 group-hover/volume:w-16 group-hover/volume:opacity-100 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none transition-all duration-300"
                        style={{
                          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                            (isMuted ? 0 : volume) * 100
                          }%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Pip & Fullscreen controls */}
                  <div className="flex items-center gap-5">
                    <button
                      onClick={triggerPiP}
                      className="p-5 text-muted-foreground hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/5 hover:bg-white/5 rounded-sm"
                      title="Miniplayer (PiP)"
                    >
                      <Tv className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={toggleFullscreen}
                      className="p-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer border border-transparent hover:border-primary/10 hover:bg-primary/5 rounded-sm"
                      title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
                    >
                      {isFullscreen ? (
                        <Minimize className="w-4 h-4 text-primary" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Suggestion Card Overlay */}
        <AnimatePresence>
          {showNextSuggestion && nextVideo && (
            <motion.div
              initial={{ opacity: 0, x: 50, y: 50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 50, y: 50 }}
              className="absolute bottom-20 right-4 z-40 max-w-sm w-80 bg-black/90 border border-primary/20 backdrop-blur-md rounded-sm p-4 text-left shadow-2xl flex flex-col gap-3 scanlines"
            >
              <div className="flex items-start justify-between gap-5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest font-display">Próximo Vídeo</span>
                  <h4 className="text-xs font-bold text-white line-clamp-1 uppercase font-display leading-tight">{nextVideo.title}</h4>
                </div>
                <button
                  onClick={cancelNextSuggestion}
                  className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-3 items-center">
                {/* Mini thumbnail */}
                <div className="w-20 aspect-video rounded-sm bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden relative">
                  {nextVideo.thumbnailUrl ? (
                    <img src={nextVideo.thumbnailUrl} alt={nextVideo.title} className="w-full h-full object-cover" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <Play className="w-3.5 h-3.5 text-white/80 fill-current" />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-5">
                  <span className="text-sm text-muted-foreground font-semibold">
                    Iniciando em <span className="text-primary font-bold">{nextCountdown}s</span>
                  </span>
                  
                  <div className="flex gap-5">
                    <button
                      onClick={handlePlayNext}
                      className="px-2.5 py-1.5 rounded-sm bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/95 flex items-center gap-2 cursor-pointer"
                    >
                      Iniciar <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelNextSuggestion}
                      className="px-2 py-1.5 rounded-sm border border-border text-muted-foreground hover:text-white text-xs uppercase tracking-wider cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
