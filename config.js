/* ==========================================================================
   SEITEN-EINSTELLUNGEN / SITE SETTINGS
   Alles Globale steht hier. Wert ändern, speichern, neu laden. Fertig.
   ========================================================================== */

window.SITE = {
  // Titel im Kopf und im Browser-Tab.
  title: "Das Rezeptbuch",

  // Eine Zeile unter dem Titel. "" versteckt sie.
  tagline: "Alles, was ein zweites Mal gekocht gehört.",

  // Kleingedrucktes am Seitenende. "" versteckt es.
  footer: "Von Hand gesammelt. Oft gekocht.",

  // Die Kategorien der Übersichtsseite, in genau dieser Reihenfolge.
  // Hier umbenennen, umsortieren, ergänzen oder löschen.
  // Der Wert muss exakt dem `category`-Feld im Rezept entsprechen.
  // Eine Kategorie, die in keinem Rezept vorkommt, wird ausgeblendet.
  categories: [
    "Frühstück",
    "Vorspeisen",
    "Hauptgerichte",
    "Pasta",
    "Suppen & Eintöpfe",
    "Beilagen",
    "Backen",
    "Desserts",
  ],

  // Die eine Akzentfarbe: Links, Fokus, Fortschritt, Sterne.
  accent: "#1B3FB0",
  accentDark: "#8FA8FF",

  // "auto" folgt dem Gerät. Oder fest "light" / "dark".
  defaultTheme: "auto",

  // Sortierung beim Öffnen: "newest" | "az" | "quickest" | "favorites"
  defaultSort: "newest",
};
