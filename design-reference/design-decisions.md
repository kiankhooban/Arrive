# Arrive — Design Decisions
Developer handoff · v1 · May 8, 2026

One file. Every decision an engineer needs to implement Landing, 
Onboarding, and Chat consistently. These decisions take precedence 
over CLAUDE.md's design token section wherever they conflict.

---

## 1. Tokens — native Tailwind classes (no @theme needed)

The designer used native Tailwind v4 classes throughout. Do NOT 
create custom @theme tokens. Use these exact class names:

| Token          | Hex       | Tailwind class                        | Where                                          |
|----------------|-----------|---------------------------------------|------------------------------------------------|
| teal           | #0F766E   | bg-teal-700 / text-teal-700           | Primary buttons, user bubbles, focus rings     |
| amber fill     | #F59E0B   | bg-amber-500                          | Dot indicators, accent bars (no text on top)   |
| amber pill     | #FEF3C7   | bg-amber-100 + text-amber-800         | Category pills, verified stamp — passes AA     |
| background     | #FAFAF9   | bg-stone-50                           | Page background                                |
| surface        | #FFFFFF   | bg-white                              | Cards, AI bubbles, input field                 |
| text-primary   | #171717   | text-neutral-900                      | Body text, headings                            |
| text-secondary | #6B7280   | text-gray-500                         | Subheadings, captions, disclaimers             |
| border         | #E7E5E4   | border-stone-200                      | Card borders, dividers, navbar                 |

**⚠ amber-500 contrast warning**
`amber-500` on white fails WCAG AA for text ≤18px. Never put text 
on an amber-500 background. Use `bg-amber-100 text-amber-800` for 
any readable badge or stamp.

**src/index.css — full required content:**
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```
No @theme block. No tailwind.config.js.

---

## 2. Typography scale

Inter — weights 400 / 500 / 600 / 700. Six steps across all screens.
Body uses `leading-relaxed` (1.625). Headings use `leading-tight tracking-tight`.

| Step              | Classes                                          | Used for                        |
|-------------------|--------------------------------------------------|---------------------------------|
| Display           | text-5xl font-semibold tracking-tight            | Hero headline (sm:text-5xl)     |
| H1                | text-4xl font-semibold tracking-tight            | Page titles                     |
| H2                | text-3xl font-semibold tracking-tight            | Section headings                |
| H3 / card title   | text-xl font-semibold                            | Card headings                   |
| Lead body         | text-lg leading-relaxed                          | Privacy line, key subheadings   |
| Body              | text-base leading-relaxed                        | Message bubbles, descriptions   |
| Caption           | text-sm text-gray-500                            | Verified date, secondary labels |
| Disclaimer        | text-xs text-gray-500                            | Legal disclaimer, trust bar     |

Rules:
- Hero H1: `text-4xl sm:text-5xl` — steps up on tablet+
- Never go below `text-xs` (12px) — disclaimer is the floor
- Sentence-case headings. Never ALL CAPS in body copy.

---

## 3. Spacing rhythm

Deliberate generosity. Multiples of 4px. These are the standard steps:

| Context               | Classes                          |
|-----------------------|----------------------------------|
| Hero & major sections | py-16 sm:py-24                   |
| Sub-sections          | py-10 sm:py-12                   |
| Resource cards        | p-4 sm:p-5                       |
| Onboarding cards      | p-5 sm:p-6                       |
| Hero panels           | p-6 sm:p-8                       |
| Heading → subhead     | mt-3                             |
| Subhead → content     | mt-6 or mt-8                     |
| Card grids            | gap-5 md:gap-6                   |
| Message stack         | space-y-6                        |

Page max-widths:
- Landing / marketing: `max-w-6xl`
- Onboarding: `max-w-3xl`
- Chat: `max-w-3xl`
- Horizontal rails: `px-4 sm:px-6`

---

## 4. Shadows, radii, borders

**Two shadow levels maximum. Never above shadow-md — not a SaaS product.**

| Shadow     | Value                             | Use                                              |
|------------|-----------------------------------|--------------------------------------------------|
| shadow-sm  | 0 1px 2px rgb(0 0 0 / 0.05)       | Default: resting cards, AI bubbles, buttons, input |
| shadow     | 0 1px 3px rgb(0 0 0 / 0.1)        | Hover/active state on cards — subtle lift         |
| shadow-lg  | (Tailwind default)                | Floating menus / popovers ONLY. Never on cards.   |

**Border radii:**
| Class       | px  | Used for                                     |
|-------------|-----|----------------------------------------------|
| rounded-2xl | 16px | Cards, message bubbles, panels, inputs       |
| rounded-xl  | 12px | Icon containers                              |
| rounded-lg  | 8px  | Buttons, nav items, popover items            |
| rounded-md  | 6px  | Verified stamp                               |
| rounded-full | —   | Category pills, dot indicators, progress bar |

**Border rules:**
- Resting: `border border-stone-200`
- Selected: `border-2 border-teal-700` + `bg-teal-50`
  (Note: going from border to border-2 shifts layout by 1px — 
  pre-reserve space with `outline` if this causes jitter)
- Hover on selectable: `border-stone-300`
- Dividers: `border-stone-200`

---

## 5. States — hover, focus, selected, disabled

**Focus (apply to every interactive element):**
```
focus:outline-none 
focus-visible:ring-2 
focus-visible:ring-teal-700 
focus-visible:ring-offset-2 
focus-visible:ring-offset-stone-50
```
Use `ring-offset-white` when inside a white card. 
Never use `focus:outline-none` alone.

**Hover:**
| Element          | Classes                               |
|------------------|---------------------------------------|
| Primary button   | hover:bg-teal-800                     |
| Secondary button | hover:border-stone-300                |
| Selectable card  | hover:border-stone-300 hover:shadow-sm |
| Link             | hover:text-teal-700                   |

No hover-only affordances — every hover has a non-hover equivalent.

**Selected (3 signals — ALL THREE REQUIRED):**
1. `border-2 border-teal-700`
2. `bg-teal-50`
3. Filled checkmark badge (teal-700 bg, white icon) in top-right of card

Color alone is never the only signal. All three must be present.

**Disabled:**
- Primary button: `bg-stone-300 text-gray-500 shadow-none cursor-not-allowed`
- Icon-only: `opacity-40 cursor-not-allowed`
- Always pair with `disabled:cursor-not-allowed` on the element

---

## 6. Component inventory

Eight components compose the entire app. Build these, then wire screens.

| Component      | Used in          | Key implementation notes                                                  |
|----------------|------------------|---------------------------------------------------------------------------|
| Wordmark       | All screens      | Compass icon in teal-700 square + "Arrive" text. Anchors every navbar.   |
| Button         | All screens      | min-h-11 (44px). Primary: bg-teal-700 text-white. Secondary: border bg-white. |
| SelectCard     | Onboarding       | Icon left, title+desc center, check badge right. `multi` prop: radio vs checkbox. |
| ResourceCard   | Chat             | Inline in AI bubble. VerifiedStamp top-right is non-negotiable.           |
| VerifiedStamp  | Chat             | bg-amber-50 + border-amber-200 + shield-check icon + "Verified [date]".  |
| CategoryPill   | Chat             | bg-amber-100 text-amber-800 rounded-full text-xs.                        |
| Bubble         | Chat             | User: right, bg-teal-700, text-white. AI: left, bg-white, border-stone-200, shadow-sm. |
| PrivacyBanner  | Landing, Onboard | Shield icon in teal-50 square + uppercase eyebrow + privacy text. Highest-priority content on Landing. |

---

## 7. Chat-specific patterns

**AI message structure:**
Each AI response is a list of blocks: `{ type: "text" | "resource", content }`.
Render blocks in order with `space-y-4` between them.
ResourceCards render inline, breaking up paragraphs — NOT pinned to the end.

**Disclaimer placement:**
`text-xs text-gray-500` below every AI message bubble, outside the bubble.
One disclaimer per AI message. Verbatim wording (see §9).

**Loading vs streaming:**
- Loading (waiting for first token): empty AI bubble with 3 pulsing dots.
  Animation: `dot 1.2s` infinite, staggered by 0.15s per dot.
  Add `aria-live="polite"` to the loading bubble.
- Streaming (tokens arriving): replace loading bubble with AI bubble.
  Show partial text + 2px blinking caret. Resource cards appear AFTER 
  streaming text is complete, not mid-stream.

**Error state:**
Render an AI bubble containing:
1. Amber alert strip with plain-language failure message
2. Previous topic's resource cards as fallback (from filteredResources)
3. "Try again" button
Never leave the user with an empty screen.

**Input bar:**
- Shell: `flex flex-col h-screen`
- Input: sticky at bottom, `min-h-[48px] max-h-[120px]`, `rounded-2xl`
- Enter sends. Shift+Enter inserts newline.
- Disable textarea AND send button while waiting for AI response.

**Empty state (no messages yet):**
Show one centered AI bubble:
"Hi — tell me what you need help with and I'll find verified resources 
for your situation."

---

## 8. Accessibility checklist

Every item is required before submission.

- **Contrast (verified pairs):**
  neutral-900/white = 18:1 ✓
  teal-700/white = 5.8:1 ✓
  amber-800/amber-100 = 7.5:1 ✓
  gray-500/white = 4.6:1 ✓ (secondary text ≥14px only)

- **Tap targets:** Every interactive element `min-h-11` (44px).
  Selectable onboarding cards: `min-h-24` (96px) for low-dexterity users.

- **Focus rings:** `focus-visible:ring-2 ring-teal-700 ring-offset-2` 
  on every interactive element. Never `focus:outline-none` alone.

- **Selected state:** Border + tint + checkmark. All three. Always.

- **ARIA on onboarding:**
  Card groups: `role="radiogroup"` (single-select) or `role="group"` (multi-select)
  Individual cards: `role="radio"` or `role="checkbox"` with `aria-checked`

- **ARIA on resource cards:**
  `aria-label="{name}, {category}, verified {last_verified}"`

- **Live regions:** Loading bubble uses `aria-live="polite"`.

- **Tab order:**
  Onboarding: cards → Back → Continue
  Chat: messages → input → send
  Logical top-to-bottom on every screen.

- **Reduced motion:**
  Wrap fade-up and dot-loader animations in:
  `@media (prefers-reduced-motion: reduce) { animation: none; }`

---

## 9. Copy & tone rules

**Tone:** Calm, plain English, second person. Contractions OK.
Never imperative-stack ("Click here to enter your details now").
Never apologetic-corporate ("We deeply value your trust…").

**Reading level:** Grade 6–8. Avoid jargon.
"newcomer" not "alien"
"claim" not "application for refugee protection"
"free" not "no-cost"
Define IRCC and CBSA on first use only.

**Privacy statement — verbatim, do not paraphrase:**
> "Arrive does not log your conversations or share your information 
> with IRCC, CBSA, or any government agency."

Appears on: Landing (PrivacyBanner, above the fold) and Onboarding 
(footer reinforcement). Both placements required.

**Disclaimer — verbatim, do not paraphrase:**
> "This is not legal advice. For legal matters, consult a lawyer 
> or legal aid clinic."

Below every AI message. `text-xs text-gray-500`. One per message.
