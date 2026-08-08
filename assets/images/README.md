# Hier kommen die Fotos hin

Rezeptfotos in diesen Ordner legen und im Rezept darauf verweisen:

```js
images: [
  "assets/images/cacio-e-pepe-1.jpg",
  "assets/images/cacio-e-pepe-2.jpg",
],
```

Das **erste Bild ist das Titelbild** — es erscheint auf der Übersichtskarte und
hinter dem Rezepttitel. Der Rest landet weiter unten in der Galerie.

Ein paar Gewohnheiten, die das aufgeräumt halten:

- Dateien nach dem Slug benennen: `cacio-e-pepe-1.jpg`, `cacio-e-pepe-2.jpg`.
- Querformat sieht am besten aus. Das Titelbild wird im Verhältnis 4:3 gezeigt.
- Vor dem Hochladen auf etwa **1600 px Breite** verkleinern und als JPEG mit
  rund 80 % Qualität speichern. Handyfotos haben oft 5–8 MB, was die Seite im
  Mobilfunknetz zäh macht. 1600 px reichen völlig und landen meist unter 400 KB.
- Noch kein Foto? `images: []` stehen lassen — dann wird ein Platzhalter aus den
  Initialen des Rezepts gezeichnet. Das sieht gewollt aus, nicht kaputt.

Stimmt ein Pfad nicht, fällt die Seite auf denselben Platzhalter zurück statt
ein kaputtes Bild anzuzeigen.
