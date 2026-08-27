# Helpdock — demo video script

Target length **4:00–4:30**. Screen recording with voiceover. Record at 1440×900 or 1920×1080, browser zoom 100%, no bookmarks bar, no notifications.

## Before you hit record

- Two browser windows ready: the Helpdock landing page, and `storefront-demo.html?key=<public key>&origin=<site url>`.
- A demo account signed out, plus its email and password on a sticky note — you will sign up live.
- Two files on the desktop: `shipping-and-delivery.pdf` and `returns-policy.pdf`.
- Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.
- A second account already on the Pro plan, for the inbox segment, so you do not have to wait for a live upgrade twice.

---

## 0:00–0:30 — The problem, on the landing page

**Screen:** the landing page, scrolling slowly from the hero through the statistics band.

> "Every online store answers the same six questions all day. Where is my order. Can I return this. Do you ship to Poland. The answers are already written down — in a returns policy, a shipping page, a product FAQ. They are just not where the customer is looking. Helpdock takes those documents and turns them into a support agent that sits on the storefront."

## 0:30–1:00 — Sign up and create a chatbot

**Screen:** click *Start free* → sign up → land on the empty chatbots screen → *New chatbot* → name it "Northline Supply", greeting "Hi! Ask me about shipping, returns or your order." → Create.

> "Signing up takes an email and a password. A new account starts on the free plan: one chatbot, fifty thousand characters of knowledge, fifty answers a month. I will name this one after the store and give it a greeting."

## 1:00–1:45 — Give it something to read

**Screen:** on the Knowledge tab, drop in `shipping-and-delivery.pdf`. Wait for **Ready**. Switch the side panel to URL, paste a returns page, add it. Show the character and passage counts, and the usage counter climbing at the top right.

> "Now the knowledge. A PDF of the shipping terms — Helpdock pulls the text out, splits it into passages and embeds them. It tells me exactly when the source is ready and how many passages it produced. I can also point it at a page on the store's own site, which is usually where the returns policy already lives. Notice the counter at the top: the free plan's fifty thousand characters are being spent, and the product enforces that, not just the pricing page."

## 1:45–2:30 — Test it before a customer sees it

**Screen:** Chat tab. Ask *"I ordered boots on Friday, do they arrive before the weekend?"* — let it stream. Point at the citation line. Then ask something the documents do not cover, for example *"Do you sell socks?"*.

> "Before this goes anywhere near a customer, I can talk to it myself. The answer streams in, and underneath it Helpdock names the document it came from — so I can see whether it is quoting the real policy or reaching. And this is the part that matters for a store: when the documents do not cover a question, it says so and points to the team. It does not invent a delivery date."

## 2:30–3:10 — Put it on the storefront

**Screen:** Embed tab. Copy the snippet. Switch to the demo storefront window, reload it, click the bubble, ask the same shipping question. Then back in Helpdock, change the accent colour, save, and reload the storefront to show the new colour.

> "Shipping it is one line. This script tag goes anywhere before the closing body tag. Here is a completely separate storefront — different page, different site — and the same agent answers there, from the same knowledge. It takes the store's name, greeting and colour, so it reads as part of the shop rather than a bolted-on tool."

## 3:10–3:45 — Pricing and the upgrade

**Screen:** Billing. Show usage bars. Click *Upgrade* on Pro → Stripe Checkout → card 4242 → back on the billing page with the success banner and the new limits.

> "Pricing follows volume: chatbots, how much knowledge, how many answers a month. This is Stripe running in test mode, so the checkout is real but the charge is not. Coming back, the plan is Pro, the limits are lifted, and two features that were locked are now open."

## 3:45–4:15 — What the upgrade unlocked

**Screen:** switch to the Pro account. Inbox tab — expand a conversation. Then the Embed tab, showing the tone of voice field now editable, and the widget without the Helpdock badge.

> "The first is the inbox. Every conversation from the storefront is here, so the owner can read what customers actually ask — which is the fastest way to find out which page to write next. The second is tone of voice, and the Helpdock badge coming off the widget entirely."

## 4:15–4:30 — Close

**Screen:** back to the landing page hero.

> "Documents in, support agent out, on the storefront in about five minutes. Built with Next.js, Supabase for auth and vector search, and Gemini for retrieval and answers."

---

## Things worth showing if you have time

- The **Failed** state on a source — upload a scanned PDF with no text layer and let the error message speak for itself.
- The free plan refusing a second chatbot, with the upgrade prompt in place of the create card.
- The widget on a phone-width window.
