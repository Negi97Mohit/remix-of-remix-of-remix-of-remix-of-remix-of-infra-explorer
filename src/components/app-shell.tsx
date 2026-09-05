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
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { to: "/", label: "Operations Hub", icon: Activity },
  { to: "/sites", label: "Global Catalogue", icon: Database },
  { to: "/reconciliation", label: "Reconciliation Inspector", icon: GitMerge },
  { to: "/checks", label: "Quality & Pipeline Audit", icon: ShieldCheck },
  { to: "/data-flow", label: "Adapter Architecture", icon: Workflow },
] as const;

const SECONDARY_NAV = [
  { to: "/map", label: "Grid Map", icon: Globe },
  { to: "/data", label: "Raw Snapshots", icon: FileSpreadsheet },
  { to: "/guide", label: "CRIC Guide", icon: BookOpen },
  { to: "/learn", label: "Engineering Primer", icon: GraduationCap },
  { to: "/api", label: "REST Endpoints", icon: Code2 },
  { to: "/about", label: "About POC", icon: Info },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-rule bg-background/95 backdrop-blur">
        <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 lg:px-8">
          <div className="hidden items-center gap-2 label-micro sm:flex">
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-foreground">
              CERN CRIC POC <span className="text-muted-foreground font-normal">· Multi-Source Federation</span>
            </span>
          </div>
          <Link to="/" className="text-center">
            <span className="whitespace-nowrap font-display text-xl font-black tracking-tight sm:text-2xl text-foreground">
              WLCG <em className="font-normal italic text-accent">CRIC</em> Catalogue
            </span>
          </Link>
          <div className="flex justify-end items-center gap-3 label-micro">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/10 text-accent border border-accent/20">
              828 GOCDB · 1 BDII · 124 OSG
            </span>
          </div>
        </div>

        {/* Primary Operational Navigation */}
        <nav className="mx-auto flex max-w-[1600px] items-center justify-between overflow-x-auto border-t border-border px-4 py-1.5 lg:px-8">
          <div className="flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors rounded-sm",
                    active
                      ? "bg-foreground text-background shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Secondary Utilities */}
          <div className="hidden xl:flex items-center gap-1 border-l border-rule pl-3">
            {SECONDARY_NAV.map((item) => {
              const active = pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap px-2 py-1 text-[10px] font-medium tracking-wide transition-colors",
                    active
                      ? "text-accent font-bold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">{children}</div>
      </main>

      <footer className="border-t border-rule py-4 bg-card/20">
        <div className="mx-auto max-w-[1600px] px-4 flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground gap-2 lg:px-8">
          <div>
            CERN CRIC Technical POC · IT-CE-LCG-2026-54-GRAP Demonstration
          </div>
          <div>
            Real Infrastructure Sources: GOCDB (REST/XML), BDII (GLUE2 LDAP), OSG (HTTP/XML)
          </div>
        </div>
      </footer>
    </div>
  );
}
