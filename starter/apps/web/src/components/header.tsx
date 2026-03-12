import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-xl items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-xl">🐝</span>
          <span>Hive</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="#features">Features</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="https://github.com/paralect/hive" target="_blank">
              Docs
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-in">
              Get Started
              <ArrowRight />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
