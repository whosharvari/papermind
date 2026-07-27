"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  durationSeconds?: number;
}

export function AnimatedNumber({ value, className, durationSeconds = 1.2 }: AnimatedNumberProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    if (prefersReducedMotion) {
      node.textContent = value.toLocaleString();
      return;
    }

    const controls = animate(motionValue, value, {
      duration: durationSeconds,
      ease: "easeOut",
      onUpdate: (latest) => {
        node.textContent = Math.round(latest).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [value, motionValue, durationSeconds, prefersReducedMotion]);

  return (
    <span ref={spanRef} className={className}>
      0
    </span>
  );
}
