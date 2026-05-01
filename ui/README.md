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
- [Testing](#testing)
- [Environment Variables](#environment-variables)

---

<a name="overview"></a>
## Overview

Rulebase UI is the web interface for running UDAAP compliance checks on customer interaction data. It lets you upload a CSV, sends it to the backend review endpoint, and renders:

- Summary metrics (total, compliant, flagged)
- Row-level risk indicators
- Detailed findings (severity, rationale, evidence, suggested rewrite)

---

<a name="features"></a>
## Features

- CSV upload workflow for interaction datasets
- One-click review run against `POST /api/v1/review`
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

*Upload CSV, run review, and inspect summary metrics.*

---

### Expanded Findings View

`[Add screenshot here]`

*Inspect flagged rules with rationale, evidence, and suggested rewrites.*

---

<a name="project-structure"></a>
## Project Structure

```text
ui/
├── src/
│   ├── components/
│   │   ├── ComplianceReview.tsx
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

<a name="testing"></a>
## Testing

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

- `VITE_API_BASE_URL`: Base URL of the backend API (for example `http://localhost:3000`)
