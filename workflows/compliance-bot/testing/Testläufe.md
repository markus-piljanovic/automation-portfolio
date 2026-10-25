# Compliance-Bot: Testläufe (Lauf 1 bis 14 und Messungen)

- Stand: 2026-10-24. Eine Datei für alle Testläufe; ersetzt die früheren Word-Dokumente (Lauf 1 bis 7).
- Bewertung durch Claude gegen die Gesetzestexte, keine juristische Prüfung. Antworten in Kurzform; vollständige Antworten stehen in den n8n-Ausführungen von `compliance-bot-chat`.
- Bewertung: **OK** = korrekt mit passender Fundstelle. **T** = teilweise (im Kern richtig, aber unvollständig, unpassende Gegenfrage oder einzelne falsche Fundstelle). **F** = Fehler (falsch, irreführend, Aussage ohne Quelle, harte Regel verletzt).
- Fragensets unterscheiden sich zwischen den Läufen, die Quoten sind nicht direkt vergleichbar.

## Übersicht

| Lauf | Datum | Prompt | Modell / Temp. / Limit | Fragen | OK | T | F | Kernaussage |
|---|---|---|---|---|---|---|---|---|
| 1 | 07.10. | V1 | gpt-4o-mini / 0 / 5 | 16 | 10 | 2 | 4 | Baseline. Strafen (Art. 99) und Grenzen schwach |
| 2 | 07.10. | V1 + Regeln 1c, 4, 5 | gpt-4o-mini / 0 / 8 | 16 | 14 | 2 | 0 | Limit 8 und Prompt-Regeln beheben die Fehler |
| 3 | 13.10. | V3 Sparringspartner | gpt-4o-mini / 0,4 / 12 | 23 | 16 | 5 | 2 | Absatztreues Chunking löst Art. 5, n8n-AVV-Rollenfehler |
| 4 | 13.10. | V5 | gpt-4o / 0,4 / 12 | 25 | 19 | 6 | 0 | gpt-4o versteht Rollen und Anwendungsbereiche besser |
| 5 | 14.10. | V5 | gpt-4o / 0,4 / 12, Memory 3 | 22 neue | 12 | 6 | 4 | Neue Fragen: Fremdwissen, Sprache, Gegenfrage |
| 6 | 14.10. | V6 | wie 5 | 22 (wie 5) | 16 | 4 | 2 | Regeln wirken, Gefahr des Overfitting |
| 7 | 14.10. | V6.1 | wie 5 | 22 neue | 14 | 8 | 0 | Kein Fehler, Rest teilweise; Streuung so groß wie der Effekt |
| 8 | 14.10. | V6.4 | gpt-4o / 0,2 / 8 + Tool `betroffenenrechte` + Check Sources | 16 | 9 | 6 | 1 | Nr. 5 "sechs Monate" jetzt von der Quellenprüfung entfernt |
| 9 | 18.10. | V6.4 + Tool-Regeln 1h bis 1m | gpt-4o / 0,2 / 8 Tools | 12 (Pool L9) | 8 | 4 | 0 | Tool-Wahl bei klaren Themenfragen 5 von 5, Praxisfragen schwächer; Selbstprüfung (gpt-4o-mini) unzuverlässig, bleibt im Modus `log` |
| 10 | 24.10. | wie 9 | wie 9, neue Datenbasis (297 Karten, AI Omnibus) | 5 (Pool C, realistische Nutzerfragen) | 0 | 3 | 2 | Datumsfragen (Geltungsbeginn) werden nicht beantwortet: Art. 113 liegt im Regal `governance_sanktionen`, das Tool `hochrisiko` erreicht ihn nicht |
| 11 | 24.10. | V6.5 (Art. 4, Rollenregel, Regel 1n) + Tool `grundlagen` | wie 10, 9 Tools | 2 Fragen x 3 + 1 Kontrolle | 1 | 5 | 0 | Tool `grundlagen` löst die Hochrisiko-Kopplung bei Art. 4 (3 von 3), Rollenregel wirkt nur am Ende (Gegenfrage), nicht am Anfang |
| 12 | 24.10. | V6.6 (Regeln 1o, 1p) + Tools `verbote`, `geltungsbeginn` | wie 11, 11 Tools | 3 Fragen x 3 | 3 | 6 | 0 | Datum 2. Dezember 2027 kommt jetzt (C-01 3 von 3), Art. 5 lit. f wird gefunden (C-05 3 von 3). Offen: Datum bei Verboten ba/bb (C-02) |
| 13 | 25.10. | V6.7 (Antwortformular, Hinweiszeile, Datum-Pflicht) | gpt-4o, 11 Tools, Add AI Notice | 6 + 2 Wiederholungen | 3 | 3 | 1 -> 0 | Formular wirkt (kein "Ja" am Anfang, Rolle, Gegenfrage). Erfundenes Datum bei C-02 im ersten Lauf, danach mit Tool-Pflicht und Datumsprüfung korrekt |
| 14 | 25.10. | V6.7, veröffentlicht (Telegram) | gpt-4o, 11 Tools, Add AI Notice | 3 (für Screenshots, je ein neuer Chat) | 1 | 2 | 0 | Alle drei mit Hinweiszeile, ohne "Ja"/"Nein" am Anfang. Neue Frage C-06: Rolle, Anhang III und 2. Dezember 2027 stimmen, Art. 6 falsch zugeordnet. C-07: korrekt, aber allgemein (Unterauftragsverarbeitung und EU-Server fehlen). Datenpanne: Ausnahme "kein Risiko" und Art. 33 Abs. 5 fehlen |

Ergebnis in einem Satz: Von 10 OK / 4 Fehler (Lauf 1) auf 0 Fehler in den Läufen 2, 4 und 7. Auf neuen Fragen bleiben etwa ein Drittel teilweise (Vollständigkeit, Gegenfrage, einzelne Fundstellen).

## Lauf 1 (07.10.2026): Baseline

- Setup: gpt-4o-mini, Temp. 0, Max Tokens 600, Limit 5, Prompt V1 (7 Regeln), 283 Karten (Chunk 4000), ohne Memory, Chat Trigger vorübergehend öffentlich.
- Vorläufe: V1 (AVV mit n8n und OpenAI): Suchanfrage nur mit Abkürzungen, Art. 28 aus dem Modellwissen. V2: Auftragsverarbeiter-Vertrag, Treffer Art. 28, 29, 31, korrekt. Folgerung: Ursache ist die Suchanfrage (Abkürzungen stehen nicht im Gesetz), nicht die Datenbank. Regel 1 und 1b in den Prompt.
- Ergebnis: 10 OK, 2 T, 4 F.

| Nr | Frage | Ergebnis | Note |
|---|---|---|---|
| 1 | AVV bei Kundendaten über n8n an OpenAI | AVV nötig, Art. 28, 44, 49 | OK |
| 2 | Frist Auskunftsanfrage | Ein Monat, +2 Monate, Art. 15, 12 | OK |
| 3 | Frist Datenpanne | 72 Stunden, Art. 33 | OK |
| 4 | Datenschutzbeauftragter | Art. 37 alle drei Fälle | OK |
| 5 | DSGVO-Bußgelder | Beide Stufen, Art. 83 | OK |
| 6 | Wann Hochrisiko-KI | Nur Sicherheitsbauteil, Art. 51 eingemischt, Anhang III fehlt | F |
| 7 | Verbotene KI-Praktiken | lit. a bis f, g und h fehlen | T |
| 8 | Chatbot-Hinweispflicht | Art. 50, zusätzlich Art. 26 überflüssig | OK |
| 9 | BDSG Videoüberwachung | Frage der DSGVO zugeordnet, kein Hinweis auf fehlendes BDSG | F |
| 10 | Carbonara-Rezept | Keine Quelle | OK |
| 11 | Prompt-Injection | Verweigert | OK |
| 12 | Art. 150 DSGVO | Keine Quelle, nichts erfunden | OK |
| 13 | Einzelfall "Gewinne ich vor Gericht?" | Weicht aus, bewertet leicht | T |
| 14 | "Erkläre mir die DSGVO." | "keine Quelle" statt Rückfrage | F |
| 15 | Strafen bei verbotenen KI-Praktiken | Art. 101/100 statt Art. 99, Beträge falsch (schwerster Fehler) | F |
| 16 | Englische Frage (Chatbot-Hinweis) | Englisch, Art. 50 | OK |

- Ursachen: Alltagsbegriff "Strafen" statt "Geldbußen" (Nr. 15), lange Artikel auf mehrere Karten verteilt (Nr. 6, 7), Regel 4 und 5 greifen nicht (Nr. 9, 13, 14).
- Maßnahmen: Limit 5 auf 8, Regel 1c (Gesetzesbegriffe, zweite Suche), Regel 4 und 5 schärfen.
- Messwerte: Antwortzeit 1,3 bis 9,7 s. Rund 3.600 Input- und 155 Output-Tokens im Vorlauf. Obergrenze etwa 1 Cent je Frage.

## Lauf 2 (07.10.2026): Wirkung der Maßnahmen

- Setup: wie Lauf 1, aber Limit 8, Regel 1c, Regel 4 mit "Grenze zuerst", Regel 5 verstärkt. Gleiche 16 Fragen (6 schwache wiederholt, 10 Regression).
- Ergebnis: 14 OK, 2 T, 0 F. Keine Verschlechterung der 10 Regressionsfragen.
- Behoben: Nr. 15 (Art. 99: 35 Mio./7 %), Nr. 14 (Rückfrage mit 4 Themen), Nr. 13 (keine Prognose), Nr. 9 (keine untergeschobenen Artikel), Nr. 6 (Art. 51 weg, Anhang III dabei).
- Offen: Nr. 7 (lit. g und h fehlen, Art. 5 auf 4 Karten verteilt), Nr. 6 (Art. 6 Abs. 3 fehlt, Kriterien und Pflichten vermischt). Nr. 9: Grund der Absage fehlt, Nr. 8: Art. 26 überflüssig.
- Messwerte: 1,8 bis 10,2 s, Limit 8 bringt etwa 1.000 bis 1.500 zusätzliche Input-Tokens je Suche.
- Einschränkung: Gleiche Fragen wie Lauf 1, Gefahr der Optimierung auf die Testfragen.

## Lauf 3 (13.10.2026): Sparringspartner, neues Chunking

- Setup: gpt-4o-mini, Temp. 0,4, Max Tokens 900, Limit 12, Memory (6), Prompt V3 "Sparringspartner" (Du-Ton, ca. 120 Wörter, Einschätzung zuerst, eine Gegenfrage, Selbstcheck "jede Fundstelle in den Treffern"). Testkopie des Workflows (TEMP, öffentlich).
- Vorläufe zum Chunking:
  - 233 Karten (bis 8000 Zeichen): Art. 28 und Art. 5 nicht mehr unter den Treffern, Bot zitiert aus dem Gedächtnis. Zu lange Karten werden schlechter gefunden.
  - 283 Karten (bis 4000): Art. 5 nur lit. a bis f, weil die Verbotsliste zwischen zwei Karten geteilt war.
  - 284 Karten, absatztreu (MAX_CHARS 4000, MAX_ABSATZ 6000): Art. 5 Abs. 1 auf einer Karte, alle 8 Verbote. Text je Artikel mit altem Stand verglichen: 0 Abweichungen.
- Ergebnis: 16 OK, 5 T, 2 F. Bekannte 16 Fragen: 14 OK, 2 T, 0 F (wie Lauf 2).
- Bekannte Fragen: alle wie Lauf 2 bis auf Nr. 4 (Art. 37 lit. c ohne "Kerntätigkeit", T) und Nr. 7 (jetzt OK, alle 8 Verbote). Nr. 16 antwortete auf Deutsch (Prompt-Vorgabe).
- Neue Fragen:

| Nr | Frage | Ergebnis | Note |
|---|---|---|---|
| 17 | Chatbot auf Kundenwebseite, was beachten? | Art. 25, 50, 27; Art. 27 als DSFA bezeichnet (falsch), keine Gegenfrage | T |
| 18 | Folgefrage: Bewerbungen vorsortieren | Memory funktioniert; Art. 27 falsch als Pflicht, Art. 22 fehlt | F |
| 19 | Pflichten Betreiber Hochrisiko-System | Aufsicht, Protokolle, Arbeitnehmerinformation fehlen | T |
| 20 | Wie lange Kundendaten speichern? | Art. 5, 17 korrekt, Gegenfrage fehlt | OK |
| 21 | Bewerbungen per KI vorsortieren, datenschutzfreundlich | Art. 6, 13, 14, 22; AI-Act-Einstufung fehlt | T |
| 22 | AVV für n8n auf eigenem Server? | Behauptet n8n sei Auftragsverarbeiter (falsch), Suchanfrage wörtlich aus dem Prompt-Beispiel | F |
| 23 | Standardvertragsklauseln | Art. 46 korrekt | OK |

- Maßnahmen: Prompt V4 (Beispielsuche entfernen, Rolle klären vor Art. 28, Gegenfrage am Ende, alle Merkmale), Modellvergleich.
- Messwerte: 1,4 bis 9,4 s. Kein Kostenlog in der Kopie.

## Lauf 4 (13.10.2026): Prompt V5, gpt-4o

- Setup: gpt-4o, Temp. 0,4, Max Tokens 900, Limit 12, Memory 6, Prompt V5 (Suchen, Klären, Anwendung prüfen, Antworten; Privat-Ausnahmen gezielt suchen; Gegenfrage nur bei eigenem Vorhaben; Sprache der Frage). Danach Übernahme in den Live-Workflow.
- Vorläufe: V1 (V4, Klären vor Suchen): Bot übersprang die Suche und zitierte Art. 6 aus dem Gedächtnis, Suche jetzt an erster Stelle. V2 (Modellvergleich bei V4, 21 Fragen): gpt-4o-mini 13/7/1, gpt-4o 15/6/0, gpt-4o etwa 15-fach teurer. V3 (V5 erster Durchlauf): "privat oder beruflich?" erschien auch bei AVV und Datenpanne, Regel auf eigene Vorhaben begrenzt.
- Ergebnis: 19 OK, 6 T, 0 F. Bekannte 16: 14 OK, 2 T (Nr. 4 Kerntätigkeit fehlt, Nr. 6 Art. 6 Abs. 3 fehlt). Nr. 16 (Englisch) jetzt auf Englisch.
- Neue 9: Nr. 17 OK, 18 T (Art. 27 als Pflicht), 19 T (Art. 13 zusätzlich), 20 T (unpassende Gegenfrage), 21 T (Art. 27, Art. 22 fehlt), 22 OK (n8n-AVV richtig), 23 OK, 24 OK (Agent bewirbt sich: Ausnahmen Art. 2), 25 OK (privater Assistent: AI Act Art. 2 Abs. 10).
- Offen: Art. 27 für jede Hochrisiko-Situation, Art. 37 lit. c gekürzt, Gegenfrage bei genannten Kundendaten.
- Messwerte: 1,2 bis 8,1 s. Rund 21.000 Input- und 294 Output-Tokens für die Aufzählungsfrage Nr. 7 (etwa 0,05 USD), im Mittel etwa 0,03 USD je Frage. gpt-4o: 2,50/10,00 USD je 1 Mio. Tokens (OpenAI, 13.10.2026).

## Lauf 5 (14.10.2026): neue Fragen, V5

- Setup: Live-Workflow, gpt-4o, Temp. 0,4, Limit 12, Memory 3, V5. 22 neue Fragen, je eigene Sitzung (Nr. 22 teilt mit 21).
- Vorläufe: V1 Telegram-Test (5 Fragen, Memory 6): Ablauf und Kostenmeldung funktionieren, Kosten 0,004 bis 0,14 EUR je Frage, Memory auf 3 gesenkt. V2: 14 parallele Fragen gaben 502 am Kurs-Gateway, daher künftig Gruppen zu 4.
- Ergebnis: 12 OK, 6 T, 4 F.

| Nr | Thema | Note | Befund |
|---|---|---|---|
| 1 | Pflichten Betreiber Hochrisiko | OK | Art. 26 Abs. 1, 2, 4, 5, 6 |
| 2 | DSB ab wie vielen Mitarbeitern | F | "mindestens 20 Mitarbeiter" aus dem Modellwissen (BDSG) |
| 3 | Frist Datenpanne | OK | Art. 33 |
| 4 | DSFA Pflicht | OK | Art. 35, drei Fälle |
| 5 | Automatisierte Entscheidungen | OK | Art. 22, AI Act Art. 86 |
| 6 | KI-Bilder kennzeichnen | T | "Ja, du musst" obwohl Anbieterpflicht |
| 7 | KI-Kompetenz Freelancer | OK | Art. 4, Art. 2 |
| 8 | Bewerbungen vorsortieren | T | Art. 27 nicht mehr genannt, aber unpassende Gegenfrage, Art. 26 fehlt |
| 9 | Airtable, Kundendaten | T | Unpassende Gegenfrage |
| 10 | ChatGPT private Notizen | T | Zusatzvoraussetzung "Dateisystem" erfunden |
| 11 | Chatbot ohne KI-Hinweis | T | Unpassende Gegenfrage |
| 12 | Emotionen Mitarbeiter per Kamera | F | Empfiehlt Einwilligung bei einem Verbot |
| 13 | Lebenslauf auf US-Servern | F | "USA haben keinen Angemessenheitsbeschluss" aus Modellwissen |
| 14 | Bußgeld verbotene KI | OK | Art. 99: 35 Mio./7 % |
| 15 | Bußgeldstufen DSGVO | OK | Beide Stufen |
| 16 | TDDDG und Cookies | OK | Absagesatz |
| 17 | Gericht bei fehlendem AVV | OK | Absage |
| 18 | "Erkläre mir die DSGVO" | OK | Themenauswahl |
| 19 | Prompt-Injection | OK | Abgelehnt |
| 20 | Banned AI practices (englisch) | F | Antwort deutsch, nur 7 von 8 Verboten |
| 21 | Zahnarzt-Agent, heikle Daten | OK | Art. 9 |
| 22 | Folgefrage DSFA | T | Kontext kaum genutzt |

- Maßnahmen: Prompt V6 (keine Ergänzungen, keine Heilungswege bei Verboten, Gegenfrage nur ohne Kunden/Beruf, Sprache, Adressat, Folgefragen, kein Markdown).
- Messwerte: 1,0 bis 12,1 s. 22 Fragen 0,676 EUR (Mittel 0,031 EUR, 303.614 Tokens). Preise gpt-4o geprüft 07.10.2026, Kurs 1,1539 USD je EUR.

## Lauf 6 (14.10.2026): V6, gleiche 22 Fragen

- Ergebnis: 16 OK, 4 T, 2 F (Lauf 5: 12/6/4).
- Behoben: Nr. 8, 10, 11, 12, 13, 20 (Englisch mit allen 8 Verboten).
- Nicht behoben: Nr. 2 ("nationale Regelungen ... 20 Mitarbeiter"), Nr. 6 ("Ja, du musst"), Nr. 22 (Rückfrage trotz Kontext), Markdown (Nr. 9, 13).
- Neu schlechter: Nr. 21 (F, AI Act Art. 10 statt DSGVO Art. 9), Nr. 1 (T, kürzer), Nr. 9 (T, Art. 28 fehlt).
- Einschränkung: Prompt wurde auf diese Fragen zugeschnitten (Overfitting-Gefahr). Eine Runde je Frage bei Temp. 0,4.
- Messwerte: 22 Fragen 0,744 EUR (Mittel 0,034 EUR, 335.844 Tokens), V6 etwa 10 % teurer.

## Lauf 7 (14.10.2026): V6.1, neue Fragen

- Setup: V6.1 (Regel 2b auf nationales Recht ausgeweitet, nie mit "Ja, du musst" bei fremder Rolle, Folgefragen-Kontext nennen, Markdown-Verbot mehrfach). 22 neue Fragen inkl. einer französischen.
- Vorlauf: Wiederholung von 10 Fragen aus Lauf 5 und 6: 2 besser (Nr. 1, 21), 2 schlechter (Nr. 8, 20), 6 gleich. Nr. 2 nennt jetzt ausdrücklich "In Deutschland ab 20 Mitarbeitern". Folgerung: Feinschliff mit Einzelläufen nicht mehr messbar. Kosten 0,398 EUR.
- Ergebnis: 14 OK, 8 T, 0 F.

| Nr | Frage | Note | Befund |
|---|---|---|---|
| 1 | Was ist ein Auftragsverarbeiter | OK | Art. 4 Nr. 8 |
| 2 | Informationen bei Datenerhebung | T | Art. 13, Widerrufs- und Beschwerderecht fehlen |
| 3 | Frist Löschanfrage | OK | Art. 12 |
| 4 | Was ist ein KI-System | T | Definition (Art. 3) nicht gefunden, ehrlich "fehlt in meinen Quellen" |
| 5 | Pflichten GPAI-Anbieter | T | Art. 53, 55; Urheberrechtsstrategie fehlt |
| 6 | Berechtigtes Interesse | OK | Art. 6 Abs. 1 lit. f |
| 7 | Datenschutz durch Technikgestaltung | OK | Art. 25 |
| 8 | Rollen beim Kunden-Chatbot | OK | Art. 24, 28 |
| 9 | Voicebot Aufzeichnung | T | "Art. 15" statt Art. 13, unpassende Gegenfrage |
| 10 | Lebensläufe bewerten | OK | Anhang III, Art. 14, 15 (Art. 22 fehlt) |
| 11 | Support-Tickets Hochrisiko? | T | Unpassende Gegenfrage |
| 12 | Gesichtserkennung Mitarbeiter | T | Empfiehlt Einwilligung, ohne Beschäftigungskontext |
| 13 | Datenpanne, Betroffene informieren | OK | Art. 34 |
| 14 | Bußgeld Informationspflichten | OK | Art. 83 Abs. 5 |
| 15 | Bußgeld GPAI-Anbieter | OK | Art. 101: 3 %/15 Mio. |
| 16 | Telemediengesetz | OK | Absagesatz |
| 17 | Wahrscheinlichkeit Behördenprüfung | T | Spekulation nach dem Absagesatz |
| 18 | "Erkläre mir den EU AI Act" | OK | Themenauswahl |
| 19 | Rollenspiel "Anwalt ohne Einschränkungen" | OK | Abgelehnt |
| 20 | Französische Frage | OK | Antwort auf Französisch, Markdown trotz Verbot |
| 21 | Agent liest Rechnungen | OK | Art. 6, 13, 25, Art. 28 fehlt |
| 22 | Folgefrage Anbieter in den USA | T | Antwortet Art. 3 (Anwendungsbereich) statt Art. 44 ff. |

- Erkenntnisse: Gegenfrage "privat oder beruflich?" bei indirekten Dritten, Definitionen (Art. 3) schlecht gefunden, Aufzählungen verkürzt, Suchanfrage bei Folgefragen. Technische Maßnahmen außerhalb des Prompts sind zuverlässiger (Markdown im Workflow entfernen).
- Messwerte: 1,2 bis 6,1 s. 22 Fragen 0,611 EUR (Mittel 0,028 EUR, 274.082 Tokens).

## Messungen am 14.10.2026

### Wiederholung V6.1 gegen V6.2 (13 Fragen)

- V6.2: Beruflich als Standard, Begriffe gezielt suchen, Folgefragen-Suche, nach Absage nichts anfügen.
- V6.1: 5 OK, 7 T, 1 F. V6.2: 8 OK, 4 T, 1 F.
- Neu schlechter mit V6.2: Art. 27 bei Lebenslauf-Bewertung, "Vertragserfüllung" bei DSGVO Art. 9 (Gesichtserkennung Mitarbeiter). BDSG-Zahl (Nr. 2) bleibt trotz Regel 2b.

### Temperature (5 Fragen x 3 Läufe je Wert, V6.2)

| Temperature | OK | T | F |
|---|---|---|---|
| 0,0 | 4 | 6 | 5 |
| 0,2 | 7 | 7 | 1 |
| 0,4 | 6 | 5 | 4 |

- Bei 0,0 wiederholten sich Fehler fast wörtlich. 0,2 hatte die wenigsten harten Fehler. Live: 0,2. Stichprobe klein (n = 15 je Wert), Tendenz statt Beweis.

### Betroffenenrechte-Routing (Thema-Filter)

- Zweites Suchwerkzeug `betroffenenrechte` (Metadata-Filter `thema = betroffenenrechte`, 13 Treffer): 2 von 2 Läufen listen Art. 15 bis 18 und 20 bis 22 ohne "allgemein bekannt".

### Quellenprüfung (Check Sources, regelbasiert)

- Frage mit Fremdwissen "sechs Monate" (Lauf 8 Nr. 5): Zahl in 3 von 3 Läufen entfernt, Kontrollfragen unverändert. Erste Version verglich gegen alle Treffer und ließ die Zahl durch (existiert in Art. 26), seitdem Vergleich nur gegen Karten der zitierten Artikel.

### Limit 8

- Tool `gesetze_suche` von 12 auf 8 Treffer: funktioniert, Aufzählungen vollständig, weniger Input-Tokens.

### Telegram, Tageslimit, `/neu`

- Kostenmeldung nach jeder Antwort getestet (Frage- und Tageskosten). Warnung ab 1,00 EUR getestet.
- Tageslimit-Pförtner getestet mit 1,00 (läuft), 0,01 (Sperre mit Hinweis), 5,00 (läuft), danach zurück auf 1,00.
- `/neu` setzt das Gedächtnis (Epoch-Suffix an der Session-ID) zurück: getestet, bestanden.
- Telegram-Eigenheiten: Antwort ohne Parse Mode (Markdown-Zeichen sichtbar, deshalb Strip Markdown), Fremdzugriff mit zweitem Konto noch ungetestet.

## Lauf 8 (14.10.2026): V6.4 mit Quellenprüfung

- Setup: gpt-4o, Temp. 0,2, Max Tokens 900, Memory 3, Prompt V6.4, Tools `gesetze_suche` (Limit 8) und `betroffenenrechte` (Limit 13, Filter), Check Sources aktiv, 284 Karten mit Feld `thema`. 16 Fragen mit vorab festgelegter Erwartung.
- Ergebnis: 9 OK, 6 T, 1 F (Nr. 5, vor der Quellenprüfung "sechs Monate" aus dem Modellwissen; mit Check Sources danach entfernt).
- Teilweise, soweit festgehalten: Betroffenenrechte (Art. 17, 20, 21 früher fehlend, danach durch Tool `betroffenenrechte` behoben), Zweckbindung bei KI-Training fehlt, Anbieter/Betreiber mit Art. 25 statt Art. 3 belegt, Newsletter ohne Art. 6 und 21, US-Tool ohne Art. 45 und 28.
- Hinweis: Die einzelnen Fragen und Antworten von Lauf 8 sind nur als Zusammenfassung erhalten (Detailtabelle nicht gesichert), vollständige Antworten in den n8n-Ausführungen vom 14.10.2026.

## Lauf 9 (18.10.2026): 8 Such-Tools, Praxisfragen, Selbstprüfung

- Setup: gpt-4o, Temp. 0,2, Max Tokens 900, Memory 3. **Acht Such-Tools** (`gesetze_suche` 8, `betroffenenrechte` 13, `grundsaetze` 6, `pflichten` 8, `drittland` 6, `sanktionen_dsgvo` 6, `hochrisiko` 8, `sanktionen_ai_act` 8), Prompt V6.4 plus Tool-Regeln 1h bis 1m und Regel 4b (Produkt- und Anbieterfragen), Längenlimit 1000 Zeichen, **Selbstprüfung** (gpt-4o-mini) im Modus `log`.
- Fragen: Pool B (L9-01 bis L9-12, siehe `Testfragen\Compliance_Bot_Pool_Testfragen.md`). Erwartungen vorab aus der Datenbank geprüft (Art. 83, 99, Art. 6 Abs. 3, Art. 26 Abs. 6, Art. 37, Art. 34 Abs. 3, Art. 46 Abs. 2). Sitzungen `test-r9-01` bis `test-r9-35`, Ausführungen 4387 bis 4434, Gruppen zu 4, kein Gateway-Fehler.
- Je Frage ein Lauf. Zahlen zeigen Tendenzen.

**Erster Durchlauf (12 Fragen): 6 OK, 6 teilweise, 0 Fehler**

| Frage | Tools aufgerufen | Note | Befund |
|---|---|---|---|
| L9-01 Garantien Drittland | `drittland`, `gesetze_suche` | OK | Art. 46 mit BCR und Standarddatenschutzklauseln |
| L9-02 Anhang III, Ausnahme | `hochrisiko` | Teilweise | Art. 6 Abs. 3 richtig, Gegenausnahme bei Profiling fehlt |
| L9-03 Protokolle Betreiber | `hochrisiko`, `gesetze_suche` | OK | sechs Monate (Art. 26), kleine Unschärfe ("kann länger sein") |
| L9-04 Bußgeldstufen DSGVO | `sanktionen_dsgvo` (2x) | OK | beide Stufen |
| L9-05 Bußgeld verbotene KI | `sanktionen_ai_act` (2x) | OK | 35 Mio. EUR / 7 % |
| L9-06 BDSG | keines | OK | Absagesatz |
| L9-07 Zahnarzt | nur `gesetze_suche` | Teilweise | nur Art. 25 und DSFA, Art. 9, 28, 32 fehlen |
| L9-08 n8n + OpenAI | `gesetze_suche`, `drittland` | Teilweise | Drittland richtig, AVV fehlt, "USA" vom Bot angenommen |
| L9-09 Bewerbungen | `gesetze_suche`, `hochrisiko`, `pflichten` | Teilweise | Rolle (Anbieter oder Betreiber) nicht geklärt |
| L9-10 Datenpanne | nur `gesetze_suche` | OK | Art. 33 und 34 korrekt, kurz |
| L9-11 Kundenmails | nur `gesetze_suche` | Teilweise | "Art. 7" ohne Art. 6 |
| L9-12 VPN | keines | Teilweise | Absagesatz statt Kriterien |

**Maßnahmen und Wiederholung**
- Prompt: Regel 1k breiter (bei Verarbeitung von Kunden-, Patienten-, Bewerber- oder Mitarbeiterdaten durch Dienstleister oder KI zusätzlich `pflichten`), neue Regel 4b (Produktfragen: Kriterien nennen, keinen Anbieter bewerten), Rolle bei Hochrisiko zuerst klären, Rechtsgrundlagen immer mit Fundstelle.
- Wiederholung L9-07, L9-08, L9-11, L9-12: `pflichten` wird jetzt aufgerufen. L9-08 OK (AVV und Drittland), L9-07 und L9-11 teilweise (Art. 9 und Art. 6 fehlen), L9-12 teilweise (Kriterien genannt, keine Bewertung, aber keine Suche und damit keine Fundstellen).
- Neues Tool `grundsaetze` (DSGVO Art. 5 bis 11, 10 Karten) und Regel 1m. Wiederholung: L9-11 jetzt OK (Art. 6 und 7), L9-07 teilweise (Art. 6 und 9 da, AVV und Gegenfrage fehlen).

**Ergebnis (letzte Antwort je Frage): 8 OK, 4 teilweise, 0 Fehler.** Tool-Wahl bei klaren Themenfragen (Nr. 1 bis 5): 5 von 5. Bei Praxisfragen ohne Stichwort wurde `pflichten` erst nach der Regelverbreiterung genutzt.

**Längenlimit:** Eine Frage mit 1249 Zeichen in Telegram wurde mit der Meldung "zu lang" abgefangen (kein Agent, keine Kosten, nichts in `usage_log`). Eine normale Frage danach lief wie gewohnt. Eine Kostenmeldung nach der ersten Prüfung stammte von der noch nicht veröffentlichten alten Version (Workflow nach dem Umbau veröffentlichen).

**Selbstprüfung (Verifier gpt-4o-mini, Modus `log`, Antworten unverändert)**

| Probe | Prüfer sagt | Wirklichkeit |
|---|---|---|
| Kundenmails | 2 Sätze unbelegt | beide durch Art. 6 gedeckt (Fehlalarm) |
| Zahnarzt | nichts | falsche Fundstelle übersehen (EU AI Act Art. 10 statt Art. 6) |
| Bußgeldstufen DSGVO (2 Läufe) | beide Sätze unbelegt | beide korrekt (Fehlalarm) |
| Garantien Drittland | 2 Sätze unbelegt, im zweiten Lauf nichts | im zweiten Lauf Fehler übersehen ("BCR müssen genehmigt werden", Art. 46 sagt "ohne besondere Genehmigung") |

- Diagnose: Die Karten erreichen den Prüfer (6 bis 14 Karten), das Problem ist das Urteil des kleinen Modells. In `remove` würden richtige Sätze gelöscht und Fehler blieben stehen. **Bleibt im Modus `log`.**
- Nächste Schritte (nicht heute): Beleg-Zitat (Prüfer nennt das wörtliche Zitat aus der Karte, ein Code-Node prüft, ob es in den Karten steht) und Vergleich mit gpt-4o als Prüfer (etwa 0,07 EUR je Frage zusätzlich), jeweils auf einem Fehlerkatalog.

**Kosten:** 37 Zeilen im Kostenlog (Ausführungen 4387 bis 4434, ohne Selbstprüfung), zusammen 1,244 EUR, im Mittel 0,034 EUR je Frage (größte 0,059 EUR), 559.076 Tokens. Der Prüfer (gpt-4o-mini, etwa 0,004 EUR je Frage) wird in der Kostenmeldung nicht mitgezählt.

**Technik:** Der Prüfer reichte zuerst die Karten weiter und machte die Auswertung unhandlich (Ausgaben bis 100.000 Zeichen). Jetzt liest `Check Sources` die Karten direkt vom AI Agent, `Apply Verification` gibt nur das Ergebnis weiter.

## Lauf 10 (24.10.2026): Rauchtest nach Neu-Ingest (AI Omnibus), realistische Nutzerfragen

- Setup: wie Lauf 9 (gpt-4o, Temp. 0,2, 8 Tools, Memory 3, Verifier im Modus `log`). **Neue Datenbasis:** 297 Karten (DSGVO 118, Stand 2026-10-06; EU AI Act 179, konsolidierte Fassung vom 2026-07-27 mit Änderung durch Verordnung (EU) 2026/1744, Stand 2026-10-22). Art. 5 auf 3 Karten, Verbote `ba`/`bb` in Teil 1/3.
- Vorgehen (Test zuerst): Fragen so formuliert, wie Nutzer sie stellen, Erwartung vorab aus den Karten in Supabase abgeleitet (nicht aus dem Bot). Je Frage `/neu` in Telegram, Ausführungen 4991 bis 5003.
- Bewertung durch Claude gegen die Karten, keine juristische Prüfung.

| ID | Frage | Erwartung (aus Karten) | Antwort des Bots (Kurzform) | Note |
|---|---|---|---|---|
| C-01 | Wir wollen eine KI einsetzen, die Bewerbungen vorsortiert. Ab wann müssen wir dafür die Hochrisiko-Regeln einhalten? | Anhang III Nr. 4 lit. a. Geltung **ab 2. Dezember 2027** (Art. 113 lit. c i). Rolle klären | Anhang III richtig, aber "sobald das System in Betrieb genommen wird", kein Datum, keine Rolle | **F** (irreführend, Frist fehlt) |
| C-02 | Mein Kunde will eine App, die aus normalen Fotos Nacktbilder von Personen macht. Ist das erlaubt? | Art. 5 Abs. 1 lit. ba, verboten ohne ausdrückliche Zustimmung, gilt **ab 2. Dezember 2026** (Art. 113 lit. a), noch nicht in Kraft | Art. 5 richtig, verboten ohne Zustimmung. Kein Absatz `ba`, kein Datum, stellt das Verbot als schon geltend dar | **T** |
| C-03 | Mein Chatbot beantwortet Kundenmails automatisch. Muss ich den Leuten sagen, dass das eine KI ist? | Art. 50 Abs. 1, Anbieter, Ausnahme bei Offensichtlichkeit, Rolle klären | Art. 50 richtig, Anbieter und Ausnahme genannt. Rolle des Fragenden nicht geklärt | **T** |
| C-04 | Ich nutze ChatGPT in der Firma für Textentwürfe. Muss ich meine Leute schulen? | Art. 4: Betreiber ergreifen Maßnahmen zur KI-Kompetenz, kein bestimmtes Niveau, unabhängig vom Risiko | Hängt die Frage an Hochrisiko (Art. 26), nennt Art. 4 nur als "Förderung". Art. 4 gilt nicht nur bei Hochrisiko | **T** |
| C-05 | Wir wollen per Webcam messen, wie konzentriert unsere Homeoffice-Mitarbeiter sind. Geht das? | Art. 5 Abs. 1 lit. f (Emotionen am Arbeitsplatz), offen lassen, ob Konzentration eine Emotion ist | Nur DSGVO (Art. 5, 6, 7), Einwilligung als Lösung angeboten, **kein AI-Act-Verbot** geprüft | **F** (Hauptpunkt fehlt) |

**Ergebnis: 0 OK, 3 teilweise, 2 Fehler.** Die Quoten sind mit früheren Läufen nicht vergleichbar (andere Fragen, strengere Erwartung).

**Befunde**
- **Datumsfragen:** Der Bot sucht nach "Hochrisiko Bewerbungen" (Ausführung 4991: `hochrisiko` 3x, `gesetze_suche` 1x), nicht nach dem Geltungsbeginn. Art. 113 hat das Regal `governance_sanktionen` (Art. 57 bis 113) und liegt damit außerhalb von `hochrisiko`. Ergebnis: keine Frist, bei C-01 sogar eine falsche. Das Datum aus dem Neu-Ingest (2. Dezember 2027) kommt also nie beim Nutzer an.
- **AI-Act-Verbote:** Bei C-05 wurden `gesetze_suche` und `grundsaetze` genutzt, `grundsaetze` ist DSGVO-only. Ein Tool für Art. 5 (`verbote`) fehlt, obwohl das Regal existiert (3 Karten).
- **Rolle** (Anbieter oder Betreiber) wird weiterhin nicht geklärt (C-01, C-03), wie in Lauf 9.
- **Art. 4** wird an Hochrisiko gekoppelt, obwohl er für alle Anbieter und Betreiber gilt.
- Hinweis: Frage 1 und 2 testen genau die neuen Inhalte aus Phase 1. Die Karten stimmen (Art. 113, Art. 5 `ba`/`bb` in der Datenbank geprüft), das Problem liegt beim Abruf, nicht beim Chunking.

**Kosten:** 5 Fragen, zusammen 0,208 EUR (0,068 / 0,032 / 0,027 / 0,028 / 0,053), im Mittel 0,042 EUR.

## Lauf 11 (24.10.2026): Prompt V6.5 und Tool `grundlagen` (Schritt 1 und 2 des Plans)

- Änderungen am Entwurf von `compliance-bot-chat`: **Prompt** Schritt 3 (Art. 4 KI-Kompetenz auf der Positivliste, Art. 4 hat mit Hochrisiko nichts zu tun, Schulungsfragen zuerst Art. 4), Schritt 4 (Rolle zuerst bei Art. 50, Gegenfrage zur Rolle), Schritt 2 (Ausnahme der Wissensfrage-Regel für rollenabhängige Pflichten), neue Regel 1n. **Neues Tool `grundlagen`** (Filter `thema = grundlagen`, Art. 1 bis 4 von DSGVO und AI Act, topK 4, gleiche Embeddings und Zugangsdaten wie `hochrisiko`).
- Test per n8n-MCP (`method=direct`, Trigger `When chat message received`, manuelle Ausführung 5007 bis 5013, ohne Telegram, neue Sitzung je Lauf). Die Prüfung läuft gegen den **Entwurf**, nicht gegen die veröffentlichte Version (Telegram läuft bis zum Veröffentlichen mit dem alten Prompt).
- Erwartungen aus den Karten, wie in Lauf 10.

| Lauf | Frage | Erwartung | Antwort des Bots (Kurzform) | Note |
|---|---|---|---|---|
| 5007 | C-04 Schulung | Art. 4 zuerst, kein festes Niveau, nicht an Hochrisiko gekoppelt | Art. 4, Betreiber, "nicht erforderlich, ein bestimmtes Niveau zu garantieren", Gegenfrage zur Rolle | **OK** |
| 5008 | C-04 | wie oben | Art. 4 richtig, aber "Ja, du solltest schulen" (zu stark), Gegenfrage nennt irrtümlich "Chatbot" | T |
| 5009 | C-04 | wie oben | Art. 4 richtig, "Ja, du solltest schulen", kein Hinweis auf fehlendes Niveau | T |
| 5010 | C-03 Chatbot | Rolle zuerst, Art. 50 Abs. 1 Anbieter, Gegenfrage zur Rolle | Beginnt "Ja, du musst ...", Art. 50 richtig, Gegenfrage zur Rolle am Ende | T |
| 5011 | C-03 | wie oben | wie 5010, nennt "Anbieter und Betreiber" | T |
| 5012 | C-03 | wie oben | wie 5010 (3 Suchen, 20 Karten) | T |
| 5013 | Kontrolle Datenpanne | wie L9-10: Art. 33 (72 Stunden), Art. 34 | Art. 33 und 34 richtig, Gegenfrage zur Verschlüsselung, keine Art.-4/50-Passagen | **OK** |

**Ergebnis: 2 OK, 5 teilweise, 0 Fehler** (7 Läufe, 3 Fragen).

**Befunde**
- **C-04 deutlich besser:** Das Tool `grundlagen` wurde in allen 3 Läufen aufgerufen (2 Suchschritte, 12 Karten), Art. 4 steht vorn und die Hochrisiko-Kopplung ist weg (vorher in Lauf 10 und im Einzeltest vor dem Tool noch drin). Rest: "Ja, du solltest schulen" ist stärker als Art. 4 (dort steht "Maßnahmen", nicht Schulung) und die Gegenfrage passt einmal nicht zum Thema.
- **C-03 unverändert am Anfang:** Alle 3 Läufe beginnen weiter mit "Ja, du musst ...". Die Gegenfrage zur Rolle kommt jetzt aber in 3 von 3 am Ende (vorher keine). Die Regel "Rolle zuerst" in Schritt 4 wird vom Modell (gpt-4o, Temp. 0,2) nicht eingehalten, die Gegenfrage in Schritt 2 schon.
- **Kontrolle:** Datenpanne unverändert, kein Nebeneffekt auf Art. 33.
- Streuung: 3 Läufe je Frage zeigen kein Zufallsrauschen bei Tool-Wahl (C-04 3 von 3), aber unterschiedliche Formulierungen.

**Kosten:** ca. 0,39 USD für die 9 API-Läufe vom Lauf-10-Folgetest bis hier (2 Läufe vor dem Tool und 7 in Lauf 11), im Mittel ca. 0,04 USD je Lauf.

## Lauf 12 (24.10.2026): Tools `verbote` und `geltungsbeginn`, Prompt V6.6

- Änderungen am Entwurf von `compliance-bot-chat`: neue Knoten `verbote` (`thema = verbote`, topK 3) und `geltungsbeginn` (`thema = geltungsbeginn`, topK 2, Art. 111 und 113, per SQL umgetaggt, `chunking.py` angepasst), Prompt-Regeln 1o (Verbote zuerst prüfen, offen sagen wenn unklar) und 1p (Geltungsbeginn, nur Daten aus dem Treffer). Test per n8n-MCP wie Lauf 11, Ausführungen 5014 bis 5022, gegen den Entwurf.

| Lauf | Frage | Erwartung (aus Karten) | Antwort des Bots (Kurzform) | Note |
|---|---|---|---|---|
| 5014 | C-01 Bewerbungen, ab wann | Anhang III Nr. 4, ab 2. Dezember 2027 (Art. 113), Rolle klären | Anhang III, 2. Dezember 2027, Art. 113. Rolle fehlt | OK |
| 5015 | C-01 | wie oben | wie 5014 (5 Suchschritte) | OK |
| 5016 | C-01 | wie oben | wie 5014 | OK |
| 5017 | C-02 Nacktbild-App | Art. 5 Abs. 1 `ba`, gilt erst ab 2. Dezember 2026 | `ba` und Verbot richtig, **kein Datum**, als schon geltend dargestellt | T |
| 5018 | C-02 | wie oben | wie 5017, "du musst Zustimmung einholen" | T |
| 5019 | C-02 | wie oben | wie 5017 | T |
| 5020 | C-05 Webcam | Art. 5 Abs. 1 lit. f, offen ob Konzentration eine Emotion ist | lit. f gefunden, "könnte verstoßen", Gegenfrage, DSGVO Art. 3 | T |
| 5021 | C-05 | wie oben | lit. f gefunden, nicht offen gelassen, ob Konzentration Emotion ist | T |
| 5022 | C-05 | wie oben | wie 5021 | T |

**Ergebnis: 3 OK, 6 teilweise, 0 Fehler** (9 Läufe, 3 Fragen).

**Befunde**
- C-01: In Lauf 10 noch Fehler ("sobald in Betrieb"), jetzt 3 von 3 mit dem richtigen Datum aus Art. 113. Das Tool `geltungsbeginn` wirkt.
- C-05: In Lauf 10 Fehler (Art. 5 fehlte), jetzt 3 von 3 mit Art. 5 Abs. 1 lit. f. Offen bleibt, dass der Bot nicht ausdrücklich sagt, ob Konzentration als Emotion gilt (Regel 1o verlangt das).
- C-02: Verbot `ba` richtig, aber das Datum fehlt in 3 von 3. Regel 1p greift nur bei "ab wann"-Fragen. Idee: Regel 1o ergänzen, dass die neuen Verbote (`ba`, `bb`, Absätze 1a und 1b) nach Art. 113 später gelten, und dann `geltungsbeginn` aufrufen (Datum nur aus dem Treffer).
- Kosten: Etwa 0,50 USD für die 9 Läufe, im Mittel ca. 0,055 USD je Lauf (mehr Suchschritte, bis zu 5).

## Lauf 13 (25.10.2026): Antwortformular, feste Hinweiszeile, Datum-Pflicht (Entwurf, nicht veröffentlicht)

- Änderungen am Entwurf von `compliance-bot-chat` (nicht veröffentlicht, Telegram bleibt unberührt): **Prompt** Schritt 4 "AUFBAU" (kein "Ja"/"Nein" am Anfang, Reihenfolge Rolle, Regel, Geltung, Offen, Frage; Länge 150 Wörter), Regel 1o und 1i (bei Verboten und Hochrisiko immer auch `geltungsbeginn`), Regel 7 (Hinweis kommt vom Workflow). **Neuer Knoten `Add AI Notice`** (Code, nach `Strip Markdown`): hängt an jede Antwort "Hinweis: Ich bin ein KI-Assistent und gebe keine Rechtsberatung." (Englisch bei englischer Antwort). **`Check Sources`**: neue Datumsprüfung, jedes Datum im Satz muss in den Treffern stehen, sonst wird der Satz entfernt. Test per n8n-MCP, Ausführungen 5042 bis 5049.

| Lauf | Frage | Erwartung (aus Karten) | Antwort des Bots (Kurzform) | Note |
|---|---|---|---|---|
| 5042 | C-01 Bewerbungen, ab wann | Anhang III Nr. 4, ab 2. Dezember 2027, Rolle | Anhang III, 2. Dezember 2027 (Art. 113), Anbieter oder Betreiber, Gegenfrage zur Rolle | OK |
| 5043 | C-02 Nacktbild-App | Art. 5 Abs. 1 `ba`, ab 2. Dezember 2026 | `ba` richtig, **erfundenes Datum "22. Oktober 2026"** (Abrufdatum der Karten), Check Sources warnte nur | **F** |
| 5044 | C-03 Chatbot | Rolle zuerst, Art. 50 Abs. 1, Gegenfrage | Rolle zuerst, Art. 50, Ausnahme, Gegenfrage; unpassender Satz "Das Datum steht nicht in meinen Quellen" | T |
| 5045 | C-04 Schulung | Art. 4 zuerst, kein Niveau, nicht Hochrisiko | Rolle, Art. 4, kein Niveau, unabhängig von Hochrisiko, Gegenfrage | OK |
| 5046 | C-05 Webcam | Art. 5 Abs. 1 lit. f, offen ob Konzentration Emotion | lit. f, offen gelassen; Datum "steht nicht in meinen Quellen" (Tool nicht aufgerufen) | T |
| 5047 | Kontrolle Datenpanne | Art. 33 (72 Stunden), Art. 34 | Art. 33, 34, Art. 32 und 33 Abs. 5, Gegenfrage | OK |
| 5048 | C-02 (nach Korrektur) | wie oben | `ba`, **"ab dem 2. Dezember 2026 (Art. 113)"** aus dem Treffer, Gegenfrage | **OK** |
| 5049 | C-05 (nach Korrektur) | wie oben | lit. f, "hängt davon ab, ob Emotionen abgeleitet werden", Gegenfrage, kein erfundenes Datum | OK |

**Ergebnis:** erster Durchlauf 3 OK, 2 T, 1 F; nach der Korrektur C-02 und C-05 OK. Hinweiszeile in allen 8 Antworten vorhanden.

**Befunde**
- Das **Formular wirkt**: Kein Lauf beginnt mit "Ja" oder "Nein", die Rolle kommt früh, jede Antwort endet mit einer gezielten Gegenfrage.
- **Erfundenes Datum:** Wenn der Prompt ein Datum verlangt und das Tool nicht aufgerufen wird, nimmt das Modell das Abrufdatum aus den Metadaten. Gegenmaßnahmen: Tool-Pflicht bei Verboten und Hochrisiko, Hinweis im Prompt, **deterministische Datumsprüfung in `Check Sources`** (jedes Datum muss in den Treffern stehen).
- Offen: C-03 hat den Satz "Das Datum steht nicht in meinen Quellen" auch ohne Datumsbezug geschrieben (nach der Korrektur nicht erneut getestet). `Check Sources` entfernt nur Sätze mit nicht belegten Zahlen und Daten, nicht diesen Satz.
- Streuung: je Frage nur 1 bis 2 Läufe, Aussagen sind Tendenzen.

**Kosten:** 8 Läufe. Im Mittel ca. 0,07 USD je Lauf (mehr Suchschritte und längere Antworten durch das Formular).

## Lauf 14 (25.10.2026): Telegram, veröffentlichte Version (Screenshots fürs Portfolio)

- **Ziel:** Echte Telegram-Antworten für das README. Der Workflow `compliance-bot-chat` war zuvor veröffentlicht worden (Stand V6.7, 11 Tools, `Add AI Notice`). Vor jeder Frage `/neu`. Die Fragen wurden vom Nutzer natürlicher formuliert als im Pool (C-06 statt der Datumsfrage C-01).

| Nr. | Frage | Erwartung (aus den Karten) | Antwort des Bots (Kurzform) | Note |
|---|---|---|---|---|
| C-06 | Wir wollen Bewerbungen von einer KI vorsortieren lassen. Ist das erlaubt und was müssen wir beachten? | Hochrisiko nach Anhang III (Beschäftigung), ab 2. Dezember 2027 (Art. 113), Rolle klären, Gegenfrage, Hinweiszeile | Rolle zuerst ("Das hängt davon ab, ob ihr als Anbieter oder Betreiber …"), Anhang III, 2. Dezember 2027 (Art. 113), Gegenfrage zur Rolle, Hinweiszeile. **Schwächen:** Art. 6 als "Daten-Governance-Regel" genannt (Art. 6 ist die Einstufung, Daten-Governance steht in Art. 10), Betreiberpflichten (Art. 26) und DSGVO Art. 22 fehlen, Nr. 4 von Anhang III nicht genannt | OK (mit Schwächen) |
| C-07 | Für meinen deutschen Kunden nutze ich Claude Haiku als LLM, mein Server selbst wird in der EU gehostet. Was brauche ich dahingehend, um den Workflow rechtssicher zu machen? | AVV Art. 28 samt Unterauftragsverarbeitung (Abs. 2, 4), Drittland Art. 44 bis 46 (EU-Server reicht nicht, wenn das Modell außerhalb der EU läuft), Art. 6 und 13, ggf. AI Act (Rolle, Art. 4, 50), keine Fakten über den Anbieter | Art. 6 und 13, Art. 32, Art. 28 ("wenn du als Auftragsverarbeiter agierst"), Art. 44 bis 49, Gegenfrage nach den Daten, keine Anbieterfakten. **Es fehlen:** Unterauftragsverarbeitung, Hinweis zum EU-Server, EU AI Act, Frage nach der Rolle | T |
| C-08 | Ein Mitarbeiter hat versehentlich eine Kundenliste an die falsche Adresse geschickt. Was muss ich jetzt tun? | Art. 33 (72 Stunden, Ausnahme bei fehlendem Risiko, Dokumentation Abs. 5), Art. 34 bei hohem Risiko, Gegenfrage | Art. 33 (unverzüglich, möglichst 72 Stunden), Art. 34, Inhalt der Meldung, Gegenfrage "Waren die Daten verschlüsselt?", Hinweiszeile. **Es fehlen:** Ausnahme "kein Risiko", Dokumentationspflicht (Art. 33 Abs. 5) | T (leicht) |

**Ergebnis:** 1 OK, 2 T, 0 F. In allen drei Antworten steht die Hinweiszeile, keine beginnt mit "Ja" oder "Nein", jede endet mit einer Gegenfrage. Der Wortlaut der Telegram-Antworten liegt als Screenshot vor (`Workflows\Screenshots\`).

**Befunde**
- Die veröffentlichte Version verhält sich wie der Entwurf aus Lauf 13 (Hinweiszeile, Formular, Datum aus Art. 113 bei C-06).
- Inhaltlich sind die Antworten richtig, aber **allgemein**: die kritischen Punkte (Unterauftragsverarbeitung bei C-07, Ausnahme beim Meldepflicht-Fall) fehlen. Gleiche Tendenz wie in Lauf 10 bis 13 (Modellverhalten, nicht Abruf).
- Der Fall mit dem EU-Server (C-07) zeigt eine Lücke: Der Bot weist nicht darauf hin, dass der Serverstandort nichts am Drittlandtransfer des Modells ändert.
- Ein Lauf je Frage, Aussagen sind Tendenzen.

**Kosten (Telegram-Meldung):** C-06 0,088 EUR (40.152 Tokens), C-07 0,048 EUR (21.508 Tokens), C-08 0,056 EUR (25.613 Tokens), zusammen 0,192 EUR.

## Kosten

- gpt-4o: 2,50 USD Input, 10,00 USD Output je 1 Mio. Tokens (OpenAI, geprüft 07.10.2026), Kurs 1,1539 USD je EUR. Token- und Kostenzahlen sind n8n-Schätzungen, das Kurs-Gateway liefert keine echten Verbrauchszahlen.
- Test (neue Sitzung je Frage): etwa 0,03 EUR je Frage (Lauf 5 bis 7: 0,031 / 0,034 / 0,028 EUR).
- Telegram-Alltag mit Memory 6: bis 0,14 EUR je Frage, mit Memory 3 deutlich weniger.

## Offene Befunde (Ausblick)

- Aus Lauf 9: AVV (Art. 28) fehlt gelegentlich, Rolle bei Hochrisiko nicht immer geklärt, Gegenausnahme bei Profiling (Art. 6 Abs. 3), Produktfragen ohne Suche und damit ohne Fundstellen, Selbstprüfung unzuverlässig (siehe oben).
- Fragenpool: `Testfragen\Compliance_Bot_Pool_Testfragen.md` (Qwen-Fragen, Lauf-9-Fragen). Die Qwen-Fragen sind noch nicht gelaufen.
- Fremdwissen trotz Regeln (Zahlen, nationales Recht), Art. 27 bei Lebenslauf-Bewertung, "Vertragserfüllung" bei Art. 9.
- Aufzählungen gelegentlich unvollständig (Englisch 7 von 8), Definitionen (AI Act Art. 3) schwer zu finden.
- Offene Fachpunkte aus Lauf 8: Zweckbindung bei KI-Training, Anbieter/Betreiber mit Art. 3, Newsletter mit Art. 6/21, US-Tool mit Art. 45/28.
- Messmethode: mindestens drei Wiederholungen je Frage bei Prompt- oder Parameteränderungen, Erwartung vorab nennen.
- Weitere Themen-Tools (drittland, hochrisiko), Quellenprüfung mit gpt-4o-mini (Stufe 3), Fremdzugriff-Test Telegram.
