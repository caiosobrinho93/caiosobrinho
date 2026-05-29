"use client";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function initAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume();
  }
}

export function playHoverSound() {
  // Muted by user request
}

export function playClickSound() {
  // Muted by user request
}

export function playSuccessSound() {
  // Muted by user request
}

export function playNotificationSound() {
  // Muted by user request
}
