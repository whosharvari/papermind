"use client";

import dynamic from "next/dynamic";
import { useConversations } from "@/contexts/conversations-context";
import { LandingView } from "@/features/landing/landing-view";

const ChatView = dynamic(() => import("@/features/chat/chat-view").then((m) => m.ChatView), {
  ssr: false,
});

export default function Home() {
  const { activeId, startConversation } = useConversations();

  if (activeId) {
    return <ChatView key={activeId} conversationId={activeId} />;
  }

  return <LandingView onSubmit={startConversation} />;
}
