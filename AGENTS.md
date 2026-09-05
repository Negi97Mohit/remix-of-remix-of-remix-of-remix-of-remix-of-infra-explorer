# CERN CRIC Technical POC Project Guidelines

This project implements a multi-source WLCG Computing Resource Information Catalogue (CRIC) Technical POC for the **IT-CE-LCG-2026-54-GRAP** role.

### Key Architectural Guidelines:
1. **Preserve Raw Provenance**: Raw snapshots from GOCDB, BDII GLUE2, and OSG Topology are preserved without destructive mutation.
2. **Explainable Reconciliation**: Cross-catalogue entity resolution uses auditable evidence scoring (+40 domain_id, +20 country, +25 endpoint host).
3. **Data Quality Awareness**: Anomalies (such as GOCDB record whitespace) are sanitized and flagged with `valid_with_warnings` rather than dropping records.
