// KONTEXT: Offline-Prüfung der Aufgabenliste (To-dos) der Maske. Nimmt den Regel-Code aus dem Main-Workflow, lässt ihn für jeden gültigen Testfall laufen und prüft, welche Aufgaben die Maske daraus zeigt. Kostet nichts, ruft weder Webhook noch KI auf.
// BEISPIEL: node check_todos.js prüft alle Fälle in cases/. Bei Fall 09 (Mieter-Chatbot, mit Angaben über Menschen und Speicherorten) müssen "Zweck und Rechtsgrundlage" und "Löschfrist" in der Liste stehen, bei Fall 24 (keine Angaben über Menschen) keine von beiden.

// ---------- ABSCHNITT 1: Konstanten ----------
// „Dateisystem und Pfade von Node laden.“
const fs = require('fs');
const path = require('path');
// „Der Main-Workflow, die Maske und die Testfälle liegen relativ zu dieser Datei.“
const WORKFLOW = path.join(__dirname, '..', 'compliance-guide-main.json');
const MASKE = path.join(__dirname, '..', 'page', 'compliance-guide-form.html');
const CASES = path.join(__dirname, 'cases');
// „Die zwei Aufgaben, die an Bedingungen hängen.“
const ZWECK = 'Zweck und Rechtsgrundlage je Verarbeitung festlegen';
const FRIST = 'Löschfrist je Speicherort festlegen';
// „Diese Aufgabe gilt für jedes Projekt und muss immer in der Liste stehen.“
const IMMER = 'Maßnahmen zur KI-Kompetenz ergreifen';

// ---------- ABSCHNITT 2: Regeln und Aufgaben laden ----------
// „Den Code der Regel-Node aus dem Workflow holen und als Funktion bereitstellen.“
const rulesCode = JSON.parse(fs.readFileSync(WORKFLOW, 'utf8')).nodes.find(n => n.name === 'Rules').parameters.jsCode;
const rules = new Function('$input', rulesCode);
// „Die Aufgaben stehen als Liste TD im Skript der Maske.“
const TD = JSON.parse(fs.readFileSync(MASKE, 'utf8').replace(/\r\n/g, '\n').match(/const TD = (\[.*\]);\n/)[1]);

// ---------- ABSCHNITT 3: Auswahl und Sortierung wie in der Maske ----------
// „Eine Aufgabe erscheint, wenn ihre Gruppe eingeschaltet ist und ihre Bedingung stimmt. Die Löschfrist braucht zusätzlich Angaben über Menschen.“
const keep = (x, sw, c) => sw[x.b] && c[x.c || 'always'] && (x.b != 'speich' || sw.grund);

// ---------- ABSCHNITT 4: Jeden Fall prüfen ----------
let fehler = 0, geprueft = 0;
for (const f of fs.readdirSync(CASES).filter(f => f.endsWith('.json')).sort()) {
  const c = JSON.parse(fs.readFileSync(path.join(CASES, f), 'utf8'));
  // „Fehlerfälle (ungültige Eingabe) haben keine Aufgabenliste.“
  if (c.erwartung.status !== 200) continue;
  const S = rules({ first: () => ({ json: { body: c.input } }) })[0].json;
  const titel = TD.filter(x => keep(x, S.sw, S.conds)).map(x => x.title);
  // „Erwartung aus den Antworten: Zweck bei jeder Angabe über Menschen, Löschfrist zusätzlich bei einem Speicherort.“
  const mitDaten = !(c.input.daten || []).every(k => k === 'keine');
  const mitOrt = !(c.input.haltung || []).every(k => k === 'keine');
  const probleme = [];
  if (titel.includes(ZWECK) !== mitDaten) probleme.push('Zweck-Aufgabe stimmt nicht');
  if (titel.includes(FRIST) !== (mitDaten && mitOrt)) probleme.push('Löschfrist-Aufgabe stimmt nicht');
  if (!titel.includes(IMMER)) probleme.push('KI-Kompetenz fehlt');
  if (new Set(titel).size !== titel.length) probleme.push('doppelte Aufgabe');
  geprueft++; if (probleme.length) fehler++;
  console.log((probleme.length ? 'FEHLER ' : 'OK     ') + c.id + ' | ' + titel.length + ' Aufgaben | ' + (probleme.join('; ') || 'wie erwartet'));
}
// „Zusammenfassung.“
console.log('\n' + (geprueft - fehler) + ' von ' + geprueft + ' Fällen wie erwartet.');
process.exit(fehler ? 1 : 0);
