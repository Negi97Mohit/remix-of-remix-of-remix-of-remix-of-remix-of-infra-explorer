import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Globe,
  Database,
  GitMerge,
  Workflow,
  GraduationCap,
  Code2,
  Info,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/map", label: "Map", icon: Globe },
  { to: "/sites", label: "Sites", icon: Database },
  { to: "/reconciliation", label: "Reconciliation", icon: GitMerge },
  { to: "/data-flow", label: "Data Flow", icon: Workflow },
  { to: "/guide", label: "Guide", icon: BookOpen },
  { to: "/learn", label: "Learn", icon: GraduationCap },
  { to: "/api", label: "API", icon: Code2 },
  { to: "/about", label: "About", icon: Info },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-rule bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 lg:px-8">
          <div className="hidden items-center gap-2 label-micro sm:flex">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>Live · GOCDB / BDII / OSG</span>
          </div>
          <Link to="/" className="text-center">
            <span className="whitespace-nowrap font-display text-xl font-black tracking-tight sm:text-2xl">
              WLCG <em className="font-normal italic text-accent">Explorer</em>
            </span>
          </Link>
          <div className="flex justify-end label-micro">
            <span className="hidden md:inline">Unifying grid metadata</span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 lg:px-8">
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">{children}</div>
      </main>
      <footer className="border-t border-rule py-4">
        <div className="mx-auto max-w-[1600px] px-4 text-center text-[10px] uppercase tracking-[0.18em] text-muted-foreground lg:px-8">
          Technical proof-of-concept · Live data from GOCDB, BDII &amp; OSG · Not
          affiliated with CERN
        </div>
      </footer>
    </div>
  );
}
