import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  isLoading?: boolean;
}

export function StatCard({ icon: Icon, label, value, isLoading }: StatCardProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-border/80">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <p
          className="truncate text-2xl font-semibold tracking-tight text-foreground"
          title={typeof value === "string" ? value : undefined}
        >
          {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
        </p>
      )}
    </div>
  );
}
