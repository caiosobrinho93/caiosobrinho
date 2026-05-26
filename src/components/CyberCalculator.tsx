"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Delete, Plus, Minus, Move } from "lucide-react";
import { playClickSound, playHoverSound } from "./CyberAudio";

interface CyberCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CyberCalculator({ isOpen, onClose }: CyberCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  
  // Dragging states
  const [position, setPosition] = useState({ x: 80, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const calcRef = useRef<HTMLDivElement>(null);

  // Position logic adjustments inside screen boundary
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      setPosition({
        x: isMobile ? 20 : window.innerWidth - 320,
        y: isMobile ? 80 : 150
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
      
      // Limit inside screen boundaries
      newX = Math.max(0, Math.min(newX, window.innerWidth - 260));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 380));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      let newX = touch.clientX - dragStartRef.current.x;
      let newY = touch.clientY - dragStartRef.current.y;

      newX = Math.max(0, Math.min(newX, window.innerWidth - 260));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 380));

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

  const handleNumClick = (val: string) => {
    playClickSound();
    if (display === "0" || isEvaluated) {
      setDisplay(val);
      setIsEvaluated(false);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const handleOpClick = (op: string) => {
    playClickSound();
    setEquation((prev) => {
      const cleanDisplay = display.replace(/,/g, ".");
      return `${prev} ${cleanDisplay} ${op}`;
    });
    setDisplay("0");
    setIsEvaluated(false);
  };

  const handleClear = () => {
    playClickSound();
    setDisplay("0");
    setEquation("");
    setIsEvaluated(false);
  };

  const handleBackspace = () => {
    playClickSound();
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
  };

  const handleEval = () => {
    playClickSound();
    if (!equation) return;
    try {
      const fullEq = `${equation} ${display.replace(/,/g, ".")}`.replace(/x/g, "*").replace(/÷/g, "/");
      // Use standard safe evaluation (Function is safe enough for basic calculator math strings)
      const res = new Function(`return (${fullEq})`)();
      
      if (isNaN(res) || !isFinite(res)) {
        setDisplay("ERRO");
      } else {
        setDisplay(Number(res).toLocaleString("pt-BR", { maximumFractionDigits: 6 }));
      }
      setEquation("");
      setIsEvaluated(true);
    } catch (e) {
      setDisplay("ERRO");
      setEquation("");
      setIsEvaluated(true);
    }
  };

  return (
    <div
      ref={calcRef}
      style={{ top: position.y, left: position.x }}
      className="fixed w-[240px] bg-black/95 border border-primary/20 rounded-2xl shadow-2xl p-3 z-50 font-display flex flex-col gap-2 select-none neon-glow-card"
    >
      {/* HUD Header */}
      <div 
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="drag-handle flex items-center justify-between pb-1.5 border-b border-border/40 cursor-move text-muted-foreground hover:text-white"
      >
        <div className="flex items-center gap-1">
          <Move className="w-3.5 h-3.5 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-wider">HUD Calculadora</span>
        </div>
        <button
          onClick={() => { playClickSound(); onClose(); }}
          onMouseEnter={playHoverSound}
          className="p-0.5 rounded-md hover:bg-white/5 hover:text-red-400 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Screen */}
      <div className="bg-black/60 border border-border/40 p-2.5 rounded-lg flex flex-col items-end min-h-[56px] justify-between">
        <span className="text-[9px] text-primary/60 font-mono uppercase tracking-wide truncate max-w-full">
          {equation}
        </span>
        <span className="text-xl font-bold text-white font-mono tracking-tight truncate max-w-full">
          {display}
        </span>
      </div>

      {/* Keys */}
      <div className="grid grid-cols-4 gap-1 text-[11px] font-mono font-bold">
        {/* Row 1 */}
        <button
          onClick={handleClear}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer"
        >
          AC
        </button>
        <button
          onClick={handleBackspace}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-white/80 hover:bg-muted/30 rounded-lg cursor-pointer flex items-center justify-center"
        >
          <Delete className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleOpClick("÷")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg cursor-pointer"
        >
          ÷
        </button>
        <button
          onClick={() => handleOpClick("x")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg cursor-pointer"
        >
          x
        </button>

        {/* Row 2 */}
        {["7", "8", "9"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            onMouseEnter={playHoverSound}
            className="p-2.5 bg-muted/10 border border-border/20 text-white/90 hover:bg-muted/20 rounded-lg cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOpClick("-")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg cursor-pointer flex items-center justify-center"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Row 3 */}
        {["4", "5", "6"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            onMouseEnter={playHoverSound}
            className="p-2.5 bg-muted/10 border border-border/20 text-white/90 hover:bg-muted/20 rounded-lg cursor-pointer"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOpClick("+")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg cursor-pointer flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Row 4 */}
        <div className="col-span-3 grid grid-cols-3 gap-1">
          {["1", "2", "3"].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num)}
              onMouseEnter={playHoverSound}
              className="p-2.5 bg-muted/10 border border-border/20 text-white/90 hover:bg-muted/20 rounded-lg cursor-pointer"
            >
              {num}
            </button>
          ))}
        </div>
        <button
          onClick={handleEval}
          onMouseEnter={playHoverSound}
          className="row-span-2 p-2.5 bg-primary text-black hover:bg-primary/90 rounded-lg flex items-center justify-center cursor-pointer font-bold font-sans text-xs"
        >
          =
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleNumClick("0")}
          onMouseEnter={playHoverSound}
          className="col-span-2 p-2.5 bg-muted/10 border border-border/20 text-white/90 hover:bg-muted/20 rounded-lg cursor-pointer"
        >
          0
        </button>
        <button
          onClick={() => handleNumClick(",")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/10 border border-border/20 text-white/90 hover:bg-muted/20 rounded-lg cursor-pointer"
        >
          ,
        </button>
      </div>
    </div>
  );
}
