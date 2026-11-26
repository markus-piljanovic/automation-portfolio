# n8n & AI Automation

Production-ready n8n and AI automation workflows for lead operations, intelligent document processing (IDP) and compliance.\
Self-hosted, verified against expectations written down in advance, and candid about where each one stops.

## About me

Over the years I have worked in consulting and banking, in these roles:

- Project and process manager and PMO, in two separate projects at Accenture
- Product manager for B2C mortgages
- Technical delivery of those products, where I came to know the full software development lifecycle from the inside

That is where I learned what drives a business and where its processes hurt, and it shapes how I design workflows: fit for the people who use them.
Technology has fascinated me since childhood, and AI let me combine that lifelong interest with my business experience.

I am currently training as a digitalisation manager and run my own self-hosted n8n server.

Contact: [LinkedIn](https://www.linkedin.com/in/markus-piljanovic-42141310b/)

## Workflows

| Workflow | Problem | Result | Explore |
|---|---|---|---|
| **[Lead Qualification](workflows/lead-qualification/)** | Sales inquiries arrive by mail.<br>Spam burns AI runs, and no reply should reach a prospect unreviewed. | Rules stop spam before any model runs.<br>An AI agent scores each lead from 0 to 100.<br>A reply to a hot lead leaves only after a human click. | [Live demo](https://markus-piljanovic.github.io/automation-portfolio/workflows/lead-qualification/demo/index.html) |
| **[Compliance Guide](workflows/automation-compliance-guide/)** | Consultants must identify which GDPR and EU AI Act articles apply to a planned automation project. | About 20 clicks yield a checklist backed by sources.<br>Fixed rules select the topics, and the AI only phrases three sentences from the matching law cards.<br>Orientation, not legal advice. | [Live demo](https://markus-piljanovic.github.io/automation-portfolio/workflows/automation-compliance-guide/page/compliance-guide-demo.html) |
| **[Mini-IDP](workflows/mini-idp-schmidt/)** | A logistics company keys in roughly 180 delivery notes a day by hand. | Free OCR reads first, and AI steps in only for unclear notes.<br>Fixed rules decide, and a person in Slack resolves every doubt. | [Walk-through](https://markus-piljanovic.github.io/automation-portfolio/workflows/mini-idp-schmidt/page/01-intake.html) |

## How this repository is organised

Three levels, each one going deeper than the last:

1. **This page** gives the problem, the result and a demo link.
2. **The workflow README** covers architecture, design decisions, tests and known limits.
3. **The files** hold the workflow JSON, test cases and test data.

## Production readiness

*Built* means the safeguard is part of the workflow and has been tested.\
*Extension* means it is not built, and it is named openly.\
All three pieces are course and portfolio projects, not live systems.

| Topic | Lead Qualification | Compliance Guide | Mini-IDP |
|---|---|---|---|
| Error workflow | Built (Telegram alert and ping) | Built (Telegram alert and ping) | Extension |
| Human approval | Built (click to send) | Not needed (nothing is sent) | Built (Slack) |
| Duplicate handling | Built (known senders) | Not needed | Built (supplier and note number) |
| Retries, timeouts, limits | Built | Built (daily cap of 0.20 €) | Partly (two nodes retry) |
| Privacy | Built (no personal data in Telegram) | Built (click answers only) | Extension |
| Retention and deletion | Extension | Extension | Extension |
| Webhook login | Not applicable (mail trigger) | Open by design, guarded by a value allow-list and the daily cap | Extension |

## Measured numbers

Only figures from actual test runs appear here.\
Assumptions are deliberately left out.

| Workflow | Tests passed | Cost per run |
|---|---|---|
| Lead Qualification | 22 of 23 | n/a |
| Compliance Guide | 27 of 27 (all 41 articles retrieved at least once) | about 0.0023 $ |
| Mini-IDP | 16 of 18 | 0.003 to 0.005 $ per AI-read note, 0 $ for OCR |

## Notes

- Credentials, IDs, table and folder references are replaced by placeholders (`YOUR_..._ID`).
- The workflows import cleanly but need your own connections.
- The sticky notes in each workflow explain every step.
- Workflows and sticky notes are in English, and a German demo and test plan are added per workflow.
- The descriptions offer orientation and are not legal advice.
