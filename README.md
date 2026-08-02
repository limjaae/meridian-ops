# Meridian Operations

**Turning operational complexity into coordinated action.**

Meridian is a decision-support platform for supply chain disruption, not a dashboard. It connects
an operational ontology (suppliers, products, ports, disruption events, decisions) to live
data, so a team can detect a risk, understand who and what it touches, and coordinate a response,
with a human making the final call every time.

## Two scenarios, one platform

1. **Live Australian port weather assessment**: real wind, swell, and precipitation data (via
   Open-Meteo) for nine Australian ports, scored against transparent operational thresholds, with
   inventory and revenue impact modeling and ranked alternative routes.
2. **Asia-Pacific Semiconductor Crisis (demo scenario)**: a synthetic but realistically-scaled
   incident (a Shanghai port closure cascading across Taiwan/Singapore-routed semiconductor
   suppliers) used to demonstrate the full Mission Control to Incident Workspace to Decision
   Register workflow end to end, with no login required (`/demo`).

## Product structure

- **Mission Control** (`/`): "what operational problems require attention right now?" Critical
  events, financial exposure, and priority actions, plus the product's ontology and personas.
- **Network** (`/network`): the supply network: ports, suppliers, live conditions.
- **Incidents** (`/incidents`, `/incidents/[id]`): root cause, quantified impact, response
  options, an actions checklist, and a decision-logging form. This is the core "disruption
  workspace."
- **Decisions** (`/decisions`): the decision register, recording every choice, its owner, and its
  reasoning, kept after the meeting where it was made is over.
- **Demo Mode** (`/demo`): a five-step guided walkthrough of the semiconductor crisis scenario for
  a recruiter or prospect with zero setup.
- **Live conditions tool** (`/dashboard`): the original weather-driven port risk assessment.

## Data model (ontology)

```
Supplier --provides--> Product --shipped through--> Port --affected by--> Disruption Event --requires--> Decision
                          |
                          +--fulfills--> Customer Order --informs--> Decision
```

Implemented as relational tables in Postgres (Supabase), not a graph database. The relationships
are what matter here, not the storage engine.

## Stack, and a deliberate scoping decision

- **Next.js 14** (App Router): frontend + API routes, one deployable unit
- **Supabase (Postgres)**: full ontology: ports, suppliers, products, incidents, incident
  options/actions, decisions
- **Open-Meteo**: live wind, gust, precipitation, and marine swell data (no API key required)
- Deployed on **Vercel**

An earlier spec for this project called for a separate FastAPI/Python backend, Docker Compose,
trained ML risk models, Mapbox, and a split AWS/Render deployment. This build deliberately keeps a
single Next.js + Supabase stack instead. It's one service to deploy and reason about rather than
two, the "ML" is a transparent, auditable scoring formula rather than a model trained on synthetic
data (which would be hard to defend honestly in an interview), and it avoids infrastructure
(Docker, AWS Elastic Beanstalk) that wasn't available to stand up and verify end-to-end here. The
product thinking from that spec (ontology, personas, Mission Control, incident workspace, decision
register, demo mode) is fully implemented; the infrastructure shape is simplified on purpose.

## Local development

```bash
npm install
npm run dev
```

## Data notes

Port, supplier, product, and incident figures are reference/planning or illustrative demo data, not
live commercial feeds. Weather and marine conditions for the Australian ports are live. Dollar and
day estimates depend on the assumptions shown in each assessment or incident: a starting model to
reason from, not a guarantee.
