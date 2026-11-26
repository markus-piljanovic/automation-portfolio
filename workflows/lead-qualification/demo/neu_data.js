// KONTEXT: Daten der neuen Demo: Positionen aus dem n8n-Canvas "Demo_Intake_Scoring" (senkrechte Kopie, Stand 23.11. abends), Linien, Abschnitte, Texte, Fälle.
// BEISPIEL: Fall A (heißer Lead) running durch alle vier Abschnitte, Fall B endet schon in Abschnitt 1 bei drop_spam und meldet über ping_success den sauberen Abschluss.

// ---------- ABSCHNITT 1: Welt-Ursprung und Nodes ----------
// “Die Welt beginnt links oben mit etwas Rand um alle n8n-Koordinaten.”
const OX = -130, OY = 3400, WW = 1340, WH = 3010;
// “Nodes mit Position aus n8n (x, y = linke obere Ecke), Typ, Abschnitt. outs = Namen der Ausgänge, w/h = Größe, circle = rundes Zubehör (80 groß, in der 96er Box zentriert, darum +8).”
const NODES = {
  email_trigger_imap:{name:"Receive email",x:-20,y:3520,t:"imap",trig:1,sec:1},
  prepare_email_data:{name:"Prepare data",x:175,y:3520,t:"set",sec:1},
  ping_start:{name:"Report start",x:370,y:3730,t:"ping",sec:1,plus:1},
  check_lead:{name:"Check spam signs",x:370,y:3520,t:"code",sec:1},
  spam_prefilter:{name:"Spam detected?",x:565,y:3520,t:"if",outs:["true","false"],sec:1},
  drop_spam:{name:"End run",x:790,y:3520,t:"noop",sec:1},
  ps_spam:{name:"Report success",x:980,y:3730,t:"ping",sec:1,plus:1},
  spam_gate:{name:"Check spam with AI",x:-20,y:4130,t:"classifier",outs:["spam","legit","Other"],w:224,h:128,sec:2,retry:1},
  spam_gate_model:{name:"AI model",x:110,y:4350,t:"openai",circle:1,sec:2},
  search_lead:{name:"Look up sender",x:560,y:4010,t:"airtable",sec:2,retry:1},
  merge_search_result:{name:"Merge results",x:930,y:4150,t:"merge",ins:2,sec:2},
  is_duplicate:{name:"Sender known?",x:-20,y:4560,t:"if",outs:["true","false"],sec:2},
  email_duplicate_notice:{name:"Send notice mail",x:235,y:4540,t:"mail",sec:2,retry:1,plus:1},
  append_followup:{name:"Append message",x:490,y:4540,t:"airtable",sec:2,retry:1},
  telegram_followup:{name:"Notify team",x:745,y:4540,t:"telegram",sec:2,retry:1,plus:1},
  ps_dup:{name:"Report success",x:1000,y:4540,t:"ping",sec:2,plus:1},
  ai_agent:{name:"AI scores the lead",x:-20,y:4900,t:"agent",outs:["Success","Error"],w:260,h:96,sec:3,retry:1},
  chat_model:{name:"AI model",x:10,y:5170,t:"openai",circle:1,sec:3},
  read_imprint:{name:"Read legal notice",x:190,y:5170,t:"http",circle:1,sec:3},
  company_research:{name:"Fetch company figures",x:370,y:5170,t:"toolwf",circle:1,sec:3},
  structured_output:{name:"Structure the answer",x:550,y:5170,t:"parser",circle:1,sec:3},
  ai_fallback:{name:"Set fallback value",x:700,y:5000,t:"set",sec:3},
  process_ai_output:{name:"Check the answer",x:940,y:4880,t:"code",sec:3},
  create_lead_record:{name:"Store lead",x:0,y:5430,t:"airtable",sec:4,retry:1},
  ps_new:{name:"Report success",x:210,y:5430,t:"ping",sec:4,plus:1},
  route_by_category:{name:"Route by category",x:0,y:5700,t:"switch",outs:["Hot","Warm","Cold","Clarification"],w:96,h:192,sec:4},
  telegram_approval_request:{name:"Request approval",x:443,y:5462,t:"telegram",sec:4,retry:1,plus:1},
  build_dossier:{name:"Build dossier",x:596,y:5580,t:"code",sec:4},
  send_dossier:{name:"Send dossier",x:920,y:5580,t:"mail",sec:4,retry:1,plus:1},
  telegram_new_lead:{name:"Report new lead",x:740,y:5730,t:"telegram",sec:4,retry:1,plus:1},
  send_confirmation:{name:"Send confirmation",x:740,y:5890,t:"mail",sec:4,retry:1,plus:1},
  email_clarification:{name:"Clarification by mail",x:596,y:6040,t:"mail",sec:4,retry:1,plus:1},
  telegram_clarification:{name:"Report clarification",x:443,y:6158,t:"telegram",sec:4,retry:1,plus:1}
};
// “Größen ergänzen: Standard ist 96 mal 96, rundes Zubehör 80.”
for (const [k, n] of Object.entries(NODES)) { n.id = k; if (n.circle) { n.w = n.h = 80; } else { n.w = n.w || 96; n.h = n.h || 96; } }
// “Größe je Abschnitt: Abschnitt 1 auf 125 Prozent (Entwurf). Faktor k steuert auch Symbole und Schrift.”
const SCALE = {1: 1.25, 2: 1.25, 3: 1.25, 4: 1.25};
for (const n of Object.values(NODES)) { n.k = SCALE[n.sec] || 1; n.w *= n.k; n.h *= n.k; }
// “Die drei Erfolgs-Pings heißen in der Demo alle ping_success, gehören aber zu verschiedenen Stellen. bid() liefert den gemeinsamen Inhalts-Schlüssel.”
const ALIAS = {ps_spam:"ping_success", ps_dup:"ping_success", ps_new:"ping_success"};
const bid = id => ALIAS[id] || id;
const nm = id => NODES[id].name || id;
// “Welcher Zubehör-Anschluss (Raute unten) gehört zu welchem Zubehör: Chat Model 0, Memory 1, Tool 2, Output Parser 3.”
const DIAMOND = {chat_model:0, read_imprint:2, company_research:2, structured_output:3, spam_gate_model:0};

// ---------- ABSCHNITT 2: Linien ----------
// “[von, nach, Ausgang, Eingang, Art, Route]. Route: ch und lx = Rückwärtslinie um die Ecke (Höhe der Querlinie, Spalte links), w = feste Zwischenpunkte (Verteiler), noMid = kein Mini-Pfeil in der Mitte, alt = gestrichelt (zweiter Weg zum selben Ziel).”
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
// “frame = [x1,y1,x2,y2] wie die Bänder in n8n (Position und Größe). Die Farbe gilt nur für die Überschrift, der Rahmen ist dezent.”
const SEC = [
  {n:1,title:"1. Mail arrives, crude spam out",color:"#b4f2c9",frame:[-80,3456,1148,3942],
    why:"A new mail starts its own run. Free rules detect obvious spam before an AI costs money."},
  {n:2,title:"2. AI check and duplicates",color:"#6fdca4",frame:[-80,3968,1148,4800],
    why:"What the rules do not detect clearly is checked by a small AI model. That saves cost. Known senders are appended instead of scored twice."},
  {n:3,title:"3. AI scores the lead",color:"#38bd80",frame:[-80,4832,1148,5360],
    why:"An agent reads the legal notice, fetches company figures and assigns score and category. If the AI fails, a fallback steps in."},
  {n:4,title:"4. Store the lead and react",color:"#239a68",frame:[-80,5392,1148,6322],
    why:"The lead is stored in Airtable and forwarded by category: approval, dossier, confirmation or clarification."}
];
// “Kurze Schritte (höchstens drei Wörter) für die Karten im Gesamtbild.”
SEC[0].steps = [{t:"Receive mail",i:"mail"}, {t:"Prepare data",i:"edit"}, {t:"Crude spam: rules",i:"rules"}, {t:"Stop blatant spam",i:"stop"}];
SEC[1].steps = [{t:"Check grey zone by AI",i:"ai"}, {t:"Look up sender",i:"search"}, {t:"Detect duplicates",i:"copy"}, {t:"Append follow-up mail",i:"append"}];
SEC[2].steps = [{t:"Read legal notice",i:"globe"}, {t:"Fetch company figures",i:"chart"}, {t:"Score the lead",i:"star"}, {t:"Fallback on outage",i:"buoy"}];
SEC[3].steps = [{t:"Store lead",i:"db"}, {t:"Route by category",i:"route"}, {t:"Request approval",i:"ok"}, {t:"Send confirmation",i:"send"}];
const HC_TEXT = "The watchdog (custom node): every run reports at its start and at its end to an external monitoring service. If the report from the end is missing, a message arrives on the phone.";

// ---------- ABSCHNITT 4: Was jede Node macht ----------
// “ty = Node-Art, w = Stichpunkte (Was, Warum), one = ein kurzer Satz für die Abschnitts-Übersicht.”
const INFO = {
  email_trigger_imap:{ty:"Email Trigger (IMAP)",one:"reads new mails from the label ”Leads”",w:["<b>What:</b> reads new mails from the Gmail label ”Leads”, one run per mail.","<b>Why:</b> inquiries arrive by mail, and a Gmail filter sorts them into the label."]},
  prepare_email_data:{ty:"Edit Fields (Set)",one:"turns the raw mail into uniform fields",w:["<b>What:</b> splits the sender into name and address, finds the phone number, formats the date.","<b>Why:</b> every later step works with the same field names."]},
  ping_start:{ty:"Healthchecks Ping (Custom Node)",one:"reports ”run started”",w:["<b>What:</b> reports to Healthchecks.io that a run has started.","<b>Why:</b> if the end signal is missing, an alert arrives on Telegram."]},
  check_lead:{ty:"Code",one:"checks spam signs, without AI",w:["<b>What:</b> looks for spam signs: invalid address, automatic sender (e.g. no-reply), own address, under 5 characters, more than 3 links. Also notes whether the address comes from Gmail, GMX or similar.","<b>Why:</b> costs nothing and runs before any AI."]},
  spam_prefilter:{ty:"If",one:"suspected spam: end, otherwise continue",w:["<b>What:</b> on suspected spam it goes to ”End run”, otherwise to the spam filter.","<b>Why:</b> obvious spam never reaches a model."]},
  drop_spam:{ty:"No Operation",one:"ends the run on spam",w:["<b>What:</b> ends the run. Nothing is stored, no mail sent, no Telegram message sent."]},
  spam_gate:{ty:"Text Classifier",one:"Claude Haiku sorts: legit, spam, other",w:["<b>What:</b> a small model classifies the mail: legit, spam or other.","<b>Why:</b> rules only detect fixed patterns. Whether an unremarkable mail is advertising is something only a language model understands. Spam ends in ”End run”, the rest goes on."]},
  spam_gate_model:{ty:"Chat Model (Claude Haiku)",one:"the model behind the spam filter",w:["<b>What:</b> the language model the spam filter asks.","<b>Why:</b> small and cheap, because the task is simple."]},
  search_lead:{ty:"Airtable: Search record",one:"looks up the sender in Airtable",w:["<b>What:</b> looks for the sender address in the table ”Leads”.","<b>Why:</b> this is how the workflow recognises known senders."]},
  merge_search_result:{ty:"Merge (Combine)",one:"merges mail and search result",w:["<b>What:</b> attaches the search result to the mail data.","<b>Why:</b> afterwards mail and Airtable result sit in one record, so the next node can simply decide yes or no."]},
  is_duplicate:{ty:"If",one:"known sender? Yes: append, no: score",w:["<b>What:</b> checks whether the Airtable search for the sender address found a hit.","<b>Why:</b> follow-up mails are appended, not scored again. That saves AI cost."]},
  email_duplicate_notice:{ty:"Send Email",one:"short reply to the sender",w:["<b>What:</b> sends the sender a short confirmation that the message has been assigned."]},
  append_followup:{ty:"Airtable: Update record",one:"appends the message to the record",w:["<b>What:</b> adds the follow-up message to the history of the existing lead.","<b>Why:</b> one sender, one record."]},
  telegram_followup:{ty:"Telegram: Send message",one:"reports the follow-up message to the team",w:["<b>What:</b> informs the team about the follow-up message of a known lead."]},
  ai_agent:{ty:"AI Agent",one:"scores the lead with tools",w:["<b>What:</b> scores the lead (score 0 to 100, category).<br>Uses two tools: read the legal notice and fetch company figures.","<b>Points:</b> need 0 to 40, urgency 0 to 30, company 0 to 15, size 0 to 15. Without company figures the size counts as neutral (7).<br>From 70 hot, 40 to 69 warm, below that cold.","<b>Why:</b> an agent decides itself which tool it needs.","<b>Error path:</b> the ”Error” output leads to ai_fallback."]},
  chat_model:{ty:"Chat Model (Claude Haiku)",one:"the language model of the agent",w:["<b>What:</b> the model that scores the lead.","<b>Why:</b> Claude Haiku: fast and cheap."]},
  read_imprint:{ty:"HTTP Request Tool",one:"reads the legal notice of the company website",w:["<b>What:</b> fetches the legal notice page of the company.","<b>Why:</b> company name, seat and register are a sign of authenticity."]},
  company_research:{ty:"Call Workflow Tool (Workflow 4)",one:"fetches company figures through a sub-workflow",w:["<b>What:</b> starts workflow 4 ”Company Research” and returns size and revenue.","<b>Why:</b> encapsulated, so that it stays testable on its own."]},
  structured_output:{ty:"Structured Output Parser",one:"enforces a fixed answer format",w:["<b>What:</b> forces the answer into a fixed format: score, category, reasoning.","<b>Why:</b> the next node can rely on the fields."]},
  ai_fallback:{ty:"Edit Fields (Set)",one:"fallback value if the AI fails",w:["<b>What:</b> sets score 0 and category ”Clarification” when the agent reports an error.","<b>Why:</b> an AI outage must not lose a lead."]},
  process_ai_output:{ty:"Code",one:"checks and translates the AI answer",w:["<b>What:</b> reads the answer, checks score and category, sets the path (Hot, Warm, Clarification, Cold).","<b>Why:</b> text becomes a fixed number for the switch."]},
  create_lead_record:{ty:"Airtable: Create record",one:"creates the lead in Airtable",w:["<b>What:</b> stores the lead with score, category and reasoning in the table ”Leads”.","<b>Why:</b> from here on the lead is permanently recorded."]},
  route_by_category:{ty:"Switch (Rules)",one:"routes by category",w:["<b>What:</b> sends the lead down the right path by category: Hot, Warm, Clarification or Cold.","<b>Why:</b> every category needs a different reaction."]},
  telegram_approval_request:{ty:"Telegram: Send message",one:"requests approval, without personal data",w:["<b>What:</b> sends an anonymous message with the buttons ”Send” and ”Discard”.","<b>Why:</b> without personal data. The click starts workflow 2 ”Hot Lead Approval”."]},
  build_dossier:{ty:"Code",one:"builds the HTML dossier",w:["<b>What:</b> builds an HTML dossier for sales from the lead data."]},
  send_dossier:{ty:"Send Email",one:"sends the dossier to sales",w:["<b>What:</b> mails the dossier as an attachment to sales."]},
  telegram_new_lead:{ty:"Telegram: Send message",one:"reports warm leads",w:["<b>What:</b> short notice to the team for a warm lead."]},
  send_confirmation:{ty:"Send Email",one:"confirmation to the sender",w:["<b>What:</b> confirms receipt to the sender.","<b>Why:</b> every lead gets an answer."]},
  email_clarification:{ty:"Send Email",one:"clarification to the sender",w:["<b>What:</b> asks the sender for three missing details."]},
  telegram_clarification:{ty:"Telegram: Send message",one:"reports the clarification to the team",w:["<b>What:</b> informs the team that a clarification request went out."]},
  ping_success:{ty:"Healthchecks Ping (Custom Node)",one:"reports ”run successful”",w:["<b>What:</b> reports to Healthchecks.io that the run ended cleanly.","<b>Why:</b> if this signal does not arrive, there is an alert."]}
};

// ---------- ABSCHNITT 5: Fälle ----------
// “Schrittschreibweise: id, from = Vorgänger für den Impuls, io = Ausgang des Vorgängers, to = Ziel bei Zubehör, stop/crash = rotes Aufleuchten.”
const st = (id, from, o) => Object.assign({id, from}, o || {});
const P1 = [st("email_trigger_imap"), st("prepare_email_data","email_trigger_imap"), st("ping_start","prepare_email_data"), st("check_lead","prepare_email_data"), st("spam_prefilter","check_lead")];
const GATE = [st("spam_gate","spam_prefilter",{io:1}), st("spam_gate_model",null,{to:"spam_gate"})];
const DUPSEARCH = [st("search_lead","spam_gate",{io:1,also:[["spam_gate","merge_search_result",1]]}), st("merge_search_result","search_lead"), st("is_duplicate","merge_search_result")];
const AGENT_OK = [st("ai_agent","is_duplicate",{io:1}), st("chat_model",null,{to:"ai_agent"}), st("read_imprint",null,{to:"ai_agent"}), st("company_research",null,{to:"ai_agent"}), st("structured_output",null,{to:"ai_agent"}), st("process_ai_output","ai_agent",{io:0})];
const STORE = [st("create_lead_record","process_ai_output"), st("ps_new","create_lead_record"), st("route_by_category","create_lead_record")];

const CASES = {
  A:{id:"A",title:"Hot lead",err:false,kind:"hot",
    L:{name:"Lena Hoffmann",anrede:"Ms Hoffmann",firma:"Hoffmann Logistics GmbH",email:"lena.hoffmann@hoffmann-logistik.example",tel:"0171 5550123",domain:"hoffmann-logistik.example",free:false,
       subj:"Inquiry: capture invoices automatically",
       body:"Hello,\nI head purchasing at Hoffmann Logistics GmbH. We process about 2,000 invoices a week, the budget is approved and we would like to go live at the end of January. Can we talk on the phone this week? You can reach me at 0171 5550123.",
       score:87,cat:"Hot",why:"Budget approved, start date named, company verified",emp:"142",rev:"18 million €",branche:"Logistics"},
    steps:[].concat(P1,GATE,DUPSEARCH,AGENT_OK,STORE,[st("telegram_approval_request","route_by_category",{io:0}),st("build_dossier","route_by_category",{io:0}),st("send_dossier","build_dossier"),st("send_confirmation","route_by_category",{io:0})]),
    end:"Hot lead: stored, approval requested, dossier and confirmation sent, run reported as successful."},
  B:{id:"B",title:"Spam: rules",err:true,kind:"spam1",
    L:{name:"Tim Weber",firma:"",email:"tim.weber@web.example",tel:"",domain:"web.example",free:true,subj:"Hilfe",body:"Hi",reason:"Message too short"},
    steps:[].concat(P1,[st("drop_spam","spam_prefilter",{io:0,stop:1}),st("ps_spam","drop_spam")]),
    end:"Spam stopped by the rules: nothing stored, no reply, no AI cost. The run still counts as successful."},
  C:{id:"C",title:"Spam: AI filter",err:true,kind:"spam2",
    L:{name:"Marketing team",firma:"Reichweite Plus",email:"info@reichweite-plus.example",tel:"",domain:"reichweite-plus.example",free:false,subj:"More visibility for your company",
       body:"Hello,\nwe guarantee you place 1 on Google and thousands of new customers a month. Reply today and secure 50 percent off.",reason:"Advertising without relevance"},
    steps:[].concat(P1,GATE.slice(0,1),[st("drop_spam","spam_gate",{io:0,stop:1}),st("ps_spam","drop_spam")]),
    end:"Spam stopped by the AI filter: the rules did not detect it, the model did."},
  D:{id:"D",title:"Known sender",err:false,kind:"dup",
    L:{name:"Jonas Fischer",anrede:"Mr Fischer",firma:"Fischer Metallbau",email:"j.fischer@fischer-metallbau.example",tel:"",domain:"fischer-metallbau.example",free:false,subj:"Addition to my inquiry",
       body:"Hello,\nin addition to my inquiry from Monday: we have three locations, and invoices arrive everywhere. Please take that into account.",reason:"Sender already in Airtable"},
    steps:[].concat(P1,GATE,DUPSEARCH,[st("email_duplicate_notice","is_duplicate",{io:0}),st("append_followup","is_duplicate",{io:0}),st("telegram_followup","append_followup"),st("ps_dup","append_followup")]),
    end:"Known sender: message appended, team informed, no new scoring."},
  E:{id:"E",title:"Unclear inquiry",err:false,kind:"unclear",
    L:{name:"Sabine Koch",anrede:"Ms Koch",firma:"",email:"sabine.koch@mail.example",tel:"",domain:"mail.example",free:true,subj:"Question about automation",
       body:"Hello,\nwe are generally interested in automation. Please get in touch with us.",score:42,cat:"Clarification",why:"No concrete plan, no company recognisable",emp:"–",rev:"–",branche:"unknown"},
    steps:[].concat(P1,GATE,DUPSEARCH,AGENT_OK,STORE,[st("telegram_clarification","route_by_category",{io:3}),st("email_clarification","route_by_category",{io:3})]),
    end:"Unclear inquiry: stored, the sender gets a clarification request, the team is informed."},
  F:{id:"F",title:"AI outage",err:true,kind:"fail",
    L:{name:"Lena Hoffmann",anrede:"Ms Hoffmann",firma:"Hoffmann Logistics GmbH",email:"lena.hoffmann@hoffmann-logistik.example",tel:"0171 5550123",domain:"hoffmann-logistik.example",free:false,
       subj:"Inquiry: capture invoices automatically",
       body:"Hello,\nI head purchasing at Hoffmann Logistics GmbH. We process about 2,000 invoices a week, the budget is approved and we would like to go live at the end of January.",
       score:0,cat:"Clarification",why:"AI not reachable, fallback value set"},
    steps:[].concat(P1,GATE,DUPSEARCH,[st("ai_agent","is_duplicate",{io:1,crash:1}),st("ai_fallback","ai_agent",{io:1}),st("process_ai_output","ai_fallback")],STORE,[st("telegram_clarification","route_by_category",{io:3}),st("email_clarification","route_by_category",{io:3})]),
    end:"AI outage caught: the lead was not lost, it runs through as a clarification."}
};
const CASE_ORDER = ["A","B","C","D","E","F"];

// ---------- Code-Auszüge für die Code-Nodes (einfache Kommentare, Auszug aus dem n8n-Code) ----------
const CODE = {
  check_lead: `// Limits for the spam suspicion
const MIN_NACHRICHT_LAENGE = 5;
const MAX_LINKS = 3;

// We do this for every mail
return $input.all().map((item, index) => {
  // Count the links in the message
  const anzahlLinks = (nachricht.match(/https?:\/\//gi) || []).length;

  // Here we collect the reasons for spam
  const gruende = [];
  if (AUTOMATISCHE_ABSENDER.test(email)) gruende.push('automatischer Absender');
  if (nachricht.length < MIN_NACHRICHT_LAENGE) gruende.push('Message too short');
  if (anzahlLinks > MAX_LINKS) gruende.push('zu viele Links');

  // The mail moves on, with the result attached
  return { json: { ...lead, spamVerdacht: gruende.length > 0 } };
});`,
  process_ai_output: `// Every category has a score range
const KATEGORIEN = {
  hot:  { min: 70, max: 100, prioritaet: 'Hoch' },
  warm: { min: 40, max: 69,  prioritaet: 'Mittel' },
  kalt: { min: 1,  max: 39,  prioritaet: 'Niedrig' },
  // …
};
// If the AI answer is unclear, we treat the lead as warm
const FALLBACK_KATEGORIE = 'warm';

// Get the result of the AI
const ki = item.json.output || {};
// Check the category, otherwise fallback
const kategorie = KATEGORIEN[ki.kategorie] ? ki.kategorie : FALLBACK_KATEGORIE;
const regel = KATEGORIEN[kategorie];
// Force the score into the range of the category
const rohScore = Math.round(Number(ki.score));
const score = Math.min(regel.max, Math.max(regel.min, rohScore));
// Remove names, mail and phone from the text
const reasoning = anonym(ki.begruendung, namen);`,
  build_dossier: `// Get the data of the lead
const d = $('process_ai_output').all()[index].json;
// Build the link to the record in Airtable
const link = BASIS_LINK + item.json.id;
// Red flags as a list, otherwise "no irregularities"
const flags = d.redFlags.length ? d.redFlags.map(…) : '<li>no irregularities</li>';

// Build the page from heading, key figures and sections
const html = [
  '<h1>Lead dossier: ' + esc(d.kategorie) + '</h1>',
  '<div class="k">…Score, Umsatz, Mitarbeitende…</div>',
  '<h2>Why this rating</h2>…',
  '<h2>Red Flags</h2>…',
].join('');

// Turn it into an HTML file for the mail
const datei = await this.helpers.prepareBinaryData(
  Buffer.from(html, 'utf8'), 'lead-dossier.html', 'text/html');`
};
