// KONTEXT: Inhalte der Detailansicht: Output-Zeilen je Node und Fall, dazu die Animationen der Außenwelt (Mail, Airtable, Telegram, Healthchecks, KI).
// BEISPIEL: R("check_lead", Fall B) liefert die Zeilen domain, istFreemail, spamVerdacht=true; EV("email_trigger_imap", Fall A) baut das Mailfenster, in dem die Anfrage getippt wird.

// ---------- ABSCHNITT 1: Hilfen ----------
// „Text kürzen und HTML sicher machen.“
const T = (s, n) => s.length > n ? s.slice(0, n - 1) + "…" : s;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// „Text Zeichen für Zeichen in ein Element tippen, als Teil einer GSAP-Zeitleiste.“
function typeTo(tl, el, text, at, dur) {
  const o = {n: 0};
  tl.add(() => el.classList.add("typing"), at);
  tl.to(o, {n: text.length, duration: dur, ease: "none", onUpdate() { el.textContent = text.slice(0, Math.round(o.n)); }}, at);
  tl.add(() => el.classList.remove("typing"), at + dur);
  return at + dur;
}
// „Anthropic-Zeichen (für Claude Haiku).“
const ANTHROPIC = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>';
const PRIO = {"Heiß":"hot", "Warm":"warm", "Rückfrage":"ask", "Kalt":"cold"};

// ---------- ABSCHNITT 2: Output-Zeilen je Node ----------
// „Zeile = [Name, Wert, Markierung]: 1 = neues Feld (grün), 2 = Stopp oder Fehler (rot).“
function R(id, c) {
  id = bid(id);
  const L = c.L, k = c.kind, dup = k === "dup", first = L.name.split(" ")[0];
  const b1 = T(L.body.replace(/\n/g, " "), 38);
  const cat = L.cat || "–";
  const way = {"Heiß":"Hot (0)", "Warm":"Warm (1)", "Rückfrage":"Rückfrage (2)", "Kalt":"Kalt (3)"}[cat] || "–";
  const dossier = "dossier_" + (L.firma ? L.firma.split(" ")[0].toLowerCase() : "lead") + ".html";
  const rows = {
    email_trigger_imap: [["from", `${L.name} <${L.email}>`], ["subject", L.subj], ["textPlain", b1], ["date", "Mon, 23 Nov 2026 09:42:17 +0100"]],
    prepare_email_data: [["name", L.name, 1], ["firma", L.firma || "(leer)", 1], ["email", L.email, 1], ["telefon", L.tel || "(leer)", 1], ["nachricht", b1, 1], ["datum", "2026-11-23", 1], ["quelle", "E-Mail", 1]],
    ping_start: [["Aufruf", "…/ping/‹id›/start", 1], ["Antwort", "200 OK"], ["Zweck", "Lauf ist gestartet"]],
    check_lead: [["domain", L.domain, 1], ["istFreemail", String(L.free), 1], ["spamVerdacht", String(k === "spam1"), 1, k === "spam1" ? 2 : 0], ["spamGrund", k === "spam1" ? "Vorfilter: " + L.reason : "(leer)", 1, k === "spam1" ? 2 : 0], ["…", "alle Felder aus dem Schritt davor"]],
    spam_prefilter: [["Ausgang", k === "spam1" ? "true: Spam-Verdacht" : "false: weiter zum Spam-Filter", 0, k === "spam1" ? 2 : 0], ["spamVerdacht", String(k === "spam1")]],
    drop_spam: [["Ergebnis", "Lauf endet hier", 0, 2], ["gespeichert", "nein"], ["Antwort", "keine"], ["Telegram", "keine"], ["Grund", L.reason, 0, 2]],
    spam_gate: [["Ausgang", k === "spam2" ? "spam" : "legit", 0, k === "spam2" ? 2 : 0], ["Weg", k === "spam2" ? "→ drop_spam" : "→ search_lead und merge_search_result"]],
    spam_gate_model: [["Modell", "Claude Haiku"], ["Antwort", k === "spam2" ? "spam" : "legit"], ["Tokens", "≈ 310"]],
    search_lead: dup ? [["Treffer", "1 Datensatz", 1], ["Datensatz-ID", "recJ4…", 1], ["Verlauf bisher", "Erste Anfrage: Rechnungs-OCR"]] : [["Treffer", "0 Datensätze", 1], ["Hinweis", "Absender noch unbekannt"]],
    merge_search_result: [["istBekannt", String(dup), 1], ["…", "Mail-Felder und Suchergebnis in einem Datensatz"]],
    is_duplicate: [["Ausgang", dup ? "true: bekannter Absender" : "false: neuer Absender"], ["Weiter", dup ? "→ Nachricht anhängen" : "→ ai_agent"]],
    email_duplicate_notice: [["An", L.email], ["Betreff", "Re: " + T(L.subj, 30)], ["Status", "gesendet", 1]],
    append_followup: [["Datensatz", "recJ4…"], ["Verlauf", "+1 Eintrag: Folgenachricht", 1], ["Status", "aktualisiert", 1]],
    telegram_followup: [["Chat", "Vertriebs-Team"], ["Text", "Folgenachricht von " + L.name], ["Status", "gesendet", 1]],
    ai_agent: k === "fail" ? [["Fehler", "KI-Dienst nicht erreichbar (Timeout)", 0, 2], ["Ausgang", "Error → ai_fallback", 0, 2]] : [["Tools genutzt", "read_imprint, company_research"], ["Ausgang", "Success → process_ai_output"], ["Tokens", "≈ 1.900"]],
    chat_model: [["Modell", "Claude Haiku"], ["Temperatur", "0.2"], ["Antwort", "JSON laut Schema"]],
    read_imprint: [["URL", `https://${L.domain}/impressum`], ["Status", L.firma ? "200 OK" : "404", 0, L.firma ? 0 : 2], ["Fund", L.firma ? "Firmenname, Sitz, Register" : "kein Impressum gefunden", 1, L.firma ? 0 : 2]],
    company_research: [["Mitarbeitende", L.emp, 1], ["Umsatz", L.rev, 1], ["Branche", L.branche, 1], ["Quelle", "Workflow 4"]],
    structured_output: [["score", String(L.score), 1], ["kategorie", cat, 1], ["begruendung", T(L.why || "", 40), 1]],
    ai_fallback: [["score", "0", 1, 2], ["kategorie", "Rückfrage", 1], ["begruendung", L.why, 1, 2]],
    process_ai_output: [["score", String(L.score), 1], ["kategorie", cat, 1], ["weg", way, 1], ["begruendung", T(L.why || "", 40), 1]],
    create_lead_record: [["Tabelle", "Leads"], ["Datensatz", "recX7…", 1], ["Status", "Neu", 1], ["Score", String(L.score), 1], ["Kategorie", cat, 1]],
    route_by_category: [["Ausgang", way], ["Folge", {"Heiß":"Freigabe, Dossier, Bestätigung", "Rückfrage":"Rückfrage an Absender und Team"}[cat] || "–"]],
    telegram_approval_request: [["Chat", "Freigabe-Chat"], ["Text", "Heißer Lead (anonymisiert)"], ["Knöpfe", "Senden / Verwerfen"], ["Status", "gesendet", 1]],
    build_dossier: [["Datei", dossier, 1], ["Inhalt", "Firma, Score, Begründung, Mail"], ["Format", "HTML"]],
    send_dossier: [["An", "vertrieb@example.com"], ["Anhang", dossier], ["Status", "gesendet", 1]],
    telegram_new_lead: [["Chat", "Vertriebs-Team"], ["Text", "Neuer warmer Lead"], ["Status", "gesendet", 1]],
    send_confirmation: [["An", L.email], ["Betreff", "Ihre Anfrage ist eingegangen"], ["Status", "gesendet", 1]],
    email_clarification: [["An", L.email], ["Betreff", "Kurze Rückfrage zu Ihrer Anfrage"], ["Status", "gesendet", 1]],
    telegram_clarification: [["Chat", "Vertriebs-Team"], ["Text", "Rückfrage rausgegangen an " + L.name], ["Status", "gesendet", 1]],
    ping_success: [["Aufruf", "…/ping/‹id›", 1], ["Antwort", "200 OK"], ["Zweck", "Lauf ist sauber zu Ende"]]
  };
  return (rows[id] || []).map(r => ({k: r[0], v: r[1], nw: r[2] === 1, bad: (r[3] === 2) || r[2] === 2}));
}
// „Fall-spezifische Zusatzzeile unter 'Was die Node macht'.“
function EXTRA(id, c) {
  const k = c.kind;
  if (id === "ps_spam") return "<b>Hier (Ende 1 von 3):</b> auch ein Spam-Lauf ist ein erfolgreicher Lauf. Ohne dieses Signal käme ein falscher Alarm.";
  if (id === "ps_dup") return "<b>Hier (Ende 2 von 3):</b> die Folgenachricht ist verarbeitet, der Lauf ist sauber zu Ende.";
  if (id === "ps_new") return "<b>Hier (Ende 3 von 3):</b> der Lead ist gespeichert. Der Ping läuft parallel zur Verteilung.";
  if (id === "check_lead" && k === "spam1") return "<b>Hier:</b> Nachricht hat nur 2 Zeichen, das reicht für den Spam-Verdacht.";
  if (id === "drop_spam") return "<b>Hier:</b> " + esc(c.L.reason) + ". Danach meldet ping_success trotzdem „Lauf sauber“.";
  if (id === "spam_gate" && k === "spam2") return "<b>Hier:</b> kein Link, keine Spam-Regel greift, aber der Inhalt ist Werbung. Das Modell erkennt es.";
  if (id === "is_duplicate" && k === "dup") return "<b>Hier:</b> die Adresse steht schon in Airtable.";
  if (id === "ai_agent" && k === "fail") return "<b>Hier:</b> Der KI-Dienst antwortet nicht. Der Agent bricht ab, die Node leuchtet rot, der Lauf geht über „Error“ weiter.";
  if (id === "ai_fallback") return "<b>Hier:</b> der Lead wird nicht verworfen, sondern als Rückfrage geführt.";
  if (id === "route_by_category") return "<b>Hier:</b> Kategorie „" + esc(c.L.cat) + "“.";
  return "";
}

// ---------- ABSCHNITT 3: Fenster der Außenwelt ----------
// „Mailfenster: Kopf steht fest, nur der Text wird getippt, dann Senden.“
function mailWin(el, o) {
  el.innerHTML = `<div class="win mailw"><div class="wbar"><span>${o.head}</span><span>✉</span></div>${o.rows.map(r => `<div class="mf"><i>${r[0]}</i><span>${esc(r[1])}</span></div>`).join("")}<div class="mbody"></div>${o.att ? `<div class="att">📎 ${esc(o.att)}</div>` : ""}<div class="msend"><span class="sbtn">Senden</span><span class="sst"></span></div></div>`;
  const tl = gsap.timeline(), b = el.querySelector(".mbody"), st = el.querySelector(".sst"), btn = el.querySelector(".sbtn"), att = el.querySelector(".att");
  let t = typeTo(tl, b, o.body, 0.3, Math.max(1.2, Math.min(3.8, o.body.length / 60)));
  if (att) { gsap.set(att, {opacity: 0}); tl.to(att, {opacity: 1, duration: .3}, t + .1); t += .4; }
  tl.to(btn, {scale: .9, duration: .12, yoyo: true, repeat: 1}, t + .2);
  tl.add(() => { st.textContent = o.status; st.classList.add("ok"); }, t + .5);
  tl.from(st, {opacity: 0, x: -8, duration: .3}, t + .5);
  return tl;
}
// „Telegram-Fenster: Nachricht wird getippt, Knöpfe erscheinen, optional wird einer geklickt.“
function tgWin(el, o) {
  el.innerHTML = `<div class="win tg"><div class="tgh"><span class="av">LB</span><div><b>${o.who || "Lead-Bot"}</b><small>Bot</small></div></div><div class="tgb"><div class="bub"><div class="bt"></div>${o.btns ? '<div class="tbs">' + o.btns.map(b => `<span class="tb">${b}</span>`).join("") + "</div>" : ""}</div>${o.reply ? `<div class="bub rep">${o.reply}</div>` : ""}</div>${o.note ? `<div class="tnote">${o.note}</div>` : ""}</div>`;
  const tl = gsap.timeline(), bt = el.querySelector(".bt"), tbs = el.querySelectorAll(".tb"), rep = el.querySelector(".rep");
  if (rep) gsap.set(rep, {opacity: 0, y: 10});
  let t = typeTo(tl, bt, o.text, 0.3, Math.max(1, Math.min(3, o.text.length / 55)));
  if (tbs.length) { gsap.set(tbs, {opacity: 0}); tl.to(tbs, {opacity: 1, stagger: .15, duration: .3}, t + .1); t += .5; }
  if (o.click != null && tbs[o.click]) {
    tl.to(tbs[o.click], {scale: .92, duration: .12, yoyo: true, repeat: 1}, t + .5);
    tl.add(() => tbs[o.click].classList.add("hit"), t + .65);
    if (rep) tl.to(rep, {opacity: 1, y: 0, duration: .4}, t + .9);
  }
  return tl;
}
// „Airtable-Tabelle: suchen, neue Zeile anlegen oder an eine Zeile anhängen. Platzhalter, bis die echten Screenshots da sind.“
function atWin(el, o) {
  const rows = [["Julia Wagner", "Wagner Bau", "Warm", "61", "Anfrage Lagerverwaltung"], ["Peter Lang", "Lang & Söhne", "Kalt", "18", "Frage zum Newsletter"], ["Jonas Fischer", "Fischer Metallbau", "Warm", "64", "Erste Anfrage: Rechnungs-OCR"]];
  const pill = c => `<em class="pill ${PRIO[c] || ""}">${c}</em>`;
  const tr = (r, i) => `<div class="atr" data-i="${i}"><span>${esc(r[0])}</span><span>${esc(r[1])}</span><span>${r[2] ? pill(r[2]) : ""}</span><span>${esc(r[3])}</span><span class="vl">${esc(r[4])}</span></div>`;
  el.innerHTML = `<div class="win at${o.mode === "create" ? " cr" : ""}"><div class="wbar"><span>Airtable · Leads</span><span class="sbox"></span></div><div class="ath"><span>Name</span><span>Firma</span><span>Kategorie</span><span>Score</span><span>Verlauf</span></div>${rows.map(tr).join("")}${o.mode === "create" ? tr(["", "", "", "", ""], 9) : ""}<div class="atmsg"></div></div>`;
  const tl = gsap.timeline(), sb = el.querySelector(".sbox"), msg = el.querySelector(".atmsg");
  if (o.mode === "search") {
    let t = typeTo(tl, sb, "🔍 E-Mail = " + o.email, 0.2, 1.4);
    if (o.hit) { tl.add(() => el.querySelector('[data-i="2"]').classList.add("hl"), t + .3); tl.add(() => { msg.textContent = "1 Treffer: Absender ist bekannt"; msg.className = "atmsg ok"; }, t + .4); }
    else tl.add(() => { msg.textContent = "Keine Treffer: Absender ist neu"; msg.className = "atmsg"; }, t + .4);
    tl.from(msg, {opacity: 0, duration: .3}, t + .4);
  } else if (o.mode === "create") {
    const row = el.querySelector('[data-i="9"]'), cs = row.querySelectorAll("span"), v = o.vals;
    row.classList.add("newr");
    let t = .2;
    tl.from(row, {opacity: 0, duration: .3}, 0);
    [0, 1].forEach(i => { t = typeTo(tl, cs[i], v[i], t, .6); });
    tl.add(() => cs[2].innerHTML = pill(v[2]), t + .1); t += .3;
    t = typeTo(tl, cs[3], v[3], t, .3);
    t = typeTo(tl, cs[4], v[4], t, .9);
    tl.add(() => { msg.textContent = "Neuer Datensatz angelegt"; msg.className = "atmsg ok"; }, t + .2);
    tl.from(msg, {opacity: 0, duration: .3}, t + .2);
  } else if (o.mode === "append") {
    const cell = el.querySelector('[data-i="2"] .vl'); cell.insertAdjacentHTML("beforeend", ' <b class="add"></b>');
    const add = cell.querySelector(".add");
    el.querySelector('[data-i="2"]').classList.add("hl");
    let t = typeTo(tl, add, "+ Folge: drei Standorte", .3, 1.2);
    tl.add(() => { msg.textContent = "Verlauf ergänzt"; msg.className = "atmsg ok"; }, t + .2);
    tl.from(msg, {opacity: 0, duration: .3}, t + .2);
  }
  return tl;
}
// „Healthchecks-Fenster: Ping kommt an, Punkt wird blau (läuft) oder grün (fertig).“
function pingWin(el, kind) {
  const start = kind === "start";
  el.innerHTML = `<div class="win hc"><div class="wbar dark"><span>Healthchecks.io</span><span>Checks</span></div><div class="hcrow"><span class="hcdot"></span><b>Lead Qualification · Intake and Scoring</b><span class="hcst">${start ? "wartet" : "läuft"}</span></div><div class="hclog"></div><div class="hcnote">${start ? "Kommt kein Ping am Ende des Laufs, gilt der Lauf als nicht bestanden." : "Stoppt die Uhr: der Lauf gilt als erfolgreich."}</div></div>`;
  const tl = gsap.timeline(), dot = el.querySelector(".hcdot"), s = el.querySelector(".hcst"), log = el.querySelector(".hclog");
  tl.add(() => log.innerHTML = `<div>→ GET …/ping/‹id›${start ? "/start" : ""}  <small>(aus n8n)</small></div>`, .3);
  tl.add(() => log.innerHTML += '<div class="ok">← 200 OK</div>', 1.1);
  tl.add(() => { dot.className = "hcdot " + (start ? "run" : "up"); s.textContent = start ? "läuft" : "erfolgreich"; }, 1.4);
  return tl;
}
// „Spam-Filter-Fenster: Claude Haiku bekommt die Mail und wählt eine Klasse.“
function classWin(el, c) {
  const spam = c.kind === "spam2";
  el.innerHTML = `<div class="win cls"><div class="wbar dark"><span class="lg">${ANTHROPIC} Claude Haiku · Spam-Filter</span><span></span></div><div class="cq">Mail von ${esc(c.L.name)}</div><div class="cmsg">„${esc(T(c.L.body.replace(/\n/g, " "), 150))}“</div><div class="chips"><span data-k="legit">legit</span><span data-k="spam">spam</span><span data-k="other">other</span></div><div class="cres"></div></div>`;
  const tl = gsap.timeline(), res = el.querySelector(".cres");
  gsap.set(el.querySelector(".cmsg"), {opacity: 0});
  tl.to(el.querySelector(".cmsg"), {opacity: 1, duration: .5}, .2);
  tl.add(() => { el.querySelector(`[data-k="${spam ? "spam" : "legit"}"]`).classList.add(spam ? "bad" : "good"); res.textContent = spam ? "Klasse: spam → der Lauf endet" : "Klasse: legit → der Lauf geht weiter"; res.className = "cres " + (spam ? "bad" : "ok"); }, 1.3);
  tl.from(res, {opacity: 0, duration: .3}, 1.3);
  return tl;
}
// „Agent-Fenster: Claude Haiku arbeitet Tools ab oder scheitert.“
function agentWin(el, c) {
  const fail = c.kind === "fail";
  const lines = [["Aufgabe: Lead bewerten (Score 0 bis 100, Kategorie)", ""], ["→ Tool read_imprint: Impressum lesen", ""], ["→ Tool company_research: Firmenzahlen holen", ""]];
  lines.push(fail ? ["✕ Zeitüberschreitung: KI-Dienst nicht erreichbar", "err"] : ["← Antwort als JSON im festen Format", "ok"]);
  el.innerHTML = `<div class="win ag"><div class="wbar dark"><span class="lg">${ANTHROPIC} Claude Haiku · Agent</span><span></span></div><div class="aglines">${lines.map(l => `<div class="${l[1]}">${l[0]}</div>`).join("")}</div></div>`;
  const tl = gsap.timeline(), ls = el.querySelectorAll(".aglines div");
  gsap.set(ls, {opacity: 0, x: -10});
  tl.to(ls, {opacity: 1, x: 0, stagger: .6, duration: .35}, .2);
  return tl;
}
// „Impressum-Seite: eine fiktive Firmenseite.“
function imprintWin(el, c) {
  const L = c.L, ok = !!L.firma;
  el.innerHTML = `<div class="win br"><div class="wbar"><span>https://${esc(L.domain)}/impressum</span><span></span></div><div class="brb">${ok ? `<h5>Impressum</h5><p><b>${esc(L.firma)}</b><br>Musterstraße 12 · 20457 Hamburg</p><p>Handelsregister: HRB 123456, Amtsgericht Hamburg<br>Geschäftsführung: ${esc(L.name)}</p>` : `<h5 class="bad">404 · Seite nicht gefunden</h5><p>Zu dieser Adresse gibt es keine Firmenseite.</p>`}</div></div>`;
  const tl = gsap.timeline(); gsap.set(el.querySelector(".brb"), {opacity: 0}); tl.to(el.querySelector(".brb"), {opacity: 1, duration: .6}, .3); return tl;
}
// „Sub-Workflow-Fenster: Workflow 4 liefert Firmenzahlen.“
function subwfWin(el, c) {
  const L = c.L;
  el.innerHTML = `<div class="win sw"><div class="wbar dark"><span>Sub-Workflow · Workflow 4 · Company Research</span><span></span></div><div class="swres"><span>Mitarbeitende <b>${esc(L.emp)}</b></span><span>Umsatz <b>${esc(L.rev)}</b></span><span>Branche <b>${esc(L.branche)}</b></span></div></div>`;
  const tl = gsap.timeline(), r = el.querySelectorAll(".swres span"); gsap.set(r, {opacity: 0, y: 8}); tl.to(r, {opacity: 1, y: 0, stagger: .3, duration: .3}, .8); return tl;
}
// „JSON-Fenster: die feste Antwortform wird getippt.“
function jsonWin(el, c) {
  const L = c.L, txt = `{\n  "score": ${L.score},\n  "kategorie": "${L.cat}",\n  "begruendung": "${T(L.why, 44)}"\n}`;
  el.innerHTML = `<div class="win js"><div class="wbar dark"><span>Antwort im festen Format</span><span></span></div><pre class="jb"></pre></div>`;
  const tl = gsap.timeline(); typeTo(tl, el.querySelector(".jb"), txt, .3, 1.6); return tl;
}

// ---------- ABSCHNITT 4: Welche Node bekommt welches Fenster ----------
// „Mail-Texte je Fall. Nur der Text wird getippt.“
function mailText(id, c) {
  const L = c.L, f = L.anrede || L.name;
  const t = {
    send_confirmation: `Guten Tag ${f},\nvielen Dank für Ihre Anfrage. Wir haben sie erhalten und melden uns innerhalb eines Werktags bei Ihnen.\nViele Grüße\nIhr Team`,
    email_clarification: `Guten Tag ${f},\ndamit wir Ihnen gezielt helfen können, brauchen wir noch drei Angaben: Um welche Abläufe geht es? Wie viele Vorgänge pro Woche? Bis wann soll es laufen?\nViele Grüße\nIhr Team`,
    email_duplicate_notice: `Guten Tag ${f},\nvielen Dank für Ihre Ergänzung. Wir haben sie Ihrer bisherigen Anfrage zugeordnet. Eine neue Rückmeldung ist nicht nötig.\nViele Grüße\nIhr Team`,
    send_dossier: `Neuer heißer Lead: ${L.firma}.\nScore ${L.score}, Kategorie ${L.cat}. Das Dossier mit Firmendaten, Begründung und Original-Mail hängt an.`
  };
  return t[id];
}
// „Gibt für eine Node das Fenster zurück: dir = 'in' (Ereignis kommt von außen, vor dem Aufleuchten) oder 'out' (nach dem Aufleuchten).“
function EV(id, c) {
  const L = c.L;
  const mailHead = (to, subj, att) => ({head: "E-Mail gesendet", rows: [["Von", "leads@example.com"], ["An", to], ["Betreff", subj]], att, status: "✓ Gesendet"});
  switch (bid(id)) {
    case "email_trigger_imap": return {dir: "in", build: el => mailWin(el, {head: "Neue E-Mail", rows: [["An", "leads@example.com"], ["Von", `${L.name} <${L.email}>`], ["Betreff", L.subj]], body: L.body, status: "✓ Gesendet · landet im Postfach „Leads“"})};
    case "ping_start": return {dir: "out", build: el => pingWin(el, "start")};
    case "ping_success": return {dir: "out", build: el => pingWin(el, "success")};
    case "spam_gate": return {dir: "out", build: el => classWin(el, c)};
    case "search_lead": return {dir: "out", build: el => atWin(el, {mode: "search", email: L.email, hit: c.kind === "dup"})};
    case "append_followup": return {dir: "out", build: el => atWin(el, {mode: "append"})};
    case "create_lead_record": return {dir: "out", build: el => atWin(el, {mode: "create", vals: [L.name, L.firma || "(unbekannt)", L.cat, String(L.score), T(L.why, 30)]})};
    case "ai_agent": return {dir: "out", build: el => agentWin(el, c)};
    case "read_imprint": return {dir: "out", build: el => imprintWin(el, c)};
    case "company_research": return {dir: "out", build: el => subwfWin(el, c)};
    case "structured_output": return {dir: "out", build: el => jsonWin(el, c)};
    case "send_confirmation": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead(L.email, "Ihre Anfrage ist eingegangen"), {body: mailText(id, c)}))};
    case "email_clarification": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead(L.email, "Kurze Rückfrage zu Ihrer Anfrage"), {body: mailText(id, c)}))};
    case "email_duplicate_notice": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead(L.email, "Re: " + T(L.subj, 30)), {body: mailText(id, c)}))};
    case "send_dossier": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead("vertrieb@example.com", "Neuer heißer Lead: " + L.firma), {body: mailText(id, c), att: "dossier_" + L.firma.split(" ")[0].toLowerCase() + ".html"}))};
    case "telegram_approval_request": return {dir: "out", build: el => tgWin(el, {text: `🔥 Heißer Lead (anonymisiert)\nBranche: ${L.branche} · rund ${L.emp} Mitarbeitende\nScore ${L.score}: ${L.why}.\nDas Dossier ging an den Vertrieb.`, btns: ["✓ Senden", "✕ Verwerfen"], click: 0, reply: "✓ Freigegeben. Die Antwort an den Lead geht raus.", note: "Der Klick startet Workflow 2 „Hot Lead Approval“."})};
    case "telegram_followup": return {dir: "out", build: el => tgWin(el, {text: `↩ Folgenachricht von einem bekannten Lead\n${L.name}, ${L.firma}\n„${T(L.body.split("\n")[1], 70)}“`})};
    case "telegram_new_lead": return {dir: "out", build: el => tgWin(el, {text: "Neuer warmer Lead eingegangen."})};
    case "telegram_clarification": return {dir: "out", build: el => tgWin(el, {text: `❓ Rückfrage nötig\n${L.name} hat zu wenig Angaben gemacht.\nDie Rückfrage-Mail ist unterwegs.`})};
  }
  return null;
}
