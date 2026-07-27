import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <FileQuestion className="size-8 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Button asChild size="sm" className="mt-2">
        <Link href="/">Back to PaperMind</Link>
      </Button>
    </main>
  );
}
