/* ==========================================================================
   Shared runtime — config, theming, recipe loading, formatting.
   Loaded by both index.html and recipe.html.
   ========================================================================== */

(function () {
  "use strict";

  var CFG = window.SITE || {};
  window.RECIPES = [];

  /* --- UI-Texte -----------------------------------------------------------
     Every word the site renders from JavaScript. Translate here and it
     changes everywhere. (The handful of fixed strings in index.html and
     recipe.html sit directly in that markup.)
     ---------------------------------------------------------------------- */

  var T = {
    all: "Alle",
    recipeOne: "Rezept",
    recipeMany: "Rezepte",

    emptyTitle: "Nichts gefunden",
    emptyText: "Kein Rezept passt dazu. Versuch ein kürzeres Wort oder setz die Filter zurück.",

    favAdd: "Zu Favoriten hinzufügen",
    favRemove: "Aus Favoriten entfernen",

    prep: "Vorbereitung",
    cook: "Garzeit",
    rest: "Ruhezeit",
    total: "Gesamt",
    level: "Niveau",

    ingredients: "Zutaten",
    equipment: "Ausstattung",
    method: "Zubereitung",
    notes: "Notizen",
    gallery: "Weitere Bilder",
    nutrition: "Nährwerte",
    perServing: "pro Portion",

    scale: "Menge<br>anpassen",
    fewer: "Weniger Portionen",
    more: "Mehr Portionen",

    source: "Quelle",
    prev: "Vorheriges",
    next: "Nächstes",

    cookOn: "Kochmodus beenden",
    cookOff: "Kochmodus",
    cookWake: "Kochmodus an. Der Bildschirm bleibt wach.",
    cookPlain: "Kochmodus an. Größere Schrift, weniger Drumherum.",

    notFoundEyebrow: "Nicht gefunden",
    notFoundTitle: "Hier ist kein Rezept",
    notFoundLead: "Nichts liegt unter „%s“. ",
    notFoundHint: "Prüf die Schreibweise, oder ob das Rezept in <code>recipes/list.js</code> eingetragen ist.",
    backToAll: "← Zurück zu allen Rezepten",

    minute: "Min.",
    hour: "Std.",

    // Keys of the `nutrition` object, in the order they should appear.
    nutriLabels: {
      kcal: "Kalorien",
      protein: "Eiweiß",
      carbs: "Kohlenhydrate",
      sugar: "davon Zucker",
      fat: "Fett",
      saturates: "davon gesättigt",
      fibre: "Ballaststoffe",
      salt: "Salz",
    },
    nutriUnits: {
      kcal: "kcal", protein: "g", carbs: "g", sugar: "g",
      fat: "g", saturates: "g", fibre: "g", salt: "g",
    },
  };

  /* --- storage (never throws, so private mode / file:// stay usable) ------ */

  var store = {
    get: function (k, fallback) {
      try {
        var v = localStorage.getItem(k);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* no-op */ }
    },
  };

  /* --- favourites --------------------------------------------------------- */

  var FAV_KEY = "favorites";

  function favList() {
    var f = store.get(FAV_KEY, []);
    return Array.isArray(f) ? f : [];
  }
  function isFav(slug) { return favList().indexOf(slug) !== -1; }
  function toggleFav(slug) {
    var f = favList();
    var i = f.indexOf(slug);
    if (i === -1) f.push(slug); else f.splice(i, 1);
    store.set(FAV_KEY, f);
    return i === -1;
  }

  /* One star, two states. Used on cards and in the recipe header. */
  function starHTML(slug, cls) {
    var on = isFav(slug);
    return '<button type="button" class="fav ' + (cls || "") + (on ? " is-on" : "") +
      '" data-fav="' + esc(slug) + '" aria-pressed="' + on + '" title="' +
      (on ? T.favRemove : T.favAdd) + '" aria-label="' + (on ? T.favRemove : T.favAdd) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2.8l2.9 5.9 6.5.95-4.7 4.6 1.1 6.5-5.8-3.05-5.8 3.05 1.1-6.5-4.7-4.6 6.5-.95z"/>' +
      "</svg></button>";
  }

  /* Click handling is delegated once, so re-rendered cards keep working. */
  function wireStars(root, onChange) {
    (root || document).addEventListener("click", function (e) {
      var btn = e.target.closest("[data-fav]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      var on = toggleFav(btn.dataset.fav);
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("title", on ? T.favRemove : T.favAdd);
      btn.setAttribute("aria-label", on ? T.favRemove : T.favAdd);
      if (!on) btn.classList.add("is-popping");
      else { btn.classList.remove("is-popping"); void btn.offsetWidth; btn.classList.add("is-popping"); }
      setTimeout(function () { btn.classList.remove("is-popping"); }, 400);
      if (onChange) onChange(btn.dataset.fav, on);
    });
  }

  /* --- theme -------------------------------------------------------------- */

  function systemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var accent = theme === "dark" ? (CFG.accentDark || CFG.accent) : CFG.accent;
    if (accent) document.documentElement.style.setProperty("--accent", accent);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#0e1211" : "#e9ece8");
    }
  }

  function initTheme() {
    var saved = store.get("theme", null);
    var pref = CFG.defaultTheme || "auto";
    applyTheme(saved || (pref === "auto" ? systemTheme() : pref));

    if (!saved && pref === "auto" && window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function () {
        if (!store.get("theme", null)) applyTheme(systemTheme());
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  function toggleTheme() {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    store.set("theme", next);
  }

  /* --- text helpers ------------------------------------------------------- */

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function slugify(s) {
    return String(s).toLowerCase().trim()
      .replace(/[àáâãä]/g, "a").replace(/[èéêë]/g, "e").replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o").replace(/[ùúûü]/g, "u").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* Round to something a cook would actually measure, then show fractions. */
  var FRACTIONS = [
    [0.125, "⅛"], [0.25, "¼"], [0.333, "⅓"], [0.375, "⅜"], [0.5, "½"],
    [0.625, "⅝"], [0.667, "⅔"], [0.75, "¾"], [0.875, "⅞"],
  ];

  function formatQty(n) {
    if (n == null || !isFinite(n)) return "";
    if (n <= 0) return "0";
    if (n >= 100) return dec(Math.round(n / 5) * 5);
    if (n >= 20) return dec(Math.round(n));
    if (n >= 10) return String(Math.round(n * 2) / 2).replace(/\.5$/, "½");

    var whole = Math.floor(n + 1e-9);
    var rest = n - whole;
    if (rest < 0.05) return String(whole || 0);

    // Eighths only make sense below 1. Above that, cooks measure in the
    // fractions that exist on spoons and cups.
    var usable = whole >= 1
      ? FRACTIONS.filter(function (f) { return [0.25, 0.333, 0.5, 0.667, 0.75].indexOf(f[0]) !== -1; })
      : FRACTIONS;

    for (var i = 0; i < usable.length; i++) {
      if (Math.abs(rest - usable[i][0]) < 0.04) {
        return (whole ? whole : "") + usable[i][1];
      }
    }
    return dec(Math.round(n * 10) / 10);
  }

  /* German decimal comma. Applied to every number the site prints. */
  function dec(n) {
    return String(n).replace(".", ",");
  }

  /* Nutrition figures are measurements, not spoonfuls — no fractions here,
     or 0.4 g of salt would come out as "⅜ g". */
  function formatNum(n) {
    if (typeof n !== "number" || !isFinite(n)) return String(n);
    return dec(Math.round(n * 10) / 10);
  }

  function formatMinutes(mins) {
    if (!mins || mins <= 0) return "";
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (!h) return m + " " + T.minute;
    return m ? h + " " + T.hour + " " + m + " " + T.minute : h + " " + T.hour;
  }

  function totalMinutes(r) {
    var t = r.times || {};
    if (t.total) return t.total;
    return (t.prep || 0) + (t.cook || 0) + (t.rest || 0);
  }

  /* --- recipe intake ------------------------------------------------------ */

  function normalize(r) {
    r.title = r.title || "Untitled";
    r.slug = r.slug || slugify(r.title);
    r.tags = r.tags || [];
    r.images = (r.images || []).filter(Boolean);
    r.equipment = r.equipment || [];
    r.notes = r.notes || [];
    r.times = r.times || {};
    r.servings = r.servings || 0;
    r.servingsUnit = r.servingsUnit || "servings";

    r.ingredients = (r.ingredients || []).map(function (i) {
      return typeof i === "string" ? { name: i } : i;
    });
    r.steps = (r.steps || []).map(function (s) {
      return typeof s === "string" ? { body: s } : s;
    });

    // Everything searchable, flattened once.
    r._haystack = [
      r.title, r.subtitle, r.category, r.intro,
      r.tags.join(" "),
      r.ingredients.map(function (i) { return (i.name || "") + " " + (i.heading || ""); }).join(" "),
      r.equipment.join(" "),
    ].join(" ").toLowerCase();

    r._total = totalMinutes(r);
    return r;
  }

  // Each recipe file calls this.
  window.recipe = function (data) {
    window.RECIPES.push(normalize(data));
  };

  /* Recipe files are injected as <script> tags rather than fetched, so the
     whole site also works when opened straight from the filesystem. */
  function loadRecipes() {
    return new Promise(function (resolve) {
      var files = window.RECIPE_FILES || [];
      if (!files.length) return resolve([]);
      var left = files.length;

      files.forEach(function (name, i) {
        var s = document.createElement("script");
        s.src = "recipes/" + name + ".js";
        s.dataset.order = i;
        s.onload = s.onerror = function () {
          if (--left === 0) {
            // Keep list.js order, whatever order the network returned in.
            var order = {};
            files.forEach(function (n, idx) { order[n] = idx; });
            window.RECIPES.forEach(function (r) {
              r._order = order[r.slug] !== undefined ? order[r.slug] : 999;
            });
            window.RECIPES.sort(function (a, b) { return a._order - b._order; });
            resolve(window.RECIPES);
          }
        };
        document.head.appendChild(s);
      });
    });
  }

  /* --- chrome shared by both pages ---------------------------------------- */

  function paintChrome() {
    var titleEls = document.querySelectorAll("[data-site-title]");
    for (var i = 0; i < titleEls.length; i++) {
      titleEls[i].textContent = CFG.title || "Recipes";
    }
    var footEls = document.querySelectorAll("[data-site-footer]");
    for (var j = 0; j < footEls.length; j++) {
      footEls[j].textContent = CFG.footer || "";
    }
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);

    var bar = document.querySelector(".topbar");
    if (bar) {
      var onScroll = function () {
        bar.classList.toggle("is-stuck", window.scrollY > 8);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  function toast(msg) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () { el.classList.add("is-shown"); });
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("is-shown"); }, 2600);
  }

  /* Placeholder art for recipes that don't have a photo yet. */
  function coverHTML(r, cls) {
    if (r.images.length) {
      return '<img class="' + cls + '" src="' + esc(r.images[0]) + '" alt="' +
        esc(r.title) + '" loading="lazy" decoding="async" data-fallback="' +
        esc(r.title) + '">';
    }
    return placeholderHTML(r.title);
  }

  /* A broken or missing image file falls back to the drawn placeholder,
     so a typo'd path never leaves a blank hole in the layout. */
  function wireImageFallbacks(root) {
    var imgs = (root || document).querySelectorAll("img[data-fallback]");
    Array.prototype.forEach.call(imgs, function (img) {
      var swap = function () { img.replaceWith(placeholderNode(img.dataset.fallback)); };
      if (img.complete && img.naturalWidth === 0) swap();
      else img.addEventListener("error", swap, { once: true });
    });
  }

  function initials(title) {
    var words = String(title).replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);
    if (!words.length) return "?";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  function placeholderHTML(title) {
    return '<div class="ph" aria-hidden="true"><span class="ph__glyph">' +
      esc(initials(title)) + "</span></div>";
  }

  function placeholderNode(title) {
    var d = document.createElement("div");
    d.innerHTML = placeholderHTML(title);
    return d.firstChild;
  }

  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.RB = {
    cfg: CFG,
    t: T,
    favList: favList,
    isFav: isFav,
    toggleFav: toggleFav,
    starHTML: starHTML,
    wireStars: wireStars,
    store: store,
    esc: esc,
    slugify: slugify,
    formatQty: formatQty,
    formatNum: formatNum,
    formatMinutes: formatMinutes,
    totalMinutes: totalMinutes,
    loadRecipes: loadRecipes,
    paintChrome: paintChrome,
    initTheme: initTheme,
    toast: toast,
    coverHTML: coverHTML,
    wireImageFallbacks: wireImageFallbacks,
    placeholderHTML: placeholderHTML,
    placeholderNode: placeholderNode,
    reducedMotion: prefersReduced,
  };

  initTheme();
})();
