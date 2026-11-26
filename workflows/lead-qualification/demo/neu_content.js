// KONTEXT: Inhalte der Detailansicht: Output-Zeilen je Node und Fall, dazu die Animationen der Außenwelt (Mail, Airtable, Telegram, Healthchecks, KI).
// BEISPIEL: R("check_lead", Fall B) liefert die Zeilen domain, istFreemail, spamVerdacht=true; EV("email_trigger_imap", Fall A) baut das Mailfenster, in dem die Anfrage getippt wird.

// ---------- ABSCHNITT 1: Hilfen ----------
// “Text kürzen und HTML sicher machen.”
const T = (s, n) => s.length > n ? s.slice(0, n - 1) + "…" : s;
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// “Text Zeichen für Zeichen in ein Element tippen, als Teil einer GSAP-Zeitleiste.”
function typeTo(tl, el, text, at, dur) {
  const o = {n: 0};
  tl.add(() => el.classList.add("typing"), at);
  tl.to(o, {n: text.length, duration: dur, ease: "none", onUpdate() { el.textContent = text.slice(0, Math.round(o.n)); }}, at);
  tl.add(() => el.classList.remove("typing"), at + dur);
  return at + dur;
}
// “Anthropic-Zeichen (für Claude Haiku).”
const ANTHROPIC = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/></svg>';
const PRIO = {"Hot":"hot", "Warm":"warm", "Clarification":"ask", "Cold":"cold"};

// ---------- ABSCHNITT 2: Output-Zeilen je Node ----------
// “Zeile = [Name, Wert, Markierung]: 1 = neues Feld (grün), 2 = Stopp oder Fehler (rot).”
function R(id, c) {
  id = bid(id);
  const L = c.L, k = c.kind, dup = k === "dup", first = L.name.split(" ")[0];
  const b1 = T(L.body.replace(/\n/g, " "), 38);
  const cat = L.cat || "–";
  const way = {"Hot":"Hot (0)", "Warm":"Warm (1)", "Clarification":"Clarification (2)", "Cold":"Cold (3)"}[cat] || "–";
  const dossier = "dossier_" + (L.firma ? L.firma.split(" ")[0].toLowerCase() : "lead") + ".html";
  const rows = {
    email_trigger_imap: [["from", `${L.name} <${L.email}>`], ["subject", L.subj], ["textPlain", b1], ["date", "Mon, 23 Nov 2026 09:42:17 +0100"]],
    prepare_email_data: [["name", L.name, 1], ["firma", L.firma || "(empty)", 1], ["email", L.email, 1], ["telefon", L.tel || "(empty)", 1], ["nachricht", b1, 1], ["datum", "2026-11-23", 1], ["quelle", "E-Mail", 1]],
    ping_start: [["Call", "…/ping/‹id›/start", 1], ["Answer", "200 OK"], ["Purpose", "Run has started"]],
    check_lead: [["domain", L.domain, 1], ["istFreemail", String(L.free), 1], ["spamVerdacht", String(k === "spam1"), 1, k === "spam1" ? 2 : 0], ["spamGrund", k === "spam1" ? "Pre-filter: " + L.reason : "(empty)", 1, k === "spam1" ? 2 : 0], ["…", "all fields from the previous step"]],
    spam_prefilter: [["Output", k === "spam1" ? "true: suspected spam" : "false: on to the spam filter", 0, k === "spam1" ? 2 : 0], ["spamVerdacht", String(k === "spam1")]],
    drop_spam: [["Result", "Run ends here", 0, 2], ["stored", "no"], ["Reply", "none"], ["Telegram", "none"], ["Reason", L.reason, 0, 2]],
    spam_gate: [["Output", k === "spam2" ? "spam" : "legit", 0, k === "spam2" ? 2 : 0], ["Path", k === "spam2" ? "→ drop_spam" : "→ search_lead and merge_search_result"]],
    spam_gate_model: [["Model", "Claude Haiku"], ["Answer", k === "spam2" ? "spam" : "legit"], ["Tokens", "≈ 310"]],
    search_lead: dup ? [["Hits", "1 record", 1], ["Record ID", "recJ4…", 1], ["History so far", "First inquiry: invoice OCR"]] : [["Hits", "0 records", 1], ["Note", "sender not yet known"]],
    merge_search_result: [["istBekannt", String(dup), 1], ["…", "Mail fields and search result in one record"]],
    is_duplicate: [["Output", dup ? "true: known sender" : "false: new sender"], ["Next", dup ? "→ append message" : "→ ai_agent"]],
    email_duplicate_notice: [["To", L.email], ["Subject", "Re: " + T(L.subj, 30)], ["Status", "sent", 1]],
    append_followup: [["Record", "recJ4…"], ["History", "+1 entry: follow-up message", 1], ["Status", "updated", 1]],
    telegram_followup: [["Chat", "Sales team"], ["Text", "Follow-up message from " + L.name], ["Status", "sent", 1]],
    ai_agent: k === "fail" ? [["Error", "AI service not reachable (timeout)", 0, 2], ["Output", "Error → ai_fallback", 0, 2]] : [["Tools used", "read_imprint, company_research"], ["Output", "Success → process_ai_output"], ["Tokens", "≈ 1.900"]],
    chat_model: [["Model", "Claude Haiku"], ["Temperature", "0.2"], ["Answer", "JSON per schema"]],
    read_imprint: [["URL", `https://${L.domain}/impressum`], ["Status", L.firma ? "200 OK" : "404", 0, L.firma ? 0 : 2], ["Found", L.firma ? "Company name, seat, register" : "no legal notice found", 1, L.firma ? 0 : 2]],
    company_research: [["Employees", L.emp, 1], ["Revenue", L.rev, 1], ["Industry", L.branche, 1], ["Source", "Workflow 4"]],
    structured_output: [["score", String(L.score), 1], ["kategorie", cat, 1], ["begruendung", T(L.why || "", 40), 1]],
    ai_fallback: [["score", "0", 1, 2], ["kategorie", "Clarification", 1], ["begruendung", L.why, 1, 2]],
    process_ai_output: [["score", String(L.score), 1], ["kategorie", cat, 1], ["weg", way, 1], ["begruendung", T(L.why || "", 40), 1]],
    create_lead_record: [["Table", "Leads"], ["Record", "recX7…", 1], ["Status", "New", 1], ["Score", String(L.score), 1], ["Category", cat, 1]],
    route_by_category: [["Output", way], ["Then", {"Hot":"Approval, dossier, confirmation", "Clarification":"Clarification to sender and team"}[cat] || "–"]],
    telegram_approval_request: [["Chat", "Approval chat"], ["Text", "Hot lead (anonymised)"], ["Buttons", "Send / Discard"], ["Status", "sent", 1]],
    build_dossier: [["File", dossier, 1], ["Content", "Company, score, reasoning, mail"], ["Format", "HTML"]],
    send_dossier: [["To", "vertrieb@example.com"], ["Attachment", dossier], ["Status", "sent", 1]],
    telegram_new_lead: [["Chat", "Sales team"], ["Text", "New warm lead"], ["Status", "sent", 1]],
    send_confirmation: [["To", L.email], ["Subject", "Your inquiry has been received"], ["Status", "sent", 1]],
    email_clarification: [["To", L.email], ["Subject", "A short question about your inquiry"], ["Status", "sent", 1]],
    telegram_clarification: [["Chat", "Sales team"], ["Text", "Clarification request sent to " + L.name], ["Status", "sent", 1]],
    ping_success: [["Call", "…/ping/‹id›", 1], ["Answer", "200 OK"], ["Purpose", "Run ended cleanly"]]
  };
  return (rows[id] || []).map(r => ({k: r[0], v: r[1], nw: r[2] === 1, bad: (r[3] === 2) || r[2] === 2}));
}
// “Fall-spezifische Zusatzzeile unter 'Was die Node macht'.”
function EXTRA(id, c) {
  const k = c.kind;
  if (id === "ps_spam") return "<b>Here (end 1 of 3):</b> a spam run is also a successful run. Without this signal there would be a false alarm.";
  if (id === "ps_dup") return "<b>Here (end 2 of 3):</b> the follow-up message is processed, and the run has ended cleanly.";
  if (id === "ps_new") return "<b>Here (end 3 of 3):</b> the lead is stored. The ping runs in parallel to the routing.";
  if (id === "check_lead" && k === "spam1") return "<b>Here:</b> the message has only 2 characters, which is enough for the spam suspicion.";
  if (id === "drop_spam") return "<b>Here:</b> " + esc(c.L.reason) + ". Afterwards ping_success still reports ”run clean”.";
  if (id === "spam_gate" && k === "spam2") return "<b>Here:</b> no link, no spam rule applies, but the content is advertising. The model recognises it.";
  if (id === "is_duplicate" && k === "dup") return "<b>Here:</b> the address is already in Airtable.";
  if (id === "ai_agent" && k === "fail") return "<b>Here:</b> the AI service does not answer. The agent aborts, the node lights up red, and the run continues via ”Error”.";
  if (id === "ai_fallback") return "<b>Here:</b> the lead is not discarded but handled as a clarification.";
  if (id === "route_by_category") return "<b>Here:</b> category ”" + esc(c.L.cat) + "”.";
  return "";
}

// ---------- ABSCHNITT 3: Fenster der Außenwelt ----------
// “Mailfenster: Kopf steht fest, nur der Text wird getippt, dann Senden.”
function mailWin(el, o) {
  el.innerHTML = `<div class="win mailw"><div class="wbar"><span>${o.head}</span><span>✉</span></div>${o.rows.map(r => `<div class="mf"><i>${r[0]}</i><span>${esc(r[1])}</span></div>`).join("")}<div class="mbody"></div>${o.att ? `<div class="att">📎 ${esc(o.att)}</div>` : ""}<div class="msend"><span class="sbtn">Send</span><span class="sst"></span></div></div>`;
  const tl = gsap.timeline(), b = el.querySelector(".mbody"), st = el.querySelector(".sst"), btn = el.querySelector(".sbtn"), att = el.querySelector(".att");
  let t = typeTo(tl, b, o.body, 0.3, Math.max(1.2, Math.min(3.8, o.body.length / 60)));
  if (att) { gsap.set(att, {opacity: 0}); tl.to(att, {opacity: 1, duration: .3}, t + .1); t += .4; }
  tl.to(btn, {scale: .9, duration: .12, yoyo: true, repeat: 1}, t + .2);
  tl.add(() => { st.textContent = o.status; st.classList.add("ok"); }, t + .5);
  tl.from(st, {opacity: 0, x: -8, duration: .3}, t + .5);
  return tl;
}
// “Telegram-Fenster: Nachricht wird getippt, Knöpfe erscheinen, optional wird einer geklickt.”
function tgWin(el, o) {
  el.innerHTML = `<div class="win tg"><div class="tgh"><span class="av">LB</span><div><b>${o.who || "Lead bot"}</b><small>Bot</small></div></div><div class="tgb"><div class="bub"><div class="bt"></div>${o.btns ? '<div class="tbs">' + o.btns.map(b => `<span class="tb">${b}</span>`).join("") + "</div>" : ""}</div>${o.reply ? `<div class="bub rep">${o.reply}</div>` : ""}</div>${o.note ? `<div class="tnote">${o.note}</div>` : ""}</div>`;
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
// “Airtable-Tabelle: suchen, neue Zeile anlegen oder an eine Zeile anhängen. Platzhalter, bis die echten Screenshots da sind.”
function atWin(el, o) {
  const rows = [["Julia Wagner", "Wagner Construction", "Warm", "61", "Inquiry warehouse management"], ["Peter Lang", "Lang & Sons", "Cold", "18", "Question about the newsletter"], ["Jonas Fischer", "Fischer Metallbau", "Warm", "64", "First inquiry: invoice OCR"]];
  const pill = c => `<em class="pill ${PRIO[c] || ""}">${c}</em>`;
  const tr = (r, i) => `<div class="atr" data-i="${i}"><span>${esc(r[0])}</span><span>${esc(r[1])}</span><span>${r[2] ? pill(r[2]) : ""}</span><span>${esc(r[3])}</span><span class="vl">${esc(r[4])}</span></div>`;
  el.innerHTML = `<div class="win at${o.mode === "create" ? " cr" : ""}"><div class="wbar"><span>Airtable · Leads</span><span class="sbox"></span></div><div class="ath"><span>Name</span><span>Company</span><span>Category</span><span>Score</span><span>History</span></div>${rows.map(tr).join("")}${o.mode === "create" ? tr(["", "", "", "", ""], 9) : ""}<div class="atmsg"></div></div>`;
  const tl = gsap.timeline(), sb = el.querySelector(".sbox"), msg = el.querySelector(".atmsg");
  if (o.mode === "search") {
    let t = typeTo(tl, sb, "🔍 E-Mail = " + o.email, 0.2, 1.4);
    if (o.hit) { tl.add(() => el.querySelector('[data-i="2"]').classList.add("hl"), t + .3); tl.add(() => { msg.textContent = "1 hit: sender is known"; msg.className = "atmsg ok"; }, t + .4); }
    else tl.add(() => { msg.textContent = "No hits: sender is new"; msg.className = "atmsg"; }, t + .4);
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
    tl.add(() => { msg.textContent = "New record created"; msg.className = "atmsg ok"; }, t + .2);
    tl.from(msg, {opacity: 0, duration: .3}, t + .2);
  } else if (o.mode === "append") {
    const cell = el.querySelector('[data-i="2"] .vl'); cell.insertAdjacentHTML("beforeend", ' <b class="add"></b>');
    const add = cell.querySelector(".add");
    el.querySelector('[data-i="2"]').classList.add("hl");
    let t = typeTo(tl, add, "+ Follow-up: three locations", .3, 1.2);
    tl.add(() => { msg.textContent = "History updated"; msg.className = "atmsg ok"; }, t + .2);
    tl.from(msg, {opacity: 0, duration: .3}, t + .2);
  }
  return tl;
}
// “Healthchecks-Fenster: Ping kommt an, Punkt wird blau (running) oder grün (fertig).”
function pingWin(el, kind) {
  const start = kind === "start";
  el.innerHTML = `<div class="win hc"><div class="wbar dark"><span>Healthchecks.io</span><span>Checks</span></div><div class="hcrow"><span class="hcdot"></span><b>Lead Qualification · Intake and Scoring</b><span class="hcst">${start ? "waiting" : "running"}</span></div><div class="hclog"></div><div class="hcnote">${start ? "If no ping arrives at the end of the run, the run counts as failed." : "Stops the clock: the run counts as successful."}</div></div>`;
  const tl = gsap.timeline(), dot = el.querySelector(".hcdot"), s = el.querySelector(".hcst"), log = el.querySelector(".hclog");
  tl.add(() => log.innerHTML = `<div>→ GET …/ping/‹id›${start ? "/start" : ""}  <small>(aus n8n)</small></div>`, .3);
  tl.add(() => log.innerHTML += '<div class="ok">← 200 OK</div>', 1.1);
  tl.add(() => { dot.className = "hcdot " + (start ? "run" : "up"); s.textContent = start ? "running" : "successful"; }, 1.4);
  return tl;
}
// “Spam-Filter-Fenster: Claude Haiku bekommt die Mail und wählt eine Klasse.”
function classWin(el, c) {
  const spam = c.kind === "spam2";
  el.innerHTML = `<div class="win cls"><div class="wbar dark"><span class="lg">${ANTHROPIC} Claude Haiku · Spam filter</span><span></span></div><div class="cq">Mail from ${esc(c.L.name)}</div><div class="cmsg">“${esc(T(c.L.body.replace(/\n/g, " "), 150))}”</div><div class="chips"><span data-k="legit">legit</span><span data-k="spam">spam</span><span data-k="other">other</span></div><div class="cres"></div></div>`;
  const tl = gsap.timeline(), res = el.querySelector(".cres");
  gsap.set(el.querySelector(".cmsg"), {opacity: 0});
  tl.to(el.querySelector(".cmsg"), {opacity: 1, duration: .5}, .2);
  tl.add(() => { el.querySelector(`[data-k="${spam ? "spam" : "legit"}"]`).classList.add(spam ? "bad" : "good"); res.textContent = spam ? "Class: spam → the run ends" : "Class: legit → the run continues"; res.className = "cres " + (spam ? "bad" : "ok"); }, 1.3);
  tl.from(res, {opacity: 0, duration: .3}, 1.3);
  return tl;
}
// “Agent-Fenster: Claude Haiku arbeitet Tools ab oder scheitert.”
function agentWin(el, c) {
  const fail = c.kind === "fail";
  const lines = [["Task: score the lead (score 0 to 100, category)", ""], ["→ Tool read_imprint: read the legal notice", ""], ["→ Tool company_research: fetch company figures", ""]];
  lines.push(fail ? ["✕ Timeout: AI service not reachable", "err"] : ["← Answer as JSON in the fixed format", "ok"]);
  el.innerHTML = `<div class="win ag"><div class="wbar dark"><span class="lg">${ANTHROPIC} Claude Haiku · Agent</span><span></span></div><div class="aglines">${lines.map(l => `<div class="${l[1]}">${l[0]}</div>`).join("")}</div></div>`;
  const tl = gsap.timeline(), ls = el.querySelectorAll(".aglines div");
  gsap.set(ls, {opacity: 0, x: -10});
  tl.to(ls, {opacity: 1, x: 0, stagger: .6, duration: .35}, .2);
  return tl;
}
// “Impressum-Seite: eine fiktive Firmenseite.”
function imprintWin(el, c) {
  const L = c.L, ok = !!L.firma;
  el.innerHTML = `<div class="win br"><div class="wbar"><span>https://${esc(L.domain)}/impressum</span><span></span></div><div class="brb">${ok ? `<h5>Legal notice</h5><p><b>${esc(L.firma)}</b><br>Sample Street 12 · 20457 Hamburg</p><p>Commercial register: HRB 123456, Hamburg local court<br>Management: ${esc(L.name)}</p>` : `<h5 class="bad">404 · Page not found</h5><p>There is no company page at this address.</p>`}</div></div>`;
  const tl = gsap.timeline(); gsap.set(el.querySelector(".brb"), {opacity: 0}); tl.to(el.querySelector(".brb"), {opacity: 1, duration: .6}, .3); return tl;
}
// “Sub-Workflow-Fenster: Workflow 4 liefert Firmenzahlen.”
function subwfWin(el, c) {
  const L = c.L;
  el.innerHTML = `<div class="win sw"><div class="wbar dark"><span>Sub-workflow · Workflow 4 · Company Research</span><span></span></div><div class="swres"><span>Employees <b>${esc(L.emp)}</b></span><span>Revenue <b>${esc(L.rev)}</b></span><span>Industry <b>${esc(L.branche)}</b></span></div></div>`;
  const tl = gsap.timeline(), r = el.querySelectorAll(".swres span"); gsap.set(r, {opacity: 0, y: 8}); tl.to(r, {opacity: 1, y: 0, stagger: .3, duration: .3}, .8); return tl;
}
// “JSON-Fenster: die feste Antwortform wird getippt.”
function jsonWin(el, c) {
  const L = c.L, txt = `{\n  "score": ${L.score},\n  "kategorie": "${L.cat}",\n  "begruendung": "${T(L.why, 44)}"\n}`;
  el.innerHTML = `<div class="win js"><div class="wbar dark"><span>Answer in the fixed format</span><span></span></div><pre class="jb"></pre></div>`;
  const tl = gsap.timeline(); typeTo(tl, el.querySelector(".jb"), txt, .3, 1.6); return tl;
}

// ---------- ABSCHNITT 4: Welche Node bekommt welches Fenster ----------
// “Mail-Texte je Fall. Nur der Text wird getippt.”
function mailText(id, c) {
  const L = c.L, f = L.anrede || L.name;
  const t = {
    send_confirmation: `Hello ${f},\nthank you for your inquiry. We have received it and will get back to you within one working day.\nKind regards\nYour team`,
    email_clarification: `Hello ${f},\nso that we can help you in a targeted way, we need three more details: Which processes are involved? How many cases a week? By when should it run?\nKind regards\nYour team`,
    email_duplicate_notice: `Hello ${f},\nthank you for your addition. We have assigned it to your earlier inquiry. A new reply is not necessary.\nKind regards\nYour team`,
    send_dossier: `New hot lead: ${L.firma}.\nScore ${L.score}, category ${L.cat}. The dossier with company data, reasoning and original mail is attached.`
  };
  return t[id];
}
// “Gibt für eine Node das Fenster zurück: dir = 'in' (Ereignis kommt von außen, vor dem Aufleuchten) oder 'out' (nach dem Aufleuchten).”
function EV(id, c) {
  const L = c.L;
  const mailHead = (to, subj, att) => ({head: "Email sent", rows: [["From", "leads@example.com"], ["To", to], ["Subject", subj]], att, status: "✓ Sent"});
  switch (bid(id)) {
    case "email_trigger_imap": return {dir: "in", build: el => mailWin(el, {head: "New email", rows: [["To", "leads@example.com"], ["From", `${L.name} <${L.email}>`], ["Subject", L.subj]], body: L.body, status: "✓ Sent · lands in the mailbox ”Leads”"})};
    case "ping_start": return {dir: "out", build: el => pingWin(el, "start")};
    case "ping_success": return {dir: "out", build: el => pingWin(el, "success")};
    case "spam_gate": return {dir: "out", build: el => classWin(el, c)};
    case "search_lead": return {dir: "out", build: el => atWin(el, {mode: "search", email: L.email, hit: c.kind === "dup"})};
    case "append_followup": return {dir: "out", build: el => atWin(el, {mode: "append"})};
    case "create_lead_record": return {dir: "out", build: el => atWin(el, {mode: "create", vals: [L.name, L.firma || "(unknown)", L.cat, String(L.score), T(L.why, 30)]})};
    case "ai_agent": return {dir: "out", build: el => agentWin(el, c)};
    case "read_imprint": return {dir: "out", build: el => imprintWin(el, c)};
    case "company_research": return {dir: "out", build: el => subwfWin(el, c)};
    case "structured_output": return {dir: "out", build: el => jsonWin(el, c)};
    case "send_confirmation": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead(L.email, "Your inquiry has been received"), {body: mailText(id, c)}))};
    case "email_clarification": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead(L.email, "A short question about your inquiry"), {body: mailText(id, c)}))};
    case "email_duplicate_notice": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead(L.email, "Re: " + T(L.subj, 30)), {body: mailText(id, c)}))};
    case "send_dossier": return {dir: "out", build: el => mailWin(el, Object.assign(mailHead("vertrieb@example.com", "New hot lead: " + L.firma), {body: mailText(id, c), att: "dossier_" + L.firma.split(" ")[0].toLowerCase() + ".html"}))};
    case "telegram_approval_request": return {dir: "out", build: el => tgWin(el, {text: `🔥 Hot lead (anonymised)\nIndustry: ${L.branche} · about ${L.emp} employees\nScore ${L.score}: ${L.why}.\nThe dossier went to sales.`, btns: ["✓ Send", "✕ Discard"], click: 0, reply: "✓ Approved. The reply to the lead goes out.", note: "The click starts workflow 2 ”Hot Lead Approval”."})};
    case "telegram_followup": return {dir: "out", build: el => tgWin(el, {text: `↩ Follow-up message from a known lead\n${L.name}, ${L.firma}\n“${T(L.body.split("\n")[1], 70)}”`})};
    case "telegram_new_lead": return {dir: "out", build: el => tgWin(el, {text: "New warm lead received."})};
    case "telegram_clarification": return {dir: "out", build: el => tgWin(el, {text: `❓ Clarification needed\n${L.name} gave too little information.\nThe clarification mail is on its way.`})};
  }
  return null;
}
