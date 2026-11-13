// KONTEXT: Build-Hilfe. tsc kopiert keine SVG-Dateien, die Node braucht ihr Icon aber im dist-Ordner.
// BEISPIEL: Aus nodes/HealthchecksPing/healthchecks.svg wird dist/nodes/HealthchecksPing/healthchecks.svg.

// „Dateisystem-Funktionen von Node laden.“
const fs = require('fs');
// „Quelle und Ziel des Icons.“
const from = 'nodes/HealthchecksPing/healthchecks.svg';
const to = 'dist/nodes/HealthchecksPing/healthchecks.svg';
// „Zielordner anlegen, falls er fehlt.“
fs.mkdirSync('dist/nodes/HealthchecksPing', { recursive: true });
// „Icon kopieren.“
fs.copyFileSync(from, to);
// „Rückmeldung für die Konsole.“
console.log('Icon kopiert:', to);
