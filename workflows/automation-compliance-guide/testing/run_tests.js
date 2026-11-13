// KONTEXT: Testskript des Automation Compliance Guide. Schickt jeden Fall aus cases/ an den Webhook, vergleicht die Antwort mit der Erwartung aus der Fall-Datei und schreibt Ergebnisse nach results/.
// BEISPIEL: node run_tests.js ruft alle Fälle auf; node run_tests.js 09 ruft nur Fälle auf, deren Dateiname mit 09 beginnt.

// ---------- ABSCHNITT 1: Konstanten ----------
// „Dateisystem und Pfade von Node laden.“
const fs = require('fs');
const path = require('path');
// „Adresse des Webhooks, nur per Umgebungsvariable GUIDE_URL, damit keine echte Adresse in der Datei steht.“
const URL = process.env.GUIDE_URL;
// „Ohne Adresse gibt es nichts zu testen, also mit einem Hinweis beenden.“
if (!URL) { console.error('Bitte GUIDE_URL setzen, z. B. GUIDE_URL=https://<dein-n8n>/webhook/guide-request node run_tests.js'); process.exit(1); }
// „Ordner mit den Fällen und Ordner für die Ergebnisse.“
const CASES = path.join(__dirname, 'cases');
const RESULTS = path.join(__dirname, 'results');
// „Optionaler Filter: nur Fälle, deren Dateiname so beginnt.“
const FILTER = process.argv[2] || '';

// ---------- ABSCHNITT 2: Hilfsfunktionen ----------
// „Vergleich zweier Werte als Text, gut genug für Listen und Objekte.“
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// „Kurz warten, damit der Server nicht überrannt wird.“
const pause = ms => new Promise(r => setTimeout(r, ms));

// ---------- ABSCHNITT 3: Ein Fall ----------
// „Einen Fall senden und gegen die Erwartung prüfen. Gibt eine Liste der Abweichungen zurück.“
async function runCase(c) {
  const t0 = Date.now();
  // „Anfrage senden. Der Body ist der Inhalt des Falls (leere Felder entfallen im JSON von selbst).“
  const res = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(c.input) });
  // „Antwort als Text lesen und als JSON deuten.“
  const text = await res.text();
  let body = {}; try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 200) }; }
  const e = c.erwartung; const diffs = [];
  // „Prüfung 1: Status.“
  if (res.status !== e.status) diffs.push('Status ' + res.status + ' statt ' + e.status);
  // „Prüfung 2: bei gültiger Eingabe die Inhalte.“
  if (e.status === 200) {
    if (body.ok !== true) diffs.push('ok ist nicht true');
    if (body.stop !== e.stop) diffs.push('stop ' + body.stop + ' statt ' + e.stop);
    if (!same(body.arts, e.artikel)) diffs.push('Artikel je Feld weichen ab');
    const keys = Object.keys(body.summaries || {});
    if (!same([...keys].sort(), [...e.summaryKeys].sort())) diffs.push('Zusammenfassungen: ' + keys.length + ' statt ' + e.summaryKeys.length);
    if (body.kiStatus !== e.kiStatus) diffs.push('kiStatus ' + body.kiStatus + ' statt ' + e.kiStatus);
    if (!same(body.replaced, e.ersetzt)) diffs.push('ersetzte Zusammenfassungen: ' + JSON.stringify(body.replaced));
    if (e.nameBereinigt !== undefined && body.answers?.name !== e.nameBereinigt) diffs.push('Name nicht wie erwartet bereinigt');
    if (e.llmDritt && !same(body.llm?.third, e.llmDritt)) diffs.push('KI-Modelle außerhalb der EU weichen ab');
    if (e.llmUnbekannt && !same(body.llm?.unk, e.llmUnbekannt)) diffs.push('unbekannte KI-Modelle weichen ab');
  } else {
    // „Prüfung 3: bei ungültiger Eingabe die Fehlerliste.“
    if (body.ok !== false) diffs.push('ok ist nicht false');
    if (!same(body.errors, e.fehler)) diffs.push('Fehlerliste weicht ab');
  }
  return { id: c.id, status: res.status, sekunden: Math.round((Date.now() - t0) / 1000), abweichungen: diffs, kiStatus: body.kiStatus ?? null, antwort: body };
}

// ---------- ABSCHNITT 4: Alle Fälle ----------
(async () => {
  // „Fälle laden, sortiert nach Dateiname.“
  const files = fs.readdirSync(CASES).filter(f => f.endsWith('.json') && f.startsWith(FILTER)).sort();
  const out = [];
  for (const f of files) {
    const c = JSON.parse(fs.readFileSync(path.join(CASES, f), 'utf8'));
    // „Einen Fall senden, Fehler im Netz als Abweichung werten.“
    let r; try { r = await runCase(c); } catch (err) { r = { id: c.id, status: 0, sekunden: 0, abweichungen: ['Netzfehler: ' + err.message], kiStatus: null }; }
    out.push(r);
    // „Zeile in die Konsole.“
    console.log((r.abweichungen.length ? 'FEHLER ' : 'OK     ') + r.id + ' | HTTP ' + r.status + ' | ' + r.sekunden + ' s | ' + (r.abweichungen.join('; ') || 'wie erwartet'));
    await pause(2000);
  }
  // „Ergebnis als JSON ablegen.“
  fs.mkdirSync(RESULTS, { recursive: true });
  const file = path.join(RESULTS, 'ergebnis_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json');
  fs.writeFileSync(file, JSON.stringify({ zeitpunkt: new Date().toISOString(), faelle: out }, null, 1));
  // „Zusammenfassung.“
  console.log('\n' + out.filter(r => !r.abweichungen.length).length + ' von ' + out.length + ' Fällen wie erwartet. Ergebnis: ' + file);
})();
