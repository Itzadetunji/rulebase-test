# Rulebase API

> Backend service that parses interaction data and evaluates each row for UDAAP compliance using MiniMax.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Tech Stack](#tech-stack)
- [Production: TLS and CORS](#production-tls-and-cors)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Environment Variables](#environment-variables)

---

<a name="overview"></a>

## Overview

Rulebase API exposes a review endpoint that accepts interaction data as CSV upload or JSON payload. It parses incoming records, evaluates each interaction against compliance rules, and returns:

- Review summary counts (total, compliant, flagged)
- Per-interaction review results
- Rule-level findings with rationale, evidence, and rewrite suggestions

Custom compliance rules are stored and served via Redis-backed routes under `/api/v1/custom-rules`.

---

<a name="features"></a>

## Features

- `POST /api/v1/review` for compliance analysis (CSV file or JSON interactions)
- `GET` / `POST` / `PATCH` / `DELETE` under `/api/v1/custom-rules` for custom rules
- Per-row evaluation with graceful error capture
- CORS tuned for local dev and a fixed production frontend origin, plus optional extra origin via env

---

<a name="getting-started"></a>

## Getting Started

### Prerequisites

- Bun 1.0+
- MiniMax API access key

Custom rules persist with `Bun.redis` when the runtime can reach Redis; otherwise the code falls back to in-memory storage (fine for local dev).

### Installation

1. Move to the API project:

```bash
cd api
```

2. Install dependencies:

```bash
bun install
```

3. Create environment file and add values:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
bun run dev
```

5. API is available at:

- `http://localhost:3000`

---

<a name="tech-stack"></a>

## Tech Stack

### Backend

- Bun runtime
- Hono
- OpenAI SDK client (used with MiniMax-compatible endpoint)

### Internal Modules

- CSV parsing utilities
- Compliance rules and prompt generation
- AI-based interaction evaluation
- Custom rules storage (Redis)

---

<a name="production-tls-and-cors"></a>

## Production: TLS and CORS

Browsers require a **publicly trusted** HTTPS certificate. Serving the API at `https://your-domain` (for example with nginx and Let’s Encrypt) avoids `ERR_CERT_AUTHORITY_INVALID`; self-signed certs or HTTPS to a raw IP are fragile for visitors.

Allowed CORS origins are configured in `src/app.ts` (production frontend host plus localhost in non-production). Set **`FRONTEND_ORIGIN`** if you need an additional origin (another deployment URL, preview domain, or custom frontend host). Values must be full origins only, for example `https://your-app.vercel.app` (scheme, host, optional port—no path).

---

<a name="screenshots"></a>

## Screenshots

### API Request Example

`[Add screenshot here]`

*Sample request from Postman/Insomnia or cURL invocation.*

---

### API Response Example

`[Add screenshot here]`

*Sample response showing summary and per-interaction findings.*

---

<a name="project-structure"></a>

## Project Structure

```text
api/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── routes/
│   │   ├── review.ts
│   │   ├── custom-rules.ts
│   │   └── custom-rules.test.ts
│   └── lib/
│       ├── ai/
│       │   └── minimax.ts
│       ├── compliance/
│       │   ├── prompt.ts
│       │   ├── rules.ts
│       │   └── types.ts
│       ├── csv/
│       │   └── parse.ts
│       └── rules/
│           ├── redis.ts
│           └── resolve.ts
├── sample.csv
└── package.json
```

---

<a name="testing"></a>

## Testing

Run route tests:

```bash
bun test
```

---

<a name="environment-variables"></a>

## Environment Variables

- `MINIMAX_API_KEY`: MiniMax API key for compliance evaluation requests
- `MINIMAX_BASE_URL`: Base API URL (default: `https://api.minimax.io/v1`)
- `MINIMAX_MODEL`: Model name used for evaluations
- `PORT` (optional): API listening port (defaults to `3000`)
- `FRONTEND_ORIGIN` (optional): Extra allowed CORS origin beyond the defaults in `app.ts` (full origin URL)

Redis for durable custom rules is configured via Bun’s runtime / deployment (see `src/lib/rules/redis.ts`); `.env.example` currently lists only MiniMax-related keys.
