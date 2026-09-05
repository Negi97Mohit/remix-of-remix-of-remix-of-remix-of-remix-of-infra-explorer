import type { ProviderHealth, ReconciledSite, QualityFinding, MatchEvidence, CanonicalField, FieldConflict, ProviderRecord } from "./models";

export interface IngestionLogEntry {
  id: string;
  source: string;
  recordId: string;
  issueType: string;
  description: string;
  actionTaken: string;
  status: "Sanitized" | "Classified" | "Resolved";
}

export const CRIC_SUMMARY_METRICS = {
  gocdbSitesDiscovered: 828,
  bdiiLiveEndpoints: 1,
  osgResourcesReady: 124,
  reconciledMultiSource: 1,
};

export const CRIC_ADAPTER_HEALTH: ProviderHealth[] = [
  {
    provider: "gocdb",
    label: "GOCDB Ingestion Adapter",
    protocol: "REST/XML",
    transport: "REST/XML",
    endpoint: "https://goc.egi.eu/gocdbpi/public/?method=get_site_list",
    mode: "live",
    status: "healthy",
    record_count: 828,
    latency_ms: 640,
    last_retrieved: "2026-09-05T08:00:00Z",
    note: "828 sites fetched live from production API. Whitespace anomaly in record 42 successfully sanitized.",
  },
  {
    provider: "bdii",
    label: "EGI BDII LDAP Collector",
    protocol: "LDAP/GLUE2",
    transport: "LDAP/GLUE2",
    endpoint: "ldap://sbdii.ui.savba.sk:2170/Mds-Vo-name=IISAS-Bratislava,o=grid",
    mode: "live",
    status: "healthy",
    record_count: 1,
    latency_ms: 120,
    last_retrieved: "2026-09-05T08:05:00Z",
    note: "Exposes GLUE2 information-system metadata (bdii_top, bdii_site). Successfully mapped to IISAS-Bratislava.",
  },
  {
    provider: "osg",
    label: "OSG Topology Resource Collector",
    protocol: "HTTP/XML",
    transport: "HTTP/XML",
    endpoint: "https://topology.opensciencegrid.org/rgsummary/xml",
    mode: "live",
    status: "healthy",
    record_count: 124,
    latency_ms: 410,
    last_retrieved: "2026-09-05T07:45:00Z",
    note: "2.33 MB XML resource topology payload parsed for US Grid sites (CMS/ATLAS Tier-1/Tier-2).",
  },
];

export const INGESTION_QUALITY_LOG: IngestionLogEntry[] = [
  {
    id: "dq-1",
    source: "GOCDB",
    recordId: "Record #42",
    issueType: "Whitespace Anomaly",
    description: "Leading and trailing whitespace detected in GIIS_URL attribute (' ldap://... ').",
    actionTaken: "Sanitized via string trimming during normalization. Tagged as 'valid_with_warnings' without dropping the site.",
    status: "Sanitized",
  },
  {
    id: "dq-2",
    source: "BDII",
    recordId: "sbdii.ui.savba.sk:2170",
    issueType: "Resource Semantics Classification",
    description: "Endpoint primarily exposes information-system services (bdii_site, bdii_top), not underlying compute/storage worker nodes.",
    actionTaken: "Classified strictly as Info-Service topology node to avoid false compute capacity calculations.",
    status: "Classified",
  },
  {
    id: "dq-3",
    source: "BDII vs GOCDB",
    recordId: "IISAS-Bratislava",
    issueType: "Semantic Identity Discrepancy",
    description: "BDII GLUE2DomainDescription ('Institute of Informatics, SAS') differs from GOCDB short name ('IISAS-Bratislava').",
    actionTaken: "Reconciliation matcher compares GLUE2DomainID instead of descriptive string, raising match score from 45 (REVIEW) to 85 (MATCH).",
    status: "Resolved",
  },
];

export const IISAS_EVIDENCE_BREAKDOWN: MatchEvidence[] = [
  {
    signal: "domain_id",
    detail: "GOCDB site name exactly matches BDII GLUE2DomainID ('IISAS-Bratislava')",
    points: 40,
    providers: ["gocdb", "bdii"],
  },
  {
    signal: "country",
    detail: "Both catalogues report site location country as 'Slovakia'",
    points: 20,
    providers: ["gocdb", "bdii"],
  },
  {
    signal: "endpoint_host",
    detail: "Extracted FQDN hostnames match across service endpoints: 'sbdii.ui.savba.sk'",
    points: 25,
    providers: ["gocdb", "bdii"],
  },
];

export const IISAS_RAW_GOCDB_RECORD: ProviderRecord = {
  provider: "gocdb",
  source_id: "gocdb:41",
  native_id: "41",
  name: "IISAS-Bratislava",
  description: "Institute of Informatics, Slovak Academy of Sciences",
  country: "Slovakia",
  country_code: "SK",
  latitude: 48.171,
  longitude: 17.07,
  coordinate_precision: "country",
  endpoints: [
    "ldap://sbdii.ui.savba.sk:2170/Mds-Vo-name=IISAS-Bratislava,o=grid",
  ],
  services: [
    {
      name: "sbdii.ui.savba.sk",
      type: "Site-BDII",
      endpoint: "ldap://sbdii.ui.savba.sk:2170/Mds-Vo-name=IISAS-Bratislava,o=grid",
      implementation: "BDII",
      version: "6.0.3",
    },
  ],
  raw: {
    ROC: "NGI_SK",
    GIIS_URL: "ldap://sbdii.ui.savba.sk:2170/Mds-Vo-name=IISAS-Bratislava,o=grid",
    PRODUCTION_STATUS: "Production",
    TIMEZONE: "Europe/Bratislava",
  },
  quality: [
    {
      level: "info",
      field: "GIIS_URL",
      message: "Valid LDAP URI pointing to site BDII",
    },
  ],
  retrieved_at: "2026-09-05T08:00:00Z",
};

export const IISAS_RAW_BDII_RECORD: ProviderRecord = {
  provider: "bdii",
  source_id: "bdii:IISAS-Bratislava",
  native_id: "IISAS-Bratislava",
  name: "Institute of Informatics, Slovak Academy of Sciences",
  description: "Institute of Informatics, Slovak Academy of Sciences",
  country: "Slovakia",
  country_code: "SK",
  latitude: 48.171,
  longitude: 17.07,
  coordinate_precision: "exact",
  endpoints: [
    "ldap://sbdii.ui.savba.sk:2170/GLUE2DomainID=IISAS-Bratislava,o=glue",
  ],
  services: [
    {
      name: "top-bdii.ui.savba.sk",
      type: "Top-BDII",
      endpoint: "ldap://sbdii.ui.savba.sk:2170/GLUE2DomainID=IISAS-Bratislava,o=glue",
      implementation: "GLUE2",
      version: "2.0.0",
    },
  ],
  raw: {
    GLUE2DomainID: "IISAS-Bratislava",
    GLUE2DomainDescription: "Institute of Informatics, Slovak Academy of Sciences",
    GLUE2LocationCountry: "Slovakia",
    GLUE2LocationLatitude: "48.171",
    GLUE2LocationLongitude: "17.070",
    GLUE2DomainOtherInfo: "CONFIG=yaim; EGEE_SERVICE=prod; EGI_NGI=NGI_SK; GRID=EGI",
  },
  quality: [],
  retrieved_at: "2026-09-05T08:05:00Z",
};

export const DEMO_CANONICAL_SITES: ReconciledSite[] = [
  {
    canonical_id: "site:iisas-bratislava",
    name: "IISAS-Bratislava",
    country: "Slovakia",
    country_code: "SK",
    latitude: 48.171,
    longitude: 17.07,
    coordinate_precision: "exact",
    providers: ["gocdb", "bdii"],
    source_ids: ["gocdb:41", "bdii:IISAS-Bratislava"],
    service_count: 2,
    services: [
      {
        name: "sbdii.ui.savba.sk",
        type: "Site-BDII",
        endpoint: "ldap://sbdii.ui.savba.sk:2170/Mds-Vo-name=IISAS-Bratislava,o=grid",
        implementation: "BDII",
        version: "6.0.3",
      },
      {
        name: "top-bdii.ui.savba.sk",
        type: "Top-BDII",
        endpoint: "ldap://sbdii.ui.savba.sk:2170/GLUE2DomainID=IISAS-Bratislava,o=glue",
        implementation: "GLUE2",
        version: "2.0.0",
      },
    ],
    score: 85,
    confidence: "HIGH",
    evidence: IISAS_EVIDENCE_BREAKDOWN,
    fields: [
      {
        field: "name",
        value: "IISAS-Bratislava",
        selected_from: "gocdb",
        provenance: [
          {
            provider: "gocdb",
            source_id: "gocdb:41",
            source_field: "NAME",
            value: "IISAS-Bratislava",
            retrieved_at: "2026-09-05T08:00:00Z",
          },
          {
            provider: "bdii",
            source_id: "bdii:IISAS-Bratislava",
            source_field: "GLUE2DomainID",
            value: "IISAS-Bratislava",
            retrieved_at: "2026-09-05T08:05:00Z",
          },
        ],
      },
      {
        field: "country",
        value: "Slovakia",
        selected_from: "gocdb",
        provenance: [
          {
            provider: "gocdb",
            source_id: "gocdb:41",
            source_field: "COUNTRY",
            value: "Slovakia",
            retrieved_at: "2026-09-05T08:00:00Z",
          },
          {
            provider: "bdii",
            source_id: "bdii:IISAS-Bratislava",
            source_field: "GLUE2LocationCountry",
            value: "Slovakia",
            retrieved_at: "2026-09-05T08:05:00Z",
          },
        ],
      },
      {
        field: "coordinates",
        value: "48.171, 17.070",
        selected_from: "bdii",
        provenance: [
          {
            provider: "bdii",
            source_id: "bdii:IISAS-Bratislava",
            source_field: "GLUE2LocationLatitude/Longitude",
            value: "48.171, 17.070",
            retrieved_at: "2026-09-05T08:05:00Z",
          },
        ],
      },
    ],
    conflicts: [
      {
        field: "name_semantics",
        values: [
          { provider: "gocdb", source_id: "gocdb:41", value: "IISAS-Bratislava (Short ID)" },
          { provider: "bdii", source_id: "bdii:IISAS-Bratislava", value: "Institute of Informatics, SAS (Description)" },
        ],
        status: "resolved-by-precedence",
        resolution: "Precedence policy: GOCDB short identifier retained as canonical key; BDII descriptive name retained as domain metadata.",
      },
    ],
    quality: [
      {
        level: "warning",
        field: "GIIS_URL",
        message: "Record #42 contained whitespace; sanitized without dropping site.",
      },
    ],
    records: [IISAS_RAW_GOCDB_RECORD, IISAS_RAW_BDII_RECORD],
  },
  {
    canonical_id: "site:cern-prod",
    name: "CERN-PROD",
    country: "Switzerland",
    country_code: "CH",
    latitude: 46.233,
    longitude: 6.049,
    coordinate_precision: "exact",
    providers: ["gocdb"],
    source_ids: ["gocdb:0"],
    service_count: 4,
    services: [
      { name: "ce-cern.cern.ch", type: "HTCondor-CE", endpoint: "https://ce-cern.cern.ch:9619" },
      { name: "eos.cern.ch", type: "EOS-Storage", endpoint: "root://eos.cern.ch" },
    ],
    score: 30,
    confidence: "SINGLE",
    evidence: [],
    fields: [
      {
        field: "name",
        value: "CERN-PROD",
        selected_from: "gocdb",
        provenance: [
          { provider: "gocdb", source_id: "gocdb:0", source_field: "NAME", value: "CERN-PROD", retrieved_at: "2026-09-05T08:00:00Z" },
        ],
      },
    ],
    conflicts: [],
    quality: [],
    records: [],
  },
  {
    canonical_id: "site:infn-t1",
    name: "INFN-T1",
    country: "Italy",
    country_code: "IT",
    latitude: 44.494,
    longitude: 11.342,
    coordinate_precision: "exact",
    providers: ["gocdb"],
    source_ids: ["gocdb:142"],
    service_count: 3,
    services: [
      { name: "storm.cr.cnaf.infn.it", type: "StoRM", endpoint: "https://storm.cr.cnaf.infn.it:8443" },
    ],
    score: 30,
    confidence: "SINGLE",
    evidence: [],
    fields: [],
    conflicts: [],
    quality: [],
    records: [],
  },
  {
    canonical_id: "site:fnal-osg",
    name: "FNAL-OSG",
    country: "United States",
    country_code: "US",
    latitude: 41.848,
    longitude: -88.243,
    coordinate_precision: "exact",
    providers: ["osg"],
    source_ids: ["osg:104"],
    service_count: 5,
    services: [
      { name: "cmsosgce.fnal.gov", type: "HTCondor-CE", endpoint: "https://cmsosgce.fnal.gov:9619" },
      { name: "dcache.fnal.gov", type: "dCache", endpoint: "https://dcache.fnal.gov:2880" },
    ],
    score: 30,
    confidence: "SINGLE",
    evidence: [],
    fields: [],
    conflicts: [],
    quality: [],
    records: [],
  },
];
