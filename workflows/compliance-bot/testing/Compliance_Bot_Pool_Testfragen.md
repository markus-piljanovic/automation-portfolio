# Compliance-Bot: Pool der Testfragen

Stand: 2026-10-18. Sammlung aller Fragen für die Tests des Compliance-Bots. Aus dem Pool wird je Lauf eine Auswahl gezogen (Ziel: Testset mit 40 bis 60 Fragen, jede Frage dreimal).

## Wie der Pool zu lesen ist

- **Quelle:** `Qwen` = mit Qwen erstellt (Datei `Testfragen_Qwen.txt`, Wortlaut unverändert übernommen, nur ohne Formatierung). `L9` = Lauf 9 (2026-10-18), Erwartungen dort schon geprüft.
- **Scope** (meine Einschätzung, ob die Datenbank die Antwort tragen kann):
  - **A** = Antwort steht im Gesetzestext der Datenbank (DSGVO, EU AI Act).
  - **B** = teilweise: Der rechtliche Teil steht in den Gesetzen, ein Teil der Frage (n8n-Technik, Anbieterfakten, Urteile, Behördenpraxis) nicht.
  - **C** = überwiegend außerhalb der Datenbasis. Erwartet wird: Rechtsgrundlagen aus den Treffern nennen, Lücken ehrlich benennen ("steht nicht in meinen Quellen"), keine erfundenen Details.
- **Rechtsanker (Hypothese):** Artikel, die ich aus Kenntnis der Gesetze erwarte. **Vor dem Lauf je Frage gegen die Datenbank prüfen** (SQL auf `documents`), erst dann gilt die Erwartung. Bei `L9` wurden die Anker schon geprüft.
- **Tools** = welche Such-Tools der Bot nach den Prompt-Regeln aufrufen sollte (`gesetze_suche`, `betroffenenrechte`, `grundsaetze`, `pflichten`, `drittland`, `sanktionen_dsgvo`, `hochrisiko`, `sanktionen_ai_act`).

## A. Fragen aus Qwen (20)

Die Fragen sind **anspruchsvoller als unsere bisherigen**: Sie verbinden n8n-Technik mit Recht. Der Bot kennt n8n nicht (nur DSGVO und EU AI Act). Das ist gewollt als Härtetest: Er darf technische Details nicht erfinden.

### Kategorie 1: Datenverarbeitung, Logging und n8n-Mechanik

| ID | Frage | Scope | Tools | Rechtsanker (Hypothese) | Erwartetes Verhalten |
|---|---|---|---|---|---|
| Q-01 | **Execution-Logs:** n8n speichert standardmäßig Payload-Daten in den "Execution Logs". Wie lange dürfen diese Logs personenbezogene Daten enthalten, und welche technische Konfiguration ist erforderlich, um die Speicherbegrenzung automatisiert durchzusetzen? | B | `grundsaetze` | DSGVO Art. 5 Abs. 1 lit. e (Speicherbegrenzung), Art. 25 | Grundsatz nennen, keine feste Frist erfinden, n8n-Variablen nicht bestätigen oder erfinden ("steht nicht in meinen Quellen") |
| Q-02 | **Datenminimierung im Payload:** Ein Webhook in n8n empfängt einen großen JSON-Payload mit 50 Feldern, aber der nachgelagerte KI-Node benötigt nur den "Namen". Wie muss der Workflow gestaltet sein, um dem Grundsatz der Datenminimierung (Art. 5 Abs. 1 c DSGVO) zu genügen, bevor die Daten den Workflow passieren? | B | `grundsaetze`, `pflichten` | DSGVO Art. 5 Abs. 1 lit. c, Art. 25 (Datenschutz durch Technikgestaltung) | Grundsatz und Art. 25 nennen, allgemein "nur notwendige Felder weitergeben", keine erfundenen Node-Namen |
| Q-03 | **Fehlerbehandlung und Drittanbieter:** Wenn ein n8n-Workflow fehlschlägt und eine Fehlerbenachrichtigung mit personenbezogenen Daten an einen externen Dienst (z. B. Slack oder E-Mail) sendet, gilt dies als eigene Verarbeitungstätigkeit? Wie ist das im Verzeichnis von Verarbeitungstätigkeiten (Art. 30 DSGVO) zu erfassen? | A | `pflichten`, `gesetze_suche` | DSGVO Art. 4 Nr. 2 (Verarbeitung), Art. 30 (Verzeichnis), Art. 28 (externer Dienst als Auftragsverarbeiter) | Ja, Offenlegung ist Verarbeitung; Art. 30 Inhalte; Rolle des Dienstes klären (Gegenfrage) |
| Q-04 | **Recht auf Löschung:** Wenn ein Betroffener Löschung nach Art. 17 DSGVO verlangt, wie stelle ich sicher, dass die Daten nicht nur aus der Zieldatenbank, sondern auch aus n8n-Execution-Logs, Event-Bus-Histories und eventuellen Caches der KI-APIs (z. B. OpenAI) gelöscht werden? | B | `betroffenenrechte`, `pflichten` | DSGVO Art. 17 (inkl. Abs. 2), Art. 19 (Mitteilung an Empfänger), Art. 28 Abs. 3 lit. g (Löschung bei Auftragsverarbeitern) | Art. 17 und 19 nennen; technische Orte (Logs, Caches) nur allgemein, keine Aussagen zu OpenAI-Caches |
| Q-05 | **Datenpanne:** Ein n8n-Webhook-Node wurde versehentlich ohne Authentifizierung (z. B. fehlender Header/Basic Auth) veröffentlicht und hat personenbezogene Daten empfangen/gesendet. Wann genau beginnt die 72-Stunden-Frist zur Meldung an die Aufsichtsbehörde (Art. 33 DSGVO), und wer ist meldepflichtig (ich als Ersteller oder der Kunde)? | A | `pflichten` | DSGVO Art. 33 Abs. 1 (72 Stunden ab Bekanntwerden), Abs. 2 (Auftragsverarbeiter meldet unverzüglich dem Verantwortlichen), Art. 34, Art. 4 Nr. 12 | Fristbeginn "nachdem die Verletzung bekannt wurde", Meldepflicht beim Verantwortlichen, Auftragsverarbeiter informiert diesen. Rolle klären (Gegenfrage) |

### Kategorie 2: EU AI Act und KI-spezifische Compliance

| ID | Frage | Scope | Tools | Rechtsanker (Hypothese) | Erwartetes Verhalten |
|---|---|---|---|---|---|
| Q-06 | **Hochrisiko-Einstufung:** Ab wann stuft der EU AI Act einen n8n-Workflow, der KI für das automatische Vorauswählen von Bewerbern (CV-Screening) nutzt, als "Hochrisiko-KI-System" ein, und welche konkreten Pflichten (z. B. Konformitätsbewertung, Risikomanagementsystem) löst das aus? | A | `hochrisiko` | EU AI Act Art. 6 Abs. 2, Anhang III Nr. 4, Art. 9 (Risikomanagement), Art. 14, Art. 16 (Anbieter), Art. 26 (Betreiber), Art. 43 (Konformitätsbewertung) | Anhang III Nr. 4, Rolle (Anbieter oder Betreiber) klären, Pflichten der Rolle zuordnen, Profiling-Gegenausnahme in Art. 6 Abs. 3 |
| Q-07 | **Transparenzpflicht (Art. 50):** Welche exakten Informationen muss ich dem Endnutzer bereitstellen, wenn ein über n8n orchestrierter Chatbot automatisch E-Mails von Kunden beantwortet oder Emotionen in Sprachaufnahmen analysiert? | A | `gesetze_suche` | EU AI Act Art. 50 Abs. 1 (Interaktion mit KI), Abs. 2 (Kennzeichnung erzeugter Inhalte), Abs. 3 (Emotionserkennung), Art. 5 Abs. 1 lit. f (Verbot am Arbeitsplatz) | Pflichten unterscheiden (Chatbot, Emotionserkennung), Hinweis auf mögliches Verbot, Rolle klären |
| Q-08 | **Human-in-the-Loop:** Der EU AI Act fordert bei Hochrisiko-Systemen wirksame "Human Oversight". Wie muss ein n8n-Workflow technisch gestaltet sein (z. B. Einsatz von Wait- oder Approval-Nodes, manuelle Freigabe), um dieser Anforderung gerecht zu werden, ohne den Prozess unnötig zu bremsen? | B | `hochrisiko` | EU AI Act Art. 14 (menschliche Aufsicht), Art. 26 Abs. 2 (Betreiber benennt Personen) | Art. 14 Anforderungen nennen; n8n-Nodes nicht erfinden oder bestätigen ("steht nicht in meinen Quellen") |
| Q-09 | **Verbotene Praktiken (Art. 5):** Fällt ein n8n-Workflow, der mittels KI und Webcam-Feeds (über API) die Aufmerksamkeitsspanne von Remote-Mitarbeitern misst und an den Arbeitgeber meldet, unter die verbotenen KI-Praktiken? Wie erkenne ich solche Fallstricke im Requirement-Engineering frühzeitig? | A | `gesetze_suche` | EU AI Act Art. 5 Abs. 1 lit. f (Emotionserkennung am Arbeitsplatz), Art. 3 (Begriff Emotionserkennungssystem), DSGVO Art. 88 | Verbot prüfen, Abgrenzung "Emotionen" gegen "Aufmerksamkeit" ehrlich als unklar benennen, keine sichere Ja/Nein-Antwort, keine Heilung per Einwilligung (Regel 3b) |
| Q-10 | **Modellwechsel und Versioning:** Wenn ich einen produktiven n8n-Workflow aktualisiere (z. B. Wechsel des LLM-Providers von OpenAI auf ein lokales Llama-Modell oder Upgrade auf ein neueres Modell), gilt das als "wesentliche Änderung" im Sinne des EU AI Act, die eine neue Konformitätsbewertung erfordert? | A | `hochrisiko`, `gesetze_suche` | EU AI Act Art. 3 (Begriffsbestimmung "wesentliche Veränderung"), Art. 43 Abs. 4, Art. 25 | Definition aus den Treffern, Bezug nur bei Hochrisiko, Rolle klären, keine pauschale Antwort |
| Q-11 | **Prompt-Injection und Sicherheit:** Welche DSGVO- und AI-Act-relevanten Risiken entstehen durch Prompt-Injection in einem n8n-Workflow, und welche technischen Maßnahmen (z. B. Input-Validierung, Guardrails, Sandbox) werden von Aufsichtsbehörden als "Stand der Technik" erwartet? | C | `pflichten`, `hochrisiko` | DSGVO Art. 32 (Sicherheit der Verarbeitung), Art. 25, EU AI Act Art. 15 (Genauigkeit, Robustheit, Cybersicherheit) | Art. 32 und Art. 15 nennen; **keine** Aussagen zu den Erwartungen von Aufsichtsbehörden ("steht nicht in meinen Quellen") |

### Kategorie 3: Betroffenenrechte und Rechtsgrundlagen

| ID | Frage | Scope | Tools | Rechtsanker (Hypothese) | Erwartetes Verhalten |
|---|---|---|---|---|---|
| Q-12 | **Automatisierte Entscheidungen (Art. 22):** Wie kann ich die "Erklärung automatisierter Entscheidungen" gewährleisten, wenn der n8n-Workflow eine komplexe, nicht nachvollziehbare KI (Black Box) für die Kreditwürdigkeitsprüfung oder Preisdynamik nutzt? Reicht ein Link zur Datenschutzerklärung? | A | `betroffenenrechte`, `hochrisiko` | DSGVO Art. 22 Abs. 3, Art. 13 Abs. 2 lit. f, Art. 15 Abs. 1 lit. h (Information über die Logik), Art. 12 (verständlich); EU AI Act Art. 86 (Recht auf Erläuterung), Anhang III Nr. 5 (Kreditwürdigkeit) | Information über involvierte Logik nennen, Link allein nicht pauschal bejahen, Art. 86 AI Act |
| Q-13 | **Besondere Kategorien (Art. 9):** Was passiert, wenn ein User in einem über n8n angebundenen KI-Formular versehentlich Gesundheitsdaten eingibt? Welche technischen Sperren oder Workflow-Logiken (z. B. Regex-Filter, KI-basierte PII-Erkennung vor der Weiterverarbeitung) sind erforderlich, um eine unzulässige Verarbeitung zu verhindern? | B | `grundsaetze`, `pflichten` | DSGVO Art. 9 Abs. 1 und 2, Art. 32, Art. 25 | Art. 9 Verbot und Ausnahmen, Maßnahmen allgemein, keine fest vorgeschriebenen Tools behaupten |
| Q-14 | **Profiling:** Stellt ein n8n-Workflow, der Kundendaten aus einem CRM holt, mit KI analysiert und einen "Churn-Risiko-Score" berechnet, ein "Profiling" im Sinne von Art. 4 Nr. 4 DSGVO dar? Wenn ja, welche zusätzlichen Pflichten (z. B. Datenschutz-Folgenabschätzung) entstehen? | A | `gesetze_suche`, `betroffenenrechte`, `pflichten` | DSGVO Art. 4 Nr. 4, Art. 21 (Widerspruch), Art. 22 (nur bei Rechtswirkung), Art. 35 Abs. 3 lit. a | Definition, Abgrenzung zu Art. 22 (Churn-Score hat allein keine Rechtswirkung), DSFA nur unter Voraussetzungen |
| Q-15 | **Recht auf Widerspruch:** Wie muss ein n8n-Workflow technisch gestaltet sein, um einem Widerspruch gegen Direktwerbung (Art. 21 DSGVO) sofort und automatisiert gerecht zu werden, insbesondere wenn die Daten bereits an externe Marketing-KI-Tools weitergeleitet wurden? | B | `betroffenenrechte` | DSGVO Art. 21 Abs. 2 bis 4, Art. 19 (Mitteilung an Empfänger) | Art. 21 Abs. 2 und 3 (Verarbeitung endet), Art. 19; technische Umsetzung nur allgemein |

### Kategorie 4: Architektur, Hosting und Lieferkette

| ID | Frage | Scope | Tools | Rechtsanker (Hypothese) | Erwartetes Verhalten |
|---|---|---|---|---|---|
| Q-16 | **AVV-Kaskade:** Wenn ich n8n Cloud nutze, ist n8n mein Auftragsverarbeiter? Wie verhält es sich mit den Sub-Sub-Processorn (z. B. AWS, die n8n nutzt, oder OpenAI, das der Workflow nutzt), wenn ich einen AVV mit meinem Kunden schließe? Wer trägt welche Verantwortung? | C | `pflichten` | DSGVO Art. 4 Nr. 7 und 8, Art. 28 Abs. 2, 3, 4 (Unterauftragsverarbeiter), Art. 26 | Rollen und Kette nach Art. 28 erklären, **keine Fakten über n8n oder AWS** (Anbieterfragen, Regel 4b), Gegenfrage |
| Q-17 | **Self-Hosted vs. Cloud:** Macht es einen datenschutzrechtlichen Unterschied, ob ich n8n selbst hoste (z. B. auf einem deutschen Server) oder die n8n Cloud verwende, insbesondere im Hinblick auf die Rechenschaftspflicht (Art. 5 Abs. 2 DSGVO) und die Anforderungen des EU AI Act an die KI-Lieferkette? | B | `grundsaetze`, `pflichten`, `hochrisiko` | DSGVO Art. 5 Abs. 2, Art. 24, Art. 28; EU AI Act Art. 25 (Verantwortlichkeit in der Lieferkette) | Unterschied über Rollen (Auftragsverarbeiter ja/nein) erklären, keine Anbieterfakten |
| Q-18 | **Drittlandtransfer:** Mein Kunde sitzt in Deutschland, ich als Freelancer in Österreich, und der n8n-Server läuft auf einem Host in den USA (oder nutzt US-KI-APIs). Welche spezifischen Garantien (z. B. SCCs, ergänzende Maßnahmen nach Schrems II) müssen im AVV genau spezifiziert sein? | B | `drittland`, `pflichten` | DSGVO Art. 44 bis 46, Art. 49, Art. 28 Abs. 3 lit. a (Übermittlung nur auf Weisung) | Art. 46 Garantien, Art. 28 Abs. 3 lit. a; "Schrems II" und ergänzende Maßnahmen **nicht** aus Modellwissen, "steht nicht in meinen Quellen" |
| Q-19 | **Fine-Tuning mit Kundendaten:** Wenn mein Kunde möchte, dass die KI im n8n-Workflow mit seinen spezifischen Kundendaten "feinabgestimmt" (Fine-Tuning) wird, wer ist dann für die Rechtmäßigkeit der Trainingsdaten verantwortlich, und welche Transparenzpflichten gegenüber Urhebern (AI Act) greifen hier? | B | `grundsaetze`, `gesetze_suche` | DSGVO Art. 5 Abs. 1 lit. b (Zweckbindung), Art. 6, Art. 24; EU AI Act Art. 53 Abs. 1 lit. c und d (Urheberrecht, Zusammenfassung der Trainingsdaten, gilt für Anbieter von GPAI-Modellen) | Zweckbindung und Rechtsgrundlage, Rolle klären, Art. 53 gilt für Modellanbieter (nicht pauschal für den Nutzer) |
| Q-20 | **Auditierbarkeit:** Wie kann ich einem Datenschutzbeauftragten oder einer Marktüberwachungsbehörde (AI Act) lückenlos nachweisen, welche Version eines n8n-Workflows (Workflow-JSON) zu einem bestimmten Zeitpunkt welche Daten in welcher Reihenfolge verarbeitet hat? Gibt es n8n-spezifische Best Practices für dieses Audit-Logging? | C | `grundsaetze`, `pflichten`, `hochrisiko` | DSGVO Art. 5 Abs. 2 (Rechenschaft), Art. 24, Art. 30; EU AI Act Art. 12 (Aufzeichnung), Art. 19, Art. 26 Abs. 6 | Pflichten zu Rechenschaft und Protokollen nennen; **keine** n8n-Best-Practices erfinden |

### Prüfkriterien aus Qwen (Red Flags)

Bei der Auswertung auf diese Fehler achten (bewertet wird zusätzlich nach unseren bisherigen Maßstäben: Tool-Wahl, Fundstellen aus den Treffern, keine Fremdaussagen):
1. **Generische Floskeln:** Nur "Art. 5 DSGVO" oder "AVV schließen", ohne auf den Fall einzugehen.
2. **Halluzinierte Artikel:** erfundene oder verwechselte Artikelnummern (z. B. Art. 123 AI Act).
3. **Fehlende Differenzierung:** Self-Hosted gleich Cloud, Hochrisiko gleich begrenztes Risiko.
4. **Technische Unmöglichkeit:** Vorschläge für n8n-Funktionen, die es nicht gibt. Bei unserem Bot gilt: Er soll n8n-Details gar nicht behaupten, sondern die Lücke benennen.
5. **Verantwortungs-Diffusion:** Er benennt nicht klar, wer in der Kette (Kunde, ich, n8n Cloud, OpenAI) wofür verantwortlich ist.

Hinweis zu Qwens "Pro-Tipp" (Follow-up mit der Aufforderung, nur n8n-Features zu nennen): Das würde unseren Bot zum Erfinden zwingen (Regel 2b). Diesen Test nicht als Erfolg zählen, sondern prüfen, ob der Bot ablehnt.

## B. Fragen aus Lauf 9 (12, Erwartungen geprüft)

Stand der Antworten: letzte Antwort je Frage nach den Prompt-Änderungen. Siehe `Testläufe.md` (Lauf 9, wird beim Session-Ende eingetragen).

| ID | Frage | Tools | Erwartung (aus Datenbank belegt) | Letztes Ergebnis |
|---|---|---|---|---|
| L9-01 | Welche geeigneten Garantien gibt es für eine Datenübermittlung in ein Land ohne Angemessenheitsbeschluss? | `drittland` | DSGVO Art. 46 Abs. 2: u. a. verbindliche interne Datenschutzvorschriften (Art. 47), Standarddatenschutzklauseln | OK |
| L9-02 | Wann gilt ein KI-System aus Anhang III trotzdem nicht als Hochrisiko? | `hochrisiko` | EU AI Act Art. 6 Abs. 3 (kein erhebliches Risiko, eng gefasste Verfahrensaufgabe), Gegenausnahme bei Profiling | Teilweise (Profiling fehlt) |
| L9-03 | Wie lange muss ich als Betreiber eines Hochrisiko-Systems Protokolle aufbewahren? | `hochrisiko` | EU AI Act Art. 26 Abs. 6: mindestens sechs Monate, sofern nichts anderes bestimmt | OK |
| L9-04 | Welche Bußgeldstufen gibt es in der DSGVO? | `sanktionen_dsgvo` | DSGVO Art. 83 Abs. 4 (10 Mio. EUR / 2 %) und Abs. 5 (20 Mio. EUR / 4 %) | OK |
| L9-05 | Welche Geldbuße droht bei verbotenen KI-Praktiken? | `sanktionen_ai_act` | EU AI Act Art. 99 Abs. 3: 35 Mio. EUR oder 7 % | OK |
| L9-06 | Was sagt das BDSG zur Videoüberwachung am Arbeitsplatz? | keines | Absagesatz, keine Suche | OK |
| L9-07 | Ich baue einen KI-Assistenten für eine Zahnarztpraxis. Er liest Terminanfragen per E-Mail, dabei kommen Patientendaten vor. Was muss ich beachten? | `grundsaetze`, `pflichten` | Art. 6, 9, 28, 32 (DSGVO), Gegenfrage | Teilweise (AVV fehlt) |
| L9-08 | Mein n8n läuft auf einem Server in Deutschland und schickt Kundentexte an OpenAI. Was ist rechtlich zu regeln? | `pflichten`, `drittland` | AVV (Art. 28), Drittland (Art. 44 bis 46) | OK |
| L9-09 | Ein Kunde will, dass mein Bot Bewerbungen vorsortiert. Was gilt für mich? | `hochrisiko`, `pflichten` | Anhang III Nr. 4, Rolle klären, Art. 22 DSGVO, kein Art. 27 | Teilweise (Rolle fehlt) |
| L9-10 | Ein Mitarbeiter hat versehentlich eine Kundenliste an die falsche Adresse geschickt. Was muss ich jetzt tun? | `pflichten` | Art. 33 (72 Stunden), Art. 34 | OK |
| L9-11 | Ich möchte Kundenmails mit einer KI zusammenfassen lassen. Brauche ich dafür eine Einwilligung? | `grundsaetze` | Art. 6 (Rechtsgrundlagen, Einwilligung nur eine davon), Art. 13 | OK |
| L9-12 | Ich möchte einen VPN für meinen VPS nutzen. Ich habe die Wahl zwischen Tailscale VPN und NetBird. Welcher VPN von den beiden ist mit EU-Recht vereinbar? | `pflichten`, `drittland` | Kriterien (Art. 28, 44 bis 46, 32), keine Bewertung eines Anbieters, Gegenfrage | Teilweise (ohne Suche, keine Fundstellen) |

## C. Weitere Fragen (zu ergänzen)

Hier sammeln wir weitere Fragen, damit alle 13 Labels abgedeckt sind. Noch ohne eigene Fragen sind: `grundlagen` (Art. 1 bis 4), `transparenz` (AI Act Art. 50), `gpai` (AI Act Art. 51 bis 56), `sonderfaelle` (DSGVO Art. 85 bis 99), `anhaenge`. Außerdem fehlen: Folgefragen mit Gedächtnis, englische und französische Fragen, Grenzfälle (BDSG, Urteile, Rechtsberatung im Einzelfall), Prompt-Injection, zu breite Fragen, und **echte Nutzerfragen**.

Seit Lauf 10 (2026-10-24) gilt: Fragen so formulieren, wie Nutzer sie stellen, Erwartung vorab aus den Karten in Supabase ableiten (nicht aus dem Bot und nicht aus der Technik).

| ID | Frage | Erwartung (aus Karten) | Ergebnis Lauf 10 |
|---|---|---|---|
| C-01 | Wir wollen eine KI einsetzen, die Bewerbungen vorsortiert. Ab wann müssen wir dafür die Hochrisiko-Regeln einhalten? | Anhang III Nr. 4 lit. a, Geltung ab 2. Dezember 2027 (Art. 113 lit. c i), Rolle klären | F (kein Datum, "sobald in Betrieb") |
| C-02 | Mein Kunde will eine App, die aus normalen Fotos Nacktbilder von Personen macht. Ist das erlaubt? | Art. 5 Abs. 1 lit. ba verboten, gilt ab 2. Dezember 2026 (Art. 113 lit. a) | T (Verbot ja, ohne `ba` und Datum) |
| C-03 | Mein Chatbot beantwortet Kundenmails automatisch. Muss ich den Leuten sagen, dass das eine KI ist? | Art. 50 Abs. 1, Anbieter, Ausnahme bei Offensichtlichkeit, Rolle klären | T (Rolle fehlt) |
| C-04 | Ich nutze ChatGPT in der Firma für Textentwürfe. Muss ich meine Leute schulen? | Art. 4: Betreiber ergreifen Maßnahmen zur KI-Kompetenz, kein bestimmtes Niveau, unabhängig vom Risiko | T (an Hochrisiko gekoppelt) |
| C-05 | Wir wollen per Webcam messen, wie konzentriert unsere Homeoffice-Mitarbeiter sind. Geht das? | Art. 5 Abs. 1 lit. f (Emotionen am Arbeitsplatz), offen lassen, ob Konzentration eine Emotion ist | F (AI-Act-Verbot nicht geprüft) |
| C-06 | Wir wollen Bewerbungen von einer KI vorsortieren lassen. Ist das erlaubt und was müssen wir beachten? | Hochrisiko nach Anhang III Nr. 4, ab 2. Dezember 2027 (Art. 113), Rolle klären, Pflichten der Betreiber (Art. 26), DSGVO Art. 22 | OK mit Schwächen (Lauf 14: Art. 6 falsch zugeordnet, Art. 26 und Art. 22 fehlen) |
| C-07 | Für meinen deutschen Kunden nutze ich Claude Haiku als LLM, mein Server selbst wird in der EU gehostet. Was brauche ich dahingehend, um den Workflow rechtssicher zu machen? | AVV Art. 28 mit Unterauftragsverarbeitung (Abs. 2, 4), Drittland Art. 44 bis 46, Art. 6 und 13, ggf. AI Act, keine Anbieterfakten | T (Lauf 14: allgemein, Unterauftragsverarbeitung und EU-Server-Hinweis fehlen) |
| C-08 | Ein Mitarbeiter hat versehentlich eine Kundenliste an die falsche Adresse geschickt. Was muss ich jetzt tun? | Art. 33 (72 Stunden, Ausnahme bei fehlendem Risiko, Dokumentation Abs. 5), Art. 34 bei hohem Risiko | T leicht (Lauf 14: Ausnahme und Dokumentationspflicht fehlen) |
