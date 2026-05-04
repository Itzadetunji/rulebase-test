# Rulebase UI

> React frontend for uploading interaction CSVs and visualizing compliance review results.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Beautify](#beautify)
- [Environment Variables](#environment-variables)

---

<a name="overview"></a>

## Overview

Rulebase UI is the web interface for running UDAAP compliance checks on customer interaction data. It lets you upload a CSV, sends it to the backend review endpoint, and renders:

- Summary metrics (total, compliant, flagged)
- Row-level risk indicators
- Detailed findings (severity, rationale, evidence, suggested rewrite)

Custom rules can be managed in the UI against the `/api/v1/custom-rules` API.

---

<a name="features"></a>

## Features

- CSV upload workflow for interaction datasets
- One-click review run against `POST /api/v1/review`
- Custom rules tab for CRUD against the backend
- Expandable result rows for detailed rule findings
- Risk badges and summary counters for quick triage
- Error-state handling for API and validation failures

---

<a name="getting-started"></a>

## Getting Started

### Prerequisites

- Bun 1.0+ (recommended) or Node.js 20+
- Running Rulebase API service

### Installation

1. Clone the repository and move to the UI project:

```bash
cd ui
```

2. Install dependencies:

```bash
bun install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Point `VITE_API_BASE_URL` at your API (see [Environment Variables](#environment-variables)).

4. Start the development server:

```bash
bun run dev
```

5. Open the app:

- `http://localhost:5173`

---

<a name="tech-stack"></a>

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Axios
- shadcn-style UI components
- Tailwind CSS 4

### Tooling

- ESLint
- Biome

---

<a name="screenshots"></a>

## Screenshots

### Main Review Screen

`[Add screenshot here]`

_Upload CSV, run review, and inspect summary metrics._

---

### Expanded Findings View

`[Add screenshot here]`

_Inspect flagged rules with rationale, evidence, and suggested rewrites._

---

<a name="project-structure"></a>

## Project Structure

```text
ui/
├── src/
│   ├── components/
│   │   ├── compliance-review/
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── review-helpers.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── compliance.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
└── package.json
```

---

<a name="beautify"></a>

## Beautify

Run lint checks:

```bash
bun run lint
```

Build for production:

```bash
bun run build
```

---

<a name="environment-variables"></a>

## Environment Variables

Vite only exposes variables prefixed with `VITE_`. They are **baked in at build time**; after changing them on a host like Vercel, trigger a new deployment.

- **`VITE_API_BASE_URL`**: Origin of the backend only—no path. Examples:
  - Local: `http://localhost:3000`
  - Production: `https://hemline.app` or `https://your-api.example.com` (use a hostname with a valid public certificate, not a raw IP with a self-signed cert)

The app builds request paths such as `/api/v1/review` and `/api/v1/custom-rules` on top of this base (see `src/lib/api.ts`).
