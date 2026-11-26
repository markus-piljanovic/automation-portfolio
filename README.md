# n8n & AI Automation

n8n and AI automation workflows for lead operations, intelligent document processing (IDP) and compliance.

![n8n](https://img.shields.io/badge/-n8n-EA4B71?style=for-the-badge&logo=n8n&logoColor=white) ![Airtable](https://img.shields.io/badge/-Airtable-18BFFF?style=for-the-badge&logo=airtable&logoColor=white) ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white) ![Slack](https://img.shields.io/badge/-Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white) ![Telegram](https://img.shields.io/badge/-Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white) ![Claude](https://img.shields.io/badge/-Claude-D97757?style=for-the-badge&logo=anthropic&logoColor=white) ![Gemma 4 (local)](https://img.shields.io/badge/-Gemma%204%20(local)-4285F4?style=for-the-badge&logo=google&logoColor=white)

🧰 **Also used:** Ollama (runs the local model), Tesseract.js (OCR), Healthchecks.io (monitoring) and Tavily (company search).

## 👤 About me

Over the years I have worked in consulting and banking, in these roles:

- Project and process manager and PMO, in two separate projects at Accenture
- Product manager for B2C mortgages
- Technical delivery of those products, where I came to know the full software development lifecycle from the inside

That is where I learned what drives a business and where its processes hurt, and it shapes how I design workflows.\
Technology has fascinated me since childhood, and AI let me combine that lifelong interest with my business experience.

I am currently training as a digitalisation manager and run my own self-hosted n8n server.

💬 Contact: [LinkedIn](https://www.linkedin.com/in/markus-piljanovic-42141310b/)

## ⚙️ Workflows

| Workflow | Problem | Result | Explore |
|---|---|---|---|
| **[Lead Qualification](workflows/lead-qualification/)** | Sales inquiries arrive by mail.<br>Spam burns AI runs, and no reply should reach a prospect unreviewed. | Rules stop spam before any model runs.<br>An AI agent scores each lead from 0 to 100.<br>A reply to a hot lead leaves only after a human click. | ▶️ [Live demo](https://markus-piljanovic.github.io/automation-portfolio/workflows/lead-qualification/demo/index.html) |
| **[Compliance Guide](workflows/automation-compliance-guide/)** | Consultants must identify which GDPR and EU AI Act articles apply to a planned automation project. | About 20 clicks yield a checklist backed by sources.<br>Fixed rules select the topics, and the AI only phrases three sentences from the matching law cards.<br>Orientation, not legal advice. | ▶️ [Live demo](https://markus-piljanovic.github.io/automation-portfolio/workflows/automation-compliance-guide/page/compliance-guide-demo.html) |
| **[Mini-IDP](workflows/mini-idp-schmidt/)** | A logistics company keys in roughly 180 delivery notes a day by hand. | Free OCR reads first, and AI steps in only for unclear notes.<br>Fixed rules decide, and a person in Slack resolves every doubt. | ▶️ [Walk-through](https://markus-piljanovic.github.io/automation-portfolio/workflows/mini-idp-schmidt/page/01-intake.html) |

## 🔍 Where to look

| If you want to see | What you will find | Where |
|---|---|---|
| Architecture of an AI workflow | Fixed rules decide, and the AI only phrases three sentences | [Compliance Guide](workflows/automation-compliance-guide/README.md), section "The idea" |
| A human in the loop | A reply leaves only after a click, and Slack resolves every doubt | [Lead Qualification](workflows/lead-qualification/README.md), [Mini-IDP](workflows/mini-idp-schmidt/README.md) |
| Error handling and monitoring | Error workflow with an alert in Telegram or Slack, and a custom Healthchecks node | [Lead Qualification](workflows/lead-qualification/README.md), [Compliance Guide](workflows/automation-compliance-guide/README.md), [Mini-IDP](workflows/mini-idp-schmidt/README.md) |
| Testing | 22 of 23, 27 of 27 and 16 of 18 cases, with expectations written in advance | Test plan in each README |
| Cost per run | Measured, plus a daily cap | [Compliance Guide](workflows/automation-compliance-guide/README.md), [Mini-IDP](workflows/mini-idp-schmidt/README.md), section "Cost and value" |
| Known limits | A "Known limits" list in every README | all three |

## 🗂️ How this repository is organised

Three levels, each one going deeper than the last:

1. 🧭 **This page** gives the problem, the result and a demo link.
2. 🏗️ **The workflow README** covers architecture, design decisions, tests and known limits.
3. 📁 **The files** hold the workflow JSON, test cases and test data.

## 🛡️ Safeguards

✅ *Built* means the safeguard is part of the workflow and has been tested.\
🔧 *Extension* means it is not built.\
All three pieces are course and portfolio projects, not live systems.

| Topic | Lead Qualification | Compliance Guide | Mini-IDP |
|---|---|---|---|
| Error workflow | ✅ Built (Telegram alert and ping) | ✅ Built (Telegram alert and ping) | ✅ Built (Slack alert) |
| Human approval | ✅ Built (click to send) | ➖ Not needed (nothing is sent) | ✅ Built (Slack) |
| Duplicate handling | ✅ Built (known senders) | ➖ Not needed | ✅ Built (supplier and note number) |
| Retries, timeouts, limits | ✅ Built | ✅ Built (daily cap of 0.20 €) | ⚠️ Partly (two nodes retry) |
| Privacy | ✅ Built (no personal data in Telegram) | ✅ Built (click answers only) | 🔧 Extension |
| Retention and deletion | 🔧 Extension | 🔧 Extension | 🔧 Extension |
| Webhook login | ➖ Not applicable (mail trigger) | ➖ Not applicable (the browser form cannot hold a key; guarded by a value allow-list and the daily cap) | 🔧 Extension |

## 📊 Measured numbers

Figures from actual test runs.

| Workflow | Tests passed | Cost per run |
|---|---|---|
| Lead Qualification | 22 of 23 | n/a |
| Compliance Guide | 27 of 27 (all 41 articles retrieved at least once) | about 0.0023 $ |
| Mini-IDP | 16 of 18 | 0.003 to 0.005 $ per AI-read note, 0 $ for OCR |

## 📝 Notes

- Credentials, IDs, table and folder references are replaced by placeholders (`YOUR_..._ID`).
- The workflows need your own connections after import.
- The sticky notes in each workflow describe the steps.
- Workflows and sticky notes are in English.\
  Demo and test plan: Compliance Guide and Lead Qualification in English and German, Mini-IDP in English.
- The descriptions offer orientation and are not legal advice.
