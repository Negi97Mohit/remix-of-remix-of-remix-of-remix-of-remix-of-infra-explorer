import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, Globe, Database, GitMerge, Workflow, GraduationCap, Code2, Info, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/map", label: "World Map", icon: Globe },
  { to: "/sites/", label: "Sites", icon: Database },
  { to: "/reconciliation", label: "Reconciliation", icon: GitMerge },
  { to: "/data-flow", label: "Data Flow", icon: Workflow },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/api", label: "API", icon: Code2 },
  { to: "/about", label: "About", icon: Info },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-6 px-4 lg:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight">
                WLCG Explorer
              </span>
              <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:block">
                Infrastructure Recon
              </span>
            </div>
          </Link>
          <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">{children}</div>
      </main>
      <footer className="border-t border-border/60 py-3">
        <div className="mx-auto max-w-[1600px] px-4 text-center text-[11px] text-muted-foreground lg:px-6">
          WLCG Infrastructure Explorer — technical proof-of-concept. Live data
          from GOCDB, BDII & OSG. Not affiliated with CERN.
        </div>
      </footer>
    </div>
  );
}
