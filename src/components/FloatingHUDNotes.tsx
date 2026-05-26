"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Save, Pin, FileText, Minimize2, Maximize2, Move } from "lucide-react";
import { playClickSound, playHoverSound, playSuccessSound } from "./CyberAudio";

interface FloatingHUDNotesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FloatingHUDNotes({ isOpen, onClose }: FloatingHUDNotesProps) {
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Dragging states
  const [position, setPosition] = useState({ x: 80, y: 350 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Load from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNote = localStorage.getItem("nexus_sticky_note");
      if (savedNote) {
        setContent(savedNote);
      }
      
      const isMobile = window.innerWidth < 768;
      setPosition({
        x: isMobile ? 20 : window.innerWidth - 320,
        y: isMobile ? 380 : 400
      });
    }
  }, [isOpen]);

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
      
      // Boundary checks
      newX = Math.max(0, Math.min(newX, window.innerWidth - 260));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 300));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      let newX = touch.clientX - dragStartRef.current.x;
      let newY = touch.clientY - dragStartRef.current.y;

      newX = Math.max(0, Math.min(newX, window.innerWidth - 260));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 300));

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

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setIsSaved(false);

    // Auto save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_sticky_note", val);
      setIsSaved(true);
    }
  };

  const forceSave = () => {
    playSuccessSound();
    if (typeof window !== "undefined") {
      localStorage.setItem("nexus_sticky_note", content);
      setIsSaved(true);
    }
  };

  return (
    <div
      style={{ top: position.y, left: position.x }}
      className={`fixed w-[240px] bg-black/95 border border-primary/20 rounded-2xl shadow-2xl p-3 z-50 font-display flex flex-col gap-2 select-none neon-glow-card transition-all duration-300 ${
        isMinimized ? "h-auto" : "h-[220px]"
      }`}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="drag-handle flex items-center justify-between pb-1.5 border-b border-border/40 cursor-move text-muted-foreground hover:text-white"
      >
        <div className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-wider">HUD Lembretes</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { playClickSound(); setIsMinimized(!isMinimized); }}
            onMouseEnter={playHoverSound}
            className="p-0.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-white cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => { playClickSound(); onClose(); }}
            onMouseEnter={playHoverSound}
            className="p-0.5 rounded-md hover:bg-white/5 hover:text-red-400 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notepad area */}
      {!isMinimized && (
        <>
          <div className="flex-1 min-h-0 relative">
            <textarea
              value={content}
              onChange={handleTextChange}
              placeholder="Digite notas rápidas aqui..."
              className="w-full h-full bg-black/45 border border-border/40 rounded-lg p-2 text-[10px] text-white outline-none resize-none font-mono focus:border-primary/50"
            />
          </div>
          
          <div className="flex items-center justify-between text-[8px] text-muted-foreground pt-1 border-t border-border/20">
            <span>
              {isSaved ? "✓ Salvo automaticamente" : "Modificado..."}
            </span>
            <button
              onClick={forceSave}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded cursor-pointer"
            >
              <Save className="w-2.5 h-2.5" />
              Salvar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
