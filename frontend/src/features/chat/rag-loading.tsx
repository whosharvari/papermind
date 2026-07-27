"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useMotionPreference } from "@/hooks/use-motion-preference";

const STEPS = [
  "Embedding your question",
  "Searching the vector index",
  "Retrieving relevant passages",
  "Generating an answer",
];

// The backend answers in a single round trip, so these steps are a paced
// approximation of pipeline progress rather than real server-sent events.
const STEP_DURATION_MS = 1400;

export function RagLoading() {
  const prefersReducedMotion = useMotionPreference();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (stepIndex >= STEPS.length - 1) return;
    const timer = setTimeout(() => setStepIndex((i) => i + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [stepIndex, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
        Generating an answer…
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card px-4 py-3"
      role="status"
      aria-live="polite"
    >
      {STEPS.map((step, index) => {
        const isDone = index < stepIndex;
        const isActive = index === stepIndex;

        return (
          <div
            key={step}
            className="flex items-center gap-2.5 text-sm transition-opacity"
            style={{ opacity: isDone || isActive ? 1 : 0.4 }}
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              {isDone ? (
                <Check className="size-3.5 text-success" aria-hidden="true" />
              ) : (
                <span className="relative flex size-2">
                  {isActive && (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex size-2 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/40"}`}
                  />
                </span>
              )}
            </span>
            <span className={isActive ? "text-foreground" : "text-muted-foreground"}>{step}</span>
          </div>
        );
      })}
      <span className="sr-only">Generating an answer, please wait.</span>
    </div>
  );
}
