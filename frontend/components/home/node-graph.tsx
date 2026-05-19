"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  connections: number[];
  phase: number;
}

export function NodeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0;
    let h = 0;

    const nodes: Node[] = [];
    const NODE_COUNT = 50;
    const CONNECTION_DIST = 120;
    const NODE_SPEED = 0.3;

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
    }

    function init() {
      resize();
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        const node: Node = {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * NODE_SPEED,
          vy: (Math.random() - 0.5) * NODE_SPEED,
          r: 1 + Math.random() * 2,
          connections: [],
          phase: Math.random() * Math.PI * 2,
        };
        nodes.push(node);
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        n.phase += 0.005;

        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        n.connections = [];
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - n.x;
          const dy = nodes[j].y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            n.connections.push(j);
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(n.x, n.y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }

        const pulse = 0.5 + 0.5 * Math.sin(n.phase);
        const alpha = 0.3 + 0.4 * pulse;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx!.fill();
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
