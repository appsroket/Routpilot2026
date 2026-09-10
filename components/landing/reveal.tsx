"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: React.ReactNode;
  /** Delay before the reveal starts, in milliseconds. */
  delay?: number;
  className?: string;
};

/**
 * Fades its children up ~28px as they enter the viewport, once. The single
 * source of scroll-reveal logic for the landing page. Honors reduced motion by
 * rendering statically.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.65, ease: EASE, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
