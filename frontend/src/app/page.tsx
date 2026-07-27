"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LandingView } from "@/features/landing/landing-view";

const ChatView = dynamic(() => import("@/features/chat/chat-view").then((m) => m.ChatView), {
  ssr: false,
});

export default function Home() {
  const [initialQuestion, setInitialQuestion] = useState<string | null>(null);

  if (initialQuestion) {
    return <ChatView initialQuestion={initialQuestion} />;
  }

  return <LandingView onSubmit={setInitialQuestion} />;
}
