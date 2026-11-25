# n8n Workflows

Ich absolviere aktuell eine Weiterbildung zum Digitalisierungsmanager und setze neben dem Kurs in meiner Freizeit eigene Workflows in n8n um (selbst gehostet auf einem VPS). 
Hier liegt eine Auswahl aus einem größeren Pool an Workflows, die ich nach und nach fertigstelle und veröffentliche. Die Übersicht in diesem Repository wird laufend erweitert.

Die Workflows sind gegen vorab schriftlich festgehaltene Erwartungen getestet, bekannte Grenzen sind offen benannt. 
Jeder Workflow hat einen eigenen Ordner mit Beschreibung, Screenshots und den exportierten JSON-Dateien. 
Die Workflows und ihre Sticky Notes sind auf Englisch, alles andere auf Deutsch.

## Workflows

| Workflow | Welches Problem er löst | Ordner |
|---|---|---|
| **Compliance Guide** | Vor einem geplanten KI-Projekt muss ein Berater wissen, welche Artikel aus DSGVO und EU AI Act gelten. Ein Formular mit festen Regeln liefert eine Checkliste mit Belegen aus dem Gesetz. [Demo ansehen](https://markus-piljanovic.github.io/automation-portfolio/workflows/automation-compliance-guide/page/compliance-guide-demo.html) | [compliance-guide](workflows/automation-compliance-guide/) |
| **Lead Qualification** | Der Workflow routet Anfragen und lässt sie durch einen KI-Agenten bewerten (mit Spamschutz). Informiert wird man über Telegram, ohne personenbezogene Daten. Eine Antwort an einen heißen Lead geht erst per Klick raus. [Demo ansehen](https://markus-piljanovic.github.io/automation-portfolio/workflows/lead-qualification/demo/index.html) | [lead-qualification](workflows/lead-qualification/) |
| **Mini-IDP** | Ein fiktives Logistikunternehmen tippt täglich etwa 180 Lieferscheine von Hand ein. Kostenlose OCR liest zuerst, eine KI und ein lokales Modell lesen und prüfen nur die unklaren, feste Regeln entscheiden, und ein Mensch in Slack klärt jeden Zweifel. Jeder Lauf protokolliert seine Kosten. | [mini-idp-schmidt](workflows/mini-idp-schmidt/) |

## Hinweise

- Zugangsdaten, IDs sowie Tabellen- und Ordnerverweise sind durch Platzhalter ersetzt (`YOUR_..._ID`). Die Workflows lassen sich importieren, brauchen aber deine eigenen Zugänge.
- Die Sticky Notes in den Workflows erklären jeden Schritt.
- Die Beschreibungen sind Orientierung und keine Rechtsberatung.
