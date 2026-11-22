# n8n Workflows

Ich befinde mich derzeit in einer zertifizierten Weiterbildung zum Digitalisierungsmanager und vertiefe mein Wissen zu KI-gestützten Workflows.

Jeder Workflow hier ist gebaut in n8n (selbst gehostet auf einem VPS), hat einen eigenen Ordner mit Beschreibung, Screenshots und den exportierten JSON-Dateien. 
Alle Projekte sind gegen vorab schriftlich festgehaltene Erwartungen getestet, bekannte Grenzen offen benannt.
Die Workflows und ihre Sticky Notes sind auf Englisch, alles andere auf Deutsch.

## Workflows

| Workflow | Welches Problem er löst | Ordner |
|---|---|---|
| **Compliance Guide** | Vor einem KI-Projekt muss ein Berater wissen, welche Artikel aus DSGVO und EU AI Act gelten. Ein Formular mit festen Regeln liefert bei gleichen Antworten immer die gleiche Checkliste mit Belegen, und das lässt sich testen. | [compliance-guide](workflows/automation-compliance-guide/) |
| **Lead Qualification** | Verkaufsanfragen kommen per Mail, Spam und heiße Leads liegen im selben Posteingang. Spam wird vor jedem teuren KI-Schritt gestoppt, ein KI-Agent bewertet jeden echten Lead, und du wirst ohne personenbezogene Daten auf Telegram benachrichtigt. Eine Antwort an einen heißen Lead geht erst nach deinem Klick raus. | [lead-qualification](workflows/lead-qualification/) |
| **Mini-IDP** | Ein fiktives Logistikunternehmen tippt täglich etwa 180 Lieferscheine von Hand ein. Kostenlose OCR liest zuerst, eine KI und ein lokales Modell lesen und prüfen nur die unklaren, feste Regeln entscheiden, und ein Mensch in Slack klärt jeden Zweifel. Jeder Lauf protokolliert seine Kosten. | [mini-idp-schmidt](workflows/mini-idp-schmidt/) |

### Compliance Guide

![Compliance Guide](workflows/automation-compliance-guide/images/how-it-works.png)

- **Problem:** Ein Chat über Gesetze liefert bei jedem Lauf etwas anderes und lässt sich kaum testen. Ein Berater braucht bei gleichen Antworten ein gleiches, nachprüfbares Ergebnis.
- Etwa 20 Klick-Fragen, feste Regeln im Code, genaue Abfrage der Gesetzesartikel (DSGVO, EU AI Act) und eine Checkliste mit Belegen. Die KI schreibt nur drei Sätze pro Thema aus den geladenen Texten, eine Code-Prüfung ersetzt jede Zusammenfassung mit einem nicht erlaubten Artikel.
- Eigene Community Node für Healthchecks-Pings (TypeScript), Error-Workflow mit Telegram-Alarm, Tageslimit von 0,20 €.
- 27 Testfälle, Erwartungen vorab festgelegt, 27 von 27 bestanden, alle 41 Artikel mindestens einmal abgerufen.
- [Demo ohne Einrichtung](https://markus-piljanovic.github.io/automation-portfolio/workflows/automation-compliance-guide/page/compliance-guide-demo.html) und [Testplan](https://markus-piljanovic.github.io/automation-portfolio/workflows/automation-compliance-guide/testing/test-plan.html) als eine interaktive Seite.

[Zur ausführlichen Beschreibung](workflows/automation-compliance-guide/README.md)

### Lead Qualification

![Lead Qualification](workflows/lead-qualification/images/how-it-works.png)

- **Problem:** Verkaufsanfragen, Spam und heiße Leads teilen sich einen Posteingang. Jede Mail zu lesen und zu bewerten kostet Zeit, und eine KI für jede Spam-Mail kostet Geld.
- Spam wird zuerst durch Regeln und ein kleines Modell (etwa 600 Tokens) gestoppt, danach bewertet ein KI-Agent jeden echten Lead von 0 bis 100, mit Impressum-Prüfung und Größenklassen.
- Telegram-Meldungen enthalten nur Score, Größenklasse, Grund und einen Link, keine personenbezogenen Daten. Eine Antwort an einen heißen Lead geht erst nach einem Klick auf „Senden“ raus.
- Eigene Healthchecks-Node auf einem Nebenzweig, Error-Workflow mit Telegram-Alarm, insgesamt vier Workflows.
- 23 Testfälle, 22 bestanden. Der offene Fall, ein Doppelklick auf einen schon benutzten Button, lässt sich von Hand nicht auslösen.
- Sieben [Schritt-Seiten](https://markus-piljanovic.github.io/automation-portfolio/workflows/lead-qualification/page/01-intake.html) zeigen jede Stufe mit Screenshots, der [Testplan](https://markus-piljanovic.github.io/automation-portfolio/workflows/lead-qualification/testing/test-plan.html) ist eine Seite.

[Zur ausführlichen Beschreibung](workflows/lead-qualification/README.md)

### Mini-IDP

![Mini-IDP](workflows/mini-idp-schmidt/images/how-it-works.png)

- **Problem:** Ein Logistikunternehmen scannt, gleicht ab und tippt täglich etwa 180 Lieferscheine. Jeden Schein an eine KI zu schicken würde Geld kosten und bräuchte trotzdem Kontrollen.
- OCR liest zuerst und kostet nichts. Nur unklare Bilder gehen an Haiku, ein lokales Modell (gemma4) prüft die Werte gegen. Feste Regeln im Code entscheiden, wohin ein Schein geht, nicht das Modell.
- Ein Mensch antwortet in Slack per Klick, Korrekturformular oder Ablehnung, danach laufen die Regeln erneut. Dubletten werden vor und nach diesem Schritt erkannt.
- Jeder Lauf schreibt seine Kosten in eine Tabelle: 0 $ für OCR, etwa 0,004 $ für einen von der KI gelesenen Schein. Der Business Case (Break-even nach 3,4 bis 4,4 Monaten) beruht auf Annahmen aus dem Kurs und sagt das auch.
- 18 Testfälle, 16 bestanden, 2 offen und offen aufgeführt. Bekannte Grenzen stehen in der README, zum Beispiel ein offener Webhook und ein lokales Modell hinter einem SSH-Tunnel.
- Sechs [Schritt-Seiten](https://markus-piljanovic.github.io/automation-portfolio/workflows/mini-idp-schmidt/page/01-intake.html) zeigen jede Stufe mit Screenshots, der [Testplan](https://markus-piljanovic.github.io/automation-portfolio/workflows/mini-idp-schmidt/testing/test-plan.html) ist eine Seite. Das ist ein Kursprojekt für ein fiktives Unternehmen, die Notizen im Workflow sind auf Deutsch.

[Zur ausführlichen Beschreibung](workflows/mini-idp-schmidt/README.md)

## Hinweise

- Zugangsdaten, IDs sowie Tabellen- und Ordnerverweise sind durch Platzhalter ersetzt (`YOUR_..._ID`). Die Workflows lassen sich importieren, brauchen aber deine eigenen Zugänge.
- Die Sticky Notes in den Workflows erklären jeden Schritt.
- Die Beschreibungen sind Orientierung und keine Rechtsberatung.
