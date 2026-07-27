"use client";

import Link from "next/link";
import { History, Info, Settings, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { HealthIndicator } from "@/components/layout/health-indicator";
import { GithubIcon } from "@/components/shared/icons";
import { useConversations } from "@/contexts/conversations-context";
import { ConversationSidebar } from "@/features/chat/conversation-sidebar";

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com";

export function Navbar() {
  const { conversations, activeId, selectConversation, deleteConversation, goToLanding } =
    useConversations();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Once inside a conversation, ChatView's own sidebar already covers this --
  // this trigger exists specifically so history is reachable from the
  // landing page, which otherwise has no way back into past conversations.
  const showHistoryTrigger = !activeId && conversations.length > 0;

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

          {showHistoryTrigger && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHistoryOpen(true)}
                aria-label="Conversation history"
              >
                <History className="size-4" />
              </Button>
              <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <SheetContent side="left" className="w-64 p-0 sm:max-w-64" showCloseButton>
                  <SheetTitle className="sr-only">Conversation history</SheetTitle>
                  <ConversationSidebar
                    conversations={conversations}
                    activeId={activeId}
                    onSelect={(id) => {
                      selectConversation(id);
                      setIsHistoryOpen(false);
                    }}
                    onDelete={deleteConversation}
                    onNewChat={() => {
                      goToLanding();
                      setIsHistoryOpen(false);
                    }}
                  />
                </SheetContent>
              </Sheet>
            </>
          )}

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
