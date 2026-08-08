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
  slug: "kuerbis-quiche",

  title: "Kürbis Quiche",

  // Ein Satz. Erscheint unter dem Titel und auf der Übersichtskarte.
  subtitle: "Ein Kuchen der etwas anderen Art.",

  // Sollte exakt einer Kategorie aus config.js entsprechen. Steht sie dort
  // nicht, wird sie trotzdem als zusätzlicher Filter angezeigt.
  category: "Hauptgerichte",

  // Frei wählbar. Wird mitdurchsucht, aber nicht auf der Seite angezeigt.
  tags: ["Kürbis"],

  // Bilder in /assets/images/ ablegen. Das erste ist das Titelbild.
  // Liste leer lassen -> ein Platzhalter wird gezeichnet.
  images: [
    "assets/images/kuerbis-quiche-1.jpg",
  ],

  // Bezugsgröße. Alle Mengen skalieren von dieser Zahl aus.
  servings: 4,
  servingsUnit: "Portionen", // z. B. "Portionen", "Stücke", "Gläser"

  // Minuten. Einzelne Felder dürfen fehlen.
  times: { prep: 25, cook: 45, rest: 0 },

  difficulty: "Mittel", // Einfach | Mittel | Anspruchsvoll — frei wählbar

  // Ein, zwei Sätze: Herkunft, warum du es kochst, worauf zu achten ist.
  intro:
    "Diese herzhafte Kürbis-Quiche kombiniert einen knusprigen Mürbeteig mit einer cremigen Füllung aus aromatischem Hokkaido, Schinken und geschmolzenem Käse. Sie lässt sich unkompliziert zubereiten und ist sowohl warm als auch kalt ein absoluter Genuss.",

  // OPTIONAL. Ganzer Block löschbar — dann erscheint kein Nährwert-Abschnitt.
  // Werte pro Portion. Einzelne Zeilen weglassen ist ebenfalls in Ordnung.
  nutrition: {
    kcal: 800,
    protein: 30,
    carbs: 50,
    sugar: 10,
    fat: 55,
    saturates: 30,
    fibre: 5,
    salt: 2.5,
    // per: "pro Stück",   // überschreibt "pro Portion"
  },

  equipment: ["Springform", "Nudelholz", "Backpinsel"],

  // Zwei Schreibweisen:
  //   { qty: 200, unit: "g", name: "Mehl", note: "gesiebt" }  <- skaliert mit
  //   "Salz nach Geschmack"                                    <- skaliert nie
  // { heading: "Für die Glasur" } beginnt eine Zwischenüberschrift.
  ingredients: [
    { heading: "Teig" },
    { qty: 200, unit: "g", name: "Mehl" },
    { qty: 100, unit: "g", name: "Butter", note: "oder Margarine" },
    { qty: 3, unit: "EL", name: "kaltes Wasser" },
    "Eine Prise Salz",
    "Fett für die Form",
    { heading: "Füllung & Guss" },
    { qty: 700-1000, unit: "g", name: "Hokkaido-Kürbis", note:"mit Schale verwendbar" },
    { qty: 1, name: "Zwiebel", note:"fein gehackt" },
    { qty: 150, unit: "g", name: "Schinken", note:"klein geschnitten" },
    { qty: 200, unit: "g", name: "Sauerrahm", note:"oder Schmand" },
    { qty: 2, name: "Eier" },
    { qty: 150, unit: "g", name: "Emmentaler", note:"geribeben" },
    "Salz, Pfeffer, Muskatnuss, optional basilikum, Currypulver, Kurkuma",
  ],

  // Ebenfalls zwei Schreibweisen:
  //   { title: "Kurze Überschrift", body: "Die Anweisung." }
  //   "Nur die Anweisung."
  steps: [
    "Mehl, Butter, 3 EL Wasser und eine Prise Salz zu einem glatten Teig verkneten und 30 Minuten abgedeckt in den Kühlschrank stellen.",
    "Den Kürbis auseinander schneiden, die Kerne entfernen und das Fleisch ohne Schale klein schneiden und mit einer Zwiebel glasig anschwitzen und danach zur Seite stellen. Den Schinken klein schneiden und dazugeben.",
    "Den Sauerrahm, Sahne, Eier und den Emmentaler gut verrühren und zur Kürbismasse geben. Nach Belieben mit Salz, Pfeffer, Muskatnuss, Basilikum würzen.",
    "Den Teig ausrollen, in eine gefettete Springform legen (optional 10 Minuten blind vorbacken), die Kürbismasse darauf verteilen und bei 200 °C Ober-/Unterhitze ca. 45 Minuten backen.",
  ],

  notes: [
    "Schmeckt auch ohne Schinken gut.",
    "Der Hokkaido-Kürbis muss nicht geschält werden. Ein kurzes Anbraten in der Pfanne reicht völlig aus, da er im Ofen während der 45 Minuten fertig gart.",
    "Angebratenen Kürbis im Sieb abtropfen lassen, damit der Boden nicht wässrig wird.",
    "Teigboden vor dem Belegen 10 Min. blind vorbacken verhindert Durchweichen.",

  ],

  // Woher das Rezept stammt. Text, optional mit Link.
  source: "",
  sourceUrl: "",
});
