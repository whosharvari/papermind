import type { Citation, RetrievedChunk } from "@/types/api";

export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
      createdAt: number;
    }
  | {
      id: string;
      role: "assistant";
      status: "done";
      content: string;
      citations: Citation[];
      retrievedChunks: RetrievedChunk[];
      createdAt: number;
    }
  | {
      id: string;
      role: "assistant";
      status: "error";
      errorMessage: string;
      createdAt: number;
    };
