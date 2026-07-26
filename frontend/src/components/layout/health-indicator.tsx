"use client";

import { useHealth } from "@/hooks/use-health";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  checking: { label: "Checking backend…", dot: "bg-warning", ring: "bg-warning/40" },
  connected: { label: "Backend connected", dot: "bg-success", ring: "bg-success/40" },
  disconnected: { label: "Backend unreachable", dot: "bg-destructive", ring: "bg-destructive/40" },
} as const;

export function HealthIndicator() {
  const { status } = useHealth();
  const config = STATUS_CONFIG[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1.5"
          role="status"
          aria-label={config.label}
        >
          <span className="relative flex size-2">
            {status !== "disconnected" && (
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                  config.ring,
                )}
              />
            )}
            <span className={cn("relative inline-flex size-2 rounded-full", config.dot)} />
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {status === "connected" ? "Connected" : status === "checking" ? "Checking" : "Offline"}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{config.label}</TooltipContent>
    </Tooltip>
  );
}
