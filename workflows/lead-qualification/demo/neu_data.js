// KONTEXT: Daten der neuen Demo: Positionen aus dem n8n-Canvas "Demo_Intake_Scoring" (senkrechte Kopie, Stand 23.11. abends), Linien, Abschnitte, Texte, Fälle.
// BEISPIEL: Fall A (heißer Lead) läuft durch alle vier Abschnitte, Fall B endet schon in Abschnitt 1 bei drop_spam und meldet über ping_success den sauberen Abschluss.

// ---------- ABSCHNITT 1: Welt-Ursprung und Nodes ----------
// „Die Welt beginnt links oben mit etwas Rand um alle n8n-Koordinaten.“
const OX = -130, OY = 3400, WW = 1340, WH = 3010;
// „Nodes mit Position aus n8n (x, y = linke obere Ecke), Typ, Abschnitt. outs = Namen der Ausgänge, w/h = Größe, circle = rundes Zubehör (80 groß, in der 96er Box zentriert, darum +8).“
const NODES = {
  email_trigger_imap:{name:"E-Mail empfangen",x:-20,y:3520,t:"imap",trig:1,sec:1},
  prepare_email_data:{name:"Daten vorbereiten",x:175,y:3520,t:"set",sec:1},
  ping_start:{name:"Start melden",x:370,y:3730,t:"ping",sec:1,plus:1},
  check_lead:{name:"Spam-Zeichen prüfen",x:370,y:3520,t:"code",sec:1},
  spam_prefilter:{name:"Spam erkannt?",x:565,y:3520,t:"if",outs:["true","false"],sec:1},
  drop_spam:{name:"Lauf beenden",x:790,y:3520,t:"noop",sec:1},
  ps_spam:{name:"Erfolg melden",x:980,y:3730,t:"ping",sec:1,plus:1},
  spam_gate:{name:"Spam per KI prüfen",x:-20,y:4130,t:"classifier",outs:["spam","legit","Other"],w:224,h:128,sec:2,retry:1},
  spam_gate_model:{name:"KI-Modell",x:110,y:4350,t:"openai",circle:1,sec:2},
  search_lead:{name:"Absender suchen",x:560,y:4010,t:"airtable",sec:2,retry:1},
  merge_search_result:{name:"Ergebnisse zusammenführen",x:930,y:4150,t:"merge",ins:2,sec:2},
  is_duplicate:{name:"Absender bekannt?",x:-20,y:4560,t:"if",outs:["true","false"],sec:2},
  email_duplicate_notice:{name:"Hinweis-Mail senden",x:235,y:4540,t:"mail",sec:2,retry:1,plus:1},
  append_followup:{name:"Nachricht anhängen",x:490,y:4540,t:"airtable",sec:2,retry:1},
  telegram_followup:{name:"Team informieren",x:745,y:4540,t:"telegram",sec:2,retry:1,plus:1},
  ps_dup:{name:"Erfolg melden",x:1000,y:4540,t:"ping",sec:2,plus:1},
  ai_agent:{name:"KI bewertet den Lead",x:-20,y:4900,t:"agent",outs:["Success","Error"],w:260,h:96,sec:3,retry:1},
  chat_model:{name:"KI-Modell",x:10,y:5170,t:"openai",circle:1,sec:3},
  read_imprint:{name:"Impressum lesen",x:190,y:5170,t:"http",circle:1,sec:3},
  company_research:{name:"Firmenzahlen holen",x:370,y:5170,t:"toolwf",circle:1,sec:3},
  structured_output:{name:"Antwort strukturieren",x:550,y:5170,t:"parser",circle:1,sec:3},
  ai_fallback:{name:"Ersatzwert setzen",x:700,y:5000,t:"set",sec:3},
  process_ai_output:{name:"Antwort prüfen",x:940,y:4880,t:"code",sec:3},
  create_lead_record:{name:"Lead speichern",x:0,y:5430,t:"airtable",sec:4,retry:1},
  ps_new:{name:"Erfolg melden",x:210,y:5430,t:"ping",sec:4,plus:1},
  route_by_category:{name:"Nach Kategorie verteilen",x:0,y:5700,t:"switch",outs:["Hot","Warm","Kalt","Rückfrage"],w:96,h:192,sec:4},
  telegram_approval_request:{name:"Freigabe anfragen",x:443,y:5462,t:"telegram",sec:4,retry:1,plus:1},
  build_dossier:{name:"Dossier erstellen",x:596,y:5580,t:"code",sec:4},
  send_dossier:{name:"Dossier senden",x:920,y:5580,t:"mail",sec:4,retry:1,plus:1},
  telegram_new_lead:{name:"Neuen Lead melden",x:740,y:5730,t:"telegram",sec:4,retry:1,plus:1},
  send_confirmation:{name:"Bestätigung senden",x:740,y:5890,t:"mail",sec:4,retry:1,plus:1},
  email_clarification:{name:"Rückfrage per Mail",x:596,y:6040,t:"mail",sec:4,retry:1,plus:1},
  telegram_clarification:{name:"Rückfrage melden",x:443,y:6158,t:"telegram",sec:4,retry:1,plus:1}
};
// „Größen ergänzen: Standard ist 96 mal 96, rundes Zubehör 80.“
for (const [k, n] of Object.entries(NODES)) { n.id = k; if (n.circle) { n.w = n.h = 80; } else { n.w = n.w || 96; n.h = n.h || 96; } }
// „Größe je Abschnitt: Abschnitt 1 auf 125 Prozent (Entwurf). Faktor k steuert auch Symbole und Schrift.“
const SCALE = {1: 1.25, 2: 1.25, 3: 1.25, 4: 1.25};
for (const n of Object.values(NODES)) { n.k = SCALE[n.sec] || 1; n.w *= n.k; n.h *= n.k; }
// „Die drei Erfolgs-Pings heißen in der Demo alle ping_success, gehören aber zu verschiedenen Stellen. bid() liefert den gemeinsamen Inhalts-Schlüssel.“
const ALIAS = {ps_spam:"ping_success", ps_dup:"ping_success", ps_new:"ping_success"};
const bid = id => ALIAS[id] || id;
const nm = id => NODES[id].name || id;
// „Welcher Zubehör-Anschluss (Raute unten) gehört zu welchem Zubehör: Chat Model 0, Memory 1, Tool 2, Output Parser 3.“
const DIAMOND = {chat_model:0, read_imprint:2, company_research:2, structured_output:3, spam_gate_model:0};

// ---------- ABSCHNITT 2: Linien ----------
// „[von, nach, Ausgang, Eingang, Art, Route]. Route: ch und lx = Rückwärtslinie um die Ecke (Höhe der Querlinie, Spalte links), w = feste Zwischenpunkte (Verteiler), noMid = kein Mini-Pfeil in der Mitte, alt = gestrichelt (zweiter Weg zum selben Ziel).“
const EDGES = [
  ["email_trigger_imap","prepare_email_data",0,0,"main"],
  ["prepare_email_data","ping_start",0,0,"main"],
  ["prepare_email_data","check_lead",0,0,"main"],
  ["check_lead","spam_prefilter",0,0,"main"],
  ["spam_prefilter","drop_spam",0,0,"main"],
  ["spam_prefilter","spam_gate",1,0,"main",{ch:3955,lx:-45}],
  ["drop_spam","ps_spam",0,0,"main"],
  ["spam_gate","search_lead",1,0,"main"],
  ["spam_gate","merge_search_result",1,1,"main"],
  ["spam_gate","drop_spam",0,0,"main",{w:[[300,4170],[300,3985],[748,3985],[748,3580]]}],
  ["spam_gate","search_lead",2,0,"main",{alt:1}],
  ["spam_gate","merge_search_result",2,1,"main",{alt:1}],
  ["search_lead","merge_search_result",0,0,"main"],
  ["merge_search_result","is_duplicate",0,0,"main",{ch:4505,lx:-45}],
  ["is_duplicate","email_duplicate_notice",0,0,"main"],
  ["is_duplicate","append_followup",0,0,"main",{w:[[170,4600],[170,4730],[440,4730],[440,4600]]}],
  ["is_duplicate","ai_agent",1,0,"main",{ch:4816,lx:-45}],
  ["append_followup","telegram_followup",0,0,"main"],
  ["append_followup","ps_dup",0,0,"main",{w:[[665,4600],[665,4730],[950,4730],[950,4600]]}],
  ["ai_agent","process_ai_output",0,0,"main"],
  ["ai_agent","ai_fallback",1,0,"main"],
  ["ai_fallback","process_ai_output",0,0,"main"],
  ["process_ai_output","create_lead_record",0,0,"main",{ch:5376,lx:-30}],
  ["create_lead_record","route_by_category",0,0,"main",{ch:5650,lx:-24}],
  ["create_lead_record","ps_new",0,0,"main"],
  ["route_by_category","telegram_approval_request",0,0,"main",{fly:275}],
  ["route_by_category","build_dossier",0,0,"main",{fly:275}],
  ["route_by_category","send_confirmation",0,0,"main",{fly:275}],
  ["route_by_category","telegram_new_lead",1,0,"main",{fly:275}],
  ["route_by_category","send_confirmation",1,0,"main",{fly:275}],
  ["route_by_category","email_clarification",3,0,"main",{fly:275}],
  ["route_by_category","telegram_clarification",3,0,"main",{fly:275}],
  ["route_by_category","send_confirmation",2,0,"main",{fly:275}],
  ["build_dossier","send_dossier",0,0,"main"],
  ["chat_model","ai_agent",0,0,"ai"],
  ["read_imprint","ai_agent",0,0,"ai"],
  ["company_research","ai_agent",0,0,"ai"],
  ["structured_output","ai_agent",0,0,"ai"],
  ["spam_gate_model","spam_gate",0,0,"ai"]
];

// ---------- ABSCHNITT 3: Abschnitte, Rahmen, Farben ----------
// „frame = [x1,y1,x2,y2] wie die Bänder in n8n (Position und Größe). Die Farbe gilt nur für die Überschrift, der Rahmen ist dezent.“
const SEC = [
  {n:1,title:"1. Mail kommt rein, grober Spam raus",color:"#b4f2c9",frame:[-80,3456,1148,3942],
    why:"Eine neue Mail startet einen eigenen Lauf. Kostenlose Regeln erkennen offensichtlichen Spam, bevor eine KI Geld kostet."},
  {n:2,title:"2. KI-Check und Duplikate",color:"#6fdca4",frame:[-80,3968,1148,4800],
    why:"Was die Regeln nicht eindeutig erkennen, prüft ein kleines KI-Modell. Das spart Kosten. Bekannte Absender werden angehängt statt doppelt bewertet."},
  {n:3,title:"3. KI bewertet den Lead",color:"#38bd80",frame:[-80,4832,1148,5360],
    why:"Ein Agent liest das Impressum, holt Firmenzahlen und vergibt Score und Kategorie. Fällt die KI aus, springt ein Fallback ein."},
  {n:4,title:"4. Lead speichern und darauf reagieren",color:"#239a68",frame:[-80,5392,1148,6322],
    why:"Der Lead wird in Airtable gespeichert und je nach Kategorie weitergeleitet: Freigabe, Dossier, Bestätigung oder Rückfrage."}
];
// „Kurze Schritte (höchstens drei Wörter) für die Karten im Gesamtbild.“
SEC[0].steps = [{t:"Mail empfangen",i:"mail"}, {t:"Daten aufbereiten",i:"edit"}, {t:"Grober Spam: Regeln",i:"rules"}, {t:"Plumper Spam stoppen",i:"stop"}];
SEC[1].steps = [{t:"Grauzone per KI prüfen",i:"ai"}, {t:"Absender suchen",i:"search"}, {t:"Duplikate erkennen",i:"copy"}, {t:"Folgemail anhängen",i:"append"}];
SEC[2].steps = [{t:"Impressum lesen",i:"globe"}, {t:"Firmenzahlen holen",i:"chart"}, {t:"Lead bewerten",i:"star"}, {t:"Fallback bei Ausfall",i:"buoy"}];
SEC[3].steps = [{t:"Lead speichern",i:"db"}, {t:"Nach Kategorie verteilen",i:"route"}, {t:"Freigabe anfragen",i:"ok"}, {t:"Bestätigung senden",i:"send"}];
const HC_TEXT = "Der Wächter (Custom Node): Jeder Lauf meldet sich beim Start und am Ende bei einem externen Überwachungsdienst. Fehlt die Meldung vom Ende, kommt eine Nachricht aufs Handy.";

// ---------- ABSCHNITT 4: Was jede Node macht ----------
// „ty = Node-Art, w = Stichpunkte (Was, Warum), one = ein kurzer Satz für die Abschnitts-Übersicht.“
const INFO = {
  email_trigger_imap:{ty:"Email Trigger (IMAP)",one:"liest neue Mails aus dem Label „Leads“",w:["<b>Was:</b> liest neue Mails aus dem Gmail-Label „Leads“, ein Lauf pro Mail.","<b>Warum:</b> Anfragen kommen per Mail, ein Gmail-Filter sortiert sie ins Label."]},
  prepare_email_data:{ty:"Edit Fields (Set)",one:"macht aus der Rohmail einheitliche Felder",w:["<b>Was:</b> zerlegt den Absender in Name und Adresse, findet die Telefonnummer, formatiert das Datum.","<b>Warum:</b> jeder spätere Schritt arbeitet mit denselben Feldnamen."]},
  ping_start:{ty:"Healthchecks Ping (Custom Node)",one:"meldet „Lauf gestartet“",w:["<b>Was:</b> meldet an Healthchecks.io, dass ein Lauf gestartet ist.","<b>Warum:</b> bleibt das Ende-Signal aus, kommt ein Alarm auf Telegram."]},
  check_lead:{ty:"Code",one:"prüft Spam-Zeichen, ohne KI",w:["<b>Was:</b> sucht Spam-Zeichen: ungültige Adresse, Automatik-Absender (z. B. no-reply), eigene Adresse, unter 5 Zeichen, mehr als 3 Links. Merkt sich auch, ob die Adresse von Gmail, GMX o. Ä. kommt.","<b>Warum:</b> kostet nichts und läuft vor jeder KI."]},
  spam_prefilter:{ty:"If",one:"Spam-Verdacht: Ende, sonst weiter",w:["<b>Was:</b> bei Spam-Verdacht geht es zu „Lauf beenden“, sonst zum Spam-Filter.","<b>Warum:</b> offensichtlicher Spam erreicht nie ein Modell."]},
  drop_spam:{ty:"No Operation",one:"beendet den Lauf bei Spam",w:["<b>Was:</b> beendet den Lauf. Nichts wird gespeichert, keine Mail verschickt, keine Telegram-Nachricht gesendet."]},
  spam_gate:{ty:"Text Classifier",one:"Claude Haiku sortiert: legit, spam, other",w:["<b>Was:</b> ein kleines Modell ordnet die Mail ein: legit, spam oder other.","<b>Warum:</b> Regeln erkennen nur feste Muster. Ob eine Mail ohne Auffälligkeit Werbung ist, versteht nur ein Sprachmodell. Spam endet in „Lauf beenden“, der Rest geht weiter."]},
  spam_gate_model:{ty:"Chat Model (Claude Haiku)",one:"das Modell hinter dem Spam-Filter",w:["<b>Was:</b> das Sprachmodell, das der Spam-Filter befragt.","<b>Warum:</b> klein und günstig, weil die Aufgabe einfach ist."]},
  search_lead:{ty:"Airtable: Search record",one:"sucht den Absender in Airtable",w:["<b>Was:</b> sucht die Absender-Adresse in der Tabelle „Leads“.","<b>Warum:</b> so erkennt der Workflow bekannte Absender."]},
  merge_search_result:{ty:"Merge (Combine)",one:"führt Mail und Suchergebnis zusammen",w:["<b>Was:</b> hängt das Suchergebnis an die Mail-Daten.","<b>Warum:</b> danach liegen Mail und Airtable-Ergebnis in einem Datensatz. So kann die nächste Node einfach mit Ja oder Nein entscheiden."]},
  is_duplicate:{ty:"If",one:"bekannter Absender? Ja: anhängen, Nein: bewerten",w:["<b>Was:</b> prüft, ob die Airtable-Suche zur Absender-Adresse einen Treffer hatte.","<b>Warum:</b> Folgemails werden angehängt, nicht neu bewertet. Das spart KI-Kosten."]},
  email_duplicate_notice:{ty:"Send Email",one:"kurze Antwort an den Absender",w:["<b>Was:</b> schickt dem Absender eine kurze Bestätigung, dass die Nachricht zugeordnet wurde."]},
  append_followup:{ty:"Airtable: Update record",one:"hängt die Nachricht an den Datensatz",w:["<b>Was:</b> ergänzt die Folgenachricht im Verlauf des vorhandenen Leads.","<b>Warum:</b> ein Absender, ein Datensatz."]},
  telegram_followup:{ty:"Telegram: Send message",one:"meldet die Folgenachricht dem Team",w:["<b>Was:</b> informiert das Team über die Folgenachricht eines bekannten Leads."]},
  ai_agent:{ty:"AI Agent",one:"bewertet den Lead mit Tools",w:["<b>Was:</b> bewertet den Lead (Score 0 bis 100, Kategorie).<br>Nutzt zwei Tools: Impressum lesen und Firmenzahlen holen.","<b>Warum:</b> ein Agent entscheidet selbst, welches Tool er braucht.","<b>Fehlerweg:</b> der Ausgang „Error“ führt zu ai_fallback."]},
  chat_model:{ty:"Chat Model (Claude Haiku)",one:"das Sprachmodell des Agents",w:["<b>Was:</b> das Modell, das den Lead bewertet.","<b>Warum:</b> Claude Haiku: schnell und günstig."]},
  read_imprint:{ty:"HTTP Request Tool",one:"liest das Impressum der Firmenseite",w:["<b>Was:</b> ruft die Impressum-Seite der Firma ab.","<b>Warum:</b> Firmenname, Sitz und Register sind ein Echtheits-Signal."]},
  company_research:{ty:"Call Workflow Tool (Workflow 4)",one:"holt Firmenzahlen über einen Sub-Workflow",w:["<b>Was:</b> startet Workflow 4 „Company Research“ und liefert Größe und Umsatz.","<b>Warum:</b> gekapselt, damit er einzeln testbar bleibt."]},
  structured_output:{ty:"Structured Output Parser",one:"erzwingt eine feste Antwortform",w:["<b>Was:</b> zwingt die Antwort in ein festes Format: Score, Kategorie, Begründung.","<b>Warum:</b> die nächste Node kann sich auf die Felder verlassen."]},
  ai_fallback:{ty:"Edit Fields (Set)",one:"Ersatzwert, wenn die KI ausfällt",w:["<b>Was:</b> setzt Score 0 und Kategorie „Rückfrage“, wenn der Agent einen Fehler meldet.","<b>Warum:</b> ein KI-Ausfall darf keinen Lead verlieren."]},
  process_ai_output:{ty:"Code",one:"prüft und übersetzt die KI-Antwort",w:["<b>Was:</b> liest die Antwort, prüft Score und Kategorie, setzt den Weg (Hot, Warm, Rückfrage, Kalt).","<b>Warum:</b> aus Text wird eine feste Zahl für die Weiche."]},
  create_lead_record:{ty:"Airtable: Create record",one:"legt den Lead in Airtable an",w:["<b>Was:</b> speichert den Lead mit Score, Kategorie und Begründung in der Tabelle „Leads“.","<b>Warum:</b> ab hier ist der Lead dauerhaft erfasst."]},
  route_by_category:{ty:"Switch (Rules)",one:"verteilt nach Kategorie",w:["<b>Was:</b> schickt den Lead je nach Kategorie auf den richtigen Weg: Hot, Warm, Rückfrage oder Kalt.","<b>Warum:</b> jede Kategorie braucht eine andere Reaktion."]},
  telegram_approval_request:{ty:"Telegram: Send message",one:"fragt die Freigabe an, ohne Personendaten",w:["<b>Was:</b> schickt eine anonyme Meldung mit den Knöpfen „Senden“ und „Verwerfen“.","<b>Warum:</b> ohne Personendaten. Der Klick startet Workflow 2 „Hot Lead Approval“."]},
  build_dossier:{ty:"Code",one:"baut das HTML-Dossier",w:["<b>Was:</b> baut aus den Lead-Daten ein HTML-Dossier für den Vertrieb."]},
  send_dossier:{ty:"Send Email",one:"schickt das Dossier an den Vertrieb",w:["<b>Was:</b> mailt das Dossier als Anhang an den Vertrieb."]},
  telegram_new_lead:{ty:"Telegram: Send message",one:"meldet warme Leads",w:["<b>Was:</b> kurze Info an das Team bei einem warmen Lead."]},
  send_confirmation:{ty:"Send Email",one:"Bestätigung an den Absender",w:["<b>Was:</b> bestätigt dem Absender den Eingang.","<b>Warum:</b> jeder Lead bekommt eine Antwort."]},
  email_clarification:{ty:"Send Email",one:"Rückfrage an den Absender",w:["<b>Was:</b> bittet den Absender um drei fehlende Angaben."]},
  telegram_clarification:{ty:"Telegram: Send message",one:"meldet die Rückfrage dem Team",w:["<b>Was:</b> informiert das Team, dass eine Rückfrage rausging."]},
  ping_success:{ty:"Healthchecks Ping (Custom Node)",one:"meldet „Lauf erfolgreich“",w:["<b>Was:</b> meldet an Healthchecks.io, dass der Lauf sauber zu Ende ging.","<b>Warum:</b> kommt dieses Signal nicht, gibt es einen Alarm."]}
};

// ---------- ABSCHNITT 5: Fälle ----------
// „Schrittschreibweise: id, from = Vorgänger für den Impuls, io = Ausgang des Vorgängers, to = Ziel bei Zubehör, stop/crash = rotes Aufleuchten.“
const st = (id, from, o) => Object.assign({id, from}, o || {});
const P1 = [st("email_trigger_imap"), st("prepare_email_data","email_trigger_imap"), st("ping_start","prepare_email_data"), st("check_lead","prepare_email_data"), st("spam_prefilter","check_lead")];
const GATE = [st("spam_gate","spam_prefilter",{io:1}), st("spam_gate_model",null,{to:"spam_gate"})];
const DUPSEARCH = [st("search_lead","spam_gate",{io:1,also:[["spam_gate","merge_search_result",1]]}), st("merge_search_result","search_lead"), st("is_duplicate","merge_search_result")];
const AGENT_OK = [st("ai_agent","is_duplicate",{io:1}), st("chat_model",null,{to:"ai_agent"}), st("read_imprint",null,{to:"ai_agent"}), st("company_research",null,{to:"ai_agent"}), st("structured_output",null,{to:"ai_agent"}), st("process_ai_output","ai_agent",{io:0})];
const STORE = [st("create_lead_record","process_ai_output"), st("ps_new","create_lead_record"), st("route_by_category","create_lead_record")];

const CASES = {
  A:{id:"A",title:"Heißer Lead",err:false,kind:"hot",
    L:{name:"Lena Hoffmann",anrede:"Frau Hoffmann",firma:"Hoffmann Logistik GmbH",email:"lena.hoffmann@hoffmann-logistik.example",tel:"0171 5550123",domain:"hoffmann-logistik.example",free:false,
       subj:"Anfrage: Rechnungen automatisch erfassen",
       body:"Guten Tag,\nich leite den Einkauf der Hoffmann Logistik GmbH. Wir verarbeiten rund 2.000 Rechnungen pro Woche, das Budget ist freigegeben und wir möchten Ende Januar live gehen. Können wir diese Woche telefonieren? Sie erreichen mich unter 0171 5550123.",
       score:87,cat:"Heiß",why:"Budget freigegeben, Starttermin genannt, Firma verifiziert",emp:"142",rev:"18 Mio. €",branche:"Logistik"},
    steps:[].concat(P1,GATE,DUPSEARCH,AGENT_OK,STORE,[st("telegram_approval_request","route_by_category",{io:0}),st("build_dossier","route_by_category",{io:0}),st("send_dossier","build_dossier"),st("send_confirmation","route_by_category",{io:0})]),
    end:"Heißer Lead: gespeichert, Freigabe angefragt, Dossier und Bestätigung verschickt, Lauf als erfolgreich gemeldet."},
  B:{id:"B",title:"Spam: Regeln",err:true,kind:"spam1",
    L:{name:"Tim Weber",firma:"",email:"tim.weber@web.example",tel:"",domain:"web.example",free:true,subj:"Hilfe",body:"Hi",reason:"Nachricht zu kurz"},
    steps:[].concat(P1,[st("drop_spam","spam_prefilter",{io:0,stop:1}),st("ps_spam","drop_spam")]),
    end:"Spam durch die Regeln gestoppt: nichts gespeichert, keine Antwort, keine KI-Kosten. Der Lauf zählt trotzdem als erfolgreich."},
  C:{id:"C",title:"Spam: KI-Filter",err:true,kind:"spam2",
    L:{name:"Marketing Team",firma:"Reichweite Plus",email:"info@reichweite-plus.example",tel:"",domain:"reichweite-plus.example",free:false,subj:"Mehr Sichtbarkeit für Ihr Unternehmen",
       body:"Hallo,\nwir garantieren Ihnen Platz 1 bei Google und tausende neue Kunden pro Monat. Antworten Sie heute noch und sichern Sie sich 50 Prozent Rabatt.",reason:"Werbung ohne Bezug"},
    steps:[].concat(P1,GATE.slice(0,1),[st("drop_spam","spam_gate",{io:0,stop:1}),st("ps_spam","drop_spam")]),
    end:"Spam durch den KI-Filter gestoppt: die Regeln haben ihn nicht erkannt, das Modell schon."},
  D:{id:"D",title:"Bekannter Absender",err:false,kind:"dup",
    L:{name:"Jonas Fischer",anrede:"Herr Fischer",firma:"Fischer Metallbau",email:"j.fischer@fischer-metallbau.example",tel:"",domain:"fischer-metallbau.example",free:false,subj:"Ergänzung zu meiner Anfrage",
       body:"Guten Tag,\nergänzend zu meiner Anfrage vom Montag: Wir haben drei Standorte, die Rechnungen kommen überall an. Bitte planen Sie das ein.",reason:"Absender bereits in Airtable"},
    steps:[].concat(P1,GATE,DUPSEARCH,[st("email_duplicate_notice","is_duplicate",{io:0}),st("append_followup","is_duplicate",{io:0}),st("telegram_followup","append_followup"),st("ps_dup","append_followup")]),
    end:"Bekannter Absender: Nachricht angehängt, Team informiert, keine neue Bewertung."},
  E:{id:"E",title:"Unklare Anfrage",err:false,kind:"unclear",
    L:{name:"Sabine Koch",anrede:"Frau Koch",firma:"",email:"sabine.koch@mail.example",tel:"",domain:"mail.example",free:true,subj:"Frage zu Automatisierung",
       body:"Guten Tag,\nwir interessieren uns allgemein für Automatisierung. Melden Sie sich bitte bei uns.",score:42,cat:"Rückfrage",why:"Kein konkretes Vorhaben, keine Firma erkennbar",emp:"–",rev:"–",branche:"unbekannt"},
    steps:[].concat(P1,GATE,DUPSEARCH,AGENT_OK,STORE,[st("telegram_clarification","route_by_category",{io:3}),st("email_clarification","route_by_category",{io:3})]),
    end:"Unklare Anfrage: gespeichert, der Absender bekommt eine Rückfrage, das Team wird informiert."},
  F:{id:"F",title:"KI-Ausfall",err:true,kind:"fail",
    L:{name:"Lena Hoffmann",anrede:"Frau Hoffmann",firma:"Hoffmann Logistik GmbH",email:"lena.hoffmann@hoffmann-logistik.example",tel:"0171 5550123",domain:"hoffmann-logistik.example",free:false,
       subj:"Anfrage: Rechnungen automatisch erfassen",
       body:"Guten Tag,\nich leite den Einkauf der Hoffmann Logistik GmbH. Wir verarbeiten rund 2.000 Rechnungen pro Woche, das Budget ist freigegeben und wir möchten Ende Januar live gehen.",
       score:0,cat:"Rückfrage",why:"KI nicht erreichbar, Ersatzwert gesetzt"},
    steps:[].concat(P1,GATE,DUPSEARCH,[st("ai_agent","is_duplicate",{io:1,crash:1}),st("ai_fallback","ai_agent",{io:1}),st("process_ai_output","ai_fallback")],STORE,[st("telegram_clarification","route_by_category",{io:3}),st("email_clarification","route_by_category",{io:3})]),
    end:"KI-Ausfall abgefangen: der Lead ging nicht verloren, er läuft als Rückfrage durch."}
};
const CASE_ORDER = ["A","B","C","D","E","F"];

// ---------- Code-Auszüge für die Code-Nodes (einfache Kommentare, Auszug aus dem n8n-Code) ----------
const CODE = {
  check_lead: `// Grenzen für den Spam-Verdacht
const MIN_NACHRICHT_LAENGE = 5;
const MAX_LINKS = 3;

// Das machen wir für jede Mail
return $input.all().map((item, index) => {
  // Links in der Nachricht zählen
  const anzahlLinks = (nachricht.match(/https?:\/\//gi) || []).length;

  // Hier sammeln wir die Gründe für Spam
  const gruende = [];
  if (AUTOMATISCHE_ABSENDER.test(email)) gruende.push('automatischer Absender');
  if (nachricht.length < MIN_NACHRICHT_LAENGE) gruende.push('Nachricht zu kurz');
  if (anzahlLinks > MAX_LINKS) gruende.push('zu viele Links');

  // Die Mail geht weiter, mit dem Ergebnis dazu
  return { json: { ...lead, spamVerdacht: gruende.length > 0 } };
});`,
  process_ai_output: `// Jede Kategorie hat einen Score-Bereich
const KATEGORIEN = {
  hot:  { min: 70, max: 100, prioritaet: 'Hoch' },
  warm: { min: 40, max: 69,  prioritaet: 'Mittel' },
  kalt: { min: 1,  max: 39,  prioritaet: 'Niedrig' },
  // …
};
// Ist die KI-Antwort unklar, behandeln wir den Lead als warm
const FALLBACK_KATEGORIE = 'warm';

// Das Ergebnis der KI holen
const ki = item.json.output || {};
// Kategorie prüfen, sonst Fallback
const kategorie = KATEGORIEN[ki.kategorie] ? ki.kategorie : FALLBACK_KATEGORIE;
const regel = KATEGORIEN[kategorie];
// Score in den Bereich der Kategorie zwingen
const rohScore = Math.round(Number(ki.score));
const score = Math.min(regel.max, Math.max(regel.min, rohScore));
// Namen, Mail und Telefon aus dem Text entfernen
const reasoning = anonym(ki.begruendung, namen);`,
  build_dossier: `// Daten des Leads holen
const d = $('process_ai_output').all()[index].json;
// Link zum Datensatz in Airtable bauen
const link = BASIS_LINK + item.json.id;
// Red Flags als Liste, sonst "keine Auffälligkeiten"
const flags = d.redFlags.length ? d.redFlags.map(…) : '<li>keine Auffälligkeiten</li>';

// Die Seite aus Überschrift, Kennzahlen und Abschnitten bauen
const html = [
  '<h1>Lead-Dossier: ' + esc(d.kategorie) + '</h1>',
  '<div class="k">…Score, Umsatz, Mitarbeitende…</div>',
  '<h2>Warum diese Bewertung</h2>…',
  '<h2>Red Flags</h2>…',
].join('');

// Daraus eine HTML-Datei für die Mail machen
const datei = await this.helpers.prepareBinaryData(
  Buffer.from(html, 'utf8'), 'lead-dossier.html', 'text/html');`
};
