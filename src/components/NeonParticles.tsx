"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  alphaDir: number;
  color: string;
}

export default function NeonParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 18 : 35;
    const CONNECTION_DISTANCE = isMobile ? 80 : 120;

    let animId: number;
    let particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      // Get CSS colors dynamically
      const primaryHex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00f2fe';
      const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6';

      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.15,
        alphaDir: Math.random() > 0.5 ? 0.003 : -0.003,
        color: Math.random() > 0.5 ? primaryHex : accentHex,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get current primary color dynamically in case theme changes
      const primaryHex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00f2fe';

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = primaryHex.startsWith('#') 
              ? `rgba(${hexToRgb(primaryHex)}, ${opacity})`
              : `rgba(0, 242, 254, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += p.alphaDir;
        if (p.alpha >= 0.6 || p.alpha <= 0.1) p.alphaDir *= -1;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
        gradient.addColorStop(0, p.color.startsWith('#') 
          ? `rgba(${hexToRgb(p.color)}, ${p.alpha})`
          : `rgba(0, 242, 254, ${p.alpha})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color.startsWith('#')
          ? `rgba(${hexToRgb(p.color)}, ${Math.min(p.alpha * 1.5, 1)})`
          : `rgba(0, 242, 254, ${Math.min(p.alpha * 1.5, 1)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    const hexToRgb = (hex: string) => {
      let c = hex.substring(1).trim();
      if (c.length === 3) {
        c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      }
      const num = parseInt(c, 16);
      return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
    };

    resize();
    createParticles();
    draw();

    const handleResize = () => {
      resize();
      createParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particles-canvas absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
