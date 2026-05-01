To install dependencies:
```sh
bun install
```

Set up environment variables:
```sh
cp .env.example .env
```

Then set `MINIMAX_API_KEY` in `.env`.

To run **only** the API (recommended with the React app in `/ui`):
```sh
bun run dev
```

API listens at `http://localhost:3000` with `POST /api/v1/review`.

## React UI (`../ui`)

From the monorepo root, start the frontend (Vite dev server proxies `/api` to `:3000`):

```sh
cd ../ui && bun install && bun run dev
```

Then open **`http://localhost:5173`**.

Alternatively, set `VITE_API_BASE_URL=http://localhost:3000` in `ui/.env` and call the API from any origin enabled by server CORS (`FRONTEND_ORIGIN` optional).

## Compliance review flow

- Start the API and the UI as above.
- Upload a CSV with the following headers:

  - `interaction_id,timestamp,channel,agent_id,customer_id,transcript`
- Click `Run Review`
- The UI will call `POST /api/v1/review` and render:
  - summary totals
  - per-interaction status
  - per-rule findings with severity, rationale, evidence, and suggested rewrite

## API endpoint

- `POST /api/v1/review`
- Supported content types:
  - `multipart/form-data` with `file` (CSV upload)
  - `application/json` with:
```json
{
  "interactions": [
    {
      "interactionId": "INT001",
      "timestamp": "2026-04-29T10:15:00Z",
      "channel": "call",
      "agentId": "AGENT01",
      "customerId": "CUST123",
      "transcript": "Text to evaluate"
    }
  ]
}
```
