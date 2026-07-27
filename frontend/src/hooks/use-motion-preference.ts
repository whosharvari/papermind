"use client";

import { useReducedMotion as useSystemReducedMotion } from "framer-motion";
import { useSettings } from "@/contexts/settings-context";

/** True if the user should see reduced motion, from either the OS-level
 * media query or this app's own Settings toggle. */
export function useMotionPreference(): boolean {
  const { settings } = useSettings();
  const systemPrefersReduced = useSystemReducedMotion();
  return settings.reducedMotion || Boolean(systemPrefersReduced);
}
