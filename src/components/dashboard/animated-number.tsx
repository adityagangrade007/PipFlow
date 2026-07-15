"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  format: (n: number) => string;
  /** Animation duration in seconds. */
  duration?: number;
}

/** Counts up to `value` on mount. Renders statically under reduced motion. */
export function AnimatedNumber({ value, format, duration = 0.9 }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion) return;
    const controls = animate(value * 0.6, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        node.textContent = format(latest);
      },
    });
    return () => controls.stop();
    // `format` is stable per call site; re-running on identity change is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(value)}
    </span>
  );
}
