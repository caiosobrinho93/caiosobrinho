"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Delete, Move } from "lucide-react";
import { playClickSound, playHoverSound } from "./CyberAudio";

interface CyberCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CyberCalculator({ isOpen, onClose }: CyberCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isRad, setIsRad] = useState(false); // Modos Radiano (true) ou Graus (false)
  
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
        x: isMobile ? 10 : window.innerWidth - 410,
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
      
      // Limit inside screen boundaries for w-[380px] calculator
      newX = Math.max(0, Math.min(newX, window.innerWidth - 400));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 440));

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      let newX = touch.clientX - dragStartRef.current.x;
      let newY = touch.clientY - dragStartRef.current.y;

      newX = Math.max(0, Math.min(newX, window.innerWidth - 400));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 440));

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

  const handleFuncClick = (funcName: string) => {
    playClickSound();
    if (display === "0" || isEvaluated) {
      setDisplay(funcName + "(");
      setIsEvaluated(false);
    } else {
      // Se já houver um número antes, podemos opcionalmente colocar um operador implícito,
      // mas vamos deixar simples e apenas concatenar
      setDisplay((prev) => prev + funcName + "(");
    }
  };

  const handleOpClick = (op: string) => {
    playClickSound();
    setIsEvaluated(false);
    if (display === "0" && op === "-") {
      setDisplay("-");
    } else {
      setDisplay((prev) => prev + op);
    }
  };

  const handleClear = () => {
    playClickSound();
    setDisplay("0");
    setEquation("");
    setIsEvaluated(false);
  };

  const handleBackspace = () => {
    playClickSound();
    if (isEvaluated) {
      setDisplay("0");
      setIsEvaluated(false);
    } else {
      setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    }
  };

  const handleToggleRad = () => {
    playClickSound();
    setIsRad(!isRad);
  };

  const handleEval = () => {
    playClickSound();
    if (!display || display === "0" || display === "-") return;
    try {
      // Substitui símbolos visuais e constantes por expressões JS
      let expr = display
        .replace(/x/g, "*")
        .replace(/÷/g, "/")
        .replace(/,/g, ".")
        .replace(/π/g, "Math.PI")
        .replace(/e/g, "Math.E")
        .replace(/\^/g, "**")
        .replace(/√\(/g, "sqrt(");

      // Fecha automaticamente parênteses abertos no final
      const openParens = (expr.match(/\(/g) || []).length;
      const closeParens = (expr.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        expr += ")".repeat(openParens - closeParens);
      }

      const radFactor = isRad ? 1 : Math.PI / 180;

      // Executa de forma isolada passando as funções customizadas no escopo
      const evaluator = new Function(
        "sin", "cos", "tan", "log", "ln", "sqrt",
        `return (${expr});`
      );

      const sinVal = (x: number) => Math.sin(x * radFactor);
      const cosVal = (x: number) => Math.cos(x * radFactor);
      const tanVal = (x: number) => {
        // Correção simples para tan(90) ou similar
        if (!isRad && Math.abs(x % 180) === 90) return NaN;
        return Math.tan(x * radFactor);
      };
      const logVal = (x: number) => Math.log10(x);
      const lnVal = (x: number) => Math.log(x);
      const sqrtVal = (x: number) => Math.sqrt(x);

      const res = evaluator(sinVal, cosVal, tanVal, logVal, lnVal, sqrtVal);

      if (isNaN(res) || !isFinite(res)) {
        setDisplay("ERRO");
      } else {
        // Limita a exibição do resultado científico para 8 casas decimais
        const formattedRes = Number(res).toLocaleString("pt-BR", {
          maximumFractionDigits: 8
        });
        setDisplay(formattedRes);
        setEquation(display + " =");
        setIsEvaluated(true);
      }
    } catch (e) {
      console.warn("Calculadora falhou ao avaliar expressão:", e);
      setDisplay("ERRO");
      setIsEvaluated(true);
    }
  };

  return (
    <div
      ref={calcRef}
      style={{ top: position.y, left: position.x }}
      className="fixed w-[380px] bg-black/95 border border-primary/20 rounded-2xl shadow-2xl p-4.5 z-50 font-display flex flex-col gap-4 select-none neon-glow-card"
    >
      {/* HUD Header */}
      <div 
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        className="drag-handle flex items-center justify-between pb-3 border-b border-border/40 cursor-move text-muted-foreground hover:text-white"
      >
        <div className="flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider">HUD Calculadora Científica</span>
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
      <div className="bg-black/60 border border-border/40 p-4.5 rounded-lg flex flex-col items-end min-h-[68px] justify-between relative overflow-hidden">
        {/* Rad/Deg indicator badge */}
        <span className={`absolute left-3 top-3 px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-widest ${
          isRad ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-primary/10 text-primary border border-primary/25"
        }`}>
          {isRad ? "RAD" : "DEG"}
        </span>

        <span className="text-[10px] text-primary/60 font-mono uppercase tracking-wide truncate max-w-full">
          {equation || "\u00A0"}
        </span>
        <span className="text-lg font-bold text-white font-mono tracking-tight truncate max-w-full mt-1.5">
          {display}
        </span>
      </div>

      {/* Scientific and Standard Keyboard (6 Columns) */}
      <div className="grid grid-cols-6 gap-1.5 text-xs font-mono font-bold">
        {/* Row 1 */}
        <button
          onClick={handleToggleRad}
          onMouseEnter={playHoverSound}
          className={`p-2.5 rounded-lg border text-[9px] font-bold flex items-center justify-center cursor-pointer transition-all ${
            isRad 
              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" 
              : "bg-muted/10 border-border/20 text-muted-foreground"
          }`}
        >
          Rad/Deg
        </button>
        <button
          onClick={() => handleOpClick("^")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/10 border border-border/20 text-white/80 hover:bg-muted/20 rounded-lg cursor-pointer"
        >
          xʸ
        </button>
        <button
          onClick={() => handleNumClick("(")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/10 border border-border/20 text-white/85 hover:bg-muted/20 rounded-lg cursor-pointer"
        >
          (
        </button>
        <button
          onClick={() => handleNumClick(")")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/10 border border-border/20 text-white/85 hover:bg-muted/20 rounded-lg cursor-pointer"
        >
          )
        </button>
        <button
          onClick={handleBackspace}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer flex items-center justify-center"
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

        {/* Row 2 */}
        <button
          onClick={() => handleFuncClick("sin")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-primary/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          sin
        </button>
        <button
          onClick={() => handleFuncClick("cos")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-primary/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          cos
        </button>
        {["7", "8", "9"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            onMouseEnter={playHoverSound}
            className="p-2.5 bg-white/[0.03] border border-white/5 text-white/90 hover:bg-white/[0.08] rounded-lg cursor-pointer text-sm"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOpClick("x")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg cursor-pointer"
        >
          x
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleFuncClick("tan")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-primary/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          tan
        </button>
        <button
          onClick={() => handleFuncClick("√")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-primary/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          √
        </button>
        {["4", "5", "6"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            onMouseEnter={playHoverSound}
            className="p-2.5 bg-white/[0.03] border border-white/5 text-white/90 hover:bg-white/[0.08] rounded-lg cursor-pointer text-sm"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOpClick("-")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg cursor-pointer"
        >
          -
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleNumClick("π")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-cyan-400/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          π
        </button>
        <button
          onClick={() => handleFuncClick("log")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-primary/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          log
        </button>
        {["1", "2", "3"].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num)}
            onMouseEnter={playHoverSound}
            className="p-2.5 bg-white/[0.03] border border-white/5 text-white/90 hover:bg-white/[0.08] rounded-lg cursor-pointer text-sm"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOpClick("+")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-lg cursor-pointer"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => handleNumClick("e")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-cyan-400/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          e
        </button>
        <button
          onClick={() => handleFuncClick("ln")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-muted/15 border border-border/40 text-primary/80 hover:bg-muted/25 rounded-lg cursor-pointer"
        >
          ln
        </button>
        <button
          onClick={handleClear}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer text-[10px]"
        >
          AC
        </button>
        <button
          onClick={() => handleNumClick("0")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-white/[0.03] border border-white/5 text-white/90 hover:bg-white/[0.08] rounded-lg cursor-pointer text-sm"
        >
          0
        </button>
        <button
          onClick={() => handleNumClick(",")}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-white/[0.03] border border-white/5 text-white/90 hover:bg-white/[0.08] rounded-lg cursor-pointer text-sm"
        >
          ,
        </button>
        <button
          onClick={handleEval}
          onMouseEnter={playHoverSound}
          className="p-2.5 bg-primary text-black hover:bg-primary/95 rounded-lg cursor-pointer font-bold text-sm"
        >
          =
        </button>
      </div>
    </div>
  );
}
