# Rulebase API

> Backend service that parses interaction data and evaluates each row for UDAAP compliance using MiniMax.

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

Rulebase API exposes a review endpoint that accepts interaction data as CSV upload or JSON payload. It parses incoming records, evaluates each interaction against compliance rules, and returns:

- Review summary counts (total, compliant, flagged)
- Per-interaction review results
- Rule-level findings with rationale, evidence, and rewrite suggestions

---

<a name="features"></a>
## Features

- `POST /api/v1/review` endpoint for compliance analysis
- Dual input format support:
  - `multipart/form-data` with CSV file
  - `application/json` with interactions array
- Per-row evaluation with graceful error capture
- CORS configuration for local UI and configurable frontend origin
- Structured response payload for easy frontend rendering

---

<a name="getting-started"></a>
## Getting Started

### Prerequisites

- Bun 1.0+
- MiniMax API access key

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
│   │   └── review.ts
│   └── lib/
│       ├── ai/
│       │   └── minimax.ts
│       ├── compliance/
│       │   ├── prompt.ts
│       │   ├── rules.ts
│       │   └── types.ts
│       └── csv/
│           └── parse.ts
├── sample.csv
└── package.json
```

---

<a name="testing"></a>
## Testing

No formal automated test suite is currently configured.

Recommended verification:

- Run the API locally with `bun run dev`
- Submit `sample.csv` via `POST /api/v1/review`
- Confirm summary and finding structure in the response

---

<a name="environment-variables"></a>
## Environment Variables

- `MINIMAX_API_KEY`: MiniMax API key for compliance evaluation requests
- `MINIMAX_BASE_URL`: Base API URL (default: `https://api.minimax.io/v1`)
- `MINIMAX_MODEL`: Model name used for evaluations
- `PORT` (optional): API port (defaults to `3000`)
- `FRONTEND_ORIGIN` (optional): Additional allowed CORS origin
