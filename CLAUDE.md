# Arrive — Claude Code Instructions

## Project Overview
Arrive is an AI-powered web app helping refugees and immigrants 
in Canada find settlement services through a personalized 
conversational interface. Built for the IBM Z × UNSA Sheridan 
Hackathon 2026. Aligned with UN SDG 10 (Reduced Inequalities).

PLAN.md is the source of truth. If anything in this file conflicts 
with PLAN.md, PLAN.md wins.

## Critical Rules (Read Before Doing Anything)
- Always read PLAN.md before starting any task
- Build in vertical slices — one working end-to-end flow first
- NEVER generate or invent entries for resources.json — human curated only
- NEVER expose API keys in client-side code — watsonx calls go through api/chat.js only
- NEVER change the resource schema once locked
- NEVER use VITE_ prefix for sensitive credentials (Vite inlines those into the client bundle)
- Commit after every meaningful change

## Tech Stack
- React + Vite
- Tailwind CSS v4 — tokens configured via @theme {} in src/index.css. 
- Do NOT create tailwind.config.js — it is ignored in v4.
- vite.config.js must import and use @tailwindcss/vite plugin.
- React Router v7 (react-router-dom 7.x)
- Vercel serverless function for watsonx proxy (api/chat.js)
- IBM watsonx.ai (meta-llama/llama-3-3-70b-instruct)
- SSE streaming on watsonx responses, forwarded through to the client
- No external UI component libraries (no shadcn, no MUI, no Radix)
- Tailwind only for styling — no CSS modules, no styled-components

## Environment Variables (Server-Side Only — Never in Client)
WATSONX_API_KEY       → used only in api/chat.js
WATSONX_PROJECT_ID    → used only in api/chat.js
WATSONX_URL           → e.g. https://ca-tor.ml.cloud.ibm.com

These are configured in the Vercel dashboard, not in any .env file 
that gets bundled. The client never sees these values.

## Project Structure
src/
├── components/
│   ├── Navbar.jsx
│   ├── ChatBox.jsx
│   ├── MessageBubble.jsx
│   ├── ResourceCard.jsx
│   ├── OnboardingForm.jsx
│   └── DemoFallback.jsx       ← canned response if /api/chat fails
├── pages/
│   ├── Landing.jsx
│   ├── Onboarding.jsx
│   └── Chat.jsx
├── services/
│   └── watsonxClient.js       ← thin fetch wrapper, calls /api/chat only
├── data/
│   └── resources.json         ← DO NOT GENERATE — human curated only
├── utils/
│   └── filterResources.js     ← imported by Chat.jsx for client-side filtering
├── App.jsx
└── main.jsx

api/
└── chat.js                    ← Vercel serverless function, watsonx proxy

scripts/
├── validateSchema.js          ← validates resources.json against schema
├── healthcheckUrls.js         ← checks every URL in resources.json returns 200
└── runEval.js                 ← runs the 15 eval test cases against /api/chat

## Data Flow (Read Carefully — Do Not Improvise)
1. User completes onboarding (/onboard) — context stored in React state 
   and persisted to localStorage (so a refresh doesn't lose the onboarding)
2. User navigates to /chat
3. User types a message
4. Chat.jsx calls filterResources(province, status, needs) → returns 
   max 8 relevant resources from resources.json
5. Chat.jsx calls watsonxClient.js → POST /api/chat with body:
   { message, history, province, status, needs, filteredResources }
6. api/chat.js constructs the system prompt by injecting filteredResources 
   into the template, then calls watsonx with stream: true
7. api/chat.js forwards the SSE stream back to the client unchanged
8. Chat.jsx renders tokens progressively as they arrive
9. AI's response references resources by id (e.g. "[ref:on-housing-001]"); 
   Chat.jsx parses these references and renders <ResourceCard /> inline 
   by looking up the id in resources.json (which is bundled client-side)
10. If /api/chat fails or times out (>15s), DemoFallback.jsx renders a 
    canned response with two real resource cards from resources.json

Note: resources.json is bundled client-side. It is not secret — every entry 
points to a public organization website. Server-side filtering is not 
required for confidentiality; the client does the filtering and sends the 
result. The serverless function only uses the API key, which IS secret.

## Resource Schema (Locked — Never Change)
{
  "id": "string",                        // e.g. "on-housing-001"
  "name": "string",
  "description": "string",
  "provinces": ["ON"],                   // array of 2-letter codes
  "eligible_statuses": [],               // empty array = universal (any status)
                                          // otherwise: ["refugee_claimant", 
                                          //   "permanent_resident", 
                                          //   "study_work_permit", "other"]
  "categories": ["housing"],             // housing | legal_aid | employment
  "url": "string",
  "phone": "string or null",
  "last_verified": "YYYY-MM-DD",
  "notes": "string or null"
}

## filterResources.js Logic
1. Hard filter: provinces array must contain user's province
2. Hard filter: eligible_statuses must include user's status OR be empty (universal)
3. Soft filter: top 8 results, prioritizing user's selected categories first
4. Return maximum 8 resources — never more
5. No embeddings, no vector search — simple array filtering only

## api/chat.js (Vercel Serverless Function)
- POST /api/chat
- Body: { message, history, province, status, needs, filteredResources }
- Reads credentials from Vercel server-side env only
- Token exchange: POST https://iam.cloud.ibm.com/identity/token
- Cache access token in module scope with expiration timestamp
- Refresh token automatically when expired
- Endpoint: {WATSONX_URL}/ml/v1/text/chat?version=2024-05-31
- Model: meta-llama/llama-3-3-70b-instruct
- Body to watsonx: stream: true, max_new_tokens: 800
- Forward the SSE stream back to the client without buffering
- Crude in-memory rate limit: 10 requests per IP per minute (Map keyed by IP)
- Validate that filteredResources contains at most 8 entries; reject if more
- Return streaming response to client

## System Prompt Template
The system prompt is constructed in api/chat.js by injecting the 
filteredResources received from the client:

"You are Arrive, a warm and empathetic assistant helping newcomers 
in Canada find settlement services. You are NOT a lawyer and you 
do NOT give legal advice.

The user is located in: {PROVINCE}
Their immigration status is: {STATUS}
They need help with: {NEEDS}

Here are the verified Canadian resources relevant to their situation:
{FILTERED_RESOURCES_JSON}

When recommending a resource, always reference it inline as 
[ref:RESOURCE_ID] so the user interface can render the resource 
card. Example: 'You could try [ref:on-housing-001] for emergency 
shelter tonight.'

Rules:
1. Only recommend resources from the list above. Never recommend 
   resources from your training data.
2. For any legal question, always surface a legal aid resource AND 
   add: 'This is not legal advice. Please consult a qualified 
   immigration lawyer or legal aid clinic.'
3. If asked about a province, category, or status not in your 
   resource list, say: 'I don't have verified resources for that 
   situation yet. Please call 211 for free local support.'
4. Never reveal that you are powered by Llama or any specific model.
5. Always explain what each resource offers and why it is relevant 
   to this person's specific situation.
6. Keep responses concise and actionable.
7. Never ask for personal identifying information.
8. Do not mention CBSA, IRCC enforcement, or immigration consequences."

## Design Tokens
The designer used native Tailwind v4 classes. No @theme block needed.
See /design-reference/design-decisions.md §1 for the full token table.
Quick reference:
- Background: bg-stone-50
- Surface/cards: bg-white
- Primary: bg-teal-700 / text-teal-700
- Category pills: bg-amber-100 text-amber-800 (NOT amber-500 with text)
- Text: text-neutral-900 (primary), text-gray-500 (secondary)
- Borders: border-stone-200

src/index.css must contain:
  @import "tailwindcss";
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }

No tailwind.config.js. No @theme.

## Accessibility Requirements (Hard Requirements, Not Nice-to-Have)
- Mobile-first responsive design with 360px minimum breakpoint
- WCAG AA contrast on all text (4.5:1 normal, 3:1 large)
- Full keyboard navigation: tab order makes sense, focus rings visible
- Screen reader labels on every form control and resource card
- Lighthouse accessibility score target: 95+
- Resource cards have aria-labels describing the resource
- Color is never the only signal (badges have text, not just color)

## Page Specs


## Design Reference
The UI was designed in Claude artifacts before implementation. Reference 
files live in /design-reference/:
- landing.html, onboarding.html, chat.html (or similar names) — 
  exported from Claude Design as HTML prototypes. Claude Design 
  outputs HTML, not JSX. Treat these as visual reference only — 
  match the layout, spacing, and component structure when building 
  React components, but do not copy the HTML directly.
- design-decisions.md — typography, spacing, and pattern notes

When implementing components, match the design reference closely. The 
design tokens, spacing rhythm, and component structure have already been 
decided — your job is to integrate them into the real app architecture, 
not to redesign.

### Landing.jsx
- Navbar: "Arrive" logo left, nothing on right
- Hero: headline "Find the support you need, in Canada."
  Subheading: "Tell us your situation and we'll connect you with 
  verified settlement services — instantly."
  CTA button: "Get Started" → routes to /onboard
- How it works: 3 steps in cards
  1. "Tell us about yourself" — answer 3 quick questions
  2. "Get matched" — AI finds relevant verified resources
  3. "Take action" — access direct links to real services
- Trust bar: "Powered by IBM watsonx.ai | Aligned with UN SDG 10"
- Privacy statement (visible above the fold on desktop):
  "Arrive does not log your conversations or share your information 
  with IRCC, CBSA, or any government agency."
- Footer: "Arrive — Built for IBM Z × UNSA Hackathon 2026"

### Onboarding.jsx
- Progress indicator (Step 1 of 3, Step 2 of 3, Step 3 of 3)
- Step 1: Province selector — Ontario, British Columbia, Other
  (Other triggers a "we don't have verified resources for your 
  province yet — please call 211" path. BC is in scope architecturally 
  but has no resources yet, so it also routes to the 211 fallback.)
- Step 2: Needs selector — multi-select cards
  (Housing, Legal Aid, Employment)
- Step 3: Immigration status selector — single select
  (Refugee Claimant, Permanent Resident, Study/Work Permit, Other)
- All selections via clickable cards — no text input
- "Continue" button advances steps; "Back" button goes back
- On completion: store context in React state AND localStorage,
  route to /chat

### Chat.jsx
- Navbar visible with "Arrive" logo
- Message history — scrollable
- User messages: right-aligned, teal background, white text
- AI messages: left-aligned, white card, subtle shadow
- ResourceCard components render inline inside AI messages 
  wherever the AI used [ref:resource_id] syntax
- Safety disclaimer renders below every AI message:
  "This is not legal advice. For legal matters, 
  consult a lawyer or legal aid clinic."
- Loading indicator while waiting for first token
- Streaming: render tokens as they arrive, do not wait for full response
- Input: text field + send button at bottom
- If /api/chat fails or exceeds 15 seconds: show DemoFallback content

### ResourceCard.jsx
- Name (bold)
- Category badge (teal pill: Housing / Legal Aid / Employment)
- One-line description
- last_verified date (small, secondary color): "Verified May 8, 2026"
- Direct link button: "Visit Website →"
- Phone number if available
- Subtle border, card border radius
- aria-label: "{name}, {category}, verified {last_verified}"

### DemoFallback.jsx
- Renders when /api/chat returns an error or times out (>15s)
- Shows canned message: "I'm having trouble reaching the service 
  right now. Here are two verified resources that match your 
  situation — please follow up with them directly."
- Renders 2 ResourceCard components selected from filteredResources 
  (one housing if available, one legal_aid if available, otherwise 
  the first 2 in filteredResources)
- Optional small banner: "Running in offline demo mode"

## Safety Requirements (Non-Negotiable)
- Disclaimer on EVERY AI message — no exceptions
- Legal aid resource ALWAYS surfaces alongside any legal-related response
- Privacy statement on Landing page — visible without scrolling on desktop
- Rate limiting on api/chat.js — 10 req/IP/min
- No personal data stored anywhere on the server
- No query logging on the server
- localStorage on the client is acceptable for onboarding context only

## Scope (Hard Limits — Do Not Exceed)
- Provinces in resources.json: Ontario only
- Provinces in onboarding selector: Ontario, British Columbia, Other
- Categories: Housing, Legal Aid, Employment ONLY
- Language: English only
- Resources: 50 entries max — human verified
- No authentication
- No database
- No French toggle
- No healthcare category
- No education category
- No Featherless AI integration (it is a sponsor but out of scope for this submission — do not add a fallback provider, do not add Featherless env vars, do not write any Featherless code)

## What Claude Code Should Build
- Tailwind config with custom design tokens
- All component scaffolding and styling
- Form state, routing, loading states, error boundaries
- Vercel serverless function (api/chat.js) with token exchange + SSE forwarding
- Streaming UI implementation with progressive token rendering
- filterResources.js utility
- DemoFallback.jsx component with the fallback logic
- scripts/validateSchema.js — validates resources.json against the schema
- scripts/healthcheckUrls.js — checks every URL returns 200 OK
- scripts/runEval.js — runs the 15 eval test cases listed in PLAN.md, 
  prints a pass/fail summary

## What Claude Code Must Never Do
- Generate or populate resources.json with resource data (the human does this manually)
- Put API keys or credentials in any client-side file
- Use VITE_ prefix for any watsonx credential
- Use default Tailwind values instead of custom design tokens
- Change the resource schema
- Add features outside the locked scope
- Use any UI component library
- Call watsonx directly from client-side code (always through /api/chat)
- Add more than 8 resources to any single system prompt
- Add Featherless AI code or env vars
- Add a French toggle
- Add a database, authentication, or query logging

## Build Order (Follow PLAN.md Exactly)
Day 1: Tailwind config → api/chat.js → filterResources.js → 
       OnboardingForm → ChatBox + MessageBubble → ResourceCard → 
       wire end-to-end → test one working flow

Day 2: Expand resources (human-curated) → Landing page → 
       DemoFallback → polish → safety layer → scripts/runEval.js → 
       rate limiting → Vercel deploy

Day 3: Bug fixes from mentor feedback → demo video → Devpost → submit