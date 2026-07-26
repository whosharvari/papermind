"use client";

import Link from "next/link";
import { Info, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HealthIndicator } from "@/components/layout/health-indicator";
import { GithubIcon } from "@/components/shared/icons";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Sparkles className="size-4 text-primary" aria-hidden="true" />
          <span>PaperMind</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary">
          <HealthIndicator />

          <Button variant="ghost" size="icon" asChild>
            <Link href="/about" aria-label="About PaperMind">
              <Info className="size-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings" aria-label="Settings">
              <Settings className="size-4" />
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub"
            >
              <GithubIcon className="size-4" />
            </a>
          </Button>

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
