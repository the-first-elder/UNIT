"use client";

import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  hue: number;
  alpha: number;
}

export function FloatingOrbs({ count = 4 }: { count?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const orbs: Orb[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      orbs.length = 0;
      for (let i = 0; i < count; i++) {
        orbs.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: 80 + Math.random() * 160,
          dx: (Math.random() - 0.5) * 0.15,
          dy: (Math.random() - 0.5) * 0.15,
          hue: 210 + Math.random() * 40,
          alpha: 0.03 + Math.random() * 0.03,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (const orb of orbs) {
        orb.x += orb.dx;
        orb.y += orb.dy;

        if (orb.x < -orb.r) orb.x = canvas!.width + orb.r;
        if (orb.x > canvas!.width + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = canvas!.height + orb.r;
        if (orb.y > canvas!.height + orb.r) orb.y = -orb.r;

        const gradient = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        gradient.addColorStop(0, `hsla(${orb.hue}, 70%, 60%, ${orb.alpha})`);
        gradient.addColorStop(0.5, `hsla(${orb.hue + 20}, 60%, 50%, ${orb.alpha * 0.5})`);
        gradient.addColorStop(1, `hsla(${orb.hue + 40}, 50%, 40%, 0)`);
        ctx!.fillStyle = gradient;
        ctx!.fillRect(orb.x - orb.r, orb.y - orb.r, orb.r * 2, orb.r * 2);
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
