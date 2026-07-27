"use client";

import { useState } from "react";
import { LandingView } from "@/features/landing/landing-view";

export default function Home() {
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);

  if (initialQuestion) {
    // Placeholder until the chat interface lands in the next commit.
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm text-muted-foreground">You asked:</p>
        <p className="mt-1 text-lg font-medium">{initialQuestion}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          The chat interface is coming up next.
        </p>
      </main>
    );
  }

  return <LandingView onSubmit={setInitialQuestion} />;
}
