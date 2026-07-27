"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ConversationsProvider } from "@/contexts/conversations-context";
import { SettingsProvider } from "@/contexts/settings-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 10_000,
            refetchOnWindowFocus: false,
            // Our own ApiError already distinguishes "backend unreachable" from
            // other failures with a clear message -- we don't want TanStack
            // Query's own online/offline detection silently pausing retries
            // on top of that (observed: it can get stuck indefinitely even
            // when navigator.onLine reports true), which would leave the
            // health indicator stuck on "checking" forever instead of
            // settling into a real, retryable "disconnected" state.
            networkMode: "always",
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        <SettingsProvider>
          <ConversationsProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster />
            </TooltipProvider>
          </ConversationsProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
