"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Eases a displayed number toward `target` whenever the target changes, so the
 * ROI calculator's outputs visibly jump when a slider moves. Snaps instantly
 * under reduced motion.
 */
export function useTween(target: number, duration = 450): number {
  const reduce = useReducedMotion();
  const [value, setValue] = React.useState(target);
  const valueRef = React.useRef(target);
  const rafRef = React.useRef<number>();

  valueRef.current = value;

  React.useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    const from = valueRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, reduce]);

  return value;
}
