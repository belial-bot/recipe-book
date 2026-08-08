# Das Rezeptbuch

Eine statische Rezeptseite. Kein Build-Schritt, keine Abhängigkeiten, kein
Server — `index.html` öffnen und es läuft, egal ob von der Festplatte oder von
GitHub Pages.

---

## Rezept hinzufügen

Zwei Schritte, jedes Mal.

**1. `recipes/TEMPLATE.js` kopieren**, in denselben Ordner legen und nach dem
Gericht benennen, klein und mit Bindestrichen:

```
recipes/miso-aubergine.js
```

Ausfüllen. `slug` muss exakt dem Dateinamen entsprechen (`"miso-aubergine"`).
Alle anderen Felder sind optional — was du löschst, verschwindet von der Seite.

**2. Den Dateinamen in `recipes/list.js` eintragen**, ohne `.js`:

```js
window.RECIPE_FILES = [
  "brathaehnchen-mit-brotsalat",
  "spaghetti-cacio-e-pepe",
  "miso-aubergine",          // ← neu, ganz unten
];
```

Das war's. Übersicht, Suche, Kategoriefilter, Zähler und die Vor/Zurück-Links
ziehen sich das beim nächsten Laden von selbst.

> **Warum zwei Schritte?** Damit die Rezeptdaten an genau einer Stelle liegen.
> Die Übersicht liest dieselbe Datei wie die Rezeptseite, also können die
> beiden nie auseinanderlaufen. Die Liste ist nur das Inhaltsverzeichnis.

Neue Rezepte kommen **ans Ende** der Liste — danach sortiert „Neueste".

---

## Die Seite selbst ändern

Alles Globale steht in `config.js`:

```js
window.SITE = {
  title: "Das Rezeptbuch",
  tagline: "Alles, was ein zweites Mal gekocht gehört.",
  footer: "Von Hand gesammelt. Oft gekocht.",
  categories: [ … ],       // die Filterknöpfe der Übersicht
  accent: "#1B3FB0",       // helles Design
  accentDark: "#8FA8FF",   // dunkles Design
  defaultTheme: "auto",    // "auto" | "light" | "dark"
  defaultSort: "newest",   // "newest" | "az" | "quickest" | "favorites"
};
```

Titel dort ändern und er ändert sich im Kopf, im Aufmacher und im Browser-Tab
auf allen Seiten gleichzeitig. Genauso die Akzentfarbe: ein Wert steuert Links,
Fokusrahmen, abgehakte Schritte, den Fortschrittsbalken, die Sterne und die
Platzhalter-Grafik.

### Kategorien

`categories` in `config.js` bestimmt **Wortlaut und Reihenfolge** der
Filterknöpfe. Der Wert muss exakt dem `category`-Feld im Rezept entsprechen.

- Eine Kategorie, die in **keinem** Rezept vorkommt, wird ausgeblendet — du
  kannst also ruhig auf Vorrat welche eintragen.
- Eine Kategorie, die ein Rezept benutzt, aber **nicht** in der Liste steht,
  wird hinten angehängt. So wird nie ein Rezept unerreichbar, nur weil du dich
  vertippt hast.

Dieselben Wörter erscheinen als kleine Kennzeichnung über dem Rezepttitel.
Schlagwörter (`tags`) tauchen dort bewusst **nicht** auf — sie sind nur für die
Suche da.

### UI-Texte

Jedes Wort, das die Seite aus JavaScript erzeugt, steht im `T`-Objekt oben in
`assets/app.js`. Die wenigen festen Texte (Suchfeld-Platzhalter, die
Sortier-Auswahl, „Überrasch mich") stehen direkt in `index.html`.

---

## Ein Rezept schreiben

**Zutaten** in zwei Schreibweisen:

```js
{ qty: 200, unit: "g", name: "Spaghetti", note: "oder Tonnarelli" }
"Salz nach Geschmack"
```

Alles mit `qty` **skaliert automatisch**, wenn du auf der Seite die Portionen
änderst. Reine Textzeilen skalieren nie — für „nach Geschmack", „ein Schuss"
und Ähnliches. `{ heading: "Für die Glasur" }` beginnt eine Zwischenüberschrift.

**Schritte** ebenso:

```js
{ title: "Pfeffer rösten", body: "Grob zerstoßen, dann …" }
"Nur die Anweisung."
```

**Zeiten** in Minuten. `total` wird addiert, wenn du es nicht selbst setzt:

```js
times: { prep: 10, cook: 25, rest: 5 }
```

**Nährwerte** sind optional. Ganzer Block weg → kein Nährwert-Abschnitt.
Einzelne Zeilen weglassen geht auch:

```js
nutrition: {
  kcal: 385, protein: 5, carbs: 46, sugar: 27,
  fat: 20, saturates: 3, fibre: 4, salt: 0.4,
  per: "pro Stück",     // optional, sonst "pro Portion"
}
```

Die Werte gelten pro Portion und skalieren deshalb **nicht** mit der
Portionszahl mit.

**Bilder** — siehe `assets/images/README.md`.

---

## Auf GitHub stellen

1. Ein Repository anlegen (öffentlich — GitHub Pages ist für öffentliche Repos
   kostenlos).
2. Den gesamten Inhalt dieses Ordners in die Wurzel des Repos hochladen. Auf
   github.com kannst du die Dateien direkt in **Add file → Upload files**
   ziehen.
3. Unter **Settings → Pages** die **Source** auf *Deploy from a branch* stellen,
   `main` und `/ (root)` wählen, speichern.
4. Eine Minute später läuft die Seite unter
   `https://<benutzername>.github.io/<repo-name>/`.

Später ein Rezept ergänzen heißt: die neue `recipes/<name>.js` hochladen und
die geänderte `recipes/list.js` committen. Die Seite baut sich beim nächsten
Aufruf selbst neu.

Die Datei `.nojekyll` sagt GitHub Pages, den Ordner unverändert auszuliefern.
Bitte dort lassen.

### Andere Hoster

Den Ordner auf [Netlify Drop](https://app.netlify.com/drop) ziehen und die
Seite ist sofort online. Cloudflare Pages und Vercel funktionieren genauso.
Nichts hier braucht einen Build-Befehl.

### Auf dem Handy

Sobald die Seite online ist, in Safari oder Chrome öffnen und **Zum Home-
Bildschirm hinzufügen**. Dann verhält sie sich wie eine App.

---

## Was die Seiten können

**Übersicht** — Live-Suche über Titel, Zutaten, Schlagwörter und Ausstattung;
Kategoriefilter aus `config.js`; Sortierung nach Neueste, A–Z, Schnellste oder
Favoriten; „Überrasch mich" für ein zufälliges Rezept. `/` springt überall ins
Suchfeld, `Esc` leert es. Die Karten gleiten beim Filtern an ihre neue Position,
statt zu springen.

**Favoriten** — der Stern oben rechts auf jeder Karte und neben jedem
Rezepttitel. Gemerkt wird das im Browser des jeweiligen Geräts, nicht in einer
Datei — Handy und Laptop führen also getrennte Listen.

**Rezeptseite** — ein Portionsregler, der jede Menge live umrechnet;
Zutaten und Schritte lassen sich antippen und abhaken (pro Rezept gemerkt);
Bildergalerie mit Lightbox; Lesefortschritt; optionale Nährwerte; und der
**Kochmodus**: größere Schrift, weniger Drumherum, und auf unterstützten
Geräten bleibt der Bildschirm wach, solange die Hände voll Mehl sind.

Beide Seiten haben einen Hell/Dunkel-Schalter, der standardmäßig dem Gerät
folgt, funktionieren bis hinunter zu kleinen Handys, respektieren „Bewegung
reduzieren" und drucken sauber, falls du eine Papierfassung auf der Arbeits-
platte willst.

---

## Dateiübersicht

```
index.html            Übersichtsseite
recipe.html           Zeigt ein einzelnes Rezept (recipe.html?r=slug)
config.js             ← Titel, Untertitel, Kategorien, Farbe, Voreinstellungen
recipes/
  list.js             ← das Inhaltsverzeichnis
  TEMPLATE.js         Kopiervorlage für ein neues Rezept
  *.js                Eine Datei pro Rezept
assets/
  style.css           Gesamtes Design, Farbwerte ganz oben
  app.js              Konfiguration, Design, Laden, UI-Texte (T), Zahlen, Favoriten
  overview.js         Suche, Filter, Sortierung, Kartenanimation
  recipe.js           Rezeptdarstellung, Skalierung, Kochmodus
  images/             Deine Fotos
.nojekyll             Sagt GitHub Pages, nichts umzubauen
```

Die vier enthaltenen Rezepte sind Beispiele. Ihre Dateien und ihre Zeilen in
`recipes/list.js` löschen, sobald deine eigenen drin sind.
