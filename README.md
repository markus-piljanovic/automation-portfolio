# n8n Workflows

Example workflows from my automation work (n8n, self-hosted on a VPS). Every workflow has its own folder with an explanation, screenshots and the exported JSON files.

## Workflows

| Workflow | What problem it solves | Folder |
|---|---|---|
| **Lead Qualification** | Requests from a form and a mailbox get answered late, and the hot ones get lost in a full inbox. Every slow answer can cost a customer. | [lead-qualification](lead-qualification/) |
| **E-Mail Rechnungserfassung** (invoice capture) | Invoices arrive by mail and are typed into a sheet by hand, in different currencies and sometimes twice. It is slow, boring and error-prone. | [email-rechnungserfassung](email-rechnungserfassung/) |

### Lead Qualification

![Lead Qualification](lead-qualification/images/workflow-overview.png)

- **Problem:** small businesses lose customers and hot requests in a full inbox. Sorting and answering takes time.
- Two entry points (form, mail), duplicate check, AI agent with imprint research
- Categories hot, warm, cold, spam and clarification, with score and reply draft
- Hot-lead replies are approved with two Telegram buttons, without any run waiting
- Retries, AI fallback, error workflow, heartbeat ping, fixed limits for the AI
- Tested live with more than 20 cases

[Read the full description](lead-qualification/README.md)

### E-Mail Rechnungserfassung (invoice capture)

![E-Mail Rechnungserfassung](email-rechnungserfassung/images/workflow-gesamt.png)

- Runs every night, handles up to 10 mails per run
- AI extraction, currency conversion, a key that prevents duplicate rows
- Retries, error workflow with Telegram alert

[Full description](email-rechnungserfassung/README.md) (currently in German)

## Notes

- Credentials, IDs, table and folder references are replaced by placeholders (`YOUR_..._ID`). The workflows can be imported, but need your own credentials.
- The sticky notes in the workflows explain every step.
