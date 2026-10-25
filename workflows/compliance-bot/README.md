# Compliance Bot

A chatbot for questions about the **GDPR (DSGVO)** and the **EU AI Act**. It acts as a sparring partner: it classifies a question, makes suggestions and asks a counter-question when the case is open. Statements about the law come only from the legal texts, with a citation (Fundstelle). Not legal advice.

> Status: work in progress. Database (297 cards), ingest (all laws in one run), chat workflow (web chat and Telegram) with **eleven search tools**, input gates (length limit, `/neu`, daily limit), source check (numbers, articles, dates), fixed AI notice, cost message per question and cost log are running. The AI Act is live as the **consolidated version of 2026-07-27** (includes the AI Omnibus, Regulation (EU) 2026/1744). Smoke test with five realistic user questions (run 13, 2026-10-25): 4 of 5 OK, 1 partial. A self-check of answers with a small model is built in but only logs (not reliable yet). The target is a larger architecture with a router and specialised agents (see "Target architecture"). The workflow exports in this folder are sanitized copies of the live workflows (placeholders instead of credentials and IDs). Node names and sticky notes in the workflows are in English. The system prompt is in German, because the legal texts and the search queries are German.

## What it is for, what it is not

- Meant for: questions about using AI and automation for clients, e.g. data processing agreements (AVV), data sent to OpenAI, risk classes.
- Not included: BDSG (German Federal Data Protection Act), tax and labour law, court rulings, guidance of supervisory authorities, recitals.
- Without a matching source the bot says "I have no matching source for this" (in German: "dazu habe ich keine Quelle").

## Contents

**GDPR / DSGVO (99 articles)**

- Basics and definitions (Art. 1–4)
- Principles and lawfulness (Art. 5–11)
- Rights of data subjects (Art. 12–23)
- Controller and processor (Art. 24–43), incl. data processing agreement (Art. 28)
- Transfers to third countries (Art. 44–50)
- Supervision, cooperation, liability, fines (Art. 51–84)
- Special cases and final provisions (Art. 85–99)

**EU AI Act (113 articles + 13 annexes)**

- General provisions (Art. 1–4)
- Prohibited AI practices (Art. 5)
- High-risk AI (Art. 6–49)
- Transparency obligations (Art. 50)
- General-purpose AI models (Art. 51–56)
- Innovation support, governance, market surveillance (Art. 57–94)
- Codes of conduct, penalties, final provisions (Art. 95–113)
- Annexes I–XIII

## Data status

- Source: EUR-Lex, German version (CELEX 32016R0679 and 32024R1689)
- GDPR: Official Journal text, later amendments are not included, retrieved on 2026-10-06 (118 cards)
- EU AI Act: consolidated version of 2026-07-27 (CELEX 02024R1689-20260727), retrieved on 2026-10-22 (179 cards). It includes the AI Omnibus: high-risk obligations for Annex III from 2027-12-02, new prohibitions in Art. 5 (paragraph 1 ba and bb), new Art. 4a, 60a and 75a to 75d, new Annex XIV. The GDPR amendments of the Digital Omnibus are not law yet and are not included.
- Every entry in the database carries `stand` (retrieval date) and `fassung` (version) in its metadata, set per law

## Architecture

1. **Prepare the legal texts:** `data/chunking.py` splits the EUR-Lex HTML into 297 entries (`chunks.json`, GDPR 118, AI Act 179), each with text, citation and a topic label (`thema`, 14 labels, e.g. `betroffenenrechte`, `drittland`, `hochrisiko`, `verbote`, `geltungsbeginn`, taken from the chapters of the laws). Long articles are split at paragraph boundaries (cards up to about 4,000 characters, a single paragraph stays whole up to 9,000 characters), so that lists like the prohibition list in AI Act Art. 5 stay together (Art. 5 paragraph 1 has about 8,000 characters). The script is source-neutral: each law has its own configuration (file, retrieval date, version, source URL), article numbers with letters (4a, 75b) and paragraph numbers with letters (14a, 1b) are supported and the change markers of the consolidated version are removed. A new law is added by one more configuration block. Art. 111 and 113 (start dates) have their own label, because Art. 113 sat on a large shelf and was not found for date questions.
2. **Ingest workflow (n8n):** reads `chunks.json` (all laws), creates embeddings (`text-embedding-3-small`, 1536 dimensions) and stores them in Supabase. Every run loads everything (297 cards cost well under one cent); the table is emptied before, so the database always matches the file and no node has to be changed between runs.
3. **Database:** Supabase (PostgreSQL with pgvector), region Frankfurt. Table `documents` (content, metadata, embedding), search function `match_documents`.
4. **Chat workflow (n8n):** chat trigger, AI agent with conversation memory (last 3 exchanges, reduced from 6 to save tokens) and **eleven search tools**: `gesetze_suche` (all 297 entries, 8 hits) and ten topic tools that each search only one label of the data (`betroffenenrechte`, `grundsaetze`, `pflichten`, `drittland`, `sanktionen_dsgvo`, `hochrisiko`, `sanktionen_ai_act`, `grundlagen`, `verbote`, `geltungsbeginn`, 2 to 13 hits). A **label** is the shelf sign on an entry in the database, a **tool** is a librarian that searches one shelf. All tools share one embedding node, the comparison runs inside the database (function `match_documents`). The agent picks the tools by their description and by rules in the prompt, up to 4 searches per question. Short answer in a casual tone with assessment, suggestion and citation, and a counter-question when the case is open. Statements about the law come only from the hits. Model: gpt-4o, temperature 0.2, max. 900 tokens, system prompt version 6.7. For questions of the form "is this allowed, forbidden or mandatory?" the prompt prescribes a fixed answer form of about 150 words: never "Yes" or "No" first, then (1) role (provider or deployer), (2) rule with citation, (3) start date, (4) what is open, (5) exactly one counter-question. For prohibitions and high-risk the tool `geltungsbeginn` is always called, because the field `stand` in the metadata is only the retrieval date and must never be given as a start date.
5. **Telegram as a second entry point (n8n):** The same questions can be asked via Telegram. The bot answers there and only accepts the owner's own chat ID (protection against foreign costs). The agent and its memory are the same as in the web chat, with a separate memory per Telegram chat.
6. **Cost per question (n8n):** After every Telegram answer a sub-workflow (`compliance-bot-cost-per-question`) sends a second message with the cost of that question and the daily total. Above the daily limit (1.00 EUR) a warning is added. The same row is written to `usage_log`. In addition, a gate in front of the agent reads today's cost and stops further Telegram questions once the daily limit is reached (no model call, no cost). `/neu` in Telegram starts a fresh conversation (new session id). A **length limit** (1,000 characters) stops oversized questions before the agent runs (no model call, no cost).
7. **Source check (n8n, no model call):** a code node after the agent checks the answer against the retrieved hits. A sentence with a number and unit (e.g. "six months", "20 employees") must appear in the text of the articles the answer cites, otherwise the sentence is removed and a note is added. A cited article that is not among the hits gets a note. A sentence with a date (e.g. "2. Dezember 2027") must contain a date that appears in the hits, otherwise it is removed (measured: the model once made up the retrieval date as a start date).
7b. **Fixed AI notice (n8n, no model call):** the code node `Add AI Notice` appends "Hinweis: Ich bin ein KI-Assistent und gebe keine Rechtsberatung." to every answer (English line for English answers). The workflow adds it, not the model, so it cannot be forgotten. If asked, the bot also says honestly that it is an AI assistant.
8. **Answer self-check (n8n, small model, log mode):** after the agent a second step (gpt-4o-mini) checks each sentence with a citation against the cited article. It currently only writes its findings into the execution data and does not change answers: in tests it flagged correct sentences and overlooked a wrong citation. Next: quote-based check (the model must quote the supporting text, a code node verifies the quote) and a comparison with gpt-4o.
9. **Usage logger (n8n, switched off since 2026-10-22 because it grew the n8n database to 9 GB):** every 15 minutes it wrote tokens and cost (EUR) of the chat questions that are still missing (web chat, failed runs) into the table `usage_log`, without the question in plain text (length only). Tokens are n8n estimates, the price has a source and a date.

## Target architecture (planned)

```
Telegram / chat
  -> gates: length limit, /neu, daily limit                          (running)
  -> router: classifier (gpt-4o-mini, fixed topic field) -> switch
        |- data protection agent  (GDPR tools)
        |- AI Act agent           (AI Act tools)
        |- mixed agent            (all tools, today's agent, for questions with several topics)
        '- fixed answer           (other laws, topic list for broad questions)
  -> verifier: quote-based self-check
  -> source check -> markdown strip -> answer -> cost message
```

- **Why:** the system prompt has grown to more than 70 rules and rules collide. Specialised agents get short prompts and only their own tools.
- **Measured before and after** on the same question pool, every question three times: citation fidelity, unsupported statements, retrieval recall (top 8 and top 20), tool choice, completeness (agreed key points), boundary behaviour, stability, cost and time, robustness, regression. Targets are agreed before measuring.
- **Decision rule:** the larger architecture counts as a success only if completeness and stability improve without losing citation fidelity or boundary behaviour and at acceptable cost. Otherwise only the verifier stays.
- **Re-ranking:** decided after the measurement (recall at top 8 compared with top 20). If the right entries are among the top 20 but not the top 8, re-ranking helps. If they are not found at all, the search itself must change.
- **Question pool:** [testing/Compliance_Bot_Pool_Testfragen.md](testing/Compliance_Bot_Pool_Testfragen.md) (20 hard questions that mix n8n technology with law, plus the questions of test run 9).

## Limits and mitigation

- Very broad questions ("Explain the GDPR"): the bot asks back or narrows the topic down.
- Questions spanning several articles: 8 hits per search and a second search for lists, amounts and deadlines. Rights of data subjects have their own search tool with a topic filter (all rights listed in 2 of 2 runs).
- Scope and exceptions (e.g. purely private use, GDPR Art. 2 and AI Act Art. 2) are searched and checked explicitly.
- Practice questions (scenarios without keywords) are harder than knowledge questions: test run 9 showed missing key points (processor contract, role as provider or deployer, legal basis) until a broader tool rule and a tool for the principles (Art. 5 to 11) were added. Questions about a product or provider get the legal criteria but no rating of the provider.
- Known weaknesses (test runs 5 to 9): the model occasionally adds knowledge that is not in the hits (e.g. national law), the counter-question "private or professional?" appears when third parties are only implied, definitions spread over several cards are sometimes not found (AI Act Art. 3), enumerations are sometimes incomplete, and the model sometimes uses bold markers despite the rule. Made-up numbers from model knowledge are now removed by the source check. With one run per question the results vary, so single prompt tweaks are hard to measure (at least three repetitions are needed).
- Everyday language instead of legal language: rewrite the question before searching (planned after the tests).

## Constraints of building this in n8n

This bot is a showcase for n8n, and building it there showed clear limits. Most of the open weaknesses would have been solved more elegantly in plain code (for example Python). They are listed here on purpose.

**What made it hard**

- **The agent decides, the builder cannot steer it.** The AI agent node chooses the tool, the order and the content of the answer. It sometimes skips a tool, and soft prompt rules are not followed reliably. The prompt grew to more than 70 rules that collide with each other. Whatever must always hold had to be moved out of the prompt into code nodes (source check, date check, fixed AI notice, gates).
- **Hard to test and to version.** No diff for prompts and settings, no automatic tests, every run costs money, and the same question gives different answers. A change needs at least three repeated runs to see an effect. The question pool is a table that has to be run by hand.
- **Two versions of one workflow.** Telegram uses only the published version, API tests run against the draft. That caused wrong conclusions more than once.
- **Everything is kept in sync by hand.** Sticky notes, screenshots, exports, README and notes must be updated after every change.
- **Limited visibility into cost and data.** The gateway only gives token estimates. Saving execution data of a helper workflow grew the n8n database to 9 GB.

**What a code version would add**

- A fixed pipeline: a classifier picks the topic and the role, fixed searches always run, a checklist of required points per topic (for example data breach: 72 hours, the "no risk" exception, documentation, notifying data subjects), the model only words the answer, code checks it against the checklist.
- Prompts and settings in version control, the question pool as an automatic test suite, cheap repeated runs and a measurement of the search quality (recall at top 8 and top 20).

**What code would not solve**

- The depth and accuracy of the model, for example a wrongly assigned article. This depends on the model and the data.
- Legal correctness. It needs a review by a legal expert.

**Decision:** The bot stays in n8n, because n8n is the subject of this portfolio. The next step is a middle way: n8n stays the frame (trigger, Telegram, cost, monitoring), and the decisions move into code nodes (classifier, fixed searches, required points, check step). See "Target architecture" and the roadmap.

## Roadmap

**Build (in this order)**

- [x] Supabase project, table `documents`, search function `match_documents`
- [x] Embedding access clarified (course gateway, 1536 dimensions tested)
- [x] Legal texts fetched and split into entries (now 284, paragraph-aware)
- [x] `chunks.json` on the server, file access for n8n enabled
- [x] Ingest workflow: read file, split, embeddings, store in Supabase (284 rows in `documents`)
- [x] Chat workflow: chat trigger, AI agent, Supabase as knowledge source
- [x] System prompt: answer only from sources, cite the source, "I don't know"; since 2026-10-13 as a sparring partner with counter-questions, scope check and memory, refined to version 6.2 on 2026-10-14 (no added knowledge, no consent for prohibitions, language check, no markdown, "professional" as default, targeted search for definitions and for follow-up questions). A repeat of 13 questions improved from 5 OK / 7 partial / 1 error (v6.1) to 8 OK / 4 partial / 1 error (v6.2), with some new slips (AI Act Art. 27 for CV scoring, a wrong exception in GDPR Art. 9)
- [x] Model comparison gpt-4o-mini vs. gpt-4o (21 questions): 13 vs. 15 OK, 1 vs. 0 errors. gpt-4o is live
- [x] Cost log: `usage_log` and usage logger workflow (also keeps Supabase awake, keep-alive done)
- [x] Telegram as a second entry point (own chat ID only) and cost message per question with daily limit warning (2026-10-14, warning tested)
- [x] Node names and sticky notes of all workflows translated into English (portfolio)
- [ ] Telegram: test memory (follow-up questions) and foreign access with a second account
- [x] Chunking fixed (list letters when splitting long articles) and re-ingested
- [x] Card size investigated: 8,000 characters made the search worse, paragraph-aware splitting solves Art. 5 (all 8 prohibitions)
- [x] Test runs 1 to 9, documented in one file (`testing/Testläufe.md`, changed from Word to markdown on 2026-10-14), test run 4: 19 of 25 questions OK, 6 partial, 0 errors; test runs 5 to 7 (22 questions each): 12/6/4 (prompt v5), 16/4/2 (prompt v6, same questions), 14/8/0 (prompt v6.1, new questions)
- [x] Markdown removed in the workflow before the reply (code node "Strip Markdown", 2026-10-14)
- [x] Prompt version 6.2 (default "professional", look up definitions, context for follow-up searches), 2026-10-14
- [x] Temperature measured (0.0, 0.2, 0.4, five questions with three runs each): 0.2 had the fewest hard rule violations (1 of 15 runs, against 4 at 0.4 and 5 at 0.0), 0.0 repeated the same mistakes almost word for word. Live setting: 0.2
- [x] Test run 8 (16 questions, prompt v6.4, temperature 0.2, source check): 9 OK, 6 partial, 1 error; the made-up "six months" is removed by the source check in 3 of 3 runs
- [x] Topic labels (`thema`) in the data, second search tool `betroffenenrechte` with metadata filter, search limit 8
- [x] Rule-based source check (numbers and citations), no model call
- [x] Daily-limit gate before the agent and `/neu` memory reset for Telegram
- [x] Workflow exports of all five workflows in this folder (sanitized: credential IDs, chat ID, ping UUID and workflow IDs replaced by placeholders)
- [x] Eight search tools with label filters (topic tools for rights of data subjects, principles, duties, third countries, fines of both laws, high-risk), tool rules in the prompt
- [x] Length limit (1,000 characters) in front of the agent
- [x] Test run 9 (12 practice questions): first pass 6 OK, 6 partial; after prompt and tool changes 8 OK, 4 partial, 0 errors. Tool choice for clear topic questions 5 of 5
- [x] Answer self-check with a small model built in (log mode), measured as not reliable yet
- [ ] Self-check: quote-based verification and comparison with gpt-4o
- [ ] Router with a fixed topic field, then specialised agents as sub-workflows (first one built by hand, the rest after review)
- [ ] Evaluation workflow with the question pool (three runs per question, recall at top 8 and top 20)
- [x] Hardening (2026-10-22): error workflow with Telegram alert, healthcheck ping after a successful answer, limits checked (length 1,000 characters, daily limit 1.00 EUR, memory 3), access test from a group chat passed (no execution, no answer)
- [ ] Hardening, later: rate limit per user, own API key with its own budget, retention period for execution data (gpt-4o costs about 0.03 EUR per question)
- [x] Chunking script made source-neutral and converted to the consolidated AI Act, 2026-10-22
- [x] Art. 5 kept together (paragraph limit 9,000 characters, 3 cards) and paragraph numbers with letters fixed, 2026-10-24
- [x] AI Act re-ingested (297 rows, GDPR 118 and AI Act 179, checked by SQL, 2026-10-24). Ingest workflow simplified afterwards: no filter, every run loads all cards after `truncate`
- [x] Smoke tests with expected answers from the cards (runs 10 to 13): start date 2027-12-02 for Annex III, new prohibitions in Art. 5, AI literacy (Art. 4) without link to high-risk. Three new tools (`grundlagen`, `verbote`, `geltungsbeginn`), answer form with role first, fixed AI notice, date check. Run 13: 4 of 5 OK, 1 partial
- [ ] Regression run over the whole question pool (after the budget reset on 2026-11-01)
- [x] Canvas screenshots of all four workflows (`images/`), 2026-10-25
- [x] Three real Telegram answers with screenshots (test run 14), 2026-10-25
- [x] Sanitized workflow exports (placeholders) in this repo, 2026-10-25

**Improvements afterwards**

- More hits per question: done (5 to 8 to 12 and back to 8 with better routing)
- Follow-up questions for overly broad questions: done (sparring-partner prompt)
- Model routing: simple questions with gpt-4o-mini, application questions with gpt-4o (comes with the router)
- Test Telegram access with a second account (foreign access)
- Rewrite the question into legal language before the search ("Datenpanne" to "Verletzung des Schutzes personenbezogener Daten")
- Split broad questions into sub-questions, merge several searches
- Hybrid search (meaning plus keyword), good for exact terms like "Art. 28"
- Add recitals (they explain the "why")
- Before/after comparison of the test questions in the README to prove the improvements

**Maintenance**

- When a law changes: adjust its block in `LAWS` in `chunking.py` (file, `stand`, `fassung`, `quelle`), run the script again, upload `chunks.json`, empty the table (`truncate table documents restart identity;`), run the ingest, check the count. New sources (BDSG, rulings) are added to the same file by one more block in `LAWS`
- A monthly workflow checks by hash whether the EUR-Lex page has changed and reports it by mail

**Outlook**

- Chat widget on the portfolio website
- Live link to the bot as a bonus (public use only with rate limit and cost cap)

## Files in this folder

- `compliance-bot-chat.json`, `compliance-bot-ingest.json`, `compliance-bot-cost-per-question.json`, `compliance-bot-usage-logger.json`, `Error Workflow (compliance-bot).json`: the five n8n workflows (sanitized)
- `images/`: canvas screenshots and the three Telegram answers
- `testing/`: all test runs (`Testläufe.md`) and the question pool (`Compliance_Bot_Pool_Testfragen.md`), written in German
- `data/chunking.py`: turns the EUR-Lex HTML of the laws into the cards (`chunks.json`) that the ingest workflow loads. The law texts and `chunks.json` are not part of the repo (download from EUR-Lex)

## Screenshots

Canvas screenshots of the four workflows are in [images/](images/). The sticky notes in the images explain each part.

**Chat workflow** (`compliance-bot-chat`)

1. Overview of the whole canvas: ![Chat workflow overview](images/chat_01_overview.png)
2. What the bot can answer (topics, 297 cards): ![Bot description](images/chat_02_bot_description.png)
3. Entry points and gates in front of the agent (Telegram trigger, `/neu`, length limit, daily limit): ![Trigger, input and gates](images/chat_03_trigger_input_gates.png)
4. The AI agent with chat model, memory and the self-check after it: ![AI agent](images/chat_04_ai_agent.png)
5. The eleven search tools on one shared embedding node: ![Search tools](images/chat_05_search_tools.png)
6. Source check, markdown strip, fixed AI notice and outputs: ![Checks and outputs](images/chat_06_checks_and_outputs.png)

**Supporting workflows**

- Ingest (`chunks.json` to Supabase, 297 cards): ![Ingest workflow](images/ingest.png)
- Cost per question (second Telegram message, daily total): ![Cost per question](images/cost_per_question.png)
- Usage logger (switched off): ![Usage logger](images/usage_logger.png)
- Error workflow (Telegram alert): ![Error workflow](images/error_workflow.png)

## Example answers (Telegram)

Three real answers from Telegram (test run 14, 2026-10-25, published version, new chat before each question). The questions are written the way a user would ask them. The expectations were set from the legal texts before the run, the full table is in [testing/Testläufe.md](testing/Testläufe.md). Every answer ends with the fixed AI notice, which the workflow adds.

**1. Hochrisiko, Rolle und Datum** (result: OK, with weaknesses)

> Wir wollen Bewerbungen von einer KI vorsortieren lassen. Ist das erlaubt und was müssen wir beachten?

![Answer 1: recruiting AI](images/telegram_01_bewerbungen.png)

The bot clarifies the role first (provider or deployer), classifies the case as high-risk (Annex III, employment), gives the start date 2 December 2027 from Art. 113 and asks one counter-question about the role. Weak points: it files Art. 6 under data governance (that is Art. 10), and the deployer duties (Art. 26) and GDPR Art. 22 are missing.

**2. Rechtssicher mit einem LLM-Anbieter** (result: partial)

> Für meinen deutschen Kunden nutze ich Claude Haiku als LLM, mein Server selbst wird in der EU gehostet. Was brauche ich dahingehend, um den Workflow rechtssicher zu machen?

![Answer 2: LLM provider and data protection](images/telegram_02_llm_kunde.png)

Correct points with citations (legal basis Art. 6, information Art. 13, security Art. 32, processor contract Art. 28, third countries Art. 44 to 49), nothing made up and no statements about the provider. Missing: the sub-processor rules of Art. 28 (paragraphs 2 and 4), the hint that an EU server does not settle the transfer to a model provider outside the EU, and the AI Act.

**3. Datenpanne** (result: partial, slight)

> Ein Mitarbeiter hat versehentlich eine Kundenliste an die falsche Adresse geschickt. Was muss ich jetzt tun?

![Answer 3: data breach](images/telegram_03_datenpanne.png)

Notification of the authority within 72 hours (Art. 33), information of the data subjects at high risk (Art. 34), content of the notice, one counter-question about encryption. Missing: the exception when the breach is unlikely to cause a risk, and the duty to document the breach (Art. 33 paragraph 5).

The weak points are shown on purpose: the answers are correct and grounded in the hits, but often less deep than a lawyer's answer. The next steps (fixed topic and role selection, a code check step) target exactly this.

## Test questions

All runs, per-question tables and measurements: [testing/Testläufe.md](testing/Testläufe.md). Test run 9 (2026-10-18, 12 practice questions, eight tools): 8 OK, 4 partial, 0 errors. Test run 8 (2026-10-14, 16 questions, prompt v6.4): 9 OK, 6 partial, 1 error. Progress across the runs: run 1 10 OK and 4 errors (16 questions), run 2 14 OK and 0 errors (16 questions), run 3 16 OK, 5 partial, 2 errors (23 questions, new sparring questions), run 4 19 OK, 6 partial, 0 errors (25 questions, gpt-4o), run 5 12 OK, 6 partial, 4 errors (22 new questions, prompt v5), run 6 16 OK, 4 partial, 2 errors (same 22 questions, prompt v6), run 7 14 OK, 8 partial, 0 errors (22 new questions, prompt v6.1), run 8 9 OK, 6 partial, 1 error (16 questions, prompt v6.4, source check), run 9 8 OK, 4 partial, 0 errors (12 practice questions from the pool, eight tools). The question sets differ between runs, so the numbers are not directly comparable. Cost per question with gpt-4o: about 0.03 EUR in tests (new session per question), up to 0.14 EUR in a long Telegram chat with memory. Selected examples with answer and citation will follow here, plus "I don't know" cases.

## Privacy and security

- The Supabase key and the database password live only in n8n credentials, never in the repo or an export.
- The exports in this folder are sanitized: credential IDs and names, the owner's Telegram chat ID, the ping URL and workflow IDs are replaced by placeholders (`YOUR_..._ID`). The workflows can be imported, but need your own credentials. The Telegram token and API keys are never part of an export (they live only in n8n credentials).
- The Telegram bot only reacts to the owner's chat ID.
- Done: daily cost limit (gate before the agent), chat ID restriction (tested from a group chat), length limit, error workflow, healthcheck ping.
- In the bot: every answer ends with the fixed line that it is an AI assistant and gives no legal advice.
- Not in the bot, by decision (showcase for the owner only): no data protection notice, no retention rule on the server. Questions and answers are stored in the n8n executions (default 14 days).
- Planned: rate limit per user, own API key with its own budget, retention period for execution data. The self-check stays in log mode.
