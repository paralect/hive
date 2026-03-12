import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, FileText, ArrowRight, Plus } from "lucide-react";

const stats = [
  { label: "API Endpoints", value: "3", icon: Activity },
  { label: "Users", value: "0", icon: Users },
  { label: "Collections", value: "4", icon: FileText },
];

const quickActions = [
  {
    title: "Add a resource",
    description: "Create a new API resource with schema, endpoints, and handlers",
    command: "add-resource tasks",
  },
  {
    title: "Add an endpoint",
    description: "Add a new endpoint to an existing resource",
    command: "add-endpoint tasks post title, status",
  },
  {
    title: "Add a middleware",
    description: "Create custom middleware for request processing",
    command: "add-middleware rateLimiter",
  },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-xl items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-xl">🐝</span>
            <span>Hive</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs">
              localhost:3001
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-screen-xl flex-1 space-y-8 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your Hive project at a glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardDescription className="text-sm font-medium">
                  {stat.label}
                </CardDescription>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3" />
              New Resource
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Card key={action.title} className="group cursor-pointer transition-colors hover:border-foreground/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {action.title}
                    <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                    {action.command}
                  </code>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">API Health</CardTitle>
            <CardDescription>
              Your Hive API is running at{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                http://localhost:3001
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
