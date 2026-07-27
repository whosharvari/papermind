export function Hero() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
        PaperMind
      </h1>
      <p className="max-w-md text-balance text-base text-muted-foreground sm:text-lg">
        Research assistant powered by Retrieval-Augmented Generation
      </p>
    </div>
  );
}
