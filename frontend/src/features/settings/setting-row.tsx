import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SettingRowProps {
  label: string;
  htmlFor?: string;
  description?: string;
  badge?: ReactNode;
  children: ReactNode;
}

export function SettingRow({ label, htmlFor, description, badge, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
            {label}
          </Label>
          {badge}
        </div>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
