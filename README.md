# Arrive

AI-powered settlement service finder for refugees and immigrants in Canada.

## What it does

Arrive asks three quick questions — province, immigration status, and what you need help with — then uses IBM watsonx.ai to match you with verified Canadian settlement services and answer follow-up questions in plain language. Every resource recommendation links back to a manually verified entry with a visible last-verified date, so nothing is hallucinated.

Built for the IBM Z × UNSA Sheridan Hackathon 2026. Aligned with **UN SDG 10 — Reduced Inequalities**.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router v7 |
| Styling | Tailwind CSS v4 |
| AI | IBM watsonx.ai — `meta-llama/llama-3-3-70b-instruct` |
| API proxy | Vercel Serverless Functions (`api/chat.js`) |
| Hosting | Vercel |

## Running locally

Requires [Vercel CLI](https://vercel.com/docs/cli) to run the `api/chat.js` serverless function alongside the Vite dev server.

```bash
npm install
vercel dev
```

`vercel dev` starts both the frontend and the `/api/chat` function. Plain `npm run dev` works for UI-only development but all watsonx calls will 404.

## Environment variables

Create a `.env.local` file in the project root (never committed):

```
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_URL=https://ca-tor.ml.cloud.ibm.com
```

These are read exclusively by `api/chat.js` on the server. They are never exposed to the client bundle.

In production, set them in the Vercel dashboard under **Project → Settings → Environment Variables**.

## Data

`src/data/resources.json` is the verified resource database. Every entry is manually checked from the source website before being added — no AI-generated entries, ever. The `last_verified` field on each resource is visible to users in the UI.
