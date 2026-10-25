# n8n Workflows

Example workflows from my automation work (n8n, self-hosted on a VPS). Every workflow has its own folder with an explanation, screenshots and the exported JSON files.

## Workflows

| Workflow | What problem it solves | Folder |
|---|---|---|
| **Lead Qualification** | Requests from a form and a mailbox get answered late, and the hot ones get lost in a full inbox. Every slow answer can cost a customer. | [lead-qualification](workflows/lead-qualification/) |
| **Invoice Capture** | Invoices arrive by mail as PDFs, often in other currencies, and are typed into a sheet by hand. That is slow, and missed or double invoices mean late fees and messy books. | [invoice-capture](workflows/invoice-capture/) |
| **Compliance Bot** | Questions about GDPR and the EU AI Act need the right article, not a guess. A chatbot that makes things up is worse than none. | [compliance-bot](workflows/compliance-bot/) |

### Lead Qualification

![Lead Qualification](workflows/lead-qualification/images/workflow-overview.png)

- **Problem:** small businesses lose customers and hot requests in a full inbox. Sorting and answering takes time.
- Two entry points (form, mail), duplicate check, AI agent with imprint research
- Categories hot, warm, cold, spam and clarification, with score and reply draft
- Hot-lead replies are approved with two Telegram buttons, without any run waiting
- Retries, AI fallback, error workflow, heartbeat ping, fixed limits for the AI
- Tested live with more than 20 cases

[Read the full description](workflows/lead-qualification/README.md)

### Invoice Capture

![Invoice Capture](workflows/invoice-capture/images/workflow-overview.png)

- **Problem:** invoices arrive by mail as PDFs, often in other currencies. Typing them into a sheet is slow and easy to get wrong. Missed or double invoices cost money.
- Runs every night, up to 10 mails per run
- An AI reads the PDF, foreign currencies are converted with the ECB rate of the invoice date
- One row per invoice in Google Sheets, a key prevents double rows, the PDF goes to Google Drive
- Retries, error workflow with Telegram alert, heartbeat ping
- Tested with test PDFs: invoices in euro and other currencies, offers, terms, duplicates

[Read the full description](workflows/invoice-capture/README.md)

### Compliance Bot

![Compliance Bot](workflows/compliance-bot/images/chat_01_overview.png)

- **Problem:** questions about the GDPR and the EU AI Act are answered from memory, with invented articles and wrong dates. Advice that cannot be checked is risky.
- RAG on the full legal texts (297 cards in Supabase, topic labels), AI agent with eleven search tools, one per topic
- Answers only from the retrieved text, with citation, a counter-question when the case is open and a fixed AI notice
- Code checks after the model: numbers, articles and dates must appear in the retrieved text, otherwise the sentence is removed
- Telegram bot with daily cost limit, length limit, cost message per question, error workflow and heartbeat ping
- Tested with realistic user questions, expectations written from the law first. Weak points are documented

[Read the full description](workflows/compliance-bot/README.md)

## Notes

- Credentials, IDs, table and folder references are replaced by placeholders (`YOUR_..._ID`). The workflows can be imported, but need your own credentials.
- The sticky notes in the workflows explain every step.
