"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
      <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        An unexpected error interrupted the page. Your conversations are unaffected -- they&apos;re
        saved locally.
      </p>
      <Button size="sm" className="mt-2" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
