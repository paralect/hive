import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Database, Shield, Globe, Terminal, Layers } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Convention over config",
    description: "Resources, schemas, endpoints — just follow the pattern. No wiring needed.",
  },
  {
    icon: Database,
    title: "MongoDB + Zod",
    description: "Type-safe schemas that validate at runtime. Auto-generated TypeScript types.",
  },
  {
    icon: Shield,
    title: "Auth built-in",
    description: "Token-based authentication, middleware guards, and user management out of the box.",
  },
  {
    icon: Globe,
    title: "Full-stack ready",
    description: "API and Next.js frontend in one monorepo. Turbo runs both in parallel.",
  },
  {
    icon: Terminal,
    title: "CLI-powered",
    description: "hive init, hive run, hive deploy. One command to scaffold, develop, and ship.",
  },
  {
    icon: Layers,
    title: "Auto-sync",
    description: "Embedded document references stay in sync automatically across collections.",
  },
];

export function Hero() {
  return (
    <section className="flex flex-col items-center gap-8 pb-20 pt-24 text-center">
      <Badge variant="secondary" className="gap-1.5 px-3 py-1">
        <span>🐝</span> Open Source Framework
      </Badge>

      <div className="flex max-w-3xl flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Build products,
          <br />
          <span className="text-muted-foreground">not infrastructure</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Hive is a full-stack Node.js framework that lets you go from idea to production
          without fighting boilerplate, config files, or deployment headaches.
        </p>
      </div>

      <div className="flex gap-3">
        <Button size="lg" asChild>
          <Link href="/sign-in">
            Start Building
            <ArrowRight />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="https://github.com/paralect/hive" target="_blank">
            View on GitHub
          </Link>
        </Button>
      </div>

      <div className="mt-4 rounded-lg border bg-muted/50 p-4 font-mono text-sm text-muted-foreground">
        npx @paralect/hive init my-app && cd my-app && npm run dev
      </div>
    </section>
  );
}

export function Features() {
  return (
    <section id="features" className="py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Everything you need to ship
        </h2>
        <p className="mt-3 text-muted-foreground">
          Less code, fewer decisions, faster products.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border/50">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

const techStack = [
  {
    category: "Backend",
    items: [
      { name: "Node.js", detail: "Runtime" },
      { name: "Koa", detail: "HTTP framework" },
      { name: "MongoDB", detail: "Database" },
      { name: "Zod", detail: "Schema validation" },
      { name: "Socket.io", detail: "Real-time" },
      { name: "Redis", detail: "Cache & pub/sub" },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "Next.js 15", detail: "React framework" },
      { name: "React 19", detail: "UI library" },
      { name: "Tailwind v4", detail: "Styling" },
      { name: "shadcn/ui", detail: "Components" },
      { name: "TypeScript", detail: "Type safety" },
      { name: "Turbopack", detail: "Dev bundler" },
    ],
  },
  {
    category: "Tooling",
    items: [
      { name: "Turborepo", detail: "Monorepo" },
      { name: "Docker", detail: "Containers" },
      { name: "Hive CLI", detail: "Scaffolding" },
      { name: "tsx", detail: "TS execution" },
    ],
  },
];

export function TechStack() {
  return (
    <section className="py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Built on modern tech
        </h2>
        <p className="mt-3 text-muted-foreground">
          Production-ready stack. No compromises.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {techStack.map((group) => (
          <Card key={group.category} className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">{group.category}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {group.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.detail}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="py-20">
      <div className="flex flex-col items-center gap-6 rounded-2xl border bg-muted/30 p-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Ready to build?
        </h2>
        <p className="max-w-md text-muted-foreground">
          Get your full-stack app running in under a minute.
          API, database, auth, and frontend — all wired up.
        </p>
        <Button size="lg" asChild>
          <Link href="/sign-in">
            Get Started
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
