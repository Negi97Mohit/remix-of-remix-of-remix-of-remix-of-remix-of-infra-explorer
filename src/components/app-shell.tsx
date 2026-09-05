import { useState, useRef, useEffect } from "react";
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
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRIMARY_NAV = [
  { to: "/", label: "Operations Hub", icon: Activity },
  { to: "/sites", label: "Global Catalogue", icon: Database },
  { to: "/reconciliation", label: "Reconciliation", icon: GitMerge },
  { to: "/checks", label: "Quality Audit", icon: ShieldCheck },
  { to: "/data-flow", label: "Architecture", icon: Workflow },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close menus on page change
  useEffect(() => {
    setMobileMenuOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  const isSecondaryActive = SECONDARY_NAV.some((item) => pathname.startsWith(item.to));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-rule bg-background/95 backdrop-blur-md">
        {/* Brand Bar */}
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-2.5 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-lg font-black tracking-tight sm:text-xl text-foreground">
                WLCG <em className="font-normal italic text-accent">CRIC</em>
              </span>
            </Link>
            <span className="hidden h-4 w-px bg-border sm:inline-block" />
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-mono text-[11px]">Multi-Source Federation</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/10 text-accent border border-accent/20 sm:inline-block">
              828 GOCDB · 1 BDII · 124 OSG
            </span>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Desktop Underline Nav (Zero Horizontal Scroll) */}
        <nav className="hidden border-t border-rule lg:block">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => {
                const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group flex items-center gap-2 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "border-primary text-foreground font-semibold"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 stroke-[1.5] transition-colors",
                        active
                          ? "text-primary"
                          : "text-muted-foreground/70 group-hover:text-foreground",
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Resources Dropdown (Keeps Nav Clean & Lean) */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setResourcesOpen(!resourcesOpen)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
                  isSecondaryActive
                    ? "border-accent text-accent font-semibold"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                <span>Resources & Docs</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 stroke-[1.5] transition-transform duration-150",
                    resourcesOpen && "rotate-180",
                  )}
                />
              </button>

              {resourcesOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 rounded-md border border-border bg-popover p-1 shadow-lg z-50">
                  {SECONDARY_NAV.map((item) => {
                    const active = pathname.startsWith(item.to);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2 rounded px-2.5 py-1.5 text-xs transition-colors",
                          active
                            ? "bg-accent/10 font-semibold text-accent"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile / Tablet Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Core Views
                </div>
                <div className="flex flex-col gap-1">
                  {PRIMARY_NAV.map((item) => {
                    const active =
                      item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4 stroke-[1.5]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border/60 pt-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Resources
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {SECONDARY_NAV.map((item) => {
                    const active = pathname.startsWith(item.to);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                          active
                            ? "bg-accent/10 font-semibold text-accent"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 stroke-[1.5]" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">{children}</div>
      </main>

      <footer className="border-t border-rule py-4 bg-card/20">
        <div className="mx-auto max-w-[1600px] px-4 flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground gap-2 lg:px-8">
          <div>CERN CRIC Technical POC · IT-CE-LCG-2026-54-GRAP Demonstration</div>
          <div>
            Real Infrastructure Sources: GOCDB (REST/XML), BDII (GLUE2 LDAP), OSG (HTTP/XML)
          </div>
        </div>
      </footer>
    </div>
  );
}
