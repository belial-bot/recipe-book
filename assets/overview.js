/* ==========================================================================
   Overview page — search, category filters, sorting, animated grid.
   ========================================================================== */

(function () {
  "use strict";

  var RB = window.RB;
  var grid, searchField, chipRow, sortSelect, countEl;
  var all = [];
  var state = { q: "", category: null, sort: RB.cfg.defaultSort || "newest" };
  var firstPaint = true;

  /* --- filtering ---------------------------------------------------------- */

  function matches(r) {
    if (state.category && r.category !== state.category) return false;
    if (!state.q) return true;
    // Every word must appear somewhere, in any order.
    var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    for (var i = 0; i < words.length; i++) {
      if (r._haystack.indexOf(words[i]) === -1) return false;
    }
    return true;
  }

  function sorted(list) {
    var out = list.slice();
    if (state.sort === "favorites") {
      out.sort(function (a, b) {
        var fa = RB.isFav(a.slug) ? 0 : 1;
        var fb = RB.isFav(b.slug) ? 0 : 1;
        return fa - fb || b._order - a._order;
      });
    } else if (state.sort === "az") {
      out.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (state.sort === "quickest") {
      out.sort(function (a, b) {
        return (a._total || 1e9) - (b._total || 1e9) || a.title.localeCompare(b.title);
      });
    } else {
      out.sort(function (a, b) { return b._order - a._order; }); // newest = last in list.js
    }
    return out;
  }

  /* --- rendering ---------------------------------------------------------- */

  function cardHTML(r, i) {
    var meta = [];
    if (r._total) meta.push(RB.formatMinutes(r._total));
    if (r.servings) meta.push(r.servings + " " + r.servingsUnit);
    if (r.difficulty) meta.push(r.difficulty);

    var metaHTML = meta.map(function (m) { return "<span>" + RB.esc(m) + "</span>"; })
      .join('<i class="card__dot"></i>');

    return '<div class="card' + (firstPaint ? " is-entering" : "") + '" ' +
      'style="--i:' + i + '" data-slug="' + RB.esc(r.slug) + '">' +
        '<a class="card__link" href="recipe.html?r=' + encodeURIComponent(r.slug) + '">' +
          '<div class="card__frame">' +
            RB.coverHTML(r, "card__img") +
            (r.category ? '<span class="card__badge">' + RB.esc(r.category) + "</span>" : "") +
          "</div>" +
          '<div class="card__body">' +
            '<h2 class="card__title">' + RB.esc(r.title) + "</h2>" +
            (r.subtitle ? '<p class="card__sub">' + RB.esc(r.subtitle) + "</p>" : "") +
            (metaHTML ? '<div class="card__meta">' + metaHTML + "</div>" : "") +
          "</div>" +
        "</a>" +
        RB.starHTML(r.slug, "fav--card") +
      "</div>";
  }

  function emptyHTML() {
    return '<div class="empty">' +
      '<p class="empty__title">' + RB.t.emptyTitle + "</p>" +
      '<p class="empty__text">' + RB.t.emptyText + "</p>" +
      "</div>";
  }

  /* FLIP: measure, mutate, then play the difference. Cards glide to their
     new positions instead of snapping when you filter or re-sort. */
  function render() {
    var list = sorted(all.filter(matches));

    countEl.textContent = list.length + " " +
      (list.length === 1 ? RB.t.recipeOne : RB.t.recipeMany);

    if (firstPaint || RB.reducedMotion) {
      grid.innerHTML = list.length ? list.map(cardHTML).join("") : emptyHTML();
      RB.wireImageFallbacks(grid);
      firstPaint = false;
      return;
    }

    var before = new Map();
    Array.prototype.forEach.call(grid.children, function (el) {
      if (el.dataset.slug) before.set(el.dataset.slug, el.getBoundingClientRect());
    });

    grid.innerHTML = list.length ? list.map(cardHTML).join("") : emptyHTML();
    RB.wireImageFallbacks(grid);

    Array.prototype.forEach.call(grid.children, function (el) {
      var prev = el.dataset.slug && before.get(el.dataset.slug);
      if (!prev) {
        el.animate(
          [{ opacity: 0, transform: "scale(.95)" }, { opacity: 1, transform: "none" }],
          { duration: 300, easing: "cubic-bezier(.22,1,.36,1)" }
        );
        return;
      }
      var now = el.getBoundingClientRect();
      var dx = prev.left - now.left;
      var dy = prev.top - now.top;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        el.animate(
          [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
          { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" }
        );
      }
    });
  }

  /* --- controls ----------------------------------------------------------- */

  function buildChips() {
    // Which categories are actually in use right now.
    var used = [];
    all.forEach(function (r) {
      if (r.category && used.indexOf(r.category) === -1) used.push(r.category);
    });

    // config.js sets the wording and the order. Categories listed there but
    // not used by any recipe are skipped; categories used by a recipe but
    // missing from config are appended, so nothing ever becomes unreachable.
    var configured = RB.cfg.categories || [];
    var cats = configured.filter(function (c) { return used.indexOf(c) !== -1; });
    used.forEach(function (c) { if (cats.indexOf(c) === -1) cats.push(c); });

    chipRow.innerHTML = [RB.t.all].concat(cats).map(function (c) {
      var isAll = c === RB.t.all;
      return '<button type="button" class="chip" data-cat="' + (isAll ? "" : RB.esc(c)) + '" ' +
        'aria-pressed="' + (isAll ? !state.category : c === state.category) + '">' +
        RB.esc(c) + "</button>";
    }).join("");

    chipRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      state.category = btn.dataset.cat || null;
      Array.prototype.forEach.call(chipRow.children, function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      render();
    });
  }

  function wireSearch() {
    var t;
    searchField.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(function () {
        state.q = searchField.value.trim();
        render();
      }, 90);
    });

    searchField.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && searchField.value) {
        searchField.value = "";
        state.q = "";
        render();
      }
    });

    // "/" jumps to search from anywhere on the page.
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        searchField.focus();
        searchField.select();
      }
    });
  }

  function wireSort() {
    sortSelect.value = state.sort;
    sortSelect.addEventListener("change", function () {
      state.sort = sortSelect.value;
      render();
    });
  }

  function wireRandom() {
    var btn = document.querySelector("[data-random]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var pool = all.filter(matches);
      if (!pool.length) pool = all;
      if (!pool.length) return;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      location.href = "recipe.html?r=" + encodeURIComponent(pick.slug);
    });
  }

  /* --- boot --------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", function () {
    RB.paintChrome();
    document.title = (RB.cfg.title || "Recipes");

    var tagline = document.querySelector("[data-site-tagline]");
    if (tagline) {
      if (RB.cfg.tagline) tagline.textContent = RB.cfg.tagline;
      else tagline.remove();
    }

    grid = document.getElementById("grid");
    searchField = document.getElementById("search");
    chipRow = document.getElementById("chips");
    sortSelect = document.getElementById("sort");
    countEl = document.getElementById("count");

    RB.loadRecipes().then(function (recipes) {
      all = recipes;
      buildChips();
      RB.wireStars(grid, function () {
        if (state.sort === "favorites") render();
      });
      wireSearch();
      wireSort();
      wireRandom();
      render();
    });
  });
})();
