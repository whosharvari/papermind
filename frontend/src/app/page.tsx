import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-4xl font-semibold tracking-tight">PaperMind</h1>
      <p className="text-muted-foreground">Design system scaffold — verification checkpoint.</p>
      <Button>Accent button</Button>
    </main>
  );
}
