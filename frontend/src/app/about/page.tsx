import { DesignRationale } from "@/features/about/design-rationale";
import { EvaluationMetrics } from "@/features/about/evaluation-metrics";
import { PipelineDiagram } from "@/features/about/pipeline-diagram";

const TECH_STACK = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "PDF.js",
  "FastAPI",
  "Sentence Transformers",
  "FAISS",
  "Groq",
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">About PaperMind</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        PaperMind answers questions about a corpus of AI research papers by retrieving the
        passages most relevant to a question and asking an LLM to answer using only that
        retrieved text -- grounded, citable, and verifiable against the original PDFs.
      </p>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-foreground">How a question becomes an answer</h2>
        <div className="mt-4">
          <PipelineDiagram />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-foreground">Design decisions</h2>
        <div className="mt-4">
          <DesignRationale />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-foreground">Evaluation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Retrieval and generation quality are measured with a hand-authored question set, not
          assumed.
        </p>
        <div className="mt-4">
          <EvaluationMetrics />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-foreground">Tech stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
