# BidWise AI

BidWise AI is a proposal knowledge assistant for small and mid-sized government contractors. Capture and proposal teams can search past performance documents, resumes, capability statements, and technical approaches with natural-language questions. Answers are grounded only in documents stored in the local knowledge hub and include clickable source citations.

## What the MVP includes

1. Document knowledge hub
2. Pre-seeded sample documents (Aether Federal demo library)
3. Add custom text/markdown documents
4. Category filters and keyword search
5. Natural-language proposal Q&A
6. Grounded answers based only on available documents
7. Clickable source citations
8. Citation/source drawer
9. Copy proposal snippet
10. Empty-query validation
11. Loading states and error handling

## Architecture

```
bidwise-ai-local/
  shared/types.ts          Shared TypeScript contracts
  backend/
    src/index.ts           Express server
    src/routes/            HTTP routes
    src/services/          Document store, retrieval, LLM
    seed/                  Sample markdown sources
    data/                  Local JSON persistence (created at runtime)
  frontend/
    src/components/        React UI
    src/api/client.ts      Frontend API client
```

- **Frontend:** React 18 + TypeScript + Vite (port `5173`)
- **Backend:** Node.js + Express + TypeScript (port `3001`)
- **Storage:** JSON file at `backend/data/documents.json` (seeded on first run)
- **API keys:** `OPENAI_API_KEY` is read only on the server. The browser never receives it.

Without an OpenAI key the app still runs. Retrieval stays the same; answers are extractive snippets taken from matching documents.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Setup and run

From the repository root:

```bash
npm install
npm run install:all
cp .env.example backend/.env
```

Optional: edit `backend/.env` and add your OpenAI key.

```bash
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o-mini
PORT=3001
```

Start both servers:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

Run the API or UI separately if you prefer:

```bash
npm run dev:backend
npm run dev:frontend
```

Vite proxies `/api` to `http://localhost:3001`. Keep the backend running while you use the UI.

## How to try the product

1. Browse the knowledge hub and filter by Past Performance, Resume, Capability Statement, or Technical Approach.
2. Search keywords such as `CDM`, `FHIR`, or `Maya Chen`.
3. Ask: *Who should we name as Security Operations Lead, and what evidence supports that?*
4. Click a citation to open the source drawer.
5. Use **Copy proposal snippet** to paste grounded language into a volume.
6. Add your own markdown resume or past performance with **Add document**.

Empty questions are blocked in both the UI and the `/api/ask` route.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service status and whether an LLM key is configured |
| `GET` | `/api/documents?category=&q=` | List/filter documents |
| `GET` | `/api/documents/:id` | Full document for the source drawer |
| `POST` | `/api/documents` | Add a custom text/markdown document |
| `POST` | `/api/ask` | Grounded Q&A (`{ "question": "...", "category": "all" }`) |

## Academic note

Sample company names, contract numbers, and personnel are fictitious and intended for coursework demonstration only.
