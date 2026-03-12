export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto flex max-w-screen-xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>🐝</span>
          <span>Built with Hive</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Ship faster. Stress less.
        </p>
      </div>
    </footer>
  );
}
