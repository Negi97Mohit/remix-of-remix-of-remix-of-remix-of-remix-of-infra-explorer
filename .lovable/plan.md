# CRIC technical POC dashboard transformation

## Outcome
Transform the current WLCG explorer into a serious CERN/CRIC-style operations dashboard that makes the unified catalogue, the IISAS-Bratislava evidence match, ingestion quality, provenance, conflicts, and adapter health visible as one coherent workflow.

## Work
1. Establish the visual language: navy/slate tokens, compact engineering typography, restrained square data surfaces, explicit status badges, and source-specific accents; update shared shell/navigation to use CRIC naming and prioritize the requested operational views.
2. Add a deterministic CRIC demo dataset layer alongside the live pipeline so the requested real sample records and counts are always present in the POC while live source health remains visible and honest.
3. Rebuild the global sites catalogue as a searchable/filterable grid with source, country, quality filters, pagination, summary metrics, and an interactive slide-over detail drawer.
4. Build the reconciliation inspector around IISAS-Bratislava with side-by-side GOCDB/BDII raw fields, the 85-point evidence card, canonical object, provenance field inspector, and an explicit resolved conflict scenario.
5. Add an ingestion quality and sanitization log, adapter health/status cards, and a simulated pipeline-run control with progress and refreshed status.
6. Keep the existing map, raw data, validation checks, guide, and data-flow capabilities discoverable, but align copy and navigation with the CRIC POC model.
7. Verify all requested flows at desktop and narrow responsive widths, then resolve build/runtime errors and confirm route metadata.

## Technical details
- Reuse the existing TanStack Router, React Query, normalized models, provider adapters, reconciliation engine, and design-system tokens.
- Use client state for drawer, filters, pagination, and pipeline-run animation; do not introduce persistence or authentication for this presentation-only POC.
- Preserve raw provider values and provenance; demo rows are clearly marked as POC fixtures where they do not come from the current live snapshot.
- Use the existing design-system Button and Tooltip primitives for controls and explanations; avoid hardcoded colors in JSX and keep all palette values in `src/styles.css`.
