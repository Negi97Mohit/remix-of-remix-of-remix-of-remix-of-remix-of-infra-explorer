# WLCG Infrastructure Explorer — Build Plan

## What we have
The data pipeline is complete in `src/lib/pipeline/`:
- `providers/gocdb.ts`, `providers/osg.ts` — live REST/HTTP XML fetchers
- `providers/bdii.ts` + `bdii-snapshot.ts` — GLUE2 snapshot adapter
- `reconciliation.ts` — evidence-based matching, provenance, conflict tracking
- `models.ts`, `geo.ts`, `xml.ts` — shared model, geo, and XML tooling

## What we build now (one pass)
The service layer + the full UI.

### 1. Service / orchestrator layer
- `src/lib/pipeline/snapshot.ts` — `buildSnapshot()` runs all three adapters in parallel, catches per-provider errors (so one failed provider doesn't kill the page), reconciles, and returns a `Snapshot` with per-provider `ProviderHealth`.
- `src/lib/pipeline.functions.ts` — typed server functions via `createServerFn`:
  - `getSnapshot()` — full reconciled snapshot (for dashboard, map, explorer, reconciliation)
  - `getSite(canonical_id)` — single site with full records for detail page
  - `getProviders()` — provider health summary
  Uses an in-memory cache (60s TTL) so repeated navigations don't re-fetch the ~2.4MB OSG payload.

### 2. Query layer + shared UI primitives
- `src/lib/queries.ts` — query keys + `queryOptions` for each server fn.
- `src/components/site-layout.tsx` — app shell: top nav (Dashboard, Map, Sites, Reconciliation, Data Flow, Learn, API, About), dark engineering theme.
- `src/components/confidence-badge.tsx`, `provider-badge.tsx`, `quality-list.tsx` — small reusable presentational components.
- Update `src/routes/__root.tsx` head metadata to real title/description, and render `<Toaster />` (sonner).

### 3. Pages (routes under `src/routes/`)
| Route | File | Purpose |
|---|---|---|
| `/` | `index.tsx` (rewrite) | Dashboard: KPI cards (sites, providers, coverage countries, matched vs single-provider), provider health cards, confidence-band distribution chart, top conflicts list |
| `/map` | `map.tsx` | World map (react-simple-maps + d3-geo) of reconciled sites; marker color by confidence; click → site detail; search box filters markers; legend |
| `/sites` | `sites.tsx` | Searchable/sortable table of reconciled sites: name, country, providers, services, confidence, score. Click row → detail |
| `/sites/$id` | `sites.$id.tsx` | Site detail: canonical fields with provenance chips, **side-by-side provider records** comparison, "Trace This Match" evidence walkthrough, conflict visualization, quality findings, raw record viewer |
| `/reconciliation` | `reconciliation.tsx` | Focus on matched sites: evidence breakdown, score breakdown, conflict resolution explanations; filter by confidence band |
| `/data-flow` | `data-flow.tsx` | Visual pipeline diagram (Ingest → Normalize → Reconcile → Trace) with live stats per stage; explain each stage |
| `/learn` | `learn.tsx` | Educational content: WLCG/grid computing, GLUE2, BDII, GOCDB, OSG, why reconciliation matters — interview-friendly explanations |
| `/api` | `api-docs.tsx` | Documented API: endpoint list, example responses, query params, how provenance is traced |
| `/about` | `about.tsx` | Project purpose, scope (proof-of-concept, not CRIC replacement), tech stack, data sources, limitations |

### 4. Design direction
Professional engineering-tool aesthetic — not generic AI SaaS. Dark, data-dense, monospace accents for IDs/coordinates, restrained color (one accent for "live", muted neutrals, semantic confidence colors). Uses existing shadcn tokens; map uses a dark world geography.

## Build order
1. snapshot.ts + pipeline.functions.ts + queries.ts (service layer)
2. site-layout + __root.tsx metadata + badges
3. Dashboard (index) — proves end-to-end data flow
4. Sites list + Site detail (side-by-side + Trace This Match) — the core deliverable
5. World Map
6. Reconciliation view
7. Data Flow, Learn, API, About
8. Verify: build, typecheck, smoke-test each route in the preview

## Out of scope
- No auth / users (read-only public tool).
- No database persistence (pipeline runs live on each load; cached 60s in memory).
- BDII stays snapshot-mode (raw LDAP port 2170 unreachable from edge runtime).
