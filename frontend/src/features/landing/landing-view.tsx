"use client";

import { motion } from "framer-motion";
import { Hero } from "@/features/landing/hero";
import { SearchBox } from "@/features/landing/search-box";
import { SuggestedPrompts } from "@/features/landing/suggested-prompts";
import { StatsSection } from "@/features/landing/stats-section";
import { useMotionPreference } from "@/hooks/use-motion-preference";

interface LandingViewProps {
  onSubmit: (question: string) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function LandingView({ onSubmit }: LandingViewProps) {
  const prefersReducedMotion = useMotionPreference();
  const initial = prefersReducedMotion ? false : "hidden";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-4xl flex-col items-center justify-center gap-10 px-4 py-16 sm:px-6">
      <motion.div initial={initial} animate="visible" variants={fadeUp} transition={{ duration: 0.4, ease: "easeOut" }}>
        <Hero />
      </motion.div>

      <motion.div
        initial={initial}
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
        className="flex w-full flex-col items-center gap-4"
      >
        <SearchBox onSubmit={onSubmit} />
        <SuggestedPrompts onSelect={onSubmit} />
      </motion.div>

      <motion.div
        initial={initial}
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, delay: 0.16, ease: "easeOut" }}
        className="w-full"
      >
        <StatsSection />
      </motion.div>
    </main>
  );
}
