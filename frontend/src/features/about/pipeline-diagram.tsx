import {
  Binary,
  Bot,
  Database,
  Eraser,
  FileText,
  MessageSquareText,
  Scissors,
  SearchCode,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  icon: LucideIcon;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { icon: FileText, label: "PDF", description: "Raw paper" },
  { icon: Eraser, label: "Cleaning", description: "Strip artifacts" },
  { icon: Scissors, label: "Chunking", description: "Section-aware split" },
  { icon: Binary, label: "Embedding", description: "Sentence Transformers" },
  { icon: Database, label: "FAISS", description: "IndexFlatIP" },
  { icon: SearchCode, label: "Retrieval", description: "Top-k by similarity" },
  { icon: MessageSquareText, label: "Prompt", description: "Chunks + question" },
  { icon: Bot, label: "Groq", description: "LLM generation" },
  { icon: Sparkles, label: "Answer", description: "Grounded + cited" },
];

export function PipelineDiagram() {
  return (
    <div
      className="flex flex-wrap items-stretch justify-center gap-2 overflow-x-auto rounded-xl border border-border bg-card p-4 sm:gap-1"
      role="img"
      aria-label="Pipeline: PDF, then Cleaning, Chunking, Embedding, FAISS, Retrieval, Prompt, Groq, Answer"
    >
      {STEPS.map((step, index) => (
        <div key={step.label} className="flex items-center gap-1 sm:gap-2">
          <div className="flex w-24 flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background">
              <step.icon className="size-4 text-primary" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium text-foreground">{step.label}</p>
            <p className="text-[10px] leading-tight text-muted-foreground">{step.description}</p>
          </div>
          {index < STEPS.length - 1 && (
            <div className="h-px w-3 shrink-0 bg-border sm:w-4" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
