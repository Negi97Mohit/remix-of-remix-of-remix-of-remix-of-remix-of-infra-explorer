import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProviderBadges } from "@/components/provider-badge";
import { ConfidenceBadge } from "@/components/confidence-badge";
import type { ReconciledSite } from "@/lib/pipeline/models";
import { ShieldCheck, Server, Globe, Calendar, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";

interface SiteDrawerProps {
  site: ReconciledSite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SiteDrawer({ site, open, onOpenChange }: SiteDrawerProps) {
  if (!site) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto border-l border-rule bg-background p-6 space-y-6">
        <SheetHeader className="space-y-1 text-left border-b border-rule pb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-accent font-semibold tracking-wider">
              {site.canonical_id}
            </span>
            <ConfidenceBadge confidence={site.confidence} score={site.score} />
          </div>
          <SheetTitle className="text-2xl font-display font-black text-foreground">
            {site.name}
          </SheetTitle>
          <div className="flex items-center gap-2 pt-1">
            <ProviderBadges providers={site.providers} />
            {site.country && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {site.country} {site.country_code ? `(${site.country_code})` : ""}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Source Identifiers & Topology Position */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-accent" />
            Participating Source Identifiers
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {site.source_ids.map((sid) => (
              <div
                key={sid}
                className="p-2.5 rounded border border-rule bg-card/50 flex justify-between items-center"
              >
                <span className="text-muted-foreground">Source Key:</span>
                <span className="font-mono font-semibold text-foreground">{sid}</span>
              </div>
            ))}
            {site.latitude !== undefined && site.longitude !== undefined && (
              <div className="p-2.5 rounded border border-rule bg-card/50 flex justify-between items-center sm:col-span-2">
                <span className="text-muted-foreground">Coordinates:</span>
                <span className="font-mono text-foreground">
                  {site.latitude.toFixed(3)}, {site.longitude.toFixed(3)} ({site.coordinate_precision})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Field-level Provenance Audit */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Field-Level Provenance & Precedence Lineage
          </h3>
          {site.fields && site.fields.length > 0 ? (
            <div className="divide-y divide-rule border border-rule rounded bg-card/40 overflow-hidden text-xs">
              {site.fields.map((field) => (
                <div key={field.field} className="p-3 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-foreground capitalize">
                      canonical.{field.field}
                    </span>
                    {field.selected_from && (
                      <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold rounded bg-accent/15 text-accent border border-accent/30">
                        Selected: {field.selected_from}
                      </span>
                    )}
                  </div>
                  <div className="text-foreground font-mono bg-background/80 px-2 py-1 rounded border border-rule/60 truncate">
                    Value: {String(field.value ?? "null")}
                  </div>
                  {field.provenance && field.provenance.length > 0 && (
                    <div className="pt-1 space-y-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                        Raw Source Attributions:
                      </span>
                      {field.provenance.map((prov, i) => (
                        <div key={i} className="text-[11px] text-muted-foreground flex justify-between items-center pl-2 border-l border-rule">
                          <span>
                            <strong className="text-foreground uppercase">{prov.provider}</strong> ({prov.source_field}): &quot;{prov.value}&quot;
                          </span>
                          <span className="font-mono text-[10px]">{prov.retrieved_at ? new Date(prov.retrieved_at).toLocaleTimeString() : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 border border-rule rounded bg-card/20 text-xs text-muted-foreground">
              Single-source entity. Field values inherit directly from source record.
            </div>
          )}
        </div>

        {/* Conflicts Log */}
        {site.conflicts && site.conflicts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Recorded Source Disagreements ({site.conflicts.length})
            </h3>
            <div className="space-y-2 text-xs">
              {site.conflicts.map((conflict, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-amber-500/30 bg-amber-500/10 rounded space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground uppercase tracking-wider font-mono">
                      Field: {conflict.field}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 border border-amber-500/30">
                      {conflict.status}
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {conflict.values.map((v, vi) => (
                      <div key={vi} className="text-muted-foreground">
                        <span className="font-semibold uppercase text-foreground">{v.provider}</span>: {v.value}
                      </div>
                    ))}
                  </div>
                  {conflict.resolution && (
                    <div className="text-[11px] text-foreground pt-1 border-t border-amber-500/20">
                      <strong>Policy Resolution:</strong> {conflict.resolution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services & Endpoints */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-accent" />
            Normalized Services ({site.services.length})
          </h3>
          <div className="space-y-2 text-xs">
            {site.services.map((svc, i) => (
              <div
                key={i}
                className="p-2.5 rounded border border-rule bg-card/40 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">{svc.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rule text-foreground">
                    {svc.type ?? "service"}
                  </span>
                </div>
                {svc.endpoint && (
                  <div className="font-mono text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                    {svc.endpoint}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 text-[10px] text-muted-foreground uppercase tracking-wider border-t border-rule text-center">
          WLCG CRIC Technical POC · Non-destructive Provenance Architecture
        </div>
      </SheetContent>
    </Sheet>
  );
}
