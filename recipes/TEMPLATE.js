/* ==========================================================================
   REZEPT-VORLAGE

   Neues Rezept anlegen:
     1. Diese Datei kopieren und umbenennen, z. B. "miso-aubergine.js"
     2. Inhalte eintragen. `slug` muss exakt dem Dateinamen entsprechen.
     3. "miso-aubergine" in /recipes/list.js eintragen.

   Nur `title` ist Pflicht. Alles andere kann gelöscht werden — leere
   Abschnitte verschwinden automatisch von der Seite.
   ========================================================================== */

recipe({
  // Steht in der Adresszeile. Muss zum Dateinamen passen: klein, mit Bindestrichen.
  slug: "miso-aubergine",

  title: "Miso-Aubergine",

  // Ein Satz. Erscheint unter dem Titel und auf der Übersichtskarte.
  subtitle: "Weich geschmort, glasiert bis sie glänzt.",

  // Sollte exakt einer Kategorie aus config.js entsprechen. Steht sie dort
  // nicht, wird sie trotzdem als zusätzlicher Filter angezeigt.
  category: "Hauptgerichte",

  // Frei wählbar. Wird mitdurchsucht, aber nicht auf der Seite angezeigt.
  tags: ["Japanisch", "Feierabend", "Vegetarisch"],

  // Bilder in /assets/images/ ablegen. Das erste ist das Titelbild.
  // Liste leer lassen -> ein Platzhalter wird gezeichnet.
  images: [
    // "assets/images/miso-aubergine-1.jpg",
  ],

  // Bezugsgröße. Alle Mengen skalieren von dieser Zahl aus.
  servings: 2,
  servingsUnit: "Portionen", // z. B. "Portionen", "Stücke", "Gläser"

  // Minuten. Einzelne Felder dürfen fehlen.
  times: { prep: 10, cook: 25, rest: 0 },

  difficulty: "Einfach", // Einfach | Mittel | Anspruchsvoll — frei wählbar

  // Ein, zwei Sätze: Herkunft, warum du es kochst, worauf zu achten ist.
  intro:
    "Hier etwas Nützliches schreiben: woher das Rezept kommt, warum du es " +
    "machst, wo die Fallstricke liegen.",

  // OPTIONAL. Ganzer Block löschbar — dann erscheint kein Nährwert-Abschnitt.
  // Werte pro Portion. Einzelne Zeilen weglassen ist ebenfalls in Ordnung.
  nutrition: {
    kcal: 320,
    protein: 8,
    carbs: 34,
    sugar: 18,
    fat: 16,
    saturates: 2,
    fibre: 9,
    salt: 1.4,
    // per: "pro Stück",   // überschreibt "pro Portion"
  },

  equipment: ["Backblech", "Backpinsel", "Kleine Schüssel"],

  // Zwei Schreibweisen:
  //   { qty: 200, unit: "g", name: "Mehl", note: "gesiebt" }  <- skaliert mit
  //   "Salz nach Geschmack"                                    <- skaliert nie
  // { heading: "Für die Glasur" } beginnt eine Zwischenüberschrift.
  ingredients: [
    { qty: 2, name: "Auberginen", note: "längs halbiert" },
    { qty: 2, unit: "EL", name: "neutrales Öl" },
    { heading: "Glasur" },
    { qty: 3, unit: "EL", name: "helles Miso" },
    { qty: 2, unit: "EL", name: "Mirin" },
    { qty: 1, unit: "EL", name: "Zucker" },
    "Geröstete Sesamsamen zum Bestreuen",
  ],

  // Ebenfalls zwei Schreibweisen:
  //   { title: "Kurze Überschrift", body: "Die Anweisung." }
  //   "Nur die Anweisung."
  steps: [
    {
      title: "Einschneiden und backen",
      body: "Die Schnittflächen rautenförmig einritzen, mit Öl bestreichen und bei 200 °C etwa 20 Minuten backen, bis das Fruchtfleisch weich ist.",
    },
    "Die Zutaten für die Glasur glatt rühren.",
    "Die Glasur aufstreichen und 3–4 Minuten unter den Grill schieben, bis sie Blasen wirft. Dabei bleiben — das brennt schnell an.",
  ],

  notes: [
    "Statt Mirin ein Schuss Sake und eine Prise Zucker mehr.",
    "Reste schmecken kalt über Reis noch besser.",
  ],

  // Woher das Rezept stammt. Text, optional mit Link.
  source: "",
  sourceUrl: "",
});
