# Arrive

**AI-powered settlement navigator for refugees and immigrants in Canada.**

## What it does

Arrive helps people like Maya — a refugee claimant who arrives in Toronto with 60 days to file her Basis of Claim form and no idea where to start — find real, verified settlement services in minutes. You answer three quick questions about your province, immigration status, and what you need help with. Arrive then uses IBM watsonx.ai to match you with resources from a hand-verified database and answer follow-up questions in plain language. Every recommendation links back to a real organization with a visible last-verified date, so nothing is invented.

## How it works

- **Onboarding** — Three questions (province, needs, immigration status) build your context. No account required, nothing is logged.
- **Filtering** — Your answers filter a curated database of verified Canadian settlement resources down to the 8 most relevant for your situation.
- **Verified AI response** — watsonx.ai receives only those 8 resources and is instructed never to recommend anything outside them. Every resource it cites renders as a card with a source URL and last-verified date.

## Tech stack

| Technology | Purpose |
|---|---|
| IBM watsonx.ai (`meta-llama/llama-3-3-70b-instruct`) | AI inference |
| React + Vite | Frontend |
| Tailwind CSS v4 | Styling |
| Vercel serverless functions | API proxy + deployment |
| `resources.json` (39 verified entries) | Curated data layer |

## Running locally

**Prerequisites:** Node 20+, [Vercel CLI](https://vercel.com/docs/cli)

```bash
git clone https://github.com/kiankhooban/Arrive.git
cd Arrive
npm install
```

Create `.env.local` in the project root (never committed):

```
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_URL=https://ca-tor.ml.cloud.ibm.com
```

```bash
vercel dev
```

`vercel dev` starts both the Vite frontend and the `/api/chat` serverless function. Running `npm run dev` alone works for UI-only development but all watsonx calls will 404.

## Data verification

Every entry in `resources.json` is manually verified by checking the organization's website before it is added — no AI-generated entries, ever. Each resource carries a `last_verified` date that is visible to users on every resource card. The `scripts/healthcheckUrls.js` script sends a HEAD request to every URL in the database and reports pass/fail, making it straightforward to catch broken links before a demo or submission. This manual curation layer is the core of what makes Arrive trustworthy: the AI is grounded in a database a human has verified, not in training data that may be outdated or wrong.

## SDG alignment

- **SDG 10 — Reduced Inequalities** (primary): connecting newcomers to settlement services regardless of language, background, or technical literacy.
- **SDG 16 — Peace, Justice and Strong Institutions**: surfacing legal aid resources and ensuring access to free immigration legal support for the most vulnerable claimants.

## Built for

IBM Z × UNSA Sheridan Hackathon 2026
