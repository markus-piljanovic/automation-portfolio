# ============================================================
# KONTEXT: Der Compliance-Bot durchsucht Gesetzestexte. Große Texte findet die Suche schlecht,
#          kleine Karteikarten gut.
# CODE:    Liest zwei Gesetze (HTML) und schneidet sie in Karten (JSON), je Karte ein Etikett.
# BEISPIEL: DSGVO.html -> Karte "DSGVO Art. 28 – Auftragsverarbeiter (Teil 1/2)" + Etikett (Thema "pflichten" ...)
# Aufbau:  1) Einstellungen -> 2) Hilfsfunktionen -> 3) Hauptschleife -> 4) Speichern + Kontrollzahlen
# Lesehilfe: Über jeder Codezeile steht in Anführungszeichen, wie man sie "spricht".
# ============================================================

# "Lade die Bibliotheken re und json." Beide sind in Python schon eingebaut.
# re = Suchmuster (Suchen/Ersetzen mit Muster, z. B. "finde ( + Zahl + )"), json = Daten als JSON-Datei speichern
import re, json

# "Nimm aus dem Kasten bs4 das Werkzeug BeautifulSoup." Kasten = bs4, Hammer = BeautifulSoup.
# bs4 kommt per "pip install beautifulsoup4" (einmal, Python-App-Store). Es liest HTML.
# BEISPIEL: BeautifulSoup(html).select('div[id="art_28"]') = "gib mir den Block von Artikel 28"
from bs4 import BeautifulSoup

# ============================================================
# 1) EINSTELLUNGEN
# ============================================================

# KONTEXT: Pro Gesetz ein "Bestellzettel". Neues Gesetz (z. B. BDSG) = hier einen Block ergänzen.
# CODE:    stand = Abrufdatum, fassung = welche Version, quelle = Link zum Original (für Artikel-Links).
# BEISPIEL: LAWS["32016R0679"]["datei"] ist "DSGVO.html"
LAWS = {
    "32016R0679": {
        "gesetz": "DSGVO", "name": "Verordnung (EU) 2016/679", "datei": "DSGVO.html",
        "stand": "2026-10-06",
        "fassung": "Amtsblatt-Fassung (Original, ohne spätere Änderungen)",
        "quelle": "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:32016R0679",
    },
    # AI Act = die NEUE Fassung mit den Änderungen aus dem AI Omnibus (Verordnung 2026/1744).
    # Im HTML stehen Änderungs-Etiketten (▼M1, ▼B). Die werfen wir unten raus.
    "02024R1689-20260727": {
        "gesetz": "EU AI Act", "name": "Verordnung (EU) 2024/1689", "datei": "EU-AI-Act_konsolidiert.html",
        "stand": "2026-10-22",
        "fassung": "Konsolidierte Fassung vom 2026-07-27 (einschließlich Änderung durch Verordnung (EU) 2026/1744)",
        "quelle": "https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX:02024R1689-20260727",
    },
}

# Ausgabedatei. Heißt wie die Datei auf dem VPS, damit sie direkt hochgeladen werden kann.
OUT = "chunks.json"

# KONTEXT: Wie groß darf eine Karte sein? Zu groß = Suche findet sie schlecht (Art. 28 ging bei 8000 unter).
#          Zu klein = Listen werden zerrissen (Verbote in AI Act Art. 5).
# CODE:    Zwei Grenzen, gezählt in Zeichen (ca. 4000 Zeichen = 1 Seite).
#          MAX_CHARS  = so groß darf eine Karte werden.
#          MAX_ABSATZ = so groß darf ein einzelner Absatz sein, ohne zerschnitten zu werden.
# BEISPIEL: Absatz mit 5000 Zeichen -> bleibt ganz (unter 6000), die Karte wird größer als 4000.
#           Der Splitter im Ingest-Workflow muss größer sein als die längste Karte (9000 reicht).
MAX_CHARS = 4000
MAX_ABSATZ = 9000

# KONTEXT: Jede Karte bekommt ein "Regalschild" (thema), damit der Chat nur in EINEM Regal suchen kann.
# CODE:    Regelliste wie im Regelserver: (von Artikel, bis Artikel, Thema). Die erste passende Zeile gewinnt.
#          Die Grenzen folgen den Kapiteln des Gesetzes, die Namen sind selbst gewählt.
# BEISPIEL: DSGVO Art. 28 liegt zwischen 24 und 43 -> "pflichten"
THEMEN = {
    "DSGVO": [(1, 4, "grundlagen"), (5, 11, "grundsaetze"), (12, 23, "betroffenenrechte"),
              (24, 43, "pflichten"), (44, 50, "drittland"), (51, 84, "aufsicht_sanktionen"),
              (85, 99, "sonderfaelle")],
    "EU AI Act": [(1, 4, "grundlagen"), (5, 5, "verbote"), (6, 49, "hochrisiko"),
                  (50, 50, "transparenz"), (51, 56, "gpai"), (57, 110, "governance_sanktionen"),
                  (111, 111, "geltungsbeginn"), (112, 112, "governance_sanktionen"),
                  (113, 113, "geltungsbeginn")],
}

# ============================================================
# 2) HILFSFUNKTIONEN (kleine Werkzeuge, die unten benutzt werden)
# ============================================================

# KONTEXT: Frage "In welches Regal kommt diese Karte?"
# BEISPIEL: thema_of("DSGVO", "Artikel", "28")      -> "pflichten"
#           thema_of("EU AI Act", "Artikel", "4a")  -> "grundlagen" (4a zählt wie 4)
#           thema_of("EU AI Act", "Anhang", "III")  -> "hochrisiko"
# "Ich definiere die Funktion thema_of. Sie bekommt ein Gesetz, einen Typ und eine Nummer."
def thema_of(gesetz, typ, nummer):
    # "Wenn der Typ Anhang ist:"
    if typ == "Anhang":
        # Gib hochrisiko zurück, wenn Bedingung stimmt, sonst anhaenge
        # Funktion endet nach return, daher sieht man darunter kein "Else", es ist aber eins
        # Warum "hochrisiko" vorn? Python-Form: WERT_WENN_JA if BEDINGUNG else WERT_WENN_NEIN.
        # "hochrisiko" = Sonderfall, auf den die Bedingung prüft. "anhaenge" = Normalfall (alle übrigen Anhänge).
        return "hochrisiko" if (gesetz == "EU AI Act" and nummer == "III") else "anhaenge"
    # "Es war kein Anhang, also ein Artikel. Nimm von der Nummer nur die Ziffern vorne, mach daraus eine Zahl n."
    # BEISPIEL: "75b" -> "75" -> 75
    n = int(re.match(r"\d+", nummer).group())
    # "Gehe die Themenliste dieses Gesetzes Eintrag für Eintrag durch. lo = von, hi = bis, t = Thema."
    for lo, hi, t in THEMEN[gesetz]:
        # "Liegt n zwischen von und bis, gib das Thema zurück." BEISPIEL: n = 28, Eintrag (24, 43, "pflichten") -> "pflichten"
        if lo <= n <= hi: return t
    # "Hat kein Eintrag gepasst, gib sonstiges zurück."
    return "sonstiges"   # Fallback, sollte nie passieren

# KONTEXT: Absätze beginnen im Gesetz mit "(1)", "(2)" ...
# CODE:    Suchmuster: Zeilenanfang + "(" + Zahl + ")" + Leerzeichen.
# BEISPIEL: ABSATZ.match("(2) Der Auftragsverarbeiter ...") -> Treffer, ABSATZ.match("a) Zweck") -> kein Treffer
ABSATZ = re.compile(r"^\(\d+\)\s")

# KONTEXT: Der Text aus dem HTML ist unordentlich (Sonderzeichen, Fußnoten, Zeilenumbrüche mittendrin).
# CODE:    Putzfrau mit fünf Schritten. Jede Zeile "s = ..." ersetzt etwas im Text.
# "Ich definiere die Funktion clean. Sie bekommt einen Text s."
def clean(s):
    # a) "Ersetze jedes geschützte Leerzeichen durch ein normales."
    #    BEISPIEL: "Artikel\xa028" -> "Artikel 28"
    s = s.replace("\xa0", " ")
    # b) "Mehrere Zeilenumbrüche werden einer, mehrere Leerzeichen werden eines, Leerraum an den Enden weg."
    #    BEISPIEL: "Auftrag   x\n\n\ny" -> "Auftrag x\ny"
    s = re.sub(r"[ \t]+", " ", re.sub(r"\n\s*\n+", "\n", s)).strip()
    # c) "Finde eine Fußnote, die auf drei Zeilen verteilt ist (Klammer auf, Zahl oder Stern, Klammer zu), ersetze sie durch ein Leerzeichen."
    #    BEISPIEL: "Daten\n(\n19\n)\nund" -> "Daten und"
    s = re.sub(r"\s*\n ?\( ?\n ?(?:\d+|\*) ?\n ?\) ?\n?", " ", s)
    # d) "Steht ein Listenzeichen (a), iv), 10., 4.4., Strich) allein in einer Zeile, klebe es an den Text dahinter."
    #    Sonst trennt der Splitter "a)" von seinem Satz.
    #    BEISPIEL: "a)\nZweck" -> "a) Zweck"   ("10.\nText" -> "10. Text")
    s = re.sub(r"(?m)^ ?([a-z]{1,4}\)|\d+[a-z]?(?:\.\d+)*\.|[—–*]) ?\n", r"\1 ", s)
    # e) "Steht eine Absatznummer (1) allein in der Zeile, klebe sie an den Text dahinter."
    #    Neue AI-Act-Fassung: "(1)" steht allein. Sonst erkennt ABSATZ den Absatzanfang nicht.
    #    BEISPIEL: "(1)\nSoweit dies ..." -> "(1) Soweit dies ..."
    s = re.sub(r"(?m)^(\(\d+\)) ?\n", r"\1 ", s)
    # "Gib den geputzten Text zurück."
    return s

# KONTEXT: Von einem HTML-Block zum sauberen Text.
# BEISPIEL: <p>Artikel 28</p><p>Auftragsverarbeiter</p> -> "Artikel 28\nAuftragsverarbeiter"
# "Ich definiere die Funktion text_of. Sie bekommt ein HTML-Element."
def text_of(el):
    # "Hole jedes Textstück auf eine eigene Zeile, putze alles mit clean und gib es zurück."
    return clean(el.get_text("\n"))

# KONTEXT: Simpler Stapler für Anhänge und für Riesen-Absätze.
# CODE:    Zeile für Zeile auf einen Stapel legen. Wird er größer als MAX_CHARS -> neuer Stapel.
#          Jeder Stapel = eine Karte.
# BEISPIEL: 5 Zeilen à 1500 Zeichen -> 3 Stapel (2 + 2 + 1 Zeilen)
# "Ich definiere die Funktion split_lines. Sie bekommt eine Liste von Zeilen."
def split_lines(lines):
    # "parts = fertige Stapel (leere Liste), cur = aktueller Stapel (leerer Text)."
    parts, cur = [], ""
    # "Nimm jede Zeile nacheinander:"
    for p in lines:
        # "Ist der aktuelle Stapel nicht leer und würde mit der Zeile größer als MAX_CHARS:
        #  lege den Stapel zu den fertigen und beginne einen neuen."
        if cur and len(cur) + len(p) > MAX_CHARS:
            parts.append(cur); cur = ""
        # "Hänge die Zeile an den aktuellen Stapel, mit Zeilenumbruch davor, wenn er nicht leer ist."
        cur += ("\n" if cur else "") + p
    # "Der letzte Stapel kommt auch noch dazu."
    if cur: parts.append(cur)
    # "Gib alle Stapel zurück."
    return parts

# KONTEXT: Langer Artikel muss in mehrere Karten, aber nicht mitten im Absatz.
# CODE:    Drei Schritte (unten). Eingabe = Liste der Zeilen des Artikels.
# BEISPIEL: DSGVO Art. 28 (ca. 6500 Zeichen) -> 2 Karten ("Teil 1/2" mit 3897 und "Teil 2/2" mit 2589 Zeichen)
# "Ich definiere die Funktion split_long. Sie bekommt die Zeilen eines Artikels."
def split_long(lines):

    # Schritt 1: "Gruppiere die Zeilen zu Absatz-Blöcken. Ein neuer Block beginnt bei (1), (2) ..., alles andere hängt am letzten Block."
    # BEISPIEL: ["(1) Der Anbieter", "a) Zweck", "(2) Die Kommission"] -> ["(1) Der Anbieter\na) Zweck", "(2) Die Kommission"]
    blocks = []
    for ln in lines:
        if ABSATZ.match(ln) or not blocks:
            blocks.append(ln)
        else:
            blocks[-1] += "\n" + ln

    # Schritt 2: "Ein Block bis MAX_ABSATZ bleibt ganz. Nur Riesen-Blöcke werden zeilenweise zerlegt."
    # BEISPIEL: Block mit 5000 Zeichen -> bleibt ein Stück. Block mit 8000 Zeichen -> mehrere Stücke.
    units = []
    for b in blocks:
        units.extend([b] if len(b) <= MAX_ABSATZ else split_lines(b.split("\n")))

    # Schritt 3: "Bündle die Stücke wie beim Stapler zu Karten bis MAX_CHARS."
    # BEISPIEL: Stücke à 2500, 1200, 3000 Zeichen -> Karte 1 (2500 + 1200), Karte 2 (3000)
    parts, cur = [], ""
    for u in units:
        if cur and len(cur) + len(u) > MAX_CHARS:
            parts.append(cur); cur = ""
        cur += ("\n" if cur else "") + u
    if cur: parts.append(cur)
    return parts

# ============================================================
# 3) HAUPTSCHLEIFE: pro Gesetz -> HTML lesen -> Karten bauen
# ============================================================
# "chunks = der Karteikasten, am Anfang leer."
chunks = []

# KONTEXT: Wir haben zwei Gesetze, jedes soll gleich behandelt werden.
# BEISPIEL Durchlauf 1: celex = "32016R0679", info = {"gesetz": "DSGVO", "datei": "DSGVO.html", "stand": "2026-10-06", ...}
# "Nimm jedes Gesetz aus LAWS nacheinander (celex = Schlüssel, info = Bestellzettel). Alles Eingerückte läuft je Gesetz einmal."
for celex, info in LAWS.items():
    # "Öffne die HTML-Datei, lies sie ganz und mach sie durchsuchbar. soup = Etikett auf der Kiste."
    # BEISPIEL: info["datei"] ist "DSGVO.html" -> open("DSGVO.html") -> .read() = der ganze HTML-Text
    soup = BeautifulSoup(open(info["datei"], encoding="utf-8").read(), "lxml")
    # "Merke dir Link, Abrufdatum und Version dieses Gesetzes."
    url = info["quelle"]                              # BEISPIEL: "https://eur-lex.europa.eu/...CELEX:32016R0679"
    STAND, FASSUNG = info["stand"], info["fassung"]   # BEISPIEL: "2026-10-06", "Amtsblatt-Fassung (Original ...)"

    # --- Vorputz am HTML (bevor wir Text rausziehen) ---
    # a) KONTEXT: Die neue AI-Act-Fassung markiert Änderungen mit Etiketten.
    #    "Finde alle Absätze mit der Klasse modref und lösche sie. Der Gesetzestext dazwischen bleibt."
    #    BEISPIEL: <p class="modref">▼M1</p> verschwindet (133 Stück im AI-Act-HTML, DSGVO hat keine)
    for marker in soup.select("p.modref"):
        marker.decompose()
    # b) KONTEXT: Kursive/fette Wörter sind eigene HTML-Stücke. get_text("\n") würde sie auf eigene Zeilen setzen.
    #    "Finde alle kursiven, fetten, unterstrichenen Stellen und nimm nur die Umhüllung weg, der Text bleibt."
    #    BEISPIEL: "im <span class="italics">Amtsblatt</span> der EU" -> "im Amtsblatt der EU" (eine Zeile statt drei)
    for inline in soup.select("span.italics, span.bold, span.underline, em, i, b, strong"):
        inline.unwrap()
    # "Klebe benachbarte Textstücke wieder zu einem zusammen."
    soup.smooth()

    # --- ARTIKEL -> Karten ---
    # KONTEXT: Jeder Artikel steckt im HTML in einem eigenen Block <div id="art_28"> (oder "art_4a").
    # "Hole alle Blöcke, deren id mit art_ anfängt, und nimm sie nacheinander als art."
    # BEISPIEL: DSGVO.html liefert 99 Blöcke (art_1 ... art_99). Durchlauf 28: art["id"] ist "art_28"
    for art in soup.select('div.eli-subdivision[id^="art_"]'):
        # "Wenn die id NICHT art_ + Zahl + optional ein Buchstabe ist, überspringe diesen Block."
        # BEISPIEL: "art_28" und "art_4a" passen, "art_28_para" würde übersprungen
        if not re.fullmatch(r"art_\d+[a-z]?", art["id"]): continue
        # "Schneide ab dem Unterstrich ab, was dahinter steht, das ist die Nummer."
        num = art["id"].split("_")[1]   # "art_28" -> "28"   ("art_4a" -> "4a")

        # "Suche die Titelzeile (alte Fassung: oj-sti-art, neue Fassung: stitle-article-norm)."
        ti = art.select_one("p.oj-sti-art, p.stitle-article-norm")
        # "Wurde ein Titel gefunden, putze seinen Text und nimm ihn, sonst bleibt der Titel leer."
        # BEISPIEL: DSGVO Art. 28 -> "Auftragsverarbeiter"
        titel = clean(ti.get_text()) if ti else ""

        # KONTEXT: Den Artikeltext brauchen wir komplett (Absätze mit Unterpunkten stecken oft in Tabellen).
        # "Hole den ganzen Block als sauberen Text."
        body = text_of(art)
        # "Schneide die Kopfzeile 'Artikel 28 / Titel' vorne ab. re.escape = Sonderzeichen im Titel als normalen Text behandeln."
        # BEISPIEL: "Artikel 28\nAuftragsverarbeiter\n(1) Erfolgt eine Verarbeitung ..." -> "(1) Erfolgt eine Verarbeitung ..."
        body = re.sub(r"^Artikel\s*\d+[a-z]?\s*\n" + re.escape(titel) + r"\s*\n?", "", body).strip()

        # "Ist der Text höchstens MAX_CHARS lang, ist er eine Karte. Sonst zerlege ihn mit split_long."
        # BEISPIEL: Art. 28 hat ca. 6500 Zeichen (> 4000) -> parts = [Karte 1, Karte 2]
        parts = [body] if len(body) <= MAX_CHARS else split_long(body.split("\n"))
        # "Nimm jede Karte nacheinander und nummeriere sie ab 1 (i = Nummer, part = Text)."
        # BEISPIEL: parts = ["A", "B"] -> (1, "A"), (2, "B")
        for i, part in enumerate(parts, 1):
            # "Gibt es mehr als eine Karte, hänge ' (Teil 1/2)' an, sonst nichts."
            suffix = f" (Teil {i}/{len(parts)})" if len(parts) > 1 else ""
            # "Lege eine neue Karte in den Karteikasten:"
            chunks.append({
                # content = der Text, der später durchsucht wird (Überschrift + Gesetzestext)
                # BEISPIEL: "DSGVO Art. 28 – Auftragsverarbeiter (Teil 1/2)\n(1) Erfolgt eine Verarbeitung ..."
                "content": f"{info['gesetz']} Art. {num} – {titel}{suffix}\n{part}",
                # metadata = das Etikett auf der Karte (zum Filtern und für die Fundstelle)
                # BEISPIEL: gesetz "DSGVO", nummer "28", thema "pflichten", fundstelle "DSGVO Art. 28 (Teil 1/2)"
                "metadata": {"gesetz": info["gesetz"], "typ": "Artikel", "nummer": num,
                             "thema": thema_of(info["gesetz"], "Artikel", num),
                             "titel": titel, "fundstelle": f"{info['gesetz']} Art. {num}{suffix}",
                             "quelle": url, "stand": STAND, "fassung": FASSUNG}})

    # --- ANHÄNGE -> Karten ---
    # KONTEXT: Anhänge (nur AI Act) sind Listen, z. B. Anhang III = Hochrisiko-Bereiche.
    # CODE:    Gleiches Prinzip wie Artikel, nur einfacher: kein Titel, kein Absatz-Schneiden (split_lines statt split_long).
    # BEISPIEL: id "anx_III" -> num "III" -> Karten "EU AI Act Anhang III (Teil 1/3)", Regal "hochrisiko"
    # "Hole alle Blöcke, deren id mit anx_ anfängt, und nimm sie nacheinander als anx."
    for anx in soup.select('div.eli-container[id^="anx_"], div[id^="anx_"]'):
        # "Passt die id nicht zu anx_ + Großbuchstaben/Zahlen, überspringe den Block."
        if not re.fullmatch(r"anx_[A-Z0-9]+", anx.get("id", "")): continue
        num = anx["id"].split("_")[1]   # "anx_III" -> "III"
        # "Hole den Text, zerlege ihn bei Bedarf, nummeriere die Karten und lege sie ab (wie bei den Artikeln)."
        body = text_of(anx)
        parts = [body] if len(body) <= MAX_CHARS else split_lines(body.split("\n"))
        for i, part in enumerate(parts, 1):
            suffix = f" (Teil {i}/{len(parts)})" if len(parts) > 1 else ""
            chunks.append({
                "content": f"{info['gesetz']} Anhang {num}{suffix}\n{part}",
                "metadata": {"gesetz": info["gesetz"], "typ": "Anhang", "nummer": num,
                             "thema": thema_of(info["gesetz"], "Anhang", num),
                             "titel": "", "fundstelle": f"{info['gesetz']} Anhang {num}{suffix}",
                             "quelle": url, "stand": STAND, "fassung": FASSUNG}})

# ============================================================
# 4) SPEICHERN + KONTROLLZAHLEN
# ============================================================
# KONTEXT: Der Karteikasten (Liste im Speicher) soll als Datei auf die Platte, damit der Ingest ihn lesen kann.
# "Schreibe die Liste chunks in die Datei OUT, Umlaute bleiben Umlaute."
# BEISPIEL: Ergebnis = chunks.json mit 297 Karten
json.dump(chunks, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# KONTEXT: Kontrolle im Terminal: stimmen die Zahlen? (Erwartung laut Memory: 299 gesamt)
# "Hole das Werkzeug Counter, das zählt, wie oft etwas vorkommt."
from collections import Counter
# "Gib aus: Kartenzahl gesamt, Karten je Gesetz und Typ."  BEISPIEL: "299 Counter({('DSGVO', 'Artikel'): 118, ...})"
print(len(chunks), Counter((c["metadata"]["gesetz"], c["metadata"]["typ"]) for c in chunks))           # Karten je Gesetz + Typ
# "Gib aus: Karten je Regal (sortiert)."
print(sorted(Counter((c["metadata"]["gesetz"], c["metadata"]["thema"]) for c in chunks).items()))      # Karten je Regal
# "L = Liste der Kartenlängen. Gib kleinste, größte und durchschnittliche Länge aus."
L = [len(c["content"]) for c in chunks]
print("min/max/avg Zeichen:", min(L), max(L), sum(L)//len(L))                                           # kleinste/größte/Durchschnitts-Karte
