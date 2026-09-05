import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Plain-language explanations for the vocabulary used across the explorer.
 * Keyed by short term so any page can reference the same wording.
 */
export const GLOSSARY: Record<string, string> = {
  site: "A physical computing centre that contributes storage or processing power to the grid. One site can be described by several catalogues at once.",
  provider:
    "A catalogue that publishes infrastructure metadata. This app reads three of them: GOCDB (Europe), BDII/GLUE2 (technical service directory) and OSG Topology (United States).",
  gocdb:
    "GOCDB — the European operations registry. Administratively authoritative: official names, countries and operating centres, but rarely exact coordinates.",
  bdii:
    "BDII publishes GLUE2 records over LDAP. The richest technical source: exact latitude/longitude, service endpoints, software implementations and versions.",
  osg: "OSG Topology — the United States resource catalogue, published as XML. Uses its own naming conventions, so names must be normalized before comparing.",
  normalization:
    "Rewriting every catalogue's own format into one shared shape (name, country, coordinates, endpoints, services) without ever changing or deleting the original record.",
  reconciliation:
    "Deciding which records from different catalogues describe the same real-world site, and showing the reasoning instead of silently merging them.",
  evidence:
    "One piece of proof that two records are the same site — a matching name, the same country, a shared server address, or coordinates that agree. Each is worth points.",
  score:
    "The sum of all evidence points for a group of records. Higher means stronger proof that they describe one site.",
  confidence:
    "How trustworthy the match is: High (70+ points), Medium (45+), Review (below 45, needs a human), Single (only one catalogue knows this site).",
  canonical:
    "The unified view assembled from every matched record — one name, one country, one set of coordinates, with a note of which catalogue each value came from.",
  provenance:
    "The trail behind every unified value: which catalogue it came from, which field, and when it was retrieved.",
  conflict:
    "Two catalogues stating different values for the same field. Nothing is overwritten — the disagreement is shown so it can be judged.",
  endpoint:
    "The network address of a service running at a site, for example a storage or job-submission server.",
  service:
    "A capability offered by a site, such as file storage, data transfer or job execution.",
  freshness:
    "When the data was last fetched from the live catalogues. Timestamps are always real, never simulated.",
  coordinates:
    "Latitude and longitude. Marked exact when a catalogue published them, or country when only the country was known and a country centre is used instead.",
};

export function InfoTip({
  term,
  text,
  className,
  children,
}: {
  term?: keyof typeof GLOSSARY | string;
  text?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const body = text ?? (term ? GLOSSARY[term] : undefined);
  if (!body) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children ? (
            <span
              className={cn(
                "cursor-help decoration-accent/60 decoration-dotted underline-offset-4 hover:underline",
                className,
              )}
            >
              {children}
            </span>
          ) : (
            <button
              type="button"
              aria-label={`What is ${term}?`}
              className={cn(
                "inline-flex shrink-0 align-middle text-muted-foreground transition-colors hover:text-accent",
                className,
              )}
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] border border-rule bg-paper text-[11.5px] leading-relaxed text-ink-soft shadow-lg"
        >
          {term ? (
            <span className="mb-1 block text-[9.5px] font-semibold uppercase tracking-[0.18em] text-accent">
              {term}
            </span>
          ) : null}
          {body}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
