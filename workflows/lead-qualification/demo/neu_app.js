// KONTEXT: Ablauf der neuen Demo: Titelfolie, Gesamtbild, Abschnittsansicht mit Fall-Auswahl und Pfeilen. Zeichnet den Canvas aus neu_data.js.
// BEISPIEL: Klick auf Abschnitt 2, Fall D wählen: die Kamera fährt hin, die erste Node (spam_gate) bekommt den Impuls, rechts erscheint die Beschreibung.

// ---------- ABSCHNITT 1: Hilfen ----------
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const W = $("#world"), SVG = $("#edges");
// “Stage 1920 mal 1080 an das Fenster anpassen.”
function fit() { const s = Math.min(innerWidth / 1920, innerHeight / 1080), st = $("#stage"); st.style.transform = `scale(${s})`; st.style.left = (innerWidth - 1920 * s) / 2 + "px"; st.style.top = (innerHeight - 1080 * s) / 2 + "px"; }
addEventListener("resize", fit); fit();
if (/[?&]fast/.test(location.search)) { gsap.globalTimeline.timeScale(60); document.documentElement.classList.add("fast"); }

// ---------- ABSCHNITT 2: Symbole der Nodes ----------
// “Eigene Zeichnungen im Stil von n8n: Farbe und Form je Node-Typ.”
const SW = 'fill="none" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"';
const IC = {
  imap:`<g ${SW} stroke="#22d36f"><rect x="7" y="8" width="34" height="32" rx="10"/><path d="M7 25h9l3 5h10l3-5h9"/></g>`,
  set:`<g ${SW} stroke="#8c8cff"><path d="M21 11H13a4 4 0 0 0-4 4v20a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4v-8"/><path d="M34 8l6 6-15 15-8 2 2-8z"/></g>`,
  code:`<g ${SW} stroke="#ffb057"><path d="M18 9c-6 0-5 5-5 8v3c0 3-2 4-5 4 3 0 5 1 5 4v3c0 3-1 8 5 8"/><path d="M30 9c6 0 5 5 5 8v3c0 3 2 4 5 4-3 0-5 1-5 4v3c0 3 1 8-5 8"/></g>`,
  if:`<g ${SW} stroke="#22d36f"><path d="M7 14h9c6 0 7 5 9 9s4 9 10 9h5"/><path d="M7 32h8"/><path d="M33 8l6 6-6 6"/><path d="M33 26l6 6-6 6"/><path d="M16 14h18"/></g>`,
  noop:`<g ${SW} stroke="#f3f4f6"><path d="M8 14l10 10L8 34"/><path d="M21 14l10 10-10 10"/><path d="M34 24h6"/></g>`,
  ping:`<rect x="6" y="6" width="36" height="36" rx="9" fill="#123f36"/><g ${SW} stroke="#2dd4bf" stroke-width="3"><path d="M9 25h7l3-8 5 15 4-11 2 4h9"/></g>`,
  airtable:`<path d="M24 7L6 14.5l18 7.5 18-7.5z" fill="#ffbf00"/><path d="M6 19v15l15 6.5V25.5z" fill="#f82b60"/><path d="M42 19v15l-15 6.5V25.5z" fill="#18bfff"/>`,
  telegram:`<circle cx="24" cy="24" r="19" fill="#2aa7e8"/><path d="M11 23.5l22-8.5c1-.4 2 .2 1.6 1.8l-3.8 17.6c-.3 1.2-1 1.5-2 .9l-5.6-4.2-2.7 2.6c-.3.3-.6.6-1.2.6l.4-5.7 10.4-9.4c.5-.4-.1-.6-.7-.2L16 28.9l-5.5-1.7c-1.2-.4-1.2-1.2.5-1.7z" fill="#fff"/>`,
  mail:`<g ${SW} stroke="#f3f4f6"><rect x="7" y="11" width="34" height="26" rx="5"/><path d="M8 15l16 12 16-12"/></g>`,
  switch:`<g ${SW} stroke="#4aa3ff"><path d="M7 24h10c5 0 6-9 12-9h10"/><path d="M17 24h22"/><path d="M7 24h10c5 0 6 9 12 9h10"/><path d="M35 10l5 5-5 5"/><path d="M35 28l5 5-5 5"/></g>`,
  merge:`<g ${SW} stroke="#7dd3fc"><path d="M7 13h12c6 0 8 11 14 11h8"/><path d="M7 35h12c6 0 8-11 14-11"/><path d="M35 19l6 5-6 5"/></g>`,
  classifier:`<g ${SW} stroke="#f3f4f6"><path d="M8 13a3 3 0 0 1 3-3h13l16 14-12 14H11a3 3 0 0 1-3-3z" transform="translate(0 -2)"/><circle cx="17" cy="21" r="2.4" fill="#f3f4f6"/></g>`,
  agent:`<g ${SW} stroke="#f3f4f6"><rect x="9" y="17" width="30" height="22" rx="9"/><circle cx="19" cy="28" r="2.6" fill="#f3f4f6"/><circle cx="29" cy="28" r="2.6" fill="#f3f4f6"/><path d="M24 17v-7"/><circle cx="24" cy="8" r="2.4"/></g>`,
  openai:`<g ${SW} stroke="#f3f4f6" stroke-width="3"><rect x="14" y="8" width="20" height="32" rx="10"/><rect x="14" y="8" width="20" height="32" rx="10" transform="rotate(60 24 24)"/><rect x="14" y="8" width="20" height="32" rx="10" transform="rotate(120 24 24)"/></g>`,
  http:`<g ${SW} stroke="#8c8cff"><circle cx="24" cy="24" r="16"/><path d="M8 24h32M24 8c-8 9-8 23 0 32M24 8c8 9 8 23 0 32"/></g>`,
  toolwf:`<g ${SW} stroke="#f3f4f6"><path d="M8 24h20"/><path d="M21 16l8 8-8 8"/><path d="M34 10h5v28h-5"/></g>`,
  parser:`<g ${SW} stroke="#f3f4f6"><path d="M17 8c-6 0-5 5-5 8v4c0 3-2 4-5 4 3 0 5 1 5 4v4c0 3-1 8 5 8"/><path d="M31 8c6 0 5 5 5 8v4c0 3 2 4 5 4-3 0-5 1-5 4v4c0 3 1 8-5 8"/><path d="M19 24l4 4 7-8"/></g>`
};
const RETRY = '<svg class="rt" viewBox="0 0 16 16"><path d="M3 7a4 4 0 0 1 7-2.500M13 9a4 4 0 0 1-7 2.500M10 2.500V5H7.500M6 13.500V11h2.500" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// “Zubehör-Beschriftungen an den Rauten unten am Agent.”
const AGENT_PORTS = ["Chat Model", "Memory", "Tool", "Output Parser"];
const SUBLABEL = {chat_model:"Model", spam_gate_model:"Model", read_imprint:"Tool", company_research:"Tool", structured_output:"Output Parser"};

// ---------- ABSCHNITT 3: Welt zeichnen ----------
W.style.width = WW + "px"; W.style.height = WH + "px";
SVG.setAttribute("width", WW); SVG.setAttribute("height", WH); SVG.setAttribute("viewBox", `0 0 ${WW} ${WH}`);
const px = x => x - OX, py = y => y - OY;
// “Dezente Rahmen der Abschnitte mit farbiger Überschrift oben links.”
const frameEls = {};
SEC.forEach(s => { const f = s.frame, d = document.createElement("div"); d.className = "frame"; d.dataset.sec = s.n; Object.assign(d.style, {left: px(f[0]) + "px", top: py(f[1]) + "px", width: f[2] - f[0] + "px", height: f[3] - f[1] + "px"}); d.style.setProperty("--fc", s.color); d.innerHTML = `<div class="ft" style="color:${s.color}"><span class="n">${s.n}. </span>${s.title.replace(/^\d\.\s*/, "")}</div>`; W.appendChild(d); frameEls["s" + s.n] = d; });
// “Trennlinie nach Abschnitt 4: hier endet der Workflow, danach beginnt das Band von vorn (nur im Gesamtbild sichtbar).”
const OV_GAP = 120;
{ const eb = SEC[3].frame, el = document.createElement("div"); el.className = "endline"; Object.assign(el.style, {left: px(eb[0]) + "px", top: py(eb[3] + OV_GAP / 2) + "px", width: eb[2] - eb[0] + "px"}); el.innerHTML = "<span>End of the workflow</span>"; W.appendChild(el); }
// “Anschluss-Punkte einer Node.”
const outN = n => n.outs ? n.outs.length : 1;
const sockOut = (n, i) => [n.x + n.w, n.y + n.h * (i + 1) / (outN(n) + 1)];
const sockIn = (n, i) => [n.x, n.y + n.h * (i + 1) / ((n.ins || 1) + 1)];
// “Linie mit runden Ecken durch Eckpunkte.”
function rounded(pts, r) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], v1 = [p1[0] - p0[0], p1[1] - p0[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]), rr = Math.min(r, l1 / 2, l2 / 2);
    d += `L${p1[0] - v1[0] / l1 * rr} ${p1[1] - v1[1] / l1 * rr}Q${p1[0]} ${p1[1]} ${p1[0] + v2[0] / l2 * rr} ${p1[1] + v2[1] / l2 * rr}`;
  }
  const e = pts[pts.length - 1]; return d + `L${e[0]} ${e[1]}`;
}
// “Pfeilspitze (Dreieck) an Punkt (x,y) in Richtung (ux,uy).”
const tri = (x, y, ux, uy, s = 7) => `M${x + ux * s} ${y + uy * s}L${x - ux * s - uy * s * .8} ${y - uy * s + ux * s * .8}L${x - ux * s + uy * s * .8} ${y - uy * s - ux * s * .8}Z`;
// “Pfad einer Linie berechnen (Welt-Pixel). pts = Eckpunkte bei geraden Linien, sonst Kurve.”
function geom(e) {
  const a = NODES[e[0]], b = NODES[e[1]], rt = e[5] || {};
  if (e[4] === "ai") {
    const x1 = a.x + a.w / 2, y1 = a.y, x2 = e[1] === "spam_gate" ? b.x + 48 : b.x + 40 + 78 * DIAMOND[e[0]], y2 = b.y + b.h;
    return {d: `M${px(x1)} ${py(y1)}C${px(x1)} ${py(y1 - 70)} ${px(x2)} ${py(y2 + 70)} ${px(x2)} ${py(y2)}`};
  }
  const A = sockOut(a, e[2]), B = sockIn(b, e[3]);
  // “Fluglinie (Abschnitt 4): kurze durchgezogene Linie aus dem Ausgang bis zum Bündelpunkt (x = rt.fly), von dort gerade, gepunktet zur Ziel-Node. Der Impuls running über beides.”
  if (rt.fly != null) { const P = [rt.fly, A[1]], dx = Math.max(40, (B[0] - P[0]) / 2), cv = `C${px(P[0] + dx)} ${py(P[1])} ${px(B[0] - dx)} ${py(B[1])} ${px(B[0])} ${py(B[1])}`; return {d: `M${px(P[0])} ${py(P[1])}${cv}`, full: `M${px(A[0])} ${py(A[1])}L${px(P[0])} ${py(P[1])}${cv}`, stub: `M${px(A[0])} ${py(A[1])}L${px(P[0])} ${py(P[1])}`, noMid: 1}; }
  let pts = null;
  if (rt.w) pts = [A].concat(rt.w, [B]);
  else if (rt.ch != null) pts = [A, [A[0] + 22, A[1]], [A[0] + 22, rt.ch], [rt.lx, rt.ch], [rt.lx, B[1]], B];
  if (pts) { pts = pts.map(p => [px(p[0]), py(p[1])]); return {d: rounded(pts, 14), pts, noMid: rt.noMid}; }
  const dx = Math.max(40, (B[0] - A[0]) / 2);
  return {d: `M${px(A[0])} ${py(A[1])}C${px(A[0] + dx)} ${py(A[1])} ${px(B[0] - dx)} ${py(B[1])} ${px(B[0])} ${py(B[1])}`, noMid: rt.noMid};
}
// “Mini-Pfeile liegen immer auf der Linie und zeigen in ihre Laufrichtung: einer kurz vor dem Ziel, bei langen Linien einer in der Mitte.”
function arrowsOf(g, base, kind) {
  const L = base.getTotalLength(), out = [];
  const at = l => { const p = base.getPointAtLength(l), q = base.getPointAtLength(Math.max(0, l - 2)), r = base.getPointAtLength(Math.min(L, l + 2)), dx = r.x - q.x, dy = r.y - q.y, n = Math.hypot(dx, dy) || 1; return [p.x, p.y, dx / n, dy / n]; };
  if (kind !== "ai") out.push(at(L - 13));
  if (!g.noMid && L > 240) {
    if (g.pts) {
      let best = null, bl = 0;
      for (let i = 0; i < g.pts.length - 2; i++) { const l = Math.hypot(g.pts[i + 1][0] - g.pts[i][0], g.pts[i + 1][1] - g.pts[i][1]); if (l > bl) { bl = l; best = i; } }
      if (best != null && bl >= 130) { const p = g.pts[best], q = g.pts[best + 1]; out.push([(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (q[0] - p[0]) / bl, (q[1] - p[1]) / bl]); }
    } else out.push(at(L / 2));
  }
  return out;
}
const stubSeen = new Set();
EDGES.forEach((e, i) => {
  const g = geom(e), el = document.createElementNS("http://www.w3.org/2000/svg", "g");
  el.setAttribute("class", "eg" + (e[4] === "ai" ? " ai" : "") + (e[5] && e[5].alt ? " alt" : "") + (e[5] && e[5].fly != null ? " fly" : "") + (NODES[e[0]].sec !== NODES[e[1]].sec ? " x" : "")); el.id = "eg" + i;
  // “Fluglinie: die Stub-Linie (grau fest, grün wenn aktiv) liegt unter dem gepunkteten Teil.”
  const stubs = g.stub ? `${stubSeen.has(e[0] + e[2]) ? "" : `<path class="stub0" d="${g.stub}"/>`}<path class="stub1" d="${g.stub}"/>` : "";
  if (g.stub) stubSeen.add(e[0] + e[2]);
  el.innerHTML = `${stubs}<path class="base" d="${g.d}"/><path class="pulse" d="${g.full || g.d}"/><circle class="dot" r="8" cx="-50" cy="-50"/>`;
  SVG.appendChild(el);
  const base = el.querySelector(".base");
  const ar = arrowsOf(g, base, e[4]).map(a => `<path class="arr" d="${tri(a[0], a[1], a[2], a[3])}"/>`).join("");
  el.querySelector(".pulse").insertAdjacentHTML("beforebegin", ar);
});
// “Nodes bauen.”
const nodeEls = {};
Object.values(NODES).forEach(n => {
  const d = document.createElement("div"); d.className = "node" + (n.circle ? " circ" : "") + (n.trig ? " trig" : "") + (n.t === "ping" ? " ping" : "") + ((n.t === "agent" || n.t === "classifier") ? " wide" : "") + (n.t === "agent" ? " ag" : "") + (n.t === "switch" ? " sw" : "");
  d.id = "n_" + n.id; d.style.setProperty("--k", n.k); Object.assign(d.style, {left: px(n.x) + "px", top: py(n.y) + "px", width: n.w + "px", height: n.h + "px"});
  const ic = IC[n.t] || "";
  const inner = n.t === "agent" || n.t === "classifier" ? `<svg class="ic" viewBox="0 0 48 48">${ic}</svg><span class="nm">${nm(n.id)}</span>` : `<svg class="ic" viewBox="0 0 48 48">${ic}</svg>`;
  let h = `<div class="tile">${n.trig ? '<svg class="bolt" viewBox="0 0 22 28"><path d="M13 0L0 16h9l-3 12L22 10h-9z"/></svg>' : ""}${inner}${n.retry ? RETRY : ""}</div>`;
  // “Anschlüsse: Eingang links (außer Trigger und Zubehör), Ausgänge rechts mit Namen.”
  if (!n.trig && !n.circle) for (let i = 0; i < (n.ins || 1); i++) h += `<span class="sock" style="left:-6px;top:${n.h * (i + 1) / ((n.ins || 1) + 1) - 6}px"></span>`;
  if (!n.circle) for (let i = 0; i < outN(n); i++) {
    const y = n.h * (i + 1) / (outN(n) + 1);
    h += `<span class="sock" style="left:${n.w - 6}px;top:${y - 6}px"></span>`;
    if (n.outs) h += `<span class="olab" style="left:${n.w + 8}px;top:${y}px">${n.outs[i]}</span>`;
  }
  if (n.plus || n.plus4) { const i = n.plus4 ? 4 : 0, y = n.h * (i + 1) / (outN(n) + 1), off = n.plus4 ? 124 : 6; h += `<span class="pl" style="left:${n.w + off}px;top:${y - 11}px"><i></i><b>+</b></span>`; }
  if (n.t === "agent") { AGENT_PORTS.forEach((p, i) => { const x = 40 + 78 * i; h += `<span class="dia" style="left:${x - 5}px;top:${n.h - 5}px"></span><span class="plab" style="left:${x}px;top:${n.h + 6}px">${p}</span>`; if (i === 1 || i === 2) h += `<span class="pl v" style="left:${x - 11}px;top:${n.h + 38}px"><i></i><b>+</b></span>`; }); }
  if (n.t === "classifier") h += `<span class="dia" style="left:${48 - 5}px;top:${n.h - 5}px"></span><span class="plab" style="left:48px;top:${n.h + 6}px">Model*</span>`;
  if (n.circle) h += `<span class="dia" style="left:${n.w / 2 - 5}px;top:-5px"></span><span class="plab" style="left:${n.w / 2}px;top:-24px">${SUBLABEL[n.id]}</span>`;
  // “Name unter der Node (bei Agent und Klassifizierer steht er im Kasten).”
  if (n.t !== "agent" && n.t !== "classifier") h += `<div class="lbl" style="top:${n.h + 10}px">${nm(n.id)}${n.sub ? `<small>${n.sub}</small>` : ""}</div>`;
  d.innerHTML = h; W.appendChild(d); nodeEls[n.id] = d;
});
// “Zweite Kopie der Welt für das endlos laufende Gesamtbild (Band): alle ids bekommen _c.”
const W2 = W.cloneNode(true); W2.id = "world2"; W2.style.display = "none";
W2.querySelectorAll("[id]").forEach(e => e.id += "_c");
W.parentNode.appendChild(W2);
const frameEls2 = {}; W2.querySelectorAll(".frame").forEach(f => frameEls2["s" + f.dataset.sec] = f);
gsap.set([W, W2], {transformOrigin: "0 0"});

// ---------- ABSCHNITT 4: Kamera ----------
// “Fläche links für den Canvas: im Gesamtbild schmal (Canvas ist hoch), in der Abschnittsansicht breit zwischen oberer und unterer Leiste.”
const PANE_SEC = {x: 196, y: 238, w: 1034, h: 660}, PANE_OV = {x: 944, y: 30, w: 700, h: 1020};
// “Kamera so setzen, dass der Rahmen (Welt-Koordinaten) in die Fläche passt, zentriert.”
function camTo(rect, pane, dur, top, cap) {
  const rw = rect[2] - rect[0], rh = rect[3] - rect[1], s = Math.min(pane.w / rw, pane.h / rh, cap || Infinity);
  const x = pane.x + (pane.w - rw * s) / 2 - px(rect[0]) * s, y = pane.y + (top ? 0 : (pane.h - rh * s) / 2) - py(rect[1]) * s;
  gsap.to(W, {x, y, scale: s, duration: dur, ease: "power2.inOut", overwrite: true});
}
const OV_RECT = [-100, 3436, 1168, 6342];

// ---------- ABSCHNITT 4b: Gesamtbild als Band (running von oben nach unten, ein Fall running mit) ----------
const OV = {tl: null, Ps: 0, x: 0, y0: 0, s: 1, V: 15.84, TPER: 1, sched: [], sc: {t: 0}};
const SUF = ["", "_c"];
// “Maßstab so, dass der Canvas die Fläche links in der Breite füllt; Ps = Länge einer Runde in Pixeln.”
function ovGeom() {
  const rw = OV_RECT[2] - OV_RECT[0], s = PANE_OV.w / rw;
  OV.s = s; OV.x = PANE_OV.x - px(OV_RECT[0]) * s; OV.y0 = PANE_OV.y - py(OV_RECT[1]) * s; OV.Ps = (OV_RECT[3] - OV_RECT[1] + OV_GAP) * s;
}
// “Beide Kopien verschieben: Stand des Bands = Tempo mal Zeit der Zeitleiste. Die zweite Kopie liegt genau eine Runde darunter, so gibt es keinen Sprung.”
function ovApply() {
  const t = OV.tl ? OV.tl.time() : 0, o = ((OV.V * t) % OV.Ps + OV.Ps) % OV.Ps;
  gsap.set(W, {x: OV.x, y: OV.y0 - o, scale: OV.s}); gsap.set(W2, {x: OV.x, y: OV.y0 - o + OV.Ps, scale: OV.s});
}
// “Alle Farben der Fall-Animation in beiden Kopien löschen.”
function ovClear() {
  [W, W2].forEach(w => {
    w.querySelectorAll(".node").forEach(n => n.classList.remove("done", "lit", "bad", "doneb"));
    w.querySelectorAll(".eg").forEach(g => { g.classList.remove("on", "run"); gsap.set(g.querySelector(".pulse"), {opacity: 0}); gsap.set(g.querySelector(".dot"), {attr: {cx: -50, cy: -50}}); });
  });
}
// “Node j leuchtet, die davor wird dezent grün (in beiden Kopien).”
function ovLight(j, steps = CASES.A.steps) {
  SUF.forEach(f => { if (j > 0) { const p = $("#n_" + steps[j - 1].id + f); p.classList.remove("lit"); p.classList.add("done"); } $("#n_" + steps[j].id + f).classList.add("lit"); });
}
// “Stand der Fall-Animation zur Zeit t sofort zeichnen (nach Vor- und Zurückspulen).”
function ovPaintAt(t) {
  ovClear();
  const done = OV.sched.filter(x => x.t <= t);
  done.forEach((x, k) => SUF.forEach(f => { $("#n_" + x.id + f).classList.add(k === done.length - 1 ? "lit" : "done"); x.eds.forEach(ei => gEl(ei, f).classList.add("on")); }));
}
// “Band starten: eine Zeitleiste zieht das Bild nach oben (wie der Workflow von oben nach unten running) und spielt Fall A einmal pro Runde ab.”
function startReel() {
  stopReel(); ovGeom(); W2.style.display = "block";
  // “Bandgeschwindigkeit in Pixeln pro Sekunde. Eine Runde dauert Ps geteilt durch das Tempo.”
  const V = 15.84, T0 = 0.8, FRAC = 0.6; OV.V = V; OV.TPER = OV.Ps / V; OV.sched = []; OV.sc = {t: 0};
  const steps = CASES.A.steps, first = NODES[steps[0].id], last = NODES[steps[steps.length - 1].id];
  const scr = n => PANE_OV.y + (n.y + n.h / 2 - OV_RECT[1]) * OV.s;
  // “Der Lauf endet so, dass die letzte Node bei 60 Prozent der Höhe von oben steht.”
  const target = PANE_OV.y + FRAC * PANE_OV.h, tEnd = (scr(last) - target) / V, Trun = Math.max(8, tEnd - T0);
  const ys0 = scr(first) - V * T0, k = (target - ys0) / Trun;
  const tl = gsap.timeline({repeat: -1, onRepeat: () => { if (OV.hov) { OV.hov.kill(); OV.hov = null; } ovClear(); OV.run.timeScale(1); OV.run.restart(); }}); OV.tl = tl; const run = gsap.timeline(); OV.run = run; OV.arrived = false;
  tl.to({}, {duration: OV.TPER, onUpdate: ovApply}, 0);
  let prev = -9;
  steps.forEach((s, j) => {
    const n = NODES[s.id];
    let t = Math.max(T0 + 0.7, Math.min(tEnd, (scr(n) - ys0 + k * T0) / (V + k)));
    t = Math.max(t, prev + 0.55); prev = t;
    const eds = [edgeOf(s)].concat((s.also || []).map(x => edgeIdx(x[0], x[1], x[2]))).filter(i => i >= 0);
    OV.sched.push({t, id: s.id, eds});
    eds.forEach(ei => SUF.forEach(f => run.add(pulseTween(ei, f, 0.7), t - 0.7)));
    run.add(() => ovLight(j), t);
  });
  ovApply(); reelSeek();
}
// “Mit der Maus über einem Abschnitt rechts: das Band spult (vor oder zurück, der kürzere Weg), bis dieser Abschnitt mittig steht, und hält dort an.”
// “Filter im Band nur für den angehoverten Abschnitt entfernen (Nodes und Linien in beiden Kopien).”
function ovUnfilter(n) {
  document.querySelectorAll(".unf,.foc").forEach(e => e.classList.remove("unf", "foc"));
  [W, W2].forEach(w => w.classList.toggle("hov", !!n));
  if (!n) return;
  document.querySelectorAll('.frame[data-sec="' + n + '"]').forEach(e => e.classList.add("foc"));
  Object.keys(NODES).forEach(id => { if (NODES[id].sec === n) SUF.forEach(f => { const e = $("#n_" + id + f); if (e) e.classList.add("unf"); }); });
  EDGES.forEach((e, i) => { if (NODES[e[0]].sec === n) SUF.forEach(f => { const g = gEl(i, f); if (g) g.classList.add("unf"); }); });
}
function ovFocus(n) {
  if (!OV.tl) return;
  ovUnfilter(n);
  OV.tl.pause(); OV.run.pause(); OV.arrived = false; if (OV.hov) { OV.hov.kill(); OV.hov = null; } gsap.killTweensOf(OV.sc);
  const f = SEC[n - 1].frame, Yc = f[1];
  // “Fester Slot: die Oberkante des Abschnitts steht immer auf Höhe der Oberkante der ersten Karte links.”
  let target = PANE_OV.y + 200; const cd = document.querySelector('.card[data-sec="1"]');
  if (cd) { const r = cd.getBoundingClientRect(), sr = $("#stage").getBoundingClientRect(); target = (r.top - sr.top) / (sr.height / 1080); }
  let tT = ((OV.y0 + py(Yc) * OV.s - target) / OV.V) % OV.TPER; if (tT < 0) tT += OV.TPER;
  const cur = OV.tl.time(); let best = tT;
  [tT - OV.TPER, tT, tT + OV.TPER].forEach(c => { if (Math.abs(c - cur) < Math.abs(best - cur)) best = c; });
  OV.sc.t = cur;
  const seek = tt => { OV.tl.time(((tt % OV.TPER) + OV.TPER) % OV.TPER, true); ovApply(); };
  gsap.to(OV.sc, {t: best, duration: Math.min(.9, Math.max(.4, Math.abs(best - cur) / 60)), ease: "power2.inOut", onUpdate: () => seek(OV.sc.t), onComplete: () => ovStartAt(n)});
}
// “Maus weg: Band running ab dem erreichten Punkt normal weiter.”
// “Band steht auf dem Abschnitt: alle möglichen Wege durch diesen Abschnitt laufen nacheinander in einer Schleife. Die Linie aus dem Abschnitt davor running langsam, im Abschnitt selbst running es schnell.”
function ovStartAt(n) {
  const seen = new Set(), vars = [];
  Object.keys(CASES).forEach(k => {
    const st = CASES[k].steps, a = st.findIndex(x => NODES[x.id].sec === n);
    if (a < 0) return;
    let b = a + 1; while (b < st.length && NODES[st[b].id].sec === n) b++;
    const sig = st.slice(a, b).map(x => x.id).join(); if (seen.has(sig)) return; seen.add(sig); vars.push({st, a, b});
  });
  if (!vars.length) { ovResume(); return; }
  ovClear(); OV.arrived = true;
  const h = gsap.timeline({repeat: -1, repeatDelay: 0.8}); OV.hov = h;
  let t = 0;
  vars.forEach(v => {
    h.add(() => { ovClear(); if (v.a > 0) SUF.forEach(f => $("#n_" + v.st[v.a - 1].id + f).classList.add("lit")); }, t);
    for (let j = v.a; j < v.b; j++) {
      const s = v.st[j], dur = (j === v.a && v.a > 0) ? 1.6 : 0.4;
      const eds = [edgeOf(s)].concat((s.also || []).map(x => edgeIdx(x[0], x[1], x[2]))).filter(i => i >= 0);
      eds.forEach(ei => SUF.forEach(f => h.add(pulseTween(ei, f, dur), t)));
      h.add(() => ovLight(j, v.st), t + dur); t += dur + 0.1;
    }
    t += 1.0;
  });
}
// “Normalen Durchlauf passend zur Bandposition wieder aufnehmen.”
function ovResume() { ovPaintAt(OV.tl.time()); OV.run.time(OV.tl.time(), true); OV.run.timeScale(1); OV.run.play(); OV.arrived = false; }
function ovBlur() { if (!OV.tl) return; ovUnfilter(0); gsap.killTweensOf(OV.sc); OV.tl.resume(); if (OV.hov) { OV.hov.kill(); OV.hov = null; } ovResume(); }
// “Nur zum Prüfen: ?t=12 springt das Band auf Sekunde 12 und hält an.”
function reelSeek() { const m = location.search.match(/[?&]t=(\d+)/); if (m && OV.tl) { OV.tl.pause(); OV.run.pause(); OV.run.time(+m[1], true); OV.tl.time(+m[1], true); ovApply(); ovPaintAt(+m[1]); } }
function stopReel() { if (OV.hov) { OV.hov.kill(); OV.hov = null; } gsap.killTweensOf(OV.sc); OV.arrived = false; if (OV.run) { OV.run.kill(); OV.run = null; } if (OV.tl) { OV.tl.kill(); OV.tl = null; } ovClear(); W2.style.display = "none"; }

// ---------- ABSCHNITT 5: Zustand ----------
const S = {view: "title", sec: 1, c: null, k: -1};
let TL = null, EVTL = null;
const stepsOf = () => S.c ? CASES[S.c].steps : [];
// “Nodes aus einem anderen Abschnitt, die ein Fall im Start-Abschnitt mitzeigt (Fall C: das Spam-Gate erscheint schon in Abschnitt 1, ohne Wechsel).”
const VIS = {C: ["spam_gate"]};
const extraIn = id => !!(S.c && VIS[S.c] && VIS[S.c].includes(id));
const secOf = id => extraIn(id) ? CASE_SEC[S.c] : NODES[id].sec;
// “Alle Schritte eines Falls in einem Abschnitt (als Positionen in der Schrittliste).”
const idxIn = (sec, c) => c ? c.steps.map((s, i) => i).filter(i => secOf(c.steps[i].id) === sec) : [];
// “Linie zu einem Schritt finden: Zubehör (von Zubehör zum Ziel) oder normale Linie (von Vorgänger, optional Ausgang).”
function edgeOf(s) {
  if (s.to) return EDGES.findIndex(e => e[0] === s.id && e[1] === s.to);
  if (!s.from) return -1;
  return EDGES.findIndex(e => e[0] === s.from && e[1] === s.id && (s.io == null || e[2] === s.io));
}
const edgeIdx = (a, b, io) => EDGES.findIndex(e => e[0] === a && e[1] === b && e[2] === io);
const gEl = (i, f = "") => $("#eg" + i + f);

// ---------- ABSCHNITT 6: Ansicht wechseln ----------
function setView(v) { if (typeof ovUnfilter === "function") ovUnfilter(0);
  S.view = v;
  $("#title").classList.toggle("on", v === "title");
  $("#cv").classList.toggle("on", v !== "title");
  $("#ovp").classList.toggle("on", v === "overview");
  $("#sp").classList.toggle("on", v === "sec"); $("#ip").classList.toggle("on", v === "sec");
  // “Abschnittsname und orangener Hinweis gibt es nur in der Abschnittsansicht.”
  if (v !== "sec") { $("#secname").classList.remove("on"); $("#endh").classList.remove("on"); }
  $("#tbar").classList.toggle("on", v === "sec");
  $("#bbar").classList.toggle("on", v === "sec");
  $("#toTitle").classList.toggle("on", v === "overview");
  W.classList.toggle("ov", v === "overview"); W2.classList.toggle("ov", v === "overview");
  $("#cv").classList.toggle("ovm", v === "overview");
  // “Abschnittsansicht: Karte um das Canvas, Canvas auf die Karte beschnitten (nichts blutet unter die Leisten).”
  $("#cv").classList.toggle("secm", v === "sec"); $("#cardbg").classList.toggle("on", v === "sec"); $("#cardfr").classList.toggle("on", v === "sec");
  if (v !== "sec") $("#gate").classList.remove("on");
  if (v !== "overview") stopReel();
}
function showOverview(anim = true) {
  killAll(); S.c = null; S.k = -1; setView("overview"); resetPaint(); dimFor(0);
  gsap.killTweensOf([W, W2]); startReel();
  setHash();
}
// “Obere und untere Leiste: wohin ↑ und ↓ führen (vorheriger oder nächster Abschnitt, sonst Gesamtansicht).”
function fillBars(n) {
  const prev = SEC[n - 2], next = SEC[n];
  // “Ganz oben (Abschnitt 1) und ganz unten (Abschnitt 4) führt nichts weiter: nur der Button Gesamtübersicht bringt zurück.”
  $("#tbar").innerHTML = `<span class="ar">↑</span><span class="lab"><small>${prev ? "Previous section" : "Start"}</small><b>${prev ? prev.title : "First section"}</b></span>`;
  $("#bbar").innerHTML = `<span class="ar">↓</span><span class="lab"><small>${next ? "Next section" : "End"}</small><b>${next ? next.title : "Choose another case"}</b></span>`;
  $("#tbar").classList.toggle("end", !prev); $("#bbar").classList.toggle("end", !next);
}
// “Hinweis “Run ends here”: nur wenn der Fall vor dem Ende von Abschnitt 4 aufhört (Stopp), und nur im Abschnitt, in dem er endet oder abgefangen wird.”
const ENDHINT = {
  B: "The rules detect spam. Nothing is stored, no reply is sent and no AI is paid for.",
  C: "The rules let the mail through, the AI model in ”Check spam with AI” classifies it as spam. The run ends at ”End run”, nothing is stored.",
  D: "The sender is known: the message is appended and the team is informed. The AI scoring is skipped."
};
const PANE_HINT = {x: 196, y: 238, w: 1034, h: 568};
function hintOn(n) {
  const c = S.c ? CASES[S.c] : null; if (!c || !ENDHINT[c.id]) return false;
  const last = c.steps[c.steps.length - 1], ls = secOf(last.id);
  return (ls < 4 || !!last.stop) && (n === ls || n === CASE_SEC[c.id]);
}
// “Kamera auf einen Abschnitt; mit Hinweis bleibt unten ein Streifen frei.”
// “Gleicher Maßstab für alle Abschnitte (bestimmt vom größten), damit jeder Canvas auf dem Bildschirm gleich breit ist.”
const SEC_S = Math.min(...SEC.map(s => PANE_SEC.w / (s.frame[2] - s.frame[0] + 28)), ...SEC.map(s => PANE_SEC.h / (s.frame[3] - s.frame[1] + 28)));
function secCam(n, dur) {
  const f = SEC[n - 1].frame, pad = n === 3 ? 44 : 14; let bot = f[3] + pad;
  // “Mitgezeigte Nodes (Fall C: spam_gate) müssen mit ins Bild.”
  if (S.c && VIS[S.c] && CASE_SEC[S.c] === n) VIS[S.c].forEach(id => { bot = Math.max(bot, NODES[id].y + (NODES[id].h || 96) + 40); });
  camTo([f[0] - pad, f[1] - 14, f[2] + pad, bot], hintOn(n) ? PANE_HINT : PANE_SEC, dur, true);
}
// “Abschnitt zeigen: Kamera, Hervorhebung, Panel füllen.”
function showSection(n, anim = true, k = null, quick = false, hold = false) {
  const from = S.view === "sec" ? S.sec : 0;
  killAll(); RUN++; S.sec = n; setView("sec");
  secCam(n, anim ? (quick ? 0.6 : 1.1) : 0.01);
  fillBars(n);
  S.k = -1; dimFor(n); resetPaint();
  const c = S.c ? CASES[S.c] : null, idx = idxIn(n, c);
  if (c && idx.length && hold) { ["#intro", "#hdr", "#ev", "#blocks", "#endnote"].forEach(q => $(q).style.display = "none"); }
  else if (c && idx.length) {
    S.k = k != null ? k : idx[0]; play(S.k, anim, quick);
    // “Abschnittswechsel vorwärts: die Linie running vom alten in den neuen Abschnitt, dann leuchten die Nodes auf. Rückwärts nur das Aufleuchten.”
    if (anim) {
      const fwd = from > 0 && n > from, s0 = c.steps[idx[0]];
      if (fwd) { const tl = gsap.timeline(); TL = tl; [edgeOf(s0)].concat((s0.also || []).map(a => edgeIdx(a[0], a[1], a[2]))).filter(i => i >= 0).forEach(ei => tl.add(pulseTween(ei, "", .9), .25)); }
      glowNodes(n, fwd ? 1.0 : .5);
    }
  } else showIntro();
  refreshChips(); updateNav(); setHash();
}
// “Ausblenden: alles außerhalb des gezeigten Abschnitts wird blass.”
function dimFor(n) {
  Object.entries(NODES).forEach(([id, nd]) => nodeEls[id].classList.toggle("dim", n !== 0 && nd.sec !== n && !(extraIn(id) && CASE_SEC[S.c] === n)));
  Object.entries(frameEls).forEach(([k, el]) => el.classList.toggle("dim", n !== 0 && +el.dataset.sec !== n));
  EDGES.forEach((e, i) => { const sa = NODES[e[0]].sec, sb = NODES[e[1]].sec; gEl(i).classList.toggle("dim", n !== 0 && sa !== n && sb !== n); });
}
// “Alle Zustände (grün, rot) zurücksetzen.”
function resetPaint() {
  Object.values(nodeEls).forEach(e => e.classList.remove("done", "lit", "bad", "doneb", "glow", "cur"));
  EDGES.forEach((e, i) => { const g = gEl(i); g.classList.remove("on", "run"); const p = g.querySelector(".pulse"); gsap.set(p, {opacity: 0}); gsap.set(g.querySelector(".dot"), {attr: {cx: -50, cy: -50}}); });
}
let GL = [];
function killAll() { if (TL) TL.kill(); if (EVTL) EVTL.kill(); TL = EVTL = null; gsap.killTweensOf(".dot,.pulse"); GL.forEach(c => c.kill()); GL = []; }
// “Aufleuchten: alle Nodes des Falls in diesem Abschnitt (schon grün) leuchten nacheinander auf und bleiben lange sichtbar hell, danach wieder grün.”
function glowNodes(n, delay = .12, hold = 3) {
  return; // Aufleuchten aller Nodes entfällt, nur die aktuelle Node pulsiert (Klasse cur)
  const c = CASES[S.c];
  idxIn(n, c).forEach((j, i) => {
    const el = nodeEls[c.steps[j].id], t0 = delay + i * .08;
    GL.push(gsap.delayedCall(t0, () => el.classList.add("glow")), gsap.delayedCall(t0 + hold, () => el.classList.remove("glow")));
  });
}

// ---------- ABSCHNITT 7: Schritt abspielen ----------
// “Stand bis vor Schritt k färben (fertig = dezent grün, Stopp/Fehler = dezent rot).”
// “Einen Schritt dauerhaft färben: Node grün (Stopp/Fehler rot), Linie davor grün.”
function paintStep(s) {
  nodeEls[s.id].classList.add(s.stop || s.crash ? "doneb" : "done");
  const ei = edgeOf(s); if (ei >= 0) gEl(ei).classList.add("on");
  (s.also || []).forEach(a => { const i2 = edgeIdx(a[0], a[1], a[2]); if (i2 >= 0) gEl(i2).classList.add("on"); });
}
function paintBefore(k, incl) {
  resetPaint();
  // “Fall gewählt: der ganze Lauf gilt als durchgelaufen, alle Schritte bleiben grün.”
  const steps = stepsOf(); steps.forEach(paintStep);
  if (incl && steps[k]) { const e = nodeEls[steps[k].id]; e.classList.remove("done", "doneb"); e.classList.add("lit"); if (steps[k].stop || steps[k].crash) e.classList.add("bad"); }
}
// “Impuls running entlang einer Linie: grüner Strich wächst, ein Punkt wandert mit.”
function pulseTween(ei, f = "", dur = null) {
  const g = gEl(ei, f), p = g.querySelector(".pulse"), dot = g.querySelector(".dot"), L = p.getTotalLength(), o = {t: 0};
  g.classList.add("run");
  return gsap.to(o, {t: 1, duration: dur || Math.max(.3, Math.min(.8, L / 1600)), ease: "power1.inOut",
    onStart() { gsap.set(p, {opacity: 1}); p.style.strokeDasharray = L; },
    onUpdate() { p.style.strokeDashoffset = L * (1 - o.t); const pt = p.getPointAtLength(L * o.t); dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y); },
    onComplete() { g.classList.add("on"); g.classList.remove("run"); gsap.set(p, {opacity: 0}); dot.setAttribute("cx", -50); }});
}
// “Schritt k abspielen. anim=false springt direkt zum Endbild.”
// “Text bei Was passiert hier verkleinern, damit keine Zeile umbricht (mindestens 14 px).”
// “Code-Auszug unter den Textkästen, nur bei Code-Nodes. Kommentare werden grün gezeigt.”
function showCode(id) {
  const src = typeof CODE !== "undefined" ? CODE[bid(id)] : null, blk = $("#codeblk");
  if (!blk) return;
  blk.style.display = src ? "" : "none";
  const kn = $("#kinote"); if (kn) kn.style.display = ["spam_gate", "spam_gate_model", "ai_agent", "chat_model"].includes(bid(id)) ? "" : "none";
  if (src) $("#code").innerHTML = src.split("\n").map(l => { const e = esc(l); return /^\s*\/\//.test(l) ? `<span class="c">${e}</span>` : e; }).join("\n");
}
function fitWhat() {
  const ul = $("#what") && $("#what").querySelector("ul"); if (!ul) return;
  let fs = 16.5; ul.style.fontSize = fs + "px";
  const lis = [...ul.children], wrapped = () => lis.some(li => li.getBoundingClientRect().height > fs * 1.45 * (li.querySelectorAll("br").length + 1.4));
  while (wrapped() && fs > 14) { fs -= .25; ul.style.fontSize = fs + "px"; }
}
function play(k, anim, quick = false) {
  killAll(); S.k = k;
  const c = CASES[S.c], s = c.steps[k];
  Object.values(nodeEls).forEach(e => e.classList.remove("cur")); nodeEls[s.id].classList.add("cur");
  const info = INFO[bid(s.id)], ev = EV(s.id, c);
  fillPanel(k, c, s, info, ev); fitWhat(); showCode(s.id);
  const blocks = $("#blocks"), rows = $$("#data .row");
  if (!anim || S.c) {
    paintBefore(k, true);
    if (ev) { EVTL = ev.build($("#ev")); if (anim && !quick) EVTL.timeScale(1.3); else EVTL.progress(1); }
    gsap.set([blocks, ...rows], {opacity: 1, x: 0, y: 0});
    updateNav(); return;
  }
  paintBefore(k, false);
  const tl = gsap.timeline(); TL = tl;
  let t = 0;
  // “Schnell (Durchlauf zu einer Stelle): Info rechts steht sofort, Fenster springt zum Endbild. Sonst kurze, ruhige Einblendung.”
  if (quick) gsap.set([blocks, ...rows], {opacity: 1, x: 0, y: 0}); else { gsap.set(blocks, {opacity: 0, y: 8}); gsap.set(rows, {opacity: 0}); }
  if (ev && ev.dir === "in") { EVTL = ev.build($("#ev")); if (quick) { EVTL.progress(1); } else { EVTL.timeScale(2.2); t = EVTL.duration() / 2.2 + .15; } }
  const edges = [edgeOf(s)].concat((s.also || []).map(a => edgeIdx(a[0], a[1], a[2]))).filter(i => i >= 0);
  edges.forEach(ei => tl.add(pulseTween(ei, "", quick ? .3 : null), t));
  t += edges.length ? (quick ? .32 : .65) : .05;
  tl.add(() => { paintBefore(k, true); }, t);
  if (!quick) { tl.to(blocks, {opacity: 1, y: 0, duration: .2}, Math.max(0, t - .3)); tl.to(rows, {opacity: 1, duration: .15}, Math.max(0, t - .2)); }
  if (ev && ev.dir === "out") tl.add(() => { EVTL = ev.build($("#ev")); if (quick) EVTL.progress(1); else EVTL.timeScale(2.2); }, t + .1);
  if (quick) tl.to({}, {duration: .12}, t);
  updateNav();
  return tl;
}
// “Rechte Seite füllen: Kopf, leerer oder vorbereiteter Fensterplatz, zwei Blöcke.”
function fillPanel(k, c, s, info, ev) {
  $("#intro").style.display = "none"; $("#hdr").style.display = "flex"; $("#blocks").style.display = "grid";
  const stop = s.stop || s.crash;
  $("#hdr").innerHTML = `<span class="hn ${stop ? "bad" : ""}">${nm(s.id)}</span><span class="ht">${info.ty}</span><span class="hs">Step ${idxIn(S.sec, c).indexOf(k) + 1} of ${idxIn(S.sec, c).length}</span>`;
  const evEl = $("#ev"); evEl.innerHTML = ""; evEl.style.display = ev ? "block" : "none";
  const extra = EXTRA(s.id, c);
  $("#what").innerHTML = "<ul>" + info.w.map(x => `<li>${x}</li>`).join("") + (extra ? `<li class="ex">${extra}</li>` : "") + "</ul>";
  $("#data").innerHTML = R(s.id, c).map(r => `<div class="row${r.nw ? " nw" : ""}${r.bad ? " bad" : ""}"><i>${esc(r.k)}</i><span>${esc(r.v)}</span></div>`).join("");
  const last = k === c.steps.length - 1;
  $("#endnote").style.display = last ? "block" : "none"; $("#endnote").textContent = last ? "Ende des Falls: " + c.end : "";
  $("#blocks").classList.toggle("tall", !ev);
}
// “Ohne Schritt: Abschnittsbeschreibung und Nodes, oder Hinweis, dass der Fall den Abschnitt nicht berührt.”
function showIntro() {
  $("#hdr").style.display = "none"; $("#ev").style.display = "none"; $("#blocks").style.display = "none"; $("#endnote").style.display = "none";
  const sec = SEC[S.sec - 1], i = $("#intro"); i.style.display = "block";
  const c = S.c ? CASES[S.c] : null;
  const list = Object.values(NODES).filter(n => n.sec === S.sec).sort((a, b) => a.y - b.y || a.x - b.x).map(n => `<div class="nl"><b>${nm(n.id)}</b><span>${INFO[bid(n.id)].one}</span></div>`).join("");
  let msg = `<div class="hint"><b>1.</b> Choose a case at the top left. <b>2.</b> Then the run starts with the first node of this section, and you move on with ← → or the mouse wheel.</div>`;
  if (c) {
    const stopStep = c.steps.find(s => s.stop);
    msg = `<div class="hint warn"><b>Case ${c.id} · ${c.title}</b> does not pass through this section. ${stopStep && secOf(stopStep.id) < S.sec ? `The run ends earlier in <b>${nm(stopStep.id)}</b> (section ${secOf(stopStep.id)}).` : `The run skips it.`} With ← → you jump to the steps of the case, with ↑ ↓ you change the section.</div>`;
  }
  i.innerHTML = `<div class="itag">Section ${S.sec}</div><h2>${sec.title.replace(/^\d\.\s*/, "")}</h2><p>${sec.why}</p>${msg}<div class="nls">${list}</div>`;
}

// ---------- ABSCHNITT 8: Fall-Leiste und Pfeile ----------
// “Namen auf den Reitern (D steht untereinander).”
const TAB = {A: "Hot lead", B: "Spam message", C: "Spam: AI filter", D: "Sender<br>known", E: "Unclear inquiry", F: "AI outage"};
function buildChips() {
  $(".cases .cl").innerHTML = `<span class="stp">1</span>Choose a case <em>Only then does the demo run</em>`;
  $("#cb").innerHTML = CASE_ORDER.map(id => { const c = CASES[id]; return `<button class="chip${c.err ? " err" : ""}" data-c="${id}"><b>${id}</b><span>${TAB[id]}</span></button>`; }).join("");
  $$(".chip").forEach(b => b.onclick = () => selectCase(b.dataset.c));
}
// “Hinweis über der Fall-Leiste: ohne Fall “1 Fall auswählen”, mit Fall “2 Nodes durchklicken, Abschnitte scrollen”.”
function refreshChips() {
  $$(".chip").forEach(b => b.classList.toggle("on", b.dataset.c === S.c));
  $(".cases .cl").innerHTML = S.c ? `<span class="stp">2</span>Click through the nodes <em>Scroll through sections</em>` : `<span class="stp">1</span>Choose a case <em>Only then does the demo run</em>`;
}
// “Fall wählen: der Abschnitt startet bei der ersten Node des Falls. Der Canvas wechselt nie von allein, weiter geht es per Pfeil.”
let RUN = 0;
// “Lauf als bereits durchgelaufen zeigen: Linien und Nodes des Falls in diesem Abschnitt leuchten langsam nacheinander auf und bleiben grün. Danach zeigt das Infofenster den letzten Schritt, die Nodes sind anklickbar.”
function reveal(id, n, my) {
  const idx = idxIn(n, CASES[id]);
  // “Der Lauf startet immer bei der ersten Node des Abschnitts, weiter geht es per Pfeil oder Klick.”
  play(idx[0], true); setHash();
  glowNodes(n);
}
// “Idealfall A beginnt vorn (Abschnitt 1). Jeder andere Fall springt zu dem Canvas, in dem er abgefangen wird oder abbiegt.”
const CASE_SEC = {A: 1, B: 1, C: 1, D: 2, E: 4, F: 3};
function selectCase(id) {
  S.c = id; refreshChips(); killAll(); resetPaint();
  // “Nicht in der Abschnittsansicht (Gesamtbild running als Endlosschleife)? Dann immer erst in den Abschnitt wechseln, das stoppt die Schleife.”
  const n = CASE_SEC[id], jump = n !== S.sec || S.view !== "sec";
  if (jump) showSection(n, true, null, false, true);
  else { dimFor(n); secCam(n, .6); S.k = -1; ["#intro", "#hdr", "#ev", "#blocks", "#endnote"].forEach(q => $(q).style.display = "none"); }
  const my = ++RUN, idx = idxIn(n, CASES[id]);
  updateNav(); setHash();
  if (!idx.length) { S.k = -1; showIntro(); return; }
  gsap.delayedCall(jump ? .9 : .1, () => { if (my === RUN) reveal(id, n, my); });
}
// “Nächster Schritt (dir = 1) oder vorheriger (dir = -1) im Ablauf des Falls. Ohne eigenen Schritt im Abschnitt: der erste Schritt dahinter oder der letzte davor.”
function nextIdx(dir) {
  if (S.view !== "sec" || !S.c) return -1;
  const steps = CASES[S.c].steps, here = S.k >= 0 && secOf(steps[S.k].id) === S.sec;
  if (here) { const t = S.k + dir; return t >= 0 && t < steps.length ? t : -1; }
  if (dir > 0) return steps.findIndex(s => secOf(s.id) > S.sec);
  for (let i = steps.length - 1; i >= 0; i--) if (secOf(steps[i].id) < S.sec) return i;
  return -1;
}
// “Zum Schritt t gehen: im selben Abschnitt weiterspielen, sonst Kamera in den anderen Abschnitt fahren.”
function go(t) {
  RUN++;
  const n = secOf(CASES[S.c].steps[t].id);
  if (n !== S.sec) showSection(n, true, t); else { play(t, true); setHash(); }
}
function fwd() { const t = nextIdx(1); if (t >= 0) go(t); }
function back() { const t = nextIdx(-1); if (t >= 0) go(t); }
// “↑ ↓ wechseln den Abschnitt, nur am Anfang oder Ende des Abschnitts. Vor dem ersten und nach dem letzten Abschnitt: Gesamtansicht.”
function vertOk(dir) {
  if (S.view !== "sec") return false;
  const c = S.c ? CASES[S.c] : null, idx = idxIn(S.sec, c), has = c && idx.length && idx.includes(S.k);
  return !has || S.k === (dir < 0 ? idx[0] : idx[idx.length - 1]);
}
// “Abschnitt wechseln ohne Bedingung (für die Leisten oben und unten und den Gesamtübersicht-Button).”
function jump(dir) { if (S.view !== "sec") return; const n = S.sec + dir; if (n < 1 || n > 4) return; showSection(n, true); }
function vert(dir) {
  if (!vertOk(dir)) return;
  const n = S.sec + dir;
  if (n < 1 || n > 4) return;
  showSection(n, true);
}
// “Pfeile: links/rechts gehen Node für Node, oben/unten sind nur am Anfang/Ende eines Abschnitts aktiv.”
function updateNav() {
  const c = S.c ? CASES[S.c] : null, idx = idxIn(S.sec, c), p = idx.indexOf(S.k), has = c && idx.length && p >= 0;
  const set = (id, on) => { $(id).disabled = !on; };
  set("#bL", nextIdx(-1) >= 0); set("#bR", nextIdx(1) >= 0);
  set("#bU", vertOk(-1) && S.sec > 1); set("#bD", vertOk(1) && S.sec < 4);
  const sc = SEC[S.sec - 1];
  $("#stepinfo").textContent = has ? `Step ${p + 1} of ${idx.length}` : (!S.c ? "Please choose a case" : idx.length ? `No step yet (${idx.length} in this section)` : "No step of this case here");
  // “Name des Abschnitts in der Mitte, über Leiste und Canvas.”
  $("#secname").classList.toggle("on", S.view === "sec"); $("#secname").innerHTML = `<span>${sc.title}</span>`;
  // “Orangener Hinweis, wenn der Fall hier endet.”
  const hon = S.view === "sec" && hintOn(S.sec);
  $("#endh").classList.toggle("on", hon); if (hon) $("#endh").innerHTML = `<b>The run ends here</b><span>${ENDHINT[S.c]}</span>`;
  // “Ohne gewählten Fall: Hinweis über dem Canvas, Fall-Leiste pulsiert, Beschriftung nennt Schritt 1. Mit Fall: Schritt 2.”
  const need = S.view === "sec" && !S.c;
  $("#gate").classList.toggle("on", need); $("#cb").classList.toggle("need", need);
  // “Nodes des gewählten Falls sind anklickbar.”
  Object.entries(nodeEls).forEach(([id, e]) => e.classList.toggle("clk", !!c && c.steps.some(s => s.id === id)));
}
function setHash() { try { history.replaceState(null, "", S.view === "title" ? "#t" : S.view === "overview" ? "#o" : `#s${S.sec}.${S.c || "-"}.${S.k}`); } catch (e) {} }

// “Kleine Symbole für die Schritte im Gesamtbild (Linienstil).”
const ICN = Object.fromEntries(Object.entries({
  mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 8l8 6 8-6"/>', edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>', rules:'<path d="M5 7l2 2 3-3M5 15l2 2 3-3M13 8h7M13 16h7"/>',
  stop:'<circle cx="12" cy="12" r="8"/><path d="M7 17L17 7"/>', ai:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>', search:'<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>',
  copy:'<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V6a1 1 0 0 1 1-1h9"/>', append:'<path d="M6 4h9l3 3v13H6z"/><path d="M12 11v6M9 14h6"/>',
  globe:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c-3 3-3 13 0 16M12 4c3 3 3 13 0 16"/>', chart:'<path d="M5 20V10M12 20V5M19 20v-8"/>',
  star:'<path d="M12 4l2.4 5 5.4.7-4 3.7 1 5.4L12 16.2 7.2 18.8l1-5.4-4-3.7 5.4-.7z"/>', buoy:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M6.5 6.5l3 3M14.5 14.5l3 3M17.5 6.5l-3 3M9.5 14.5l-3 3"/>',
  db:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.7 3 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3 3 7 3s7-1.3 7-3"/>', route:'<path d="M5 12h5c3 0 3-6 7-6h3M10 12h10M5 12h5c3 0 3 6 7 6h3"/>',
  ok:'<path d="M5 12l5 5 9-10"/>', send:'<path d="M4 12l16-7-6 16-3-6z"/>'
}).map(([k, v]) => [k, `<svg viewBox="0 0 24 24" aria-hidden="true">${v}</svg>`]));
// ---------- ABSCHNITT 9: Titelfolie und Gesamtbild verdrahten ----------
$("#go").onclick = () => showOverview();
$("#toTitle").onclick = () => { killAll(); RUN++; setView("title"); setHash(); };
$("#bL").onclick = back; $("#bR").onclick = fwd; $("#bU").onclick = () => vert(-1); $("#bD").onclick = () => vert(1);
// “Leisten oben und unten anklicken: vorheriger oder nächster Abschnitt, am Rand die Gesamtansicht.”
$("#tbar").onclick = () => jump(-1); $("#bbar").onclick = () => jump(1);
// “Button: zurück in die Gesamtübersicht.”
$("#bOv2").onclick = () => { killAll(); showOverview(); };
// “Node im Canvas anklicken: springt zu diesem Schritt des gewählten Falls (nur Nodes, die der Fall durchrunning).”
W.addEventListener("click", e => { if (S.view !== "sec" || !S.c) return; const el = e.target.closest(".node"); if (!el) return; const t = CASES[S.c].steps.findIndex(s => s.id === el.id.slice(2)); if (t >= 0) { RUN++; go(t); } });
// “Mausrad über dem Canvas: runter = nächster Abschnitt, hoch = voriger (Nodes nur per Klick und Pfeil). Danach kurze Pause, damit ein Rad-Ruck nur einen Schritt macht.”
let wheelLock = 0;
$("#cv").addEventListener("wheel", e => { if (S.view !== "sec") return; e.preventDefault(); const now = Date.now(); if (now - wheelLock < 600 || Math.abs(e.deltaY) < 4) return; wheelLock = now; jump(e.deltaY > 0 ? 1 : -1); }, {passive: false});
addEventListener("keydown", e => { if (S.view !== "sec") return; if (e.key === "ArrowRight") fwd(); else if (e.key === "ArrowLeft") back(); else if (e.key === "ArrowUp") vert(-1); else if (e.key === "ArrowDown") vert(1); });
// “Gesamtbild: Karten rechts, Rahmen links anklickbar, Hover verbindet beide.”
$("#ovcards").innerHTML = SEC.map(s => `<button class="card" data-sec="${s.n}" style="--c:${s.color}"><span class="num">${s.n}</span><span class="ct"><b>${s.title.replace(/^\d\.\s*/, "")}</b><span class="chs"><span class="trk">${s.steps.map(st => `<i>${ICN[st.i]}${st.t}</i>`).join("").concat("<i class=\"bar\">|</i>").repeat(2)}</span></span></span><span class="go">→</span></button>`).join("");
$("#hctext").textContent = HC_TEXT;

// “Weitere Workflows des Projekts: drei Kacheln, Klick dreht alle drei um und zeigt die Beschreibung.”
const XW = [
  {n: 2, t: "Hot lead approval", i: '<path pathLength="1" d="M5 12l5 5 9-10"/>', d: "Waits for your click in Telegram. Only then does the reply mail go out to the lead."},
  {n: 3, t: "Error workflow", i: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>', d: "Starts when a run fails and sends a Telegram alert with workflow, node and error text, but without data of the lead."},
  {n: 4, t: "Company research", i: '<circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>', d: "Tool for the AI agent: searches the company on the web and reports a revenue band and an estimate of the number of employees."}
];
$("#xfront").innerHTML = XW.map((x, k) => `<button class="xt" data-k="${k}"><svg class="xa${k}" viewBox="0 0 24 24">${x.i}</svg>${x.t}<small>Workflow ${x.n}</small></button>`).join("");
$("#xfront").addEventListener("click", e => { const b = e.target.closest(".xt"); if (!b) return; const x = XW[+b.dataset.k]; $("#xtt").textContent = "Workflow " + x.n + ": " + x.t; $("#xdd").textContent = x.d; $("#xw .xi").classList.add("flip"); });
$("#xbk").addEventListener("click", () => $("#xw .xi").classList.remove("flip"));
$$(".card").forEach(b => { b.onclick = () => showSection(+b.dataset.sec); b.onmouseenter = () => { [frameEls, frameEls2].forEach(m => m["s" + b.dataset.sec].classList.add("hl")); ovFocus(+b.dataset.sec); }; b.onmouseleave = () => { [frameEls, frameEls2].forEach(m => m["s" + b.dataset.sec].classList.remove("hl")); ovBlur(); }; });
[frameEls, frameEls2].forEach(m => Object.values(m).forEach(f => { f.onclick = () => { if (S.view === "overview") showSection(+f.dataset.sec); }; f.onmouseenter = () => { if (S.view === "overview") f.classList.add("hl"); }; f.onmouseleave = () => f.classList.remove("hl"); }));
// “Werkzeug-Band: alle Werkzeuge einmal kopieren, damit das Band ohne Lücke endlos durchrunning.”
$("#reel").innerHTML += $("#reel").innerHTML;
buildChips();
// “Start: Hash zum Prüfen (#o, #s2.A.3), sonst Titelfolie.”
(function boot() {
  const h = location.hash;
  if (/^#o/.test(h)) { showOverview(false); return; }
  const m = h.match(/^#s(\d)\.([A-F-])\.(-?\d+)/);
  // “?play lässt beim Start die echte Animation laufen (zum Prüfen), sonst springt die Seite direkt zum Endbild.”
  const play1 = /[?&]play/.test(location.search);
  if (m) { S.c = m[2] === "-" ? null : m[2]; showSection(+m[1], play1, S.c && +m[3] >= 0 ? +m[3] : null); return; }
  setView("title"); camTo(OV_RECT, PANE_OV, 0.01);
})();

// ---------- Hilfefeld zum Bedienkreuz ----------
// “Das Hilfefeld liegt außerhalb der Bühne, damit es den freien Platz links vom Canvas nutzen kann. Es erscheint beim Hover über dem Fragezeichen.”
(function () {
  const help = $("#navhelp"), qm = $("#qm"); document.body.appendChild(help);
  function place() {
    const st = $("#stage").getBoundingClientRect(), k = st.width / 1920;
    const right = st.left + 186 * k, left = 8, w = Math.min(right - left, 360 * k);
    help.style.width = w + "px"; help.style.left = (right - w) + "px"; help.style.fontSize = (13 * k) + "px"; help.style.top = "0px"; const qr = qm.getBoundingClientRect(); help.style.top = Math.max(8, qr.top - help.offsetHeight - 10 * k) + "px";
  }
  qm.addEventListener("mouseenter", () => { place(); help.classList.add("show"); });
  qm.addEventListener("mouseleave", () => help.classList.remove("show"));
  qm.addEventListener("focus", () => { place(); help.classList.add("show"); });
  qm.addEventListener("blur", () => help.classList.remove("show"));
})();
