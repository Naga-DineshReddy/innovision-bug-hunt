"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiTrigger() {
  useEffect(() => {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981"]
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981"]
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return null;
}
