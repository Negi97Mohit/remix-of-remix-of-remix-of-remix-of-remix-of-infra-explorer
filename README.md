# Remix of Remix of Remix of Remix of Remix of Infra Explorer

Build a production-quality full-stack web application called WLCG Infrastructure Explorer.

Objective

This is NOT a recreation or replacement of CERN's CRIC.

This is a CRIC-inspired technical proof-of-concept demonstrating how heterogeneous infrastructure metadata from multiple real public providers can be:

collected live

normalized

validated

reconciled

traced through provenance

explored visually

The application should feel like a professional engineering tool suitable for demonstrating during a CERN technical interview.

The most important feature is that multiple providers describing the same infrastructure site must appear side-by-side, allowing users to understand exactly how different information systems describe the same resource.

Existing Project (Do Not Rewrite)

An existing Python codebase already performs:

GOCDB REST/XML ingestion

BDII LDAP/GLUE2 ingestion

normalization

canonical Site model

data-quality detection

explainable reconciliation

Do not replace this architecture.

Extend it.

Technology Stack

Frontend

React

Vite

Tailwind CSS

React Router

TanStack Query

Framer Motion

Recharts

react-simple-maps

Lucide React

Backend

Python 3.13

FastAPI

Existing provider modules

Existing normalization pipeline

Existing reconciliation logic

Do not introduce Django yet.

Live Data Sources

The application must use real public infrastructure data.

Never use mock data for production views.

Source 1 — GOCDB

Official documentation:

https://gocdb.github.io/api/

Production endpoint:

https://goc.egi.eu/gocdbpi/public/?method=get_site_list

Returns XML.

Use it as the live site registry.

Source 2 — BDII

LDAP endpoint:

Host:

sbdii.ui.savba.sk

Port:

2170

Base DN:

o=glue

Use LDAP with GLUE2 schema.

Important GLUE2 objects include:

GLUE2Domain

GLUE2Location

GLUE2Service

GLUE2Endpoint

GLUE2Policy

GLUE2Extension

GLUE2Contact

Source 3 — OSG Topology

Official site:

https://topology.opensciencegrid.org/

Live XML:

https://topology.opensciencegrid.org/rgsummary/xml

Use it as another heterogeneous provider.

Backend Architecture

Keep the existing pipeline.

Live providers feed into adapters.

GOCDB
    ↓
GOCDB Adapter

BDII
    ↓
BDII Adapter

OSG
    ↓
OSG Adapter

        ↓

Raw Snapshots

        ↓

Normalization

        ↓

Validation

        ↓

Reconciliation

        ↓

Canonical Dataset

        ↓

FastAPI

        ↓

React UI

Never bypass normalization.

Never overwrite provider records.

FastAPI

Use port:

8000

Base URL:

http://localhost:8000

Create these endpoints.

Provider Health

GET /api/providers

Returns:

provider name

status

protocol

last retrieved

record count

Refresh

POST /api/refresh

Triggers live refresh.

Canonical Sites

GET /api/sites

Returns reconciled canonical sites.

Supports:

search

pagination

filters

Site Details

GET /api/sites/{canonical_id}

Returns:

canonical site

participating provider records

reconciliation evidence

provenance

conflicts

Raw GOCDB

GET /api/providers/gocdb

Returns normalized GOCDB data.

Raw BDII

GET /api/providers/bdii

Returns normalized BDII data.

Raw OSG

GET /api/providers/osg

Returns normalized OSG data.

Reconciliation Details

GET /api/reconciliation/{canonical_id}

Returns:

evidence

confidence

matched provider IDs

Map Data

GET /api/map

Returns:

latitude

longitude

provider

canonical ID

Live Refresh

Support:

manual refresh

automatic refresh every five minutes

freshness indicators

Every page should display:

Last retrieved

Refresh status

Source health

Example:

Retrieved 2 minutes ago

Healthy

Live

Never fake timestamps.

Frontend Design

Theme:

dark by default

modern

minimal

technical

subtle gradients

clean typography

Inspiration:

GitHub

Linear

Vercel

modern observability dashboards

Avoid:

fake CERN branding

stock illustrations

excessive glassmorphism

giant paragraphs

Navigation

Top navigation.

Dashboard

World Map

Site Explorer

Reconciliation

Data Flow

Learn

API

About

Dashboard

This is the landing page.

Hero

Title:

WLCG Infrastructure Explorer

Subtitle:

CRIC-inspired metadata aggregation and reconciliation using live infrastructure data from GOCDB, BDII and OSG.

Live Metrics

Show animated counters.

Cards:

GOCDB Sites

BDII Sites

OSG Resource Groups

High Confidence Matches

Review Matches

Providers

Last Refresh

Provider Health Cards

Each card shows:

protocol

status

records

last retrieved

Example:

GOCDB

REST

XML

Healthy

828 sites

BDII

LDAP

GLUE2

Healthy

OSG

XML

Healthy

World Map

This is the visual entry point.

Use:

react-simple-maps

Plot real coordinates.

Marker colors.

Blue = GOCDB

Green = BDII

Purple = OSG

Support:

zoom

pan

search

filters

Hover tooltip.

Show:

Site

Country

Provider

Click opens a side drawer.

Site Explorer

Display every canonical site.

Columns.

Name

Country

Providers

Services

Match Confidence

Canonical ID

Filters.

Country

Provider

Confidence

Search

Click opens the Site Detail page.

Site Detail

This is the most important page.

Example.

IISAS-Bratislava

The page must immediately show that multiple providers describe the same infrastructure.

Use a three-column layout.

Left Panel — GOCDB

Display real fields.

Site ID

Name

Country

Country Code

ROC

GIIS URL

Endpoint

Data Quality

Example warning.

GIIS_URL contains leading whitespace.

Right Panel — BDII

Display.

GLUE2DomainID

Description

Country

Latitude

Longitude

Service

Endpoint

Implementation

Version

Center Panel — Reconciliation Engine

This is the signature feature.

Animate evidence appearing one by one.

Example.

Domain identifier matched (+40)

Country matched (+20)

Endpoint host matched (+25)

Total:

85

Display.

HIGH CONFIDENCE MATCH

The animation should visually build the confidence score.

Side-by-Side Comparison

Every reconciled site must include a field-by-field comparison table.

Example.

Canonical Field

GOCDB

BDII

Name

IISAS-Bratislava

GLUE2DomainID=IISAS-Bratislava

Description

—

Institute of Informatics

Country

Slovakia

Slovakia

Endpoint

ldap://...

ldap://...

Coordinates

—

48.171 / 17.070

Matching fields should receive a subtle highlight.

Differences should be visually emphasized.

The table should resemble GitHub's diff viewer.

Reconciled Site

Below the comparison, display the merged object.

Show.

canonical_id

selected canonical fields

participating source IDs

confidence

provenance

conflicts

Example.

site:iisas-bratislava

Sources

GOCDB
gocdb:41

BDII
bdii:IISAS-Bratislava

Confidence

HIGH

Provenance Explorer

Every displayed field should answer:

Where did this value come from?

Example.

Country

↓

GOCDB

↓

SITE:41

↓

COUNTRY

↓

Retrieved timestamp

Implement this as an expandable provenance tree.

Never lose provider-specific information.

Conflict Viewer

If providers disagree, generate a structured conflict card.

Example.

Field

Country

GOCDB

Slovakia

BDII

Czech Republic

Status

Unresolved

Never silently overwrite.

Reconciliation Page

This page demonstrates how matching works.

Show.

Left.

GOCDB record.

Center.

Matcher.

Right.

BDII record.

Evidence appears step by step.

Display.

Identifier

Country

Endpoint

Confidence

Then show the resulting ReconciledSite.

Data Flow Page

Create an animated SVG architecture.

Flow.

GOCDB

BDII

OSG

↓

Adapters

↓

Raw Snapshots

↓

Normalization

↓

Validation

↓

Reconciliation

↓

Canonical Dataset

↓

FastAPI

↓

React UI

Animate data flowing through the pipeline.

Use restrained engineering-style motion.

Learn Section

Create interactive educational pages.

Topics.

GOCDB

Explain.

XML

REST

Site Registry

BDII

Explain.

LDAP

GLUE2

Information System Metadata

OSG

Explain.

Resource Groups

Topology XML

Normalization

Show.

Different schemas becoming one semantic model.

Reconciliation

Explain.

identifiers

evidence

confidence

provenance

Use diagrams rather than long paragraphs.

API Documentation Page

Automatically document the backend.

Base URL.

http://localhost:8000

Display.

endpoints

example requests

example responses

Make it resemble Swagger-style documentation.

Signature Feature — Trace This Match

This should become the most memorable feature.

When the user clicks:

IISAS-Bratislava

animate the complete pipeline.

Raw GOCDB XML record appears.

Raw BDII LDAP record appears.

Both pass through the Normalizer.

Matching signals illuminate one by one.

Confidence increases.

ReconciledSite is generated.

Every field remains clickable to reveal provenance.

The user should visually understand how two independent infrastructure systems become one canonical record.

Responsive Requirements

Support.

desktop

tablet

mobile

Desktop prioritizes side-by-side reconciliation.

Mobile stacks panels intelligently.

Project Structure

Frontend.

frontend/
    src/
        pages/
        components/
        services/
        hooks/
        assets/

Backend.

backend/
    src/
        providers/
        normalization/
        reconciliation/
        validation/
        provenance/
        models/

Keep API calls inside a dedicated service layer.

Never hardcode backend logic into UI components.

Success Criteria

The finished application should convincingly demonstrate:

Live ingestion from GOCDB, BDII and OSG.

Multi-source aggregation using real public infrastructure data.

Side-by-side comparison of provider records describing the same site.

Explainable reconciliation using evidence-based matching.

Interactive provenance tracing.

Conflict visualization.

A searchable world map of distributed computing infrastructure.

A professional engineering dashboard suitable for demonstrating during a CERN technical interview.

## Development

Prefer working locally? You need Node.js and npm:

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
