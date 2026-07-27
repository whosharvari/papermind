"use client";

import { Moon, Sun } from "lucide-react";
import { useMountedTheme } from "@/hooks/use-mounted-theme";
import { cn } from "@/lib/utils";

export function ThemeSelect() {
  const { mounted, isDark, setTheme } = useMountedTheme();

  return (
    <div className="inline-flex rounded-lg border border-border p-0.5">
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={mounted && !isDark}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          mounted && !isDark
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Sun className="size-3.5" aria-hidden="true" />
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          isDark ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Moon className="size-3.5" aria-hidden="true" />
        Dark
      </button>
    </div>
  );
}
