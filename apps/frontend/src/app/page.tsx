import { ArrowRight, GitBranch, RadioTower, ShieldCheck, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "Clerk ready",
    description: "Authentication provider is wired into the root layout.",
    icon: ShieldCheck,
  },
  {
    title: "Realtime ready",
    description: "Socket.IO client dependency is available.",
    icon: RadioTower,
  },
  {
    title: "DAG ready",
    description: "React Flow is installed for the builder phase.",
    icon: GitBranch,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <GitBranch className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight">FlowForge</span>
        </div>
        <Button variant="outline" className="rounded-full">
          Sign in
        </Button>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border bg-card/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
            Workflow orchestration for teams that move fast
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-balance sm:text-7xl">
              Build DAGs that feel alive.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              FlowForge brings workflow design, realtime execution logs, and team governance into
              one focused workspace.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full">
              Start building
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="secondary" className="rounded-full">
              View architecture
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-foreground/10 bg-card/80 shadow-2xl shadow-primary/10 backdrop-blur">
          <CardHeader>
            <CardTitle>Phase 6 frontend base</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {features.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-2xl border bg-background/60 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <h2 className="font-semibold">{title}</h2>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
