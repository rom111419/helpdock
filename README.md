# Helpdock

Turn the docs an online store already has — shipping terms, returns policy, product FAQ — into a support agent that answers inside the app and as an embeddable widget on the storefront.

Built as the demo project for the Paralect Product Academy assignment *Embeddable Chatbot Builder*.

## What it does

- **Knowledge** — upload a PDF, Markdown or text file, import a page by URL, or type an answer in. Helpdock extracts the text, splits it into passages, embeds them and reports when the source is ready.
- **Chat** — a ChatGPT-style chat inside the app, answering only from the indexed passages and naming the document behind every answer. When nothing matches, it says so instead of inventing a delivery date.
- **Widget** — one `<script>` tag puts the same agent on any site, in the store's own name and colour.
- **Inbox** — every conversation from the widget is stored, so the owner can read what customers actually ask.
- **Billing** — Stripe Checkout in test mode moves an account between Free, Pro and Business. The limits are enforced in the product, not just printed on the pricing page.

## Plans and what they gate

| | Free | Pro — $29 | Business — $99 |
|---|---|---|---|
| Chatbots | 1 | 3 | 10 |
| Knowledge | 50,000 chars | 2,000,000 | 10,000,000 |
| Answers / month | 50 | 2,000 | 10,000 |
| Helpdock badge in widget | shown | removed | removed |
| Conversations inbox | — | yes | yes |
| Custom tone of voice | — | yes | yes |

## Stack

- **Next.js 16** (App Router, React 19, Tailwind 4)
- **Supabase** — Postgres, Auth, `pgvector` for retrieval, row level security scoping every table to its owner
- **Gemini** — `gemini-2.5-flash` for answers, `gemini-embedding-001` (768 dimensions) for retrieval
- **Stripe** — Checkout and the billing portal in test mode
- **Playwright** — end-to-end tests on desktop and mobile viewports

## Running it

```bash
pnpm install
cp .env.example .env.local   # fill in the values below
pnpm dev
```

### Environment

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `GEMINI_API_KEY` | Google AI Studio |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard in **Test mode** |
| `STRIPE_WEBHOOK_SECRET` | `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| `STRIPE_PRICE_PRO`, `STRIPE_PRICE_BUSINESS` | Stripe → Products → recurring monthly prices |
| `NEXT_PUBLIC_SITE_URL` | The public origin; used in the embed snippet and Stripe redirects |
| `NEXT_PUBLIC_DEMO_BOT_KEY` | Optional. A chatbot's public key — set it and the landing page carries a live widget answering about Helpdock itself |

### Database

Run the two migrations in `supabase/migrations` against the project, in order, from the Supabase SQL editor or the CLI. They create the schema, the `pgvector` index, row level security policies, the profile trigger and the retrieval function.

### Tests

```bash
pnpm exec playwright test
```

## How retrieval works

A source is normalised, split on paragraph boundaries into ~1,200 character passages with a 160 character overlap, and embedded in batches. At question time the query is embedded with the `RETRIEVAL_QUERY` task type, matched by cosine distance through an HNSW index, and filtered by a similarity floor. Passages below the floor are dropped; if nothing survives, the agent is never called and the user is told the knowledge base does not cover the question. Answers cite the source documents they came from.

## Layout

```
src/config      plans, limits, environment, all user-facing copy
src/services    embedding, chunking, extraction, ingestion, retrieval, answering, quotas, billing
src/lib         Supabase clients, database types, session helpers
src/app         routes: landing, auth, app, widget iframe, API
public/widget.js  the embeddable loader
supabase/       schema and policies
```
