# Markus Piljanovic: n8n & AI Automation

Production-ready n8n and AI automation workflows for lead ops, document processing (IDP) and compliance. Self-hosted, tested against written expectations, with known limits stated openly.

## Workflows

| Workflow | Problem | Result | Look |
|---|---|---|---|
| **[Lead Qualification](workflows/lead-qualification/)** | Sales inquiries arrive by mail, spam wastes AI runs, and replies must not go out unchecked. | Spam is stopped by rules first, an AI scores each lead from 0 to 100, and the reply to a hot lead goes out only after a human click. | [Live demo](https://markus-piljanovic.github.io/automation-portfolio/workflows/lead-qualification/demo/index.html) |
| **[Compliance Guide](workflows/automation-compliance-guide/)** | Consultants need the right GDPR and EU AI Act articles for a planned automation project. | About 20 clicks give a checklist with sources. Fixed rules choose the topics, the AI only writes three sentences from the matching law cards. Orientation, not legal advice. | [Live demo](https://markus-piljanovic.github.io/automation-portfolio/workflows/automation-compliance-guide/page/compliance-guide-demo.html) |
| **[Mini-IDP](workflows/mini-idp-schmidt/)** | A logistics company types about 180 delivery notes a day into its system by hand. | Free OCR first, AI only for unclear notes, fixed rules decide, and a person in Slack clears every doubt. | [Walk-through](https://markus-piljanovic.github.io/automation-portfolio/workflows/mini-idp-schmidt/page/01-intake.html) |

## How this repo is built

Three levels, each one goes deeper:

1. **This page**: problem, result, demo link.
2. **Workflow README**: how it works, decisions, tests, known limits.
3. **Files**: workflow JSON, test cases, test data.

## Production readiness

Built means it is in the workflow and tested. Extension means it is not built and named openly (all three are course or portfolio projects, not live systems).

| Topic | Lead Qualification | Compliance Guide | Mini-IDP |
|---|---|---|---|
| Error workflow | Built (Telegram alert and ping) | Built (Telegram alert and ping) | Extension |
| Human approval | Built (click to send) | Not needed (nothing is sent) | Built (Slack) |
| Duplicates | Built (known senders) | Not needed | Built (supplier and note number) |
| Retries, timeouts, limits | Built | Built (daily cap of 0.20 €) | Partly (2 nodes with retry) |
| Privacy | Built (no personal data in Telegram) | Built (click answers only) | Extension |
| Retention and deletion | Extension | Extension | Extension |
| Webhook login | Not applicable (mail trigger) | Open on purpose, protected by a value list and the daily cap | Extension |

## Measured numbers

Only numbers from test runs. Assumptions are not shown here.

| Workflow | Tests passed | Cost per run |
|---|---|---|
| Lead Qualification | 22 of 23 | n/a |
| Compliance Guide | 27 of 27 (all 41 articles retrieved at least once) | about 0.002 € |
| Mini-IDP | 16 of 18 | 0.003 to 0.005 $ per AI-read note, 0 $ for OCR |

## About me

I build automations that run reliably and say where they stop. I am training as a digitalisation manager and run my own self-hosted n8n server.

Contact: [LinkedIn](https://www.linkedin.com/in/markus-piljanovic-42141310b/)

## Notes

- Credentials, IDs, table and folder references are replaced by placeholders (`YOUR_..._ID`). The workflows import fine but need your own connections.
- The sticky notes in each workflow explain every step.
- Workflows and sticky notes are in English. German demos and test plans are added per workflow.
- The descriptions are orientation, not legal advice.
