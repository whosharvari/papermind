"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Wraps next-themes' useTheme with a mounted guard -- the resolved theme is
 * only known after mount, so consumers can't render a theme-dependent icon
 * or state on the server without risking a hydration mismatch. */
export function useMountedTheme() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return { mounted, isDark: mounted && resolvedTheme === "dark", setTheme };
}
